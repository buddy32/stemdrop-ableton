const $ = (id) => document.getElementById(id);
const progressRows = new Map();
const supportedDropExtensions = new Set([".wav", ".aiff", ".mp3"]);
let currentRoomCode = "";
let copyHintTimer = null;

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

function setConnectionStatus(info) {
  $("connectionStatus").textContent = info.connected ? "Verbunden" : "Offline";
  $("connectionStatus").classList.toggle("connected", Boolean(info.connected));
  $("connectionStatus").classList.toggle("offline", !info.connected);
  $("clientCount").textContent = `${Number(info.connectedClients ?? 0)} / 2`;
  currentRoomCode = info.roomCode || "";
  $("roomCode").textContent = currentRoomCode || "-";
  $("roomInput").value = currentRoomCode || $("roomInput").value;
  if (info.relayUrl) $("relayUrl").textContent = info.relayUrl;
}

function showCopyHint(message = "Invite copied") {
  const hint = $("copyHint");
  hint.textContent = message;
  hint.classList.add("visible");
  clearTimeout(copyHintTimer);
  copyHintTimer = setTimeout(() => {
    hint.classList.remove("visible");
    hint.textContent = "";
  }, 1800);
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

function getFileExtension(fileName) {
  const dotIndex = String(fileName ?? "").lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function isSupportedDropFile(file) {
  return supportedDropExtensions.has(getFileExtension(file.name));
}

function setDropHighlight(isHighlighted) {
  dropZone.querySelector(".drop-target").classList.toggle("dragover", isHighlighted);
}

$("createSession").addEventListener("click", async () => {
  try {
    const result = await window.stemdrop.createSession();
    setConnectionStatus(result);
    log(`Neue Session erstellt: ${result.roomCode}`);
  } catch (error) {
    log(`FEHLER: ${error.message}`);
  }
});

$("connectRoom").addEventListener("click", async () => {
  try {
    const result = await window.stemdrop.connectRoom({ roomCode: $("roomInput").value });
    setConnectionStatus(result);
    log(`Verbunden mit ${result.relayUrl}`);
  } catch (error) {
    log(`FEHLER: ${error.message}`);
  }
});

$("disconnectRoom").addEventListener("click", async () => {
  try {
    const result = await window.stemdrop.disconnectRoom();
    setConnectionStatus(result);
    log("Verbindung getrennt");
  } catch (error) {
    log(`FEHLER: ${error.message}`);
  }
});

$("copyRoomCode").addEventListener("click", async () => {
  try {
    const result = await window.stemdrop.copyRoomCode(currentRoomCode || $("roomInput").value);
    showCopyHint("Invite copied");
    log(`Room-Code kopiert: ${result.roomCode}`);
  } catch (error) {
    log(`FEHLER: ${error.message}`);
  }
});

$("openIncoming").addEventListener("click", () => window.stemdrop.openFolder("incoming"));
$("refreshHistory").addEventListener("click", async () => renderHistory(await window.stemdrop.readHistory()));

const dropZone = $("dropZone");
document.addEventListener("dragover", (event) => event.preventDefault());
document.addEventListener("drop", (event) => event.preventDefault());
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer.dropEffect = "copy";
  console.log("[DROP] dragover");
  setDropHighlight(true);
});
dropZone.addEventListener("dragleave", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setDropHighlight(false);
});
dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  event.stopPropagation();
  setDropHighlight(false);
  console.log("[DROP] drop");

  const droppedFiles = [...event.dataTransfer.files];
  if (droppedFiles.length === 0) {
    console.log("[DROP] Keine Datei erkannt");
    log("Keine Datei erkannt");
    return;
  }

  for (const file of droppedFiles) log(`Datei gedroppt: ${file.name}`);

  const supportedFiles = droppedFiles.filter(isSupportedDropFile);
  if (supportedFiles.length === 0) {
    log("FEHLER: Dateityp wird nicht unterstuetzt.");
    return;
  }

  const filePaths = [];
  for (const file of supportedFiles) {
    const filePath = window.stemdrop.getFilePath(file) || file.path || "";
    console.log("[DROP] file path", filePath || "(fehlt)", file.name);
    if (!filePath) {
      log(`FEHLER: Dateipfad fehlt fuer ${file.name}`);
      continue;
    }
    filePaths.push(filePath);
  }

  if (filePaths.length === 0) {
    log("FEHLER: Dateipfad fehlt.");
    return;
  }

  try {
    await window.stemdrop.sendFiles(filePaths);
  } catch (error) {
    log(`FEHLER: ${error.message}`);
  }
});

window.stemdrop.on("connection-status", setConnectionStatus);
window.stemdrop.on("transfer-progress", setProgress);
window.stemdrop.on("history", renderHistory);
window.stemdrop.on("app-log", log);
window.stemdrop.on("app-error", (message) => log(`FEHLER: ${message}`));
window.stemdrop.readHistory().then(renderHistory);
