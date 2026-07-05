const { app, BrowserWindow, dialog, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let mainWindow;

// =====================================
// AUTO UPDATER
// =====================================
function setupAutoUpdater(mainWindow) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info.version);

    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Available",
      message: `Version ${info.version} is available and is now downloading.`
    });
  });

  autoUpdater.on("update-not-available", () => {
    console.log("No updates available.");
  });

  autoUpdater.on("download-progress", (progress) => {
    mainWindow.setProgressBar(progress.percent / 100);

    console.log(
      `Downloading update: ${progress.percent.toFixed(1)}%`
    );
  });

  autoUpdater.on("update-downloaded", (info) => {
    mainWindow.setProgressBar(-1);

    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Ready",
      message: `Version ${info.version} has been downloaded.\n\nRestart Project Helix now to install it?`,
      buttons: ["Restart", "Later"],
      defaultId: 0
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on("error", (err) => {
    console.error("AutoUpdater error:", err);
  });

  autoUpdater.checkForUpdates().catch(err => {
    console.error("Update check failed:", err);
  });
}

// =====================================
// CREATE WINDOW
// =====================================
function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0f1115",
    show: false,

    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  console.log("APP VERSION:", app.getVersion());
  console.log("Packaged:", app.isPackaged);

  if (app.isPackaged) {
    setupAutoUpdater(mainWindow);
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // =============================
  // DEVELOPMENT
  // =============================
  if (!app.isPackaged) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools();
    return;
  }

  // =============================
  // PRODUCTION
  // =============================
  mainWindow.loadFile(
    path.join(__dirname, "../renderer/index.html")
  );

  mainWindow.webContents.on("did-fail-load", (event, code, desc) => {
    console.error("LOAD FAILED:", code, desc);
  });
}

// =====================================
// APP EVENTS
// =====================================
app.whenReady().then(createWindow);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});