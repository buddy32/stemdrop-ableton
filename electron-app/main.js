import fs from "node:fs/promises";
import path from "node:path";
import { app, BrowserWindow, clipboard, ipcMain, shell } from "electron";
import {
  getAvailablePath,
  incomingDir,
  isInsideDir,
  isSupportedAudio,
  outgoingDir,
  projectRoot,
  toProjectPath
} from "../server/paths.js";
import { ensureTransferHistory, readTransferHistory } from "../server/transfer-history.js";
import { StemDropClient } from "../client/stemdrop-client.js";

const relayUrl = "wss://stemdrop-relay.onrender.com";
let mainWindow;
let client = createClient();

function sendToWindow(channel, payload) {
  mainWindow?.webContents.send(channel, payload);
}

async function readRecentHistory() {
  await ensureTransferHistory();
  return (await readTransferHistory()).slice(-25).reverse();
}

function statusPayload() {
  const status = client.getStatus();
  return {
    ...status,
    relayUrl
  };
}

function sendStatus() {
  sendToWindow("connection-status", statusPayload());
}

function createClient() {
  const stemDropClient = new StemDropClient({ restrictSendToOutgoing: true });

  stemDropClient.on("connected", () => {
    sendStatus();
    sendToWindow("app-log", `Verbunden mit ${relayUrl}`);
  });
  stemDropClient.on("close", sendStatus);
  stemDropClient.on("peer-update", sendStatus);
  stemDropClient.on("relay-error", (message) => sendToWindow("app-error", message));
  stemDropClient.on("error", (error) => sendToWindow("app-error", error.message));

  stemDropClient.on("send-start", ({ transferId, fileName }) => {
    console.log("[MAIN] send start", fileName);
    sendToWindow("transfer-progress", { transferId, fileName, percent: 0 });
    sendToWindow("app-log", `Senden gestartet: ${fileName}`);
  });
  stemDropClient.on("send-progress", (progress) => sendToWindow("transfer-progress", progress));
  stemDropClient.on("send-complete", async (progress) => {
    sendToWindow("transfer-progress", { ...progress, percent: 100 });
    sendToWindow("history", await readRecentHistory());
  });

  stemDropClient.on("receive-start", ({ transferId, fileName }) => {
    sendToWindow("transfer-progress", { transferId, fileName, percent: 0 });
  });
  stemDropClient.on("receive-progress", (progress) => sendToWindow("transfer-progress", progress));
  stemDropClient.on("receive-complete", async (transfer) => {
    sendToWindow("transfer-progress", { ...transfer, percent: 100 });
    sendToWindow("history", await readRecentHistory());
  });

  return stemDropClient;
}

async function connectRoom({ roomCode }) {
  const normalizedRoomCode = String(roomCode ?? "").trim().toUpperCase();
  if (!normalizedRoomCode) throw new Error("Room-Code fehlt.");

  const status = await client.connect({ relayUrl, roomCode: normalizedRoomCode });
  sendStatus();
  return { ok: true, ...status, relayUrl };
}

async function createSession() {
  const status = await client.createSession({ relayUrl });
  sendStatus();
  return { ok: true, ...status, relayUrl };
}

async function disconnectRoom() {
  await client.close();
  sendStatus();
  return { ok: true, ...statusPayload() };
}

function copyRoomCode(roomCode) {
  const normalizedRoomCode = String(roomCode ?? client.currentRoomCode ?? "").trim().toUpperCase();
  if (!normalizedRoomCode) throw new Error("Kein Room-Code zum Kopieren.");
  clipboard.writeText(normalizedRoomCode);
  return { ok: true, roomCode: normalizedRoomCode };
}

async function prepareOutgoingFile(filePath) {
  if (!filePath) throw new Error("Dateipfad fehlt.");
  const absolutePath = path.resolve(filePath);
  console.log("[MAIN] file path", absolutePath);
  if (!isSupportedAudio(absolutePath)) throw new Error("Dateityp wird nicht unterstuetzt.");
  if (isInsideDir(outgoingDir, absolutePath)) return absolutePath;

  await fs.mkdir(outgoingDir, { recursive: true });
  const targetPath = await getAvailablePath(path.join(outgoingDir, path.basename(absolutePath)));
  await fs.copyFile(absolutePath, targetPath);
  sendToWindow("app-log", `Datei nach ${toProjectPath(targetPath)} kopiert`);
  return targetPath;
}

async function sendFiles(filePaths) {
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    const message = "Keine Datei erkannt";
    console.log("[MAIN] send error", message);
    sendToWindow("app-error", message);
    return { ok: false, error: message };
  }

  for (const filePath of filePaths) {
    try {
      const outgoingPath = await prepareOutgoingFile(filePath);
      await client.sendFile(outgoingPath);
    } catch (error) {
      console.log("[MAIN] send error", error.message);
      sendToWindow("app-error", error.message);
    }
  }

  sendToWindow("history", await readRecentHistory());
  return { ok: true };
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 760,
    title: "StemDrop",
    backgroundColor: "#111315",
    webPreferences: { preload: path.join(projectRoot, "electron-app", "preload.js"), contextIsolation: true, nodeIntegration: false }
  });
  await mainWindow.loadFile(path.join(projectRoot, "electron-app", "renderer.html"));
  sendToWindow("connection-status", statusPayload());
  sendToWindow("history", await readRecentHistory());
}

ipcMain.handle("room:connect", (_event, config) => connectRoom(config));
ipcMain.handle("room:create", () => createSession());
ipcMain.handle("room:disconnect", () => disconnectRoom());
ipcMain.handle("room:copy", (_event, roomCode) => copyRoomCode(roomCode));
ipcMain.handle("files:send", (_event, files) => sendFiles(files));
ipcMain.handle("history:read", () => readRecentHistory());
ipcMain.handle("folder:open", (_event, folder) => shell.openPath(folder === "incoming" ? incomingDir : outgoingDir));

app.whenReady().then(async () => {
  await fs.mkdir(incomingDir, { recursive: true });
  await fs.mkdir(outgoingDir, { recursive: true });
  await createWindow();
  if (process.env.STEMDROP_GUI_SMOKE === "1") setTimeout(() => app.quit(), 800);
});
app.on("window-all-closed", () => app.quit());
