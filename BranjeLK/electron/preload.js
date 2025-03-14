const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  showSaveDialog: (excelBuffer) =>
    ipcRenderer.invoke("show-save-dialog", excelBuffer),
});
