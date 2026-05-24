import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import WebSocket from "ws";
import {
  createTimestampedFileName,
  getAvailablePath,
  incomingDir,
  isInsideDir,
  isSupportedAudio,
  outgoingDir,
  projectRoot,
  toProjectPath,
  transfersLogPath
} from "../server/paths.js";
import { createStemDropServer } from "../server/ws-core.js";
import { formatBytes } from "../server/file-utils.js";
import { ensureTransferHistory, logTransfer } from "../server/transfer-history.js";

const chunkSize = 64 * 1024;
let mainWindow;
let serverInstance = null;
let socket = null;
let currentRoomCode = "";
let activeTransfers = new Map();

function sendToWindow(channel, payload) {
  mainWindow?.webContents.send(channel, payload);
}

function sendSocket(message) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

async function readHistory() {
  await ensureTransferHistory();
  const content = await fs.readFile(transfersLogPath, "utf8");
  return JSON.parse(content).slice(-25).reverse();
}

async function startServer() {
  if (serverInstance) return { ok: true, roomCode: serverInstance.roomCode };
  const port = 8787;
  serverInstance = createStemDropServer({ host: "0.0.0.0", port });
  serverInstance.events.on("listening", (info) => sendToWindow("server-status", { ok: true, ...info }));
  serverInstance.events.on("room-update", (info) => sendToWindow("room-update", info));
  serverInstance.events.on("transfer-progress", (progress) => sendToWindow("transfer-progress", progress));
  serverInstance.events.on("log", (message) => sendToWindow("app-log", message));
  serverInstance.events.on("error", (error) => sendToWindow("app-error", error.message));
  return { ok: true, roomCode: serverInstance.roomCode, port };
}

function waitForJoin() {
  return new Promise((resolve, reject) => {
    const onMessage = (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.type === "error") {
        cleanup();
        reject(new Error(message.message));
      } else if (message.type === "room_joined") {
        cleanup();
        resolve(message);
      }
    };
    const onClose = () => {
      cleanup();
      reject(new Error("Verbindung getrennt."));
    };
    function cleanup() {
      socket.off("message", onMessage);
      socket.off("close", onClose);
    }
    socket.on("message", onMessage);
    socket.on("close", onClose);
  });
}

async function connectRoom({ host, port, roomCode }) {
  if (socket) socket.close();
  const url = `ws://${host || "127.0.0.1"}:${port || "8787"}`;
  socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
  sendSocket({ type: "join_room", roomCode });
  const joined = await waitForJoin();
  currentRoomCode = joined.roomCode;
  socket.on("message", (raw) => handleIncomingMessage(raw).catch((error) => sendToWindow("app-error", error.message)));
  socket.on("close", () => sendToWindow("connection-status", { connected: false }));
  sendToWindow("connection-status", { connected: true, roomCode: currentRoomCode, url });
  return { ok: true, roomCode: currentRoomCode, url };
}

async function sendFiles(filePaths) {
  for (const filePath of filePaths) {
    const absolutePath = path.resolve(filePath);
    if (!isInsideDir(outgoingDir, absolutePath)) {
      sendToWindow("app-error", `Nur Dateien aus ${toProjectPath(outgoingDir)} duerfen gesendet werden.`);
      continue;
    }
    if (!isSupportedAudio(absolutePath)) continue;
    const fileBuffer = await fs.readFile(absolutePath);
    const transferId = crypto.randomUUID();
    const fileName = path.basename(absolutePath);
    sendSocket({ type: "file_offer", transferId, fileName, size: fileBuffer.length, sourcePath: toProjectPath(absolutePath) });
    for (let offset = 0; offset < fileBuffer.length; offset += chunkSize) {
      const chunk = fileBuffer.subarray(offset, offset + chunkSize);
      sendSocket({ type: "file_chunk", transferId, byteLength: chunk.length, data: chunk.toString("base64") });
      sendToWindow("transfer-progress", { transferId, fileName, percent: Math.round(((offset + chunk.length) / fileBuffer.length) * 100), size: fileBuffer.length });
    }
    sendSocket({ type: "file_complete", transferId });
    await logTransfer({ filename: fileName, filesize: fileBuffer.length, direction: "sent", roomCode: currentRoomCode, sourcePath: toProjectPath(absolutePath), targetPath: "remote:shared/incoming" });
  }
  sendToWindow("history", await readHistory());
}

async function handleIncomingMessage(raw) {
  const message = JSON.parse(raw.toString());
  if (message.type === "file_offer") {
    activeTransfers.set(message.transferId, { fileName: message.fileName, size: Number(message.size), sourcePath: message.sourcePath, chunks: [], receivedBytes: 0 });
  }
  if (message.type === "file_chunk") {
    const transfer = activeTransfers.get(message.transferId);
    if (!transfer) return;
    const chunk = Buffer.from(message.data, "base64");
    transfer.chunks.push(chunk);
    transfer.receivedBytes += chunk.length;
    sendToWindow("transfer-progress", { transferId: message.transferId, fileName: transfer.fileName, percent: Math.round((transfer.receivedBytes / transfer.size) * 100), size: transfer.size });
  }
  if (message.type === "file_complete") {
    const transfer = activeTransfers.get(message.transferId);
    if (!transfer) return;
    activeTransfers.delete(message.transferId);
    const stampedName = createTimestampedFileName(path.basename(transfer.fileName));
    const targetPath = await getAvailablePath(path.join(incomingDir, stampedName));
    await fs.writeFile(targetPath, Buffer.concat(transfer.chunks));
    await logTransfer({ filename: transfer.fileName, filesize: transfer.size, direction: "received", roomCode: currentRoomCode, sourcePath: transfer.sourcePath ?? `remote:${transfer.fileName}`, targetPath: toProjectPath(targetPath) });
    sendToWindow("history", await readHistory());
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    title: "StemDrop-Ableton",
    backgroundColor: "#111315",
    webPreferences: { preload: path.join(projectRoot, "electron-app", "preload.js"), contextIsolation: true, nodeIntegration: false }
  });
  await mainWindow.loadFile(path.join(projectRoot, "electron-app", "renderer.html"));
  sendToWindow("history", await readHistory());
}

ipcMain.handle("server:start", () => startServer());
ipcMain.handle("room:connect", (_event, config) => connectRoom(config));
ipcMain.handle("files:send", (_event, files) => sendFiles(files));
ipcMain.handle("history:read", () => readHistory());
ipcMain.handle("folder:open", (_event, folder) => shell.openPath(folder === "incoming" ? incomingDir : outgoingDir));

app.whenReady().then(async () => {
  await fs.mkdir(incomingDir, { recursive: true });
  await fs.mkdir(outgoingDir, { recursive: true });
  await createWindow();
  if (process.env.STEMDROP_GUI_SMOKE === "1") setTimeout(() => app.quit(), 800);
});
app.on("window-all-closed", () => app.quit());
