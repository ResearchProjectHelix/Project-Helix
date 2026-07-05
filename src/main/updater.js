const { autoUpdater } = require("electron-updater");

function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.checkForUpdates();

  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", () => {
    console.log("Update available");
  });

  autoUpdater.on("update-downloaded", () => {
    console.log("Update downloaded. Installing...");
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
  });
}

module.exports = { setupAutoUpdater };