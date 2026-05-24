import fs from "node:fs/promises";
import path from "node:path";
import chokidar from "chokidar";
import {
  incomingDir,
  getAvailablePath,
  isInsideProject,
  isSupportedAudio,
  outgoingDir,
  toProjectPath
} from "./paths.js";

const copiedFiles = new Set();

async function ensureReady(filePath) {
  let previousSize = -1;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const stat = await fs.stat(filePath);

    if (stat.size === previousSize) {
      return;
    }

    previousSize = stat.size;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function copyToIncoming(filePath) {
  if (!isInsideProject(filePath)) {
    console.log("[IGNORIERT] Datei liegt ausserhalb des Projektordners.");
    return;
  }

  if (!isSupportedAudio(filePath)) {
    return;
  }

  const fileName = path.basename(filePath);
  const targetPath = await getAvailablePath(path.join(incomingDir, fileName));

  if (!isInsideProject(targetPath)) {
    console.log("[IGNORIERT] Ziel liegt ausserhalb des Projektordners.");
    return;
  }

  const copyKey = `${filePath}->${targetPath}`;
  if (copiedFiles.has(copyKey)) {
    return;
  }

  await ensureReady(filePath);
  await fs.mkdir(incomingDir, { recursive: true });
  await fs.copyFile(filePath, targetPath);
  copiedFiles.add(copyKey);

  console.log("[WATCHER] Neue Datei erkannt:");
  console.log(fileName);
  console.log("");
  console.log("[KOPIERT NACH]");
  console.log(toProjectPath(targetPath));
}

await fs.mkdir(outgoingDir, { recursive: true });
await fs.mkdir(incomingDir, { recursive: true });

console.log("[WATCHER] StemDrop-Ableton wartet auf neue Audio-Dateien...");
console.log(`[ORDNER] ${toProjectPath(outgoingDir)}`);
console.log("[DATEIEN] .wav, .aiff, .mp3");

const watcher = chokidar.watch(outgoingDir, {
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100
  },
  depth: 0,
  ignoreInitial: true,
  persistent: true,
  usePolling: true,
  interval: 500
});

watcher.on("add", (filePath) => {
  copyToIncoming(filePath).catch((error) => {
    console.error("[FEHLER] Datei konnte nicht kopiert werden:");
    console.error(error.message);
  });
});

watcher.on("error", (error) => {
  console.error("[FEHLER] Watcher-Problem:");
  console.error(error.message);
});
