const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0f1115",
    show: false,
    title: "PRISM",
    // Sets the window/taskbar icon while the app is running (dev and
    // packaged). This is separate from the packaged .exe's own icon,
    // which electron-builder embeds automatically from build/icon.ico
    // at build time via its default conventions — no config needed
    // there since package.json has no explicit "build" block.
    icon: path.join(app.getAppPath(), "build", "icon.ico"),
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