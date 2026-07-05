const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0f1115",
    show: false,
    webPreferences: {
      // ✅ FIXED PRELOAD (THIS IS YOUR CRASH)
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // ======================
  // DEV MODE
  // ======================
  if (!app.isPackaged) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools();
    return;
  }

  // ======================
  // PRODUCTION MODE (CORRECT)
  // ======================
  mainWindow.loadFile(
    path.join(__dirname, "../renderer/index.html")
  );

  mainWindow.webContents.on("did-fail-load", (e, code, desc) => {
    console.error("LOAD FAILED:", code, desc);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});