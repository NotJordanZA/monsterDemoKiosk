var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
class TouchDesignerWebSocketServer {
  constructor(port = 9980) {
    __publicField(this, "wss", null);
    __publicField(this, "clients", /* @__PURE__ */ new Set());
    __publicField(this, "port");
    this.port = port;
  }
  start() {
    console.log("🚀 Starting TouchDesigner WebSocket server...");
    if (this.wss) {
      console.log("⚠️  WebSocket server is already running on port", this.port);
      return;
    }
    console.log(`🔧 Initializing WebSocket server on port ${this.port} (host: 0.0.0.0)`);
    this.wss = new WebSocketServer({
      port: this.port,
      host: "0.0.0.0"
    });
    this.wss.on("listening", () => {
      console.log(`🟢 WebSocket server successfully started and listening on all interfaces, port ${this.port}`);
      console.log(`📡 TouchDesigner can connect to: ws://localhost:${this.port}`);
    });
    this.wss.on("connection", (ws, req) => {
      const clientIp = req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"] || "Unknown";
      console.log(`🔗 NEW CONNECTION: TouchDesigner client connected`);
      console.log(`   📍 IP Address: ${clientIp}`);
      console.log(`   🔧 User Agent: ${userAgent}`);
      console.log(`   👥 Total connected clients: ${this.clients.size + 1}`);
      this.clients.add(ws);
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log(`📥 RECEIVED MESSAGE from ${clientIp}:`);
          console.log(`   📋 Message type: ${data.type || "unknown"}`);
          console.log(`   📊 Message data:`, data);
          console.log(`   📏 Message size: ${message.length} bytes`);
          this.broadcastMessage(data);
        } catch (error) {
          console.error(`❌ ERROR processing message from ${clientIp}:`);
          console.error(`   🔍 Raw message: ${message.toString()}`);
          console.error(`   💥 Error details:`, error);
        }
      });
      ws.on("close", (code, reason) => {
        console.log(`🔌 CLIENT DISCONNECTED: ${clientIp}`);
        console.log(`   📊 Close code: ${code}`);
        console.log(`   📝 Close reason: ${reason || "No reason provided"}`);
        console.log(`   👥 Remaining clients: ${this.clients.size - 1}`);
        this.clients.delete(ws);
        if (this.clients.size === 0) {
          console.log("⚠️  No TouchDesigner clients connected");
        }
      });
      ws.on("error", (error) => {
        console.error(`❌ WEBSOCKET ERROR from ${clientIp}:`);
        console.error(`   💥 Error message: ${error.message}`);
        console.error(`   🔍 Error details:`, error);
      });
      const welcomeMessage = {
        type: "connection",
        message: "Connected to Monster StreamDiffusion Interface",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        serverInfo: {
          port: this.port,
          clientCount: this.clients.size
        }
      };
      console.log(`📤 Sending welcome message to ${clientIp}:`, welcomeMessage);
      ws.send(JSON.stringify(welcomeMessage));
    });
    this.wss.on("error", (error) => {
      console.error("❌ WEBSOCKET SERVER ERROR:");
      console.error(`   💥 Error message: ${error.message}`);
      console.error(`   🔍 Error details:`, error);
    });
  }
  broadcastMessage(data) {
    if (!this.wss) {
      console.error("❌ BROADCAST FAILED: WebSocket server is not running");
      return false;
    }
    console.log("📤 BROADCASTING MESSAGE to TouchDesigner clients:");
    console.log(`   👥 Target clients: ${this.clients.size}`);
    console.log(`   📋 Message type: ${data.type || "unknown"}`);
    console.log(`   📊 Message data:`, data);
    const message = JSON.stringify(data);
    const messageSize = Buffer.byteLength(message, "utf8");
    console.log(`   📏 Message size: ${messageSize} bytes`);
    let successCount = 0;
    let failureCount = 0;
    this.clients.forEach((client, index) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
          successCount++;
          console.log(`   ✅ Message sent to client ${index + 1}`);
        } catch (error) {
          failureCount++;
          console.error(`   ❌ Failed to send to client ${index + 1}:`, error);
        }
      } else {
        failureCount++;
        console.log(`   ⚠️  Client ${index + 1} not ready (state: ${client.readyState})`);
      }
    });
    console.log(`📊 BROADCAST COMPLETE: ${successCount} successful, ${failureCount} failed`);
    return successCount > 0;
  }
  broadcastStreamDiffusionData(data) {
    if (!this.wss) {
      console.error("❌ STREAMDIFFUSION BROADCAST FAILED: WebSocket server is not running");
      return false;
    }
    console.log("🎨 STREAMDIFFUSION UPDATE - Preparing broadcast:");
    console.log(`   📝 Prompt: "${data.prompt}"`);
    console.log(`   ⚡ Intensity: ${data.steps}`);
    console.log(`   📅 Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
    const message = {
      type: "streamdiffusion_update",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      prompt: data.prompt,
      steps: data.steps
    };
    console.log("🎨 Broadcasting StreamDiffusion transformation data to TouchDesigner...");
    const result = this.broadcastMessage(message);
    if (result) {
      console.log("✅ StreamDiffusion data successfully broadcast to TouchDesigner");
    } else {
      console.error("❌ Failed to broadcast StreamDiffusion data to TouchDesigner");
    }
    return result;
  }
  stop() {
    console.log("🛑 Stopping TouchDesigner WebSocket server...");
    if (this.wss) {
      console.log(`   👥 Disconnecting ${this.clients.size} active clients`);
      this.clients.forEach((client, index) => {
        if (client.readyState === WebSocket.OPEN) {
          console.log(`   🔌 Closing connection to client ${index + 1}`);
          client.close(1e3, "Server shutting down");
        }
      });
      console.log("   🔧 Closing WebSocket server...");
      this.wss.close(() => {
        console.log("   ✅ WebSocket server closed successfully");
      });
      this.wss = null;
      this.clients.clear();
      console.log("🔴 TouchDesigner WebSocket server stopped completely");
    } else {
      console.log("⚠️  WebSocket server was not running");
    }
  }
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow = null;
let isQuitting = false;
let wsServer;
const createWindow = () => {
  const isDev = process.env.NODE_ENV === "development";
  const preloadPath = path.join(__dirname, "preload.js");
  console.log("🔧 Creating window with preload path:", preloadPath);
  console.log("🔧 __dirname is:", __dirname);
  mainWindow = new BrowserWindow({
    width: isDev ? 1200 : void 0,
    height: isDev ? 800 : void 0,
    fullscreen: true,
    frame: false,
    kiosk: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on("close", (e) => {
    if (!isQuitting && !isDev) {
      e.preventDefault();
    }
  });
  mainWindow.webContents.on("crashed", () => {
    console.error("Main window crashed, restarting...");
    if (mainWindow) {
      mainWindow.destroy();
      createWindow();
    }
  });
  if (isDev) {
    const tryPort = async (port) => {
      try {
        await mainWindow.loadURL(`http://localhost:${port}`);
        console.log(`✅ Connected to Vite dev server on port ${port}`);
      } catch (error) {
        console.log(`❌ Port ${port} failed, trying next...`);
        if (port < 5180) {
          await tryPort(port + 1);
        } else {
          throw new Error("Could not connect to Vite dev server");
        }
      }
    };
    tryPort(5173).catch(console.error);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  if (mainWindow) {
    mainWindow.destroy();
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  wsServer = new TouchDesignerWebSocketServer(9980);
  wsServer.start();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
app.on("before-quit", () => {
  isQuitting = true;
  if (wsServer) {
    wsServer.stop();
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
ipcMain.handle("send-streamdiffusion-data", async (_, data) => {
  try {
    if (wsServer) {
      wsServer.broadcastStreamDiffusionData(data);
      return { success: true };
    }
    return { success: false, error: "WebSocket server not available" };
  } catch (error) {
    console.error("Error sending StreamDiffusion data:", error);
    return { success: false, error };
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZpY2VzL3dlYnNvY2tldC1zZXJ2ZXIudHMiLCIuLi9lbGVjdHJvbi9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFdlYlNvY2tldCwgV2ViU29ja2V0U2VydmVyIH0gZnJvbSAnd3MnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTdHJlYW1EaWZmdXNpb25EYXRhIHtcclxuICBwcm9tcHQ6IHN0cmluZztcclxuICBzdGVwczogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVG91Y2hEZXNpZ25lcldlYlNvY2tldFNlcnZlciB7XHJcbiAgcHJpdmF0ZSB3c3M6IFdlYlNvY2tldFNlcnZlciB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgY2xpZW50czogU2V0PFdlYlNvY2tldD4gPSBuZXcgU2V0KCk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwb3J0OiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHBvcnQ6IG51bWJlciA9IDk5ODApIHtcclxuICAgIHRoaXMucG9ydCA9IHBvcnQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygn8J+agCBTdGFydGluZyBUb3VjaERlc2lnbmVyIFdlYlNvY2tldCBzZXJ2ZXIuLi4nKTtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMud3NzKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfimqDvuI8gIFdlYlNvY2tldCBzZXJ2ZXIgaXMgYWxyZWFkeSBydW5uaW5nIG9uIHBvcnQnLCB0aGlzLnBvcnQpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coYPCflKcgSW5pdGlhbGl6aW5nIFdlYlNvY2tldCBzZXJ2ZXIgb24gcG9ydCAke3RoaXMucG9ydH0gKGhvc3Q6IDAuMC4wLjApYCk7XHJcbiAgICBcclxuICAgIHRoaXMud3NzID0gbmV3IFdlYlNvY2tldFNlcnZlcih7IFxyXG4gICAgICBwb3J0OiB0aGlzLnBvcnQsXHJcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy53c3Mub24oJ2xpc3RlbmluZycsICgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coYPCfn6IgV2ViU29ja2V0IHNlcnZlciBzdWNjZXNzZnVsbHkgc3RhcnRlZCBhbmQgbGlzdGVuaW5nIG9uIGFsbCBpbnRlcmZhY2VzLCBwb3J0ICR7dGhpcy5wb3J0fWApO1xyXG4gICAgICBjb25zb2xlLmxvZyhg8J+ToSBUb3VjaERlc2lnbmVyIGNhbiBjb25uZWN0IHRvOiB3czovL2xvY2FsaG9zdDoke3RoaXMucG9ydH1gKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMud3NzLm9uKCdjb25uZWN0aW9uJywgKHdzOiBXZWJTb2NrZXQsIHJlcSkgPT4ge1xyXG4gICAgICBjb25zdCBjbGllbnRJcCA9IHJlcS5zb2NrZXQucmVtb3RlQWRkcmVzcztcclxuICAgICAgY29uc3QgdXNlckFnZW50ID0gcmVxLmhlYWRlcnNbJ3VzZXItYWdlbnQnXSB8fCAnVW5rbm93bic7XHJcbiAgICAgIFxyXG4gICAgICBjb25zb2xlLmxvZyhg8J+UlyBORVcgQ09OTkVDVElPTjogVG91Y2hEZXNpZ25lciBjbGllbnQgY29ubmVjdGVkYCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKGAgICDwn5ONIElQIEFkZHJlc3M6ICR7Y2xpZW50SXB9YCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKGAgICDwn5SnIFVzZXIgQWdlbnQ6ICR7dXNlckFnZW50fWApO1xyXG4gICAgICBjb25zb2xlLmxvZyhgICAg8J+RpSBUb3RhbCBjb25uZWN0ZWQgY2xpZW50czogJHt0aGlzLmNsaWVudHMuc2l6ZSArIDF9YCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmNsaWVudHMuYWRkKHdzKTtcclxuXHJcbiAgICAgIHdzLm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS50b1N0cmluZygpKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGDwn5OlIFJFQ0VJVkVEIE1FU1NBR0UgZnJvbSAke2NsaWVudElwfTpgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGAgICDwn5OLIE1lc3NhZ2UgdHlwZTogJHtkYXRhLnR5cGUgfHwgJ3Vua25vd24nfWApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYCAgIPCfk4ogTWVzc2FnZSBkYXRhOmAsIGRhdGEpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYCAgIPCfk48gTWVzc2FnZSBzaXplOiAke21lc3NhZ2UubGVuZ3RofSBieXRlc2ApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICB0aGlzLmJyb2FkY2FzdE1lc3NhZ2UoZGF0YSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFUlJPUiBwcm9jZXNzaW5nIG1lc3NhZ2UgZnJvbSAke2NsaWVudElwfTpgKTtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCAgIPCflI0gUmF3IG1lc3NhZ2U6ICR7bWVzc2FnZS50b1N0cmluZygpfWApO1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgICAg8J+SpSBFcnJvciBkZXRhaWxzOmAsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgd3Mub24oJ2Nsb3NlJywgKGNvZGUsIHJlYXNvbikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SMIENMSUVOVCBESVNDT05ORUNURUQ6ICR7Y2xpZW50SXB9YCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYCAgIPCfk4ogQ2xvc2UgY29kZTogJHtjb2RlfWApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGAgICDwn5OdIENsb3NlIHJlYXNvbjogJHtyZWFzb24gfHwgJ05vIHJlYXNvbiBwcm92aWRlZCd9YCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYCAgIPCfkaUgUmVtYWluaW5nIGNsaWVudHM6ICR7dGhpcy5jbGllbnRzLnNpemUgLSAxfWApO1xyXG4gICAgICAgIHRoaXMuY2xpZW50cy5kZWxldGUod3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLmNsaWVudHMuc2l6ZSA9PT0gMCkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ+KaoO+4jyAgTm8gVG91Y2hEZXNpZ25lciBjbGllbnRzIGNvbm5lY3RlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB3cy5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgV0VCU09DS0VUIEVSUk9SIGZyb20gJHtjbGllbnRJcH06YCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgICAg8J+SpSBFcnJvciBtZXNzYWdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgICAg8J+UjSBFcnJvciBkZXRhaWxzOmAsIGVycm9yKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCB3ZWxjb21lTWVzc2FnZSA9IHtcclxuICAgICAgICB0eXBlOiAnY29ubmVjdGlvbicsXHJcbiAgICAgICAgbWVzc2FnZTogJ0Nvbm5lY3RlZCB0byBNb25zdGVyIFN0cmVhbURpZmZ1c2lvbiBJbnRlcmZhY2UnLFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIHNlcnZlckluZm86IHtcclxuICAgICAgICAgIHBvcnQ6IHRoaXMucG9ydCxcclxuICAgICAgICAgIGNsaWVudENvdW50OiB0aGlzLmNsaWVudHMuc2l6ZVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgXHJcbiAgICAgIGNvbnNvbGUubG9nKGDwn5OkIFNlbmRpbmcgd2VsY29tZSBtZXNzYWdlIHRvICR7Y2xpZW50SXB9OmAsIHdlbGNvbWVNZXNzYWdlKTtcclxuICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh3ZWxjb21lTWVzc2FnZSkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy53c3Mub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBXRUJTT0NLRVQgU0VSVkVSIEVSUk9SOicpO1xyXG4gICAgICBjb25zb2xlLmVycm9yKGAgICDwn5KlIEVycm9yIG1lc3NhZ2U6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgY29uc29sZS5lcnJvcihgICAg8J+UjSBFcnJvciBkZXRhaWxzOmAsIGVycm9yKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGJyb2FkY2FzdE1lc3NhZ2UoZGF0YTogYW55KSB7XHJcbiAgICBpZiAoIXRoaXMud3NzKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBCUk9BRENBU1QgRkFJTEVEOiBXZWJTb2NrZXQgc2VydmVyIGlzIG5vdCBydW5uaW5nJyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZygn8J+TpCBCUk9BRENBU1RJTkcgTUVTU0FHRSB0byBUb3VjaERlc2lnbmVyIGNsaWVudHM6Jyk7XHJcbiAgICBjb25zb2xlLmxvZyhgICAg8J+RpSBUYXJnZXQgY2xpZW50czogJHt0aGlzLmNsaWVudHMuc2l6ZX1gKTtcclxuICAgIGNvbnNvbGUubG9nKGAgICDwn5OLIE1lc3NhZ2UgdHlwZTogJHtkYXRhLnR5cGUgfHwgJ3Vua25vd24nfWApO1xyXG4gICAgY29uc29sZS5sb2coYCAgIPCfk4ogTWVzc2FnZSBkYXRhOmAsIGRhdGEpO1xyXG5cclxuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcclxuICAgIGNvbnN0IG1lc3NhZ2VTaXplID0gQnVmZmVyLmJ5dGVMZW5ndGgobWVzc2FnZSwgJ3V0ZjgnKTtcclxuICAgIGNvbnNvbGUubG9nKGAgICDwn5OPIE1lc3NhZ2Ugc2l6ZTogJHttZXNzYWdlU2l6ZX0gYnl0ZXNgKTtcclxuXHJcbiAgICBsZXQgc3VjY2Vzc0NvdW50ID0gMDtcclxuICAgIGxldCBmYWlsdXJlQ291bnQgPSAwO1xyXG5cclxuICAgIHRoaXMuY2xpZW50cy5mb3JFYWNoKChjbGllbnQsIGluZGV4KSA9PiB7XHJcbiAgICAgIGlmIChjbGllbnQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU4pIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY2xpZW50LnNlbmQobWVzc2FnZSk7XHJcbiAgICAgICAgICBzdWNjZXNzQ291bnQrKztcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGAgICDinIUgTWVzc2FnZSBzZW50IHRvIGNsaWVudCAke2luZGV4ICsgMX1gKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgZmFpbHVyZUNvdW50Kys7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGAgICDinYwgRmFpbGVkIHRvIHNlbmQgdG8gY2xpZW50ICR7aW5kZXggKyAxfTpgLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZhaWx1cmVDb3VudCsrO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGAgICDimqDvuI8gIENsaWVudCAke2luZGV4ICsgMX0gbm90IHJlYWR5IChzdGF0ZTogJHtjbGllbnQucmVhZHlTdGF0ZX0pYCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGDwn5OKIEJST0FEQ0FTVCBDT01QTEVURTogJHtzdWNjZXNzQ291bnR9IHN1Y2Nlc3NmdWwsICR7ZmFpbHVyZUNvdW50fSBmYWlsZWRgKTtcclxuICAgIHJldHVybiBzdWNjZXNzQ291bnQgPiAwO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGJyb2FkY2FzdFN0cmVhbURpZmZ1c2lvbkRhdGEoZGF0YTogU3RyZWFtRGlmZnVzaW9uRGF0YSkge1xyXG4gICAgaWYgKCF0aGlzLndzcykge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgU1RSRUFNRElGRlVTSU9OIEJST0FEQ0FTVCBGQUlMRUQ6IFdlYlNvY2tldCBzZXJ2ZXIgaXMgbm90IHJ1bm5pbmcnKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCfwn46oIFNUUkVBTURJRkZVU0lPTiBVUERBVEUgLSBQcmVwYXJpbmcgYnJvYWRjYXN0OicpO1xyXG4gICAgY29uc29sZS5sb2coYCAgIPCfk50gUHJvbXB0OiBcIiR7ZGF0YS5wcm9tcHR9XCJgKTtcclxuICAgIGNvbnNvbGUubG9nKGAgICDimqEgSW50ZW5zaXR5OiAke2RhdGEuc3RlcHN9YCk7XHJcbiAgICBjb25zb2xlLmxvZyhgICAg8J+ThSBUaW1lc3RhbXA6ICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfWApO1xyXG5cclxuICAgIGNvbnN0IG1lc3NhZ2UgPSB7XHJcbiAgICAgIHR5cGU6ICdzdHJlYW1kaWZmdXNpb25fdXBkYXRlJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgIHByb21wdDogZGF0YS5wcm9tcHQsXHJcbiAgICAgIHN0ZXBzOiBkYXRhLnN0ZXBzXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCfwn46oIEJyb2FkY2FzdGluZyBTdHJlYW1EaWZmdXNpb24gdHJhbnNmb3JtYXRpb24gZGF0YSB0byBUb3VjaERlc2lnbmVyLi4uJyk7XHJcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmJyb2FkY2FzdE1lc3NhZ2UobWVzc2FnZSk7XHJcbiAgICBcclxuICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBTdHJlYW1EaWZmdXNpb24gZGF0YSBzdWNjZXNzZnVsbHkgYnJvYWRjYXN0IHRvIFRvdWNoRGVzaWduZXInKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBGYWlsZWQgdG8gYnJvYWRjYXN0IFN0cmVhbURpZmZ1c2lvbiBkYXRhIHRvIFRvdWNoRGVzaWduZXInKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdG9wKCkge1xyXG4gICAgY29uc29sZS5sb2coJ/Cfm5EgU3RvcHBpbmcgVG91Y2hEZXNpZ25lciBXZWJTb2NrZXQgc2VydmVyLi4uJyk7XHJcbiAgICBcclxuICAgIGlmICh0aGlzLndzcykge1xyXG4gICAgICBjb25zb2xlLmxvZyhgICAg8J+RpSBEaXNjb25uZWN0aW5nICR7dGhpcy5jbGllbnRzLnNpemV9IGFjdGl2ZSBjbGllbnRzYCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDbG9zZSBhbGwgY2xpZW50IGNvbm5lY3Rpb25zXHJcbiAgICAgIHRoaXMuY2xpZW50cy5mb3JFYWNoKChjbGllbnQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKGNsaWVudC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuT1BFTikge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYCAgIPCflIwgQ2xvc2luZyBjb25uZWN0aW9uIHRvIGNsaWVudCAke2luZGV4ICsgMX1gKTtcclxuICAgICAgICAgIGNsaWVudC5jbG9zZSgxMDAwLCAnU2VydmVyIHNodXR0aW5nIGRvd24nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgY29uc29sZS5sb2coJyAgIPCflKcgQ2xvc2luZyBXZWJTb2NrZXQgc2VydmVyLi4uJyk7XHJcbiAgICAgIHRoaXMud3NzLmNsb3NlKCgpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnICAg4pyFIFdlYlNvY2tldCBzZXJ2ZXIgY2xvc2VkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMud3NzID0gbnVsbDtcclxuICAgICAgdGhpcy5jbGllbnRzLmNsZWFyKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn5S0IFRvdWNoRGVzaWduZXIgV2ViU29ja2V0IHNlcnZlciBzdG9wcGVkIGNvbXBsZXRlbHknKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfimqDvuI8gIFdlYlNvY2tldCBzZXJ2ZXIgd2FzIG5vdCBydW5uaW5nJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwiaW1wb3J0IHsgYXBwLCBCcm93c2VyV2luZG93LCBpcGNNYWluIH0gZnJvbSAnZWxlY3Ryb24nO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcclxuaW1wb3J0IHsgVG91Y2hEZXNpZ25lcldlYlNvY2tldFNlcnZlciB9IGZyb20gJy4uL3NyYy9zZXJ2aWNlcy93ZWJzb2NrZXQtc2VydmVyJztcclxuXHJcbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XHJcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKTtcclxuXHJcbmxldCBtYWluV2luZG93OiBCcm93c2VyV2luZG93IHwgbnVsbCA9IG51bGw7XHJcbmxldCBpc1F1aXR0aW5nID0gZmFsc2U7XHJcbmxldCB3c1NlcnZlcjogVG91Y2hEZXNpZ25lcldlYlNvY2tldFNlcnZlcjtcclxuXHJcbmNvbnN0IGNyZWF0ZVdpbmRvdyA9ICgpID0+IHtcclxuICBjb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnO1xyXG4gIGNvbnN0IHByZWxvYWRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ3ByZWxvYWQuanMnKTtcclxuICBcclxuICBjb25zb2xlLmxvZygn8J+UpyBDcmVhdGluZyB3aW5kb3cgd2l0aCBwcmVsb2FkIHBhdGg6JywgcHJlbG9hZFBhdGgpO1xyXG4gIGNvbnNvbGUubG9nKCfwn5SnIF9fZGlybmFtZSBpczonLCBfX2Rpcm5hbWUpO1xyXG4gIFxyXG4gIG1haW5XaW5kb3cgPSBuZXcgQnJvd3NlcldpbmRvdyh7XHJcbiAgICB3aWR0aDogaXNEZXYgPyAxMjAwIDogdW5kZWZpbmVkLFxyXG4gICAgaGVpZ2h0OiBpc0RldiA/IDgwMCA6IHVuZGVmaW5lZCxcclxuICAgIGZ1bGxzY3JlZW46IHRydWUsXHJcbiAgICBmcmFtZTogZmFsc2UsXHJcbiAgICBraW9zazogdHJ1ZSxcclxuICAgIHdlYlByZWZlcmVuY2VzOiB7XHJcbiAgICAgIHByZWxvYWQ6IHByZWxvYWRQYXRoLFxyXG4gICAgICBjb250ZXh0SXNvbGF0aW9uOiB0cnVlLFxyXG4gICAgICBub2RlSW50ZWdyYXRpb246IGZhbHNlLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgbWFpbldpbmRvdy5zZXRNZW51QmFyVmlzaWJpbGl0eShmYWxzZSk7XHJcblxyXG4gIG1haW5XaW5kb3cub24oJ2Nsb3NlJywgKGUpID0+IHtcclxuICAgIGlmICghaXNRdWl0dGluZyAmJiAhaXNEZXYpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9uKCdjcmFzaGVkJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5lcnJvcignTWFpbiB3aW5kb3cgY3Jhc2hlZCwgcmVzdGFydGluZy4uLicpO1xyXG4gICAgaWYgKG1haW5XaW5kb3cpIHtcclxuICAgICAgbWFpbldpbmRvdy5kZXN0cm95KCk7XHJcbiAgICAgIGNyZWF0ZVdpbmRvdygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBUcnkgbXVsdGlwbGUgcG9ydHMgZm9yIGRldmVsb3BtZW50XHJcbiAgaWYgKGlzRGV2KSB7XHJcbiAgICBjb25zdCB0cnlQb3J0ID0gYXN5bmMgKHBvcnQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG1haW5XaW5kb3chLmxvYWRVUkwoYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDinIUgQ29ubmVjdGVkIHRvIFZpdGUgZGV2IHNlcnZlciBvbiBwb3J0ICR7cG9ydH1gKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg4p2MIFBvcnQgJHtwb3J0fSBmYWlsZWQsIHRyeWluZyBuZXh0Li4uYCk7XHJcbiAgICAgICAgaWYgKHBvcnQgPCA1MTgwKSB7XHJcbiAgICAgICAgICBhd2FpdCB0cnlQb3J0KHBvcnQgKyAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byBWaXRlIGRldiBzZXJ2ZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuICAgIHRyeVBvcnQoNTE3MykuY2F0Y2goY29uc29sZS5lcnJvcik7XHJcbiAgfSBlbHNlIHtcclxuICAgIG1haW5XaW5kb3cubG9hZEZpbGUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2Rpc3QvaW5kZXguaHRtbCcpKTtcclxuICB9XHJcbn07XHJcblxyXG5wcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIChlcnJvcikgPT4ge1xyXG4gIGNvbnNvbGUuZXJyb3IoJ1VuY2F1Z2h0IGV4Y2VwdGlvbjonLCBlcnJvcik7XHJcbiAgaWYgKG1haW5XaW5kb3cpIHtcclxuICAgIG1haW5XaW5kb3cuZGVzdHJveSgpO1xyXG4gICAgY3JlYXRlV2luZG93KCk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFwcC53aGVuUmVhZHkoKS50aGVuKCgpID0+IHtcclxuICBjcmVhdGVXaW5kb3coKTtcclxuICBcclxuICB3c1NlcnZlciA9IG5ldyBUb3VjaERlc2lnbmVyV2ViU29ja2V0U2VydmVyKDk5ODApO1xyXG4gIHdzU2VydmVyLnN0YXJ0KCk7XHJcblxyXG4gIGFwcC5vbignYWN0aXZhdGUnLCAoKSA9PiB7XHJcbiAgICBpZiAoQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNyZWF0ZVdpbmRvdygpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuXHJcbmNvbnN0IGdvdFRoZUxvY2sgPSBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaygpO1xyXG5pZiAoIWdvdFRoZUxvY2spIHtcclxuICBhcHAucXVpdCgpO1xyXG59IGVsc2Uge1xyXG4gIGFwcC5vbignc2Vjb25kLWluc3RhbmNlJywgKCkgPT4ge1xyXG4gICAgaWYgKG1haW5XaW5kb3cpIHtcclxuICAgICAgaWYgKG1haW5XaW5kb3cuaXNNaW5pbWl6ZWQoKSkgbWFpbldpbmRvdy5yZXN0b3JlKCk7XHJcbiAgICAgIG1haW5XaW5kb3cuZm9jdXMoKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuYXBwLm9uKCdiZWZvcmUtcXVpdCcsICgpID0+IHtcclxuICBpc1F1aXR0aW5nID0gdHJ1ZTtcclxuICBpZiAod3NTZXJ2ZXIpIHtcclxuICAgIHdzU2VydmVyLnN0b3AoKTtcclxuICB9XHJcbn0pO1xyXG5cclxuYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsICgpID0+IHtcclxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2RhcndpbicpIHtcclxuICAgIGFwcC5xdWl0KCk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmlwY01haW4uaGFuZGxlKCdzZW5kLXN0cmVhbWRpZmZ1c2lvbi1kYXRhJywgYXN5bmMgKF8sIGRhdGE6IHsgcHJvbXB0OiBzdHJpbmc7IHN0ZXBzOiBudW1iZXIgfSkgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAod3NTZXJ2ZXIpIHtcclxuICAgICAgd3NTZXJ2ZXIuYnJvYWRjYXN0U3RyZWFtRGlmZnVzaW9uRGF0YShkYXRhKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnV2ViU29ja2V0IHNlcnZlciBub3QgYXZhaWxhYmxlJyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZW5kaW5nIFN0cmVhbURpZmZ1c2lvbiBkYXRhOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IgfTtcclxuICB9XHJcbn0pOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBT08sTUFBTSw2QkFBNkI7QUFBQSxFQUt4QyxZQUFZLE9BQWUsTUFBTTtBQUp6QiwrQkFBOEI7QUFDOUIsdURBQThCLElBQUE7QUFDckI7QUFHZixTQUFLLE9BQU87QUFBQSxFQUNkO0FBQUEsRUFFTyxRQUFRO0FBQ2IsWUFBUSxJQUFJLCtDQUErQztBQUUzRCxRQUFJLEtBQUssS0FBSztBQUNaLGNBQVEsSUFBSSxtREFBbUQsS0FBSyxJQUFJO0FBQ3hFO0FBQUEsSUFDRjtBQUVBLFlBQVEsSUFBSSw0Q0FBNEMsS0FBSyxJQUFJLGtCQUFrQjtBQUVuRixTQUFLLE1BQU0sSUFBSSxnQkFBZ0I7QUFBQSxNQUM3QixNQUFNLEtBQUs7QUFBQSxNQUNYLE1BQU07QUFBQSxJQUFBLENBQ1A7QUFFRCxTQUFLLElBQUksR0FBRyxhQUFhLE1BQU07QUFDN0IsY0FBUSxJQUFJLGtGQUFrRixLQUFLLElBQUksRUFBRTtBQUN6RyxjQUFRLElBQUksbURBQW1ELEtBQUssSUFBSSxFQUFFO0FBQUEsSUFDNUUsQ0FBQztBQUVELFNBQUssSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFlLFFBQVE7QUFDaEQsWUFBTSxXQUFXLElBQUksT0FBTztBQUM1QixZQUFNLFlBQVksSUFBSSxRQUFRLFlBQVksS0FBSztBQUUvQyxjQUFRLElBQUksbURBQW1EO0FBQy9ELGNBQVEsSUFBSSxxQkFBcUIsUUFBUSxFQUFF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
