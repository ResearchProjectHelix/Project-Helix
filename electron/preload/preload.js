const { contextBridge } = require('electron');

// Expose only what the renderer actually needs, as Phase 4 file uploads etc. get built.
contextBridge.exposeInMainWorld('helix', {
  version: '0.1.0',
});