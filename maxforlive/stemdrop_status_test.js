const maxApi = require("max-api");
const http = require("http");

const statusUrl = "http://127.0.0.1:3030/status";

function getStatus() {
  maxApi.post("status requested");

  http.get(statusUrl, (res) => {
    const chunks = [];

    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");

      if (res.statusCode < 200 || res.statusCode >= 300) {
        maxApi.post(`[StemDrop] HTTP ${res.statusCode}: ${body}`);
        maxApi.outlet("error", `HTTP ${res.statusCode}`);
        return;
      }

      maxApi.post(`[StemDrop] ${body}`);
      maxApi.outlet("status_json", body);

      try {
        const status = JSON.parse(body);
        maxApi.outlet("online", status.online ? 1 : 0);
        maxApi.outlet("roomCode", status.roomCode || "-");
        maxApi.outlet("connectedClients", Number(status.connectedClients || 0));
      } catch (error) {
        maxApi.post(`[StemDrop] JSON parse error: ${error.message}`);
        maxApi.outlet("error", error.message);
      }
    });
  }).on("error", (error) => {
    maxApi.post(`[StemDrop] Helper not reachable: ${error.message}`);
    maxApi.outlet("error", error.message);
  });
}

maxApi.addHandler("status", getStatus);

maxApi.post("StemDrop node script ready");
maxApi.outlet("ready", 1);
