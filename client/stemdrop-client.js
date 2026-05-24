import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { EventEmitter } from "node:events";
import chokidar from "chokidar";
import WebSocket from "ws";
import {
  createTimestampedFileName,
  getAvailablePath,
  incomingDir,
  isInsideDir,
  isSupportedAudio,
  outgoingDir,
  toProjectPath
} from "../server/paths.js";
import { formatBytes } from "../server/file-utils.js";
import { logTransfer } from "../server/transfer-history.js";

const chunkSize = 64 * 1024;

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function waitForJoin(socket) {
  return new Promise((resolve, reject) => {
    const handleMessage = (rawMessage) => {
      const message = JSON.parse(rawMessage.toString());

      if (message.type === "error") {
        cleanup();
        reject(new Error(message.message));
        return;
      }

      if (message.type === "room_joined") {
        cleanup();
        resolve(message);
      }
    };

    const handleClose = () => {
      cleanup();
      reject(new Error("Verbindung wurde vor dem Room-Beitritt getrennt."));
    };

    function cleanup() {
      socket.off("message", handleMessage);
      socket.off("close", handleClose);
    }

    socket.on("message", handleMessage);
    socket.on("close", handleClose);
  });
}

function openSocket(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);

    socket.on("open", () => resolve(socket));
    socket.on("error", reject);
  });
}

export class StemDropClient extends EventEmitter {
  constructor({ restrictSendToOutgoing = true } = {}) {
    super();
    this.activeTransfers = new Map();
    this.sentFiles = new Set();
    this.currentRoomCode = "";
    this.peerCount = 0;
    this.socket = null;
    this.watcher = null;
    this.restrictSendToOutgoing = restrictSendToOutgoing;
  }

  getStatus() {
    return {
      connected: this.socket?.readyState === WebSocket.OPEN,
      roomCode: this.currentRoomCode || null,
      connectedClients: this.peerCount,
      activeTransfers: this.activeTransfers.size
    };
  }

  async connect({ relayUrl, roomCode }) {
    await this.close();

    const normalizedRoomCode = String(roomCode ?? "").trim().toUpperCase();
    if (!normalizedRoomCode) throw new Error("Room-Code fehlt.");

    this.socket = await openSocket(relayUrl);
    send(this.socket, { type: "join_room", roomCode: normalizedRoomCode });
    const joined = await waitForJoin(this.socket);

    this.currentRoomCode = joined.roomCode;
    this.peerCount = Number(joined.peers ?? 1);

    this.socket.on("message", (rawMessage) => {
      this.handleMessage(rawMessage).catch((error) => this.emit("error", error));
    });

    this.socket.on("close", () => {
      this.peerCount = 0;
      this.emit("close");
    });

    this.socket.on("error", (error) => this.emit("error", error));
    this.emit("connected", this.getStatus());

    return this.getStatus();
  }

  async watchOutgoing() {
    await fs.mkdir(outgoingDir, { recursive: true });
    await fs.mkdir(incomingDir, { recursive: true });

    this.watcher = chokidar.watch(outgoingDir, {
      awaitWriteFinish: {
        stabilityThreshold: 700,
        pollInterval: 100
      },
      depth: 0,
      ignoreInitial: true,
      persistent: true,
      usePolling: true,
      interval: 500
    });

    this.watcher.on("add", (filePath) => {
      this.sendFile(filePath).catch((error) => this.emit("error", error));
    });

    this.watcher.on("error", (error) => this.emit("error", error));
  }

  async sendFile(filePath) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Nicht mit einem Room verbunden.");
    }

    const absolutePath = path.resolve(filePath);

    if (this.restrictSendToOutgoing && !isInsideDir(outgoingDir, absolutePath)) {
      throw new Error("Datei liegt nicht in shared/outgoing.");
    }

    if (!isSupportedAudio(absolutePath)) {
      throw new Error("Dateityp wird nicht unterstuetzt.");
    }

    if (this.sentFiles.has(absolutePath)) return null;
    this.sentFiles.add(absolutePath);

    const stat = await fs.stat(absolutePath);
    if (!stat.isFile()) throw new Error("Pfad ist keine Datei.");

    const fileBuffer = await fs.readFile(absolutePath);
    const transferId = crypto.randomUUID();
    const fileName = path.basename(absolutePath);

    this.emit("send-start", { transferId, fileName, size: fileBuffer.length });

    send(this.socket, {
      type: "file_offer",
      transferId,
      fileName,
      size: fileBuffer.length,
      sourcePath: toProjectPath(absolutePath)
    });

    for (let offset = 0; offset < fileBuffer.length; offset += chunkSize) {
      if (this.socket.readyState !== WebSocket.OPEN) {
        throw new Error("Verbindung waehrend des Sendens abgebrochen.");
      }

      const chunk = fileBuffer.subarray(offset, offset + chunkSize);
      send(this.socket, {
        type: "file_chunk",
        transferId,
        byteLength: chunk.length,
        data: chunk.toString("base64")
      });

      const percent = Math.min(100, Math.round(((offset + chunk.length) / fileBuffer.length) * 100));
      this.emit("send-progress", { transferId, fileName, percent, sentBytes: offset + chunk.length, size: fileBuffer.length });
    }

    send(this.socket, { type: "file_complete", transferId });
    this.emit("send-complete", { transferId, fileName, size: fileBuffer.length });

    await logTransfer({
      filename: fileName,
      filesize: fileBuffer.length,
      direction: "sent",
      roomCode: this.currentRoomCode,
      sourcePath: toProjectPath(absolutePath),
      targetPath: "remote:shared/incoming"
    });

    return { transferId, fileName, size: fileBuffer.length };
  }

  async saveIncomingFile(transfer) {
    await fs.mkdir(incomingDir, { recursive: true });

    const safeName = path.basename(transfer.fileName);
    const stampedName = createTimestampedFileName(safeName);
    const targetPath = await getAvailablePath(path.join(incomingDir, stampedName));
    await fs.writeFile(targetPath, Buffer.concat(transfer.chunks));

    await logTransfer({
      filename: transfer.fileName,
      filesize: transfer.size,
      direction: "received",
      roomCode: this.currentRoomCode,
      sourcePath: transfer.sourcePath,
      targetPath: toProjectPath(targetPath)
    });

    this.emit("receive-complete", { fileName: transfer.fileName, size: transfer.size, targetPath });
  }

  async handleMessage(rawMessage) {
    const message = JSON.parse(rawMessage.toString());

    if (message.type === "error") {
      this.emit("relay-error", message.message);
      return;
    }

    if (message.type === "peer_joined") {
      this.peerCount = Number(message.peers ?? this.peerCount);
      this.emit("peer-update", this.getStatus());
      return;
    }

    if (message.type === "peer_left") {
      this.peerCount = Math.max(1, this.peerCount - 1);
      this.emit("peer-update", this.getStatus());
      return;
    }

    if (message.type === "file_offer") {
      this.activeTransfers.set(message.transferId, {
        fileName: message.fileName,
        size: Number(message.size),
        sourcePath: message.sourcePath ?? `remote:${message.fileName}`,
        chunks: [],
        receivedBytes: 0
      });
      this.emit("receive-start", { transferId: message.transferId, fileName: message.fileName, size: Number(message.size) });
      return;
    }

    if (message.type === "file_chunk") {
      const transfer = this.activeTransfers.get(message.transferId);
      if (!transfer) return;

      const chunk = Buffer.from(message.data, "base64");
      transfer.chunks.push(chunk);
      transfer.receivedBytes += chunk.length;

      const percent = transfer.size > 0
        ? Math.min(100, Math.round((transfer.receivedBytes / transfer.size) * 100))
        : 100;
      this.emit("receive-progress", { transferId: message.transferId, fileName: transfer.fileName, percent, receivedBytes: transfer.receivedBytes, size: transfer.size });
      return;
    }

    if (message.type === "file_complete") {
      const transfer = this.activeTransfers.get(message.transferId);
      if (!transfer) return;

      this.activeTransfers.delete(message.transferId);
      await this.saveIncomingFile(transfer);
    }
  }

  async close() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.currentRoomCode = "";
    this.peerCount = 0;
    this.activeTransfers.clear();
  }
}

export { formatBytes };
