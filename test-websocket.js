import WebSocket from 'ws';

console.log('🧪 Testing WebSocket connection to port 9980...');

const ws = new WebSocket('ws://localhost:9980');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
  
  const testMessage = {
    type: 'test',
    message: 'Hello from test client',
    timestamp: new Date().toISOString()
  };
  
  ws.send(JSON.stringify(testMessage));
  console.log('📤 Sent test message:', testMessage);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📥 Received message:', message);
  } catch (e) {
    console.log('📥 Received raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('🔌 WebSocket connection closed');
  process.exit(0);
});

setTimeout(() => {
  console.log('⏰ Test timeout - closing connection');
  ws.close();
}, 5000);