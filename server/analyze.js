import fs from "node:fs/promises";
import path from "node:path";
import {
  incomingDir,
  isSupportedAudio,
  outgoingDir,
  sharedDir,
  toProjectPath
} from "./paths.js";
import { formatBytes } from "./file-utils.js";

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
    } else if (entry.isFile() && isSupportedAudio(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

await fs.mkdir(outgoingDir, { recursive: true });
await fs.mkdir(incomingDir, { recursive: true });

const files = await collectFiles(sharedDir);

console.log("[ANALYZE] Audio-Dateien im shared-Ordner:");

if (files.length === 0) {
  console.log("Keine unterstuetzten Dateien gefunden.");
} else {
  for (const filePath of files) {
    const stat = await fs.stat(filePath);
    console.log("");
    console.log(toProjectPath(filePath));
    console.log(`Typ: ${path.extname(filePath).slice(1).toUpperCase()}`);
    console.log(`Groesse: ${formatBytes(stat.size)}`);
  }
}

console.log("");
console.log("[ANALYZE] Es wurden keine Dateien verschoben oder geloescht.");
