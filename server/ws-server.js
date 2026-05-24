import { createStemDropServer } from "./ws-core.js";

const port = Number.parseInt(process.env.PORT ?? process.env.STEMDROP_WS_PORT ?? "8787", 10);
const host = process.env.HOST ?? process.env.STEMDROP_WS_HOST ?? "0.0.0.0";
const roomCode = String(process.env.STEMDROP_ROOM_CODE ?? "").trim().toUpperCase();
const server = createStemDropServer({ host, port, roomCode });

server.events.on("error", (error) => {
  process.exitCode = 1;
  console.error("[SERVER] Start fehlgeschlagen:");
  console.error(error.message);
  console.error("[SERVER] Tipp: Fuer lokale Tests STEMDROP_WS_HOST=127.0.0.1 setzen. Fuer zwei Macs im WLAN braucht der Server eine freigegebene LAN-Adresse.");
});
server.events.on("log", (message) => console.log(message));
server.events.on("transfer-progress", (transfer) => console.log(`[TRANSFER ${transfer.transferId}] Fortschritt: ${transfer.percent}% (${transfer.receivedBytes}/${transfer.size} Bytes)`));
server.events.on("listening", (info) => {
  console.log("[SERVER] StemDrop Netzwerkmodus gestartet");
  console.log(`[SERVER] Port: ${info.port}`);
  console.log(`[SERVER] Room-Code: ${info.roomCode}`);
  console.log("[SERVER] Lokale Verbindungen:");
  console.log(`ws://127.0.0.1:${info.port}`);
  if (info.localAddresses.length === 0) console.log("[SERVER] Keine WLAN/LAN-IP gefunden. Pruefe deine Netzwerkverbindung.");
  else {
    console.log("[SERVER] WLAN/LAN-Adressen fuer den zweiten Mac:");
    for (const address of info.localAddresses) console.log(`ws://${address}:${info.port}`);
  }
  console.log("[SERVER] Warte auf zwei Clients pro Room...");
});
