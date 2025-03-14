const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const { app, BrowserWindow } = require("electron");

// Handle the file save dialog
ipcMain.handle("show-save-dialog", async (event, excelBuffer) => {
  const result = await dialog.showSaveDialog({
    title: "Save Excel File",
    defaultPath: "Zbirka_struktura.xlsx", // Default filename
    filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
  });

  if (!result.canceled && result.filePath) {
    // If the user selected a file path, save the Excel data to that path
    fs.writeFile(result.filePath, Buffer.from(excelBuffer), (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return;
      }
      console.log("File saved successfully at:", result.filePath);
    });
    return result.filePath; // Return the file path to the renderer process
  } else {
    return null; // User canceled the dialog
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);
