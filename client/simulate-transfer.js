import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import WebSocket from "ws";
import { getAvailablePath, incomingDir, outgoingDir, toProjectPath } from "../server/paths.js";
import { logTransfer } from "../server/transfer-history.js";

const port = Number.parseInt(process.env.STEMDROP_WS_PORT ?? "8787", 10);
const host = process.env.STEMDROP_WS_HOST ?? "127.0.0.1";
const requestedRoomCode = String(process.env.STEMDROP_ROOM_CODE ?? "").trim().toUpperCase();
const url = `ws://${host}:${port}`;
const chunkSize = 16 * 1024;

function send(socket, message) {
  socket.send(JSON.stringify(message));
}

function waitForMessage(socket, type) {
  return new Promise((resolve, reject) => {
    const handleMessage = (rawMessage) => {
      const message = JSON.parse(rawMessage.toString());

      if (message.type === "error") {
        cleanup();
        reject(new Error(message.message));
        return;
      }

      if (message.type === type) {
        cleanup();
        resolve(message);
      }
    };

    const handleError = (error) => {
      cleanup();
      reject(error);
    };

    function cleanup() {
      socket.off("message", handleMessage);
      socket.off("error", handleError);
    }

    socket.on("message", handleMessage);
    socket.on("error", handleError);
  });
}

function connectClient(name) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);

    socket.on("open", () => {
      console.log(`[${name}] Verbunden mit ${url}`);
      resolve(socket);
    });

    socket.on("error", reject);
  });
}

function createDemoAudioBuffer() {
  const sampleRate = 22050;
  const durationSeconds = 1;
  const dataSize = sampleRate * durationSeconds * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleRate * durationSeconds; index += 1) {
    const sample = Math.sin(2 * Math.PI * 330 * (index / sampleRate));
    buffer.writeInt16LE(Math.round(sample * 32767 * 0.25), 44 + index * 2);
  }

  return buffer;
}

async function prepareDemoFile() {
  await fs.mkdir(outgoingDir, { recursive: true });
  const filePath = path.join(outgoingDir, `ws-demo-${Date.now()}.wav`);
  await fs.writeFile(filePath, createDemoAudioBuffer());
  return filePath;
}

async function receiveFile(socket) {
  return new Promise((resolve, reject) => {
    let transfer = null;
    const chunks = [];
    let receivedBytes = 0;

    const handleMessage = async (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());

        if (message.type === "file_offer") {
          transfer = message;
          chunks.length = 0;
          receivedBytes = 0;
          console.log(`[CLIENT B] Datei angeboten: ${message.fileName} (${message.size} Bytes)`);
        }

        if (message.type === "file_chunk") {
          const chunk = Buffer.from(message.data, "base64");
          chunks.push(chunk);
          receivedBytes += chunk.length;

          const percent = Math.min(100, Math.round((receivedBytes / transfer.size) * 100));
          console.log(`[CLIENT B] Empfang: ${percent}% (${receivedBytes}/${transfer.size} Bytes)`);
        }

        if (message.type === "file_complete") {
          await fs.mkdir(incomingDir, { recursive: true });
          const safeName = path.basename(transfer.fileName);
          const targetPath = await getAvailablePath(path.join(incomingDir, `ws-received-${safeName}`));
          await fs.writeFile(targetPath, Buffer.concat(chunks));
          console.log(`[CLIENT B] Gespeichert nach: ${toProjectPath(targetPath)}`);
          await logTransfer({
            filename: transfer.fileName,
            filesize: transfer.size,
            direction: "received",
            roomCode,
            sourcePath: transfer.sourcePath ?? `remote:${transfer.fileName}`,
            targetPath: toProjectPath(targetPath)
          });
          cleanup();
          resolve(targetPath);
        }
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    const handleError = (error) => {
      cleanup();
      reject(error);
    };

    function cleanup() {
      socket.off("message", handleMessage);
      socket.off("error", handleError);
    }

    socket.on("message", handleMessage);
    socket.on("error", handleError);
  });
}

async function sendFile(socket, filePath) {
  const fileBuffer = await fs.readFile(filePath);
  const transferId = crypto.randomUUID();
  const fileName = path.basename(filePath);

  send(socket, {
    type: "file_offer",
    transferId,
    fileName,
    size: fileBuffer.length,
    sourcePath: toProjectPath(filePath)
  });

  for (let offset = 0; offset < fileBuffer.length; offset += chunkSize) {
    const chunk = fileBuffer.subarray(offset, offset + chunkSize);
    send(socket, {
      type: "file_chunk",
      transferId,
      byteLength: chunk.length,
      data: chunk.toString("base64")
    });

    const percent = Math.min(100, Math.round(((offset + chunk.length) / fileBuffer.length) * 100));
    console.log(`[CLIENT A] Senden: ${percent}% (${offset + chunk.length}/${fileBuffer.length} Bytes)`);
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  send(socket, {
    type: "file_complete",
    transferId
  });

  console.log(`[CLIENT A] Transfer fertig: ${fileName}`);
  await logTransfer({
    filename: fileName,
    filesize: fileBuffer.length,
    direction: "sent",
    roomCode,
    sourcePath: toProjectPath(filePath),
    targetPath: "remote:shared/incoming"
  });
}

const clientA = await connectClient("CLIENT A");
const clientB = await connectClient("CLIENT B");

let roomCode = requestedRoomCode;

if (roomCode) {
  send(clientA, {
    type: "join_room",
    roomCode
  });
  await waitForMessage(clientA, "room_joined");
  console.log(`[CLIENT A] Room-Code beigetreten: ${roomCode}`);
} else {
  send(clientA, { type: "create_room" });
  const createdRoom = await waitForMessage(clientA, "room_created");
  roomCode = createdRoom.roomCode;
  console.log(`[CLIENT A] Room-Code erstellt: ${roomCode}`);
}

send(clientB, {
  type: "join_room",
  roomCode
});
await waitForMessage(clientB, "room_joined");
console.log(`[CLIENT B] Room-Code beigetreten: ${roomCode}`);

const sourcePath = await prepareDemoFile();
console.log(`[CLIENT A] Testdatei vorbereitet: ${toProjectPath(sourcePath)}`);

const receivePromise = receiveFile(clientB);
await sendFile(clientA, sourcePath);
const receivedPath = await receivePromise;

const [source, received] = await Promise.all([
  fs.readFile(sourcePath),
  fs.readFile(receivedPath)
]);

if (!source.equals(received)) {
  throw new Error("Transfer-Test fehlgeschlagen: Quelldatei und Zieldatei unterscheiden sich.");
}

console.log("[SIMULATION] Transfer lokal erfolgreich verifiziert.");
clientA.close();
clientB.close();
