import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  sendStreamDiffusionData: (data: { prompt: string; steps: number }) => Promise<{ success: boolean; error?: any }>;
}

const electronAPI: ElectronAPI = {
  sendStreamDiffusionData: (data) => ipcRenderer.invoke('send-streamdiffusion-data', data),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);