import fs from "node:fs/promises";
import { logsDir, transfersLogPath } from "./paths.js";

let writeQueue = Promise.resolve();

export async function readTransferHistory() {
  try {
    const content = await fs.readFile(transfersLogPath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function ensureTransferHistory() {
  await fs.mkdir(logsDir, { recursive: true });

  try {
    await fs.access(transfersLogPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(transfersLogPath, "[]\n");
      return;
    }

    throw error;
  }
}

async function appendTransfer(entry) {
  await ensureTransferHistory();

  const history = await readTransferHistory();
  history.push(entry);

  await fs.writeFile(transfersLogPath, `${JSON.stringify(history, null, 2)}\n`);
}

export async function logTransfer({
  filename,
  filesize,
  direction,
  roomCode,
  sourcePath,
  targetPath
}) {
  const entry = {
    timestamp: new Date().toISOString(),
    direction,
    filename,
    filesize,
    roomCode,
    sourcePath,
    targetPath
  };

  writeQueue = writeQueue.then(() => appendTransfer(entry));

  try {
    await writeQueue;
  } catch (error) {
    console.error("[HISTORY] Transfer konnte nicht protokolliert werden:");
    console.error(error.message);
    throw error;
  }
}
