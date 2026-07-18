const { autoUpdater } = require("electron-updater");

function setupAutoUpdater() {
  // Automatically download updates
  autoUpdater.autoDownload = true;

  // Install update when app closes
  autoUpdater.autoInstallOnAppQuit = true;

  // Logs
  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info.version);
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("No update available. Current version:", info.version);
  });

  autoUpdater.on("download-progress", (progress) => {
    console.log(
      `Downloading update: ${progress.percent.toFixed(1)}%`
    );
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded:", info.version);
    console.log("Installing update...");

    autoUpdater.quitAndInstall();
  });

  autoUpdater.on("error", (error) => {
    console.error("Auto-update error:", error);
  });

  // Start checking
  autoUpdater.checkForUpdates();
}

module.exports = {
  setupAutoUpdater
};