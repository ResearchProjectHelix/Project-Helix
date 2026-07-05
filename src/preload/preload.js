const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("helix", {
  onLicenseInvalid: (callback) => {
    ipcRenderer.on("license-invalid", callback);
  },

  getVersion: () => process.versions.electron
});