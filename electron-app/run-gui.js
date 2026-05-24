import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const binName = process.platform === "win32" ? "electron.cmd" : "electron";
const electronBin = path.join(root, "node_modules", ".bin", binName);

if (!fs.existsSync(electronBin)) {
  console.error("[GUI] Electron ist noch nicht lokal installiert.");
  console.error("[GUI] Versuche: ELECTRON_CACHE=/private/tmp/stemdrop-electron-cache npm install");
  console.error("[GUI] In dieser Umgebung wurde der Electron-Download-Cache von macOS/Sandbox blockiert.");
  process.exit(1);
}

const child = spawn(electronBin, [path.join(root, "electron-app", "main.js")], {
  cwd: root,
  stdio: "inherit"
});

child.on("exit", (code) => process.exit(code ?? 0));
