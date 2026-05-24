const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("stemdrop", {
  startServer: () => ipcRenderer.invoke("server:start"),
  connectRoom: (config) => ipcRenderer.invoke("room:connect", config),
  sendFiles: (files) => ipcRenderer.invoke("files:send", files),
  readHistory: () => ipcRenderer.invoke("history:read"),
  openFolder: (folder) => ipcRenderer.invoke("folder:open", folder),
  on: (channel, callback) => ipcRenderer.on(channel, (_event, payload) => callback(payload))
});
