const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("stemdrop", {
  createSession: () => ipcRenderer.invoke("room:create"),
  connectRoom: (config) => ipcRenderer.invoke("room:connect", config),
  disconnectRoom: () => ipcRenderer.invoke("room:disconnect"),
  copyRoomCode: (roomCode) => ipcRenderer.invoke("room:copy", roomCode),
  sendFiles: (files) => ipcRenderer.invoke("files:send", files),
  getFilePath: (file) => webUtils?.getPathForFile?.(file) || file?.path || "",
  readHistory: () => ipcRenderer.invoke("history:read"),
  openFolder: (folder) => ipcRenderer.invoke("folder:open", folder),
  on: (channel, callback) => ipcRenderer.on(channel, (_event, payload) => callback(payload))
});
