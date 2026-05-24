import http from "node:http";
import { spawn } from "node:child_process";
import { URL } from "node:url";
import { incomingDir } from "./paths.js";
import { ensureTransferHistory, readTransferHistory } from "./transfer-history.js";
import { StemDropClient } from "../client/stemdrop-client.js";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.STEMDROP_HELPER_PORT ?? "3030", 10);
const client = new StemDropClient({ restrictSendToOutgoing: false });
let relayUrl = null;
let lastError = null;

function json(res, statusCode, data) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "http://127.0.0.1",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  res.end(`${JSON.stringify(data, null, 2)}\n`);
}

function statusPayload() {
  const status = client.getStatus();
  return {
    online: true,
    roomCode: status.roomCode,
    connectedClients: status.connectedClients,
    mode: "local"
  };
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const body = Buffer.concat(chunks).toString("utf8");

  try {
    return JSON.parse(body);
  } catch {
    return Object.fromEntries(new URLSearchParams(body));
  }
}

function openIncoming() {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open";
  const child = spawn(command, [incomingDir], { detached: true, stdio: "ignore" });
  child.unref();
}

client.on("error", (error) => {
  lastError = error.message;
  console.error("[HELPER] Client-Fehler:");
  console.error(error.message);
});
client.on("relay-error", (message) => {
  lastError = message;
  console.error(`[HELPER] Relay-Fehler: ${message}`);
});

await ensureTransferHistory();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);

    if (req.method === "OPTIONS") return json(res, 200, { ok: true });

    if (req.method === "GET" && url.pathname === "/status") {
      return json(res, 200, statusPayload());
    }

    if (req.method === "POST" && url.pathname === "/connect") {
      const body = await readJson(req);
      relayUrl = String(body.relayUrl ?? "").trim();
      const roomCode = String(body.roomCode ?? "").trim().toUpperCase();
      if (!relayUrl || !roomCode) return json(res, 400, { ok: false, error: "relayUrl und roomCode sind erforderlich." });

      lastError = null;
      await client.connect({ relayUrl, roomCode });
      return json(res, 200, { ok: true, ...statusPayload() });
    }

    if (req.method === "POST" && url.pathname === "/send") {
      const body = await readJson(req);
      const filePath = String(body.path ?? "").trim();
      if (!filePath) return json(res, 400, { ok: false, error: "path ist erforderlich." });

      const transfer = await client.sendFile(filePath);
      return json(res, 200, { ok: true, transfer });
    }

    if (req.method === "GET" && url.pathname === "/history") {
      return json(res, 200, { items: await readTransferHistory() });
    }

    if (req.method === "POST" && url.pathname === "/open-incoming") {
      openIncoming();
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { ok: false, error: "Nicht gefunden." });
  } catch (error) {
    lastError = error.message;
    return json(res, 500, { ok: false, error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`[HELPER] Local Helper API gestartet: http://${host}:${port}`);
});
