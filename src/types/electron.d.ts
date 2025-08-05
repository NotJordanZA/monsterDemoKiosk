export interface ElectronAPI {
  sendStreamDiffusionData: (data: { prompt: string; steps: number }) => Promise<{ success: boolean; error?: any }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}