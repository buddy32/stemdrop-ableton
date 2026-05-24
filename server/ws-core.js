import os from "node:os";
import { EventEmitter } from "node:events";
import { WebSocketServer } from "ws";

export function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 6; index += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export function getLocalIPv4Addresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) addresses.push(entry.address);
    }
  }
  return addresses;
}

export function createStemDropServer({ host = "0.0.0.0", port = 8787, roomCode = "" } = {}) {
  const events = new EventEmitter();
  const rooms = new Map();

  function getUniqueRoomCode() {
    let code = String(roomCode ?? "").trim().toUpperCase() || createRoomCode();
    while (rooms.has(code)) code = createRoomCode();
    return code;
  }

  function createRoom(code = getUniqueRoomCode(), persistent = false) {
    const room = { code, clients: new Set(), persistent, transfers: new Map() };
    rooms.set(code, room);
    return room;
  }

  function send(client, message) {
    if (client.readyState === client.OPEN) client.send(JSON.stringify(message));
  }

  function broadcast(room, sender, message) {
    for (const client of room.clients) {
      if (client !== sender) send(client, message);
    }
  }

  function emitRoomUpdate(room) {
    events.emit("room-update", { roomCode: room.code, clients: room.clients.size });
  }

  function leaveRoom(client) {
    if (!client.roomCode) return;
    const room = rooms.get(client.roomCode);
    if (!room) return;
    room.clients.delete(client);
    events.emit("log", `[ROOM ${client.roomCode}] Client getrennt (${room.clients.size}/2 verbunden)`);
    broadcast(room, client, { type: "peer_left", roomCode: client.roomCode });
    emitRoomUpdate(room);
    if (room.clients.size === 0 && !room.persistent) {
      rooms.delete(client.roomCode);
      events.emit("log", `[ROOM ${client.roomCode}] Raum geschlossen`);
    }
    client.roomCode = null;
  }

  function handleCreateRoom(client) {
    leaveRoom(client);
    const code = getUniqueRoomCode();
    const room = createRoom(code);
    room.clients.add(client);
    client.roomCode = code;
    events.emit("log", `[ROOM] Neuer Room-Code: ${code}`);
    emitRoomUpdate(room);
    send(client, { type: "room_created", roomCode: code });
  }

  function handleJoinRoom(client, requestedCode) {
    leaveRoom(client);
    const normalizedRoomCode = String(requestedCode ?? "").trim().toUpperCase();
    const room = rooms.get(normalizedRoomCode);
    if (!room) return send(client, { type: "error", message: "Room-Code nicht gefunden." });
    if (room.clients.size >= 2) return send(client, { type: "error", message: "Room ist bereits voll." });
    room.clients.add(client);
    client.roomCode = normalizedRoomCode;
    events.emit("log", `[ROOM ${normalizedRoomCode}] Client verbunden (${room.clients.size}/2 verbunden)`);
    emitRoomUpdate(room);
    send(client, { type: "room_joined", roomCode: normalizedRoomCode, peers: room.clients.size });
    broadcast(room, client, { type: "peer_joined", roomCode: normalizedRoomCode, peers: room.clients.size });
  }

  function handleTransferMessage(client, message) {
    const room = rooms.get(client.roomCode);
    if (!room) return send(client, { type: "error", message: "Client ist mit keinem Room verbunden." });
    if (room.clients.size < 2) return send(client, { type: "error", message: "Es sind noch keine zwei Clients verbunden." });
    if (message.type === "file_offer") {
      room.transfers.set(message.transferId, { fileName: message.fileName, size: Number(message.size), receivedBytes: 0 });
      events.emit("log", `[TRANSFER ${message.transferId}] Start: ${message.fileName} (${message.size} Bytes)`);
    }
    if (message.type === "file_chunk") {
      const transfer = room.transfers.get(message.transferId);
      if (transfer) {
        transfer.receivedBytes += Number(message.byteLength ?? 0);
        const percent = transfer.size > 0 ? Math.min(100, Math.round((transfer.receivedBytes / transfer.size) * 100)) : 100;
        events.emit("transfer-progress", { transferId: message.transferId, fileName: transfer.fileName, percent, receivedBytes: transfer.receivedBytes, size: transfer.size });
        events.emit("log", `[TRANSFER ${message.transferId}] Fortschritt: ${percent}% (${transfer.receivedBytes}/${transfer.size} Bytes)`);
      }
    }
    if (message.type === "file_complete") {
      const transfer = room.transfers.get(message.transferId);
      events.emit("log", `[TRANSFER ${message.transferId}] Fertig: ${transfer?.fileName ?? "Datei"}`);
      room.transfers.delete(message.transferId);
    }
    broadcast(room, client, message);
  }

  const defaultRoom = createRoom(undefined, true);
  const wss = new WebSocketServer({ host, port });
  wss.on("connection", (client) => {
    events.emit("log", "[SERVER] Client verbunden");
    client.on("message", (rawMessage) => {
      let message;
      try { message = JSON.parse(rawMessage.toString()); } catch { return send(client, { type: "error", message: "Ungueltige Nachricht." }); }
      if (message.type === "create_room") return handleCreateRoom(client);
      if (message.type === "join_room") return handleJoinRoom(client, message.roomCode);
      if (["file_offer", "file_chunk", "file_complete"].includes(message.type)) return handleTransferMessage(client, message);
      send(client, { type: "error", message: `Unbekannter Nachrichtentyp: ${message.type}` });
    });
    client.on("close", () => leaveRoom(client));
    client.on("error", (error) => events.emit("error", error));
  });
  wss.on("error", (error) => events.emit("error", error));
  wss.on("listening", () => events.emit("listening", { host, port, roomCode: defaultRoom.code, localAddresses: getLocalIPv4Addresses() }));
  return { events, roomCode: defaultRoom.code, close: () => new Promise((resolve) => wss.close(resolve)) };
}
