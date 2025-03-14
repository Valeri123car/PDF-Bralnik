const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true, // Omogoči varno izolacijo
      preload: path.join(__dirname, "preload.js"), // Naloži preload skripto
    },
  });

  win.loadFile(path.join(app.getAppPath(), "dist/index.html"));
};

// IPC listener za shranjevanje datotek
ipcMain.on("save-file", (event, { fileName, blob }) => {
  const savePath = path.join(app.getPath("documents"), fileName); // Shrani v dokumente
  fs.writeFileSync(savePath, Buffer.from(blob)); // Shranimo datoteko
  event.reply("file-saved", "File successfully saved!");
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
