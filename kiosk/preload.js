const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kioskApi", {
  scanToken: (token) => ipcRenderer.invoke("kiosk:scan", token),
  printJob: (jobId, pdfUrl) => ipcRenderer.invoke("kiosk:print", jobId, pdfUrl)
});
