import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(serverDir, "..");
export const sharedDir = path.join(projectRoot, "shared");
export const outgoingDir = path.join(sharedDir, "outgoing");
export const incomingDir = path.join(sharedDir, "incoming");
export const logsDir = path.join(projectRoot, "logs");
export const transfersLogPath = path.join(logsDir, "transfers.json");

export const supportedExtensions = new Set([".wav", ".aiff", ".mp3"]);

export function toProjectPath(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join("/");
}

export function isInsideProject(filePath) {
  const relative = path.relative(projectRoot, filePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function isInsideDir(parentDir, filePath) {
  const relative = path.relative(parentDir, filePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function isSupportedAudio(filePath) {
  return supportedExtensions.has(path.extname(filePath).toLowerCase());
}

export function createTimestampedFileName(fileName) {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${baseName}-${stamp}${extension}`;
}

export async function getAvailablePath(filePath) {
  const dir = path.dirname(filePath);
  const extension = path.extname(filePath);
  const baseName = path.basename(filePath, extension);
  let candidate = filePath;
  let suffix = 1;

  while (true) {
    try {
      await fs.access(candidate);
      candidate = path.join(dir, `${baseName}-${suffix}${extension}`);
      suffix += 1;
    } catch {
      return candidate;
    }
  }
}
