const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 Preload script is loading...');

const electronAPI = {
  sendStreamDiffusionData: (data) => ipcRenderer.invoke('send-streamdiffusion-data', data),
};

console.log('🌉 Exposing ElectronAPI to main world...');
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
console.log('✅ ElectronAPI exposed successfully');