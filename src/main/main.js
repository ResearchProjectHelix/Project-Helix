const { app, BrowserWindow } = require("electron");
const path = require("path");

const { setupAutoUpdater } = require("./updater");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0f1115",
    show: false,
    title: "PRISM",

    icon: path.join(
      app.getAppPath(),
      "build",
      "icon.ico"
    ),

    webPreferences: {
      preload: path.join(
        __dirname,
        "../preload/index.js"
      ),
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
    mainWindow.loadURL(
      process.env.ELECTRON_RENDERER_URL
    );

    mainWindow.webContents.openDevTools();

    return;
  }


  // ======================
  // PRODUCTION MODE
  // ======================
  mainWindow.loadFile(
    path.join(
      __dirname,
      "../renderer/index.html"
    )
  );


  mainWindow.webContents.on(
    "did-fail-load",
    (event, code, description) => {
      console.error(
        "LOAD FAILED:",
        code,
        description
      );
    }
  );
}


app.whenReady().then(() => {
  createWindow();

  // Only check updates on installed versions
  if (app.isPackaged) {
    setupAutoUpdater();
  }
});


app.on(
  "window-all-closed",
  () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }
);


app.on(
  "activate",
  () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  }
);