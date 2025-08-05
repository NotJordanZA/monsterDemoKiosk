import { WebSocket, WebSocketServer } from 'ws';

export interface StreamDiffusionData {
  prompt: string;
  steps: number;
}

export class TouchDesignerWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private readonly port: number;

  constructor(port: number = 9980) {
    this.port = port;
  }

  public start() {
    console.log('🚀 Starting TouchDesigner WebSocket server...');
    
    if (this.wss) {
      console.log('⚠️  WebSocket server is already running on port', this.port);
      return;
    }

    console.log(`🔧 Initializing WebSocket server on port ${this.port} (host: 0.0.0.0)`);
    
    this.wss = new WebSocketServer({ 
      port: this.port,
      host: '0.0.0.0'
    });

    this.wss.on('listening', () => {
      console.log(`🟢 WebSocket server successfully started and listening on all interfaces, port ${this.port}`);
      console.log(`📡 TouchDesigner can connect to: ws://localhost:${this.port}`);
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientIp = req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      
      console.log(`🔗 NEW CONNECTION: TouchDesigner client connected`);
      console.log(`   📍 IP Address: ${clientIp}`);
      console.log(`   🔧 User Agent: ${userAgent}`);
      console.log(`   👥 Total connected clients: ${this.clients.size + 1}`);
      
      this.clients.add(ws);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log(`📥 RECEIVED MESSAGE from ${clientIp}:`);
          console.log(`   📋 Message type: ${data.type || 'unknown'}`);
          console.log(`   📊 Message data:`, data);
          console.log(`   📏 Message size: ${message.length} bytes`);
          
          this.broadcastMessage(data);
        } catch (error) {
          console.error(`❌ ERROR processing message from ${clientIp}:`);
          console.error(`   🔍 Raw message: ${message.toString()}`);
          console.error(`   💥 Error details:`, error);
        }
      });

      ws.on('close', (code, reason) => {
        console.log(`🔌 CLIENT DISCONNECTED: ${clientIp}`);
        console.log(`   📊 Close code: ${code}`);
        console.log(`   📝 Close reason: ${reason || 'No reason provided'}`);
        console.log(`   👥 Remaining clients: ${this.clients.size - 1}`);
        this.clients.delete(ws);
        
        if (this.clients.size === 0) {
          console.log('⚠️  No TouchDesigner clients connected');
        }
      });

      ws.on('error', (error) => {
        console.error(`❌ WEBSOCKET ERROR from ${clientIp}:`);
        console.error(`   💥 Error message: ${error.message}`);
        console.error(`   🔍 Error details:`, error);
      });

      const welcomeMessage = {
        type: 'connection',
        message: 'Connected to Monster StreamDiffusion Interface',
        timestamp: new Date().toISOString(),
        serverInfo: {
          port: this.port,
          clientCount: this.clients.size
        }
      };
      
      console.log(`📤 Sending welcome message to ${clientIp}:`, welcomeMessage);
      ws.send(JSON.stringify(welcomeMessage));
    });

    this.wss.on('error', (error) => {
      console.error('❌ WEBSOCKET SERVER ERROR:');
      console.error(`   💥 Error message: ${error.message}`);
      console.error(`   🔍 Error details:`, error);
    });
  }

  public broadcastMessage(data: any) {
    if (!this.wss) {
      console.error('❌ BROADCAST FAILED: WebSocket server is not running');
      return false;
    }

    console.log('📤 BROADCASTING MESSAGE to TouchDesigner clients:');
    console.log(`   👥 Target clients: ${this.clients.size}`);
    console.log(`   📋 Message type: ${data.type || 'unknown'}`);
    console.log(`   📊 Message data:`, data);

    const message = JSON.stringify(data);
    const messageSize = Buffer.byteLength(message, 'utf8');
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

  public broadcastStreamDiffusionData(data: StreamDiffusionData) {
    if (!this.wss) {
      console.error('❌ STREAMDIFFUSION BROADCAST FAILED: WebSocket server is not running');
      return false;
    }

    console.log('🎨 STREAMDIFFUSION UPDATE - Preparing broadcast:');
    console.log(`   📝 Prompt: "${data.prompt}"`);
    console.log(`   ⚡ Intensity: ${data.steps}`);
    console.log(`   📅 Timestamp: ${new Date().toISOString()}`);

    const message = {
      type: 'streamdiffusion_update',
      timestamp: new Date().toISOString(),
      prompt: data.prompt,
      steps: data.steps
    };

    console.log('🎨 Broadcasting StreamDiffusion transformation data to TouchDesigner...');
    const result = this.broadcastMessage(message);
    
    if (result) {
      console.log('✅ StreamDiffusion data successfully broadcast to TouchDesigner');
    } else {
      console.error('❌ Failed to broadcast StreamDiffusion data to TouchDesigner');
    }
    
    return result;
  }

  public stop() {
    console.log('🛑 Stopping TouchDesigner WebSocket server...');
    
    if (this.wss) {
      console.log(`   👥 Disconnecting ${this.clients.size} active clients`);
      
      // Close all client connections
      this.clients.forEach((client, index) => {
        if (client.readyState === WebSocket.OPEN) {
          console.log(`   🔌 Closing connection to client ${index + 1}`);
          client.close(1000, 'Server shutting down');
        }
      });
      
      console.log('   🔧 Closing WebSocket server...');
      this.wss.close(() => {
        console.log('   ✅ WebSocket server closed successfully');
      });
      
      this.wss = null;
      this.clients.clear();
      console.log('🔴 TouchDesigner WebSocket server stopped completely');
    } else {
      console.log('⚠️  WebSocket server was not running');
    }
  }
}