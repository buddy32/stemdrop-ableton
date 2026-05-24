import fs from "node:fs/promises";
import { formatBytes } from "./file-utils.js";
import { transfersLogPath } from "./paths.js";
import { ensureTransferHistory } from "./transfer-history.js";

function getField(entry, modernName, legacyName) {
  return entry[modernName] ?? entry[legacyName] ?? "";
}

await ensureTransferHistory();

let history;

try {
  history = JSON.parse(await fs.readFile(transfersLogPath, "utf8"));
} catch (error) {
  console.error("[HISTORY] transfers.json konnte nicht gelesen werden:");
  console.error(error.message);
  process.exit(1);
}

if (!Array.isArray(history) || history.length === 0) {
  console.log("[HISTORY] Noch keine Transfers protokolliert.");
  process.exit(0);
}

console.log("[HISTORY] Letzte Transfers:");

for (const entry of history.slice(-10)) {
  const filename = getField(entry, "filename", "fileName");
  const filesize = getField(entry, "filesize", "size");
  const direction = entry.direction ?? "unknown";
  const roomCode = entry.roomCode ?? "";

  console.log("");
  console.log(`${entry.timestamp ?? "ohne Zeit"} | ${direction} | ${filename}`);
  console.log(`Groesse: ${Number.isFinite(Number(filesize)) ? formatBytes(Number(filesize)) : filesize}`);
  console.log(`Room: ${roomCode || "-"}`);
  console.log(`Quelle: ${entry.sourcePath ?? "-"}`);
  console.log(`Ziel: ${entry.targetPath ?? "-"}`);
}
