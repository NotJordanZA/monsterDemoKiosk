import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { TouchDesignerWebSocketServer } from '../src/services/websocket-server';

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
let wsServer: TouchDesignerWebSocketServer;

const createWindow = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  mainWindow = new BrowserWindow({
    width: isDev ? 1200 : undefined,
    height: isDev ? 800 : undefined,
    fullscreen: !isDev,
    frame: isDev,
    kiosk: !isDev,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!isDev) {
    mainWindow.setMenuBarVisibility(false);
  }

  mainWindow.on('close', (e) => {
    if (!isQuitting && !isDev) {
      e.preventDefault();
    }
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Main window crashed, restarting...');
    if (mainWindow) {
      mainWindow.destroy();
      createWindow();
    }
  });

  // Try multiple ports for development
  if (isDev) {
    const tryPort = async (port: number): Promise<void> => {
      try {
        await mainWindow!.loadURL(`http://localhost:${port}`);
        console.log(`✅ Connected to Vite dev server on port ${port}`);
      } catch (error) {
        console.log(`❌ Port ${port} failed, trying next...`);
        if (port < 5180) {
          await tryPort(port + 1);
        } else {
          throw new Error('Could not connect to Vite dev server');
        }
      }
    };
    
    tryPort(5173).catch(console.error);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  if (mainWindow) {
    mainWindow.destroy();
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
  
  wsServer = new TouchDesignerWebSocketServer(9980);
  wsServer.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on('before-quit', () => {
  isQuitting = true;
  if (wsServer) {
    wsServer.stop();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('send-streamdiffusion-data', async (_, data: { prompt: string; steps: number }) => {
  try {
    if (wsServer) {
      wsServer.broadcastStreamDiffusionData(data);
      return { success: true };
    }
    return { success: false, error: 'WebSocket server not available' };
  } catch (error) {
    console.error('Error sending StreamDiffusion data:', error);
    return { success: false, error: error };
  }
});