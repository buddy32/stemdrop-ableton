import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { outgoingDir, toProjectPath } from "../server/paths.js";
import { StemDropClient, formatBytes } from "./stemdrop-client.js";

async function askForConfig() {
  const envHost = process.env.STEMDROP_SERVER_IP;
  const envPort = process.env.STEMDROP_WS_PORT;
  const envRoomCode = process.env.STEMDROP_ROOM_CODE;

  if (envHost && envPort && envRoomCode) {
    return {
      host: envHost,
      port: envPort,
      roomCode: envRoomCode
    };
  }

  const rl = readline.createInterface({ input, output });

  try {
    const host = envHost || await rl.question("Server-IP: ");
    const port = envPort || await rl.question("Port [8787]: ");
    const roomCode = envRoomCode || await rl.question("Room-Code: ");

    return {
      host: host.trim() || "127.0.0.1",
      port: (port.trim() || "8787"),
      roomCode: roomCode.trim().toUpperCase()
    };
  } finally {
    rl.close();
  }
}

const config = await askForConfig();
const relayUrl = `ws://${config.host}:${config.port}`;
const client = new StemDropClient({ restrictSendToOutgoing: true });

client.on("send-start", ({ fileName, size }) => {
  console.log("");
  console.log("[SENDEN] Neue Datei:");
  console.log(`${fileName} (${formatBytes(size)})`);
});
client.on("send-progress", ({ fileName, percent }) => console.log(`[SENDEN] ${fileName}: ${percent}%`));
client.on("send-complete", ({ fileName }) => console.log(`[SENDEN] Fertig: ${fileName}`));
client.on("receive-start", ({ fileName, size }) => {
  console.log("");
  console.log("[EMPFANGEN] Eingehende Datei:");
  console.log(`${fileName} (${formatBytes(Number(size))})`);
});
client.on("receive-progress", ({ fileName, percent }) => console.log(`[EMPFANGEN] ${fileName}: ${percent}%`));
client.on("receive-complete", ({ fileName, size, targetPath }) => {
  console.log("[EMPFANGEN] Datei gespeichert:");
  console.log(`${fileName} (${formatBytes(size)})`);
  console.log(`[ZIEL] ${toProjectPath(targetPath)}`);
});
client.on("peer-update", ({ connectedClients }) => {
  if (connectedClients > 1) console.log(`[ROOM] Zweiter Client verbunden (${connectedClients}/2).`);
  else console.log("[ROOM] Anderer Client getrennt. Laufende Transfers koennen fehlschlagen.");
});
client.on("relay-error", (message) => console.error(`[FEHLER] ${message}`));
client.on("close", () => console.error("[CLIENT] Verbindung getrennt."));
client.on("error", (error) => {
  console.error("[FEHLER]");
  console.error(error.message);
});

console.log(`[CLIENT] Verbinde mit ${relayUrl}`);
await client.connect({ relayUrl, roomCode: config.roomCode });
console.log(`[CLIENT] Verbunden mit Room ${client.currentRoomCode}`);
console.log(`[CLIENT] Ueberwache ${toProjectPath(outgoingDir)}`);

await client.watchOutgoing();

if (process.env.STEMDROP_EXIT_AFTER_JOIN === "1") {
  await new Promise((resolve) => setTimeout(resolve, 750));
  await client.close();
}
