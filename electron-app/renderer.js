const $ = (id) => document.getElementById(id);
const progressRows = new Map();

function log(message) {
  const out = $("logOutput");
  out.textContent = `${new Date().toLocaleTimeString()}  ${message}\n${out.textContent}`;
}

function setProgress(data) {
  let row = progressRows.get(data.transferId);
  if (!row) {
    row = document.createElement("div");
    row.className = "progress-row";
    row.innerHTML = `<strong></strong><div class="progress-bar"><span></span></div><small></small>`;
    $("progressList").prepend(row);
    progressRows.set(data.transferId, row);
  }
  row.querySelector("strong").textContent = data.fileName;
  row.querySelector("span").style.width = `${data.percent}%`;
  row.querySelector("small").textContent = `${data.percent}%`;
}

function renderHistory(items) {
  const list = $("historyList");
  list.textContent = "";
  for (const item of items || []) {
    const row = document.createElement("div");
    row.className = "history-row";
    row.innerHTML = `<strong>${item.filename || item.fileName || "Unbenannt"}</strong><span>${item.direction || "-"} · ${item.roomCode || "-"}</span><small>${item.timestamp || ""}</small>`;
    list.append(row);
  }
}

$("startServer").addEventListener("click", async () => {
  const result = await window.stemdrop.startServer();
  if (result.roomCode) $("roomCode").textContent = result.roomCode;
  log("Server gestartet");
});

$("connectRoom").addEventListener("click", async () => {
  const result = await window.stemdrop.connectRoom({ host: $("serverIp").value, port: $("serverPort").value, roomCode: $("roomInput").value });
  $("connectionStatus").textContent = "Verbunden";
  $("roomCode").textContent = result.roomCode;
  log(`Verbunden mit ${result.url}`);
});

$("openIncoming").addEventListener("click", () => window.stemdrop.openFolder("incoming"));
$("openOutgoing").addEventListener("click", () => window.stemdrop.openFolder("outgoing"));
$("refreshHistory").addEventListener("click", async () => renderHistory(await window.stemdrop.readHistory()));

const dropZone = $("dropZone");
dropZone.addEventListener("dragover", (event) => { event.preventDefault(); dropZone.querySelector(".drop-target").classList.add("dragover"); });
dropZone.addEventListener("dragleave", () => dropZone.querySelector(".drop-target").classList.remove("dragover"));
dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  dropZone.querySelector(".drop-target").classList.remove("dragover");
  const files = [...event.dataTransfer.files].map((file) => file.path).filter(Boolean);
  await window.stemdrop.sendFiles(files);
});

window.stemdrop.on("server-status", (info) => { $("roomCode").textContent = info.roomCode; log(`Server Port ${info.port}`); });
window.stemdrop.on("room-update", (info) => { $("clientCount").textContent = `${info.clients} / 2`; $("roomCode").textContent = info.roomCode; });
window.stemdrop.on("connection-status", (info) => { $("connectionStatus").textContent = info.connected ? "Verbunden" : "Offline"; });
window.stemdrop.on("transfer-progress", setProgress);
window.stemdrop.on("history", renderHistory);
window.stemdrop.on("app-log", log);
window.stemdrop.on("app-error", (message) => log(`FEHLER: ${message}`));
window.stemdrop.readHistory().then(renderHistory);
