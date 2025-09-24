const WebSocket = require('ws');
const config = require('../utils/config');

class WebSocketService {
  constructor(authManager) {
    this.ws = null;
    this.authManager = authManager;
    this.connected = false;
    this.messageQueue = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log('🌐 Connecting to ClearNode WebSocket...');
        console.log(`📡 URL: ${config.clearNodeUrl}`);
        
        this.ws = new WebSocket(config.clearNodeUrl);
        
        this.ws.on('open', async () => {
          console.log('✅ WebSocket connected to ClearNode');
          this.connected = true;
          
          try {
            await this.authenticateWebSocket();
          } catch (error) {
            console.log('⚠️ WebSocket authentication failed, continuing...');
          }
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            this.handleMessage(JSON.parse(data.toString()));
          } catch (error) {
            console.log('📨 Received raw message:', data.toString());
          }
        });

        this.ws.on('error', (error) => {
          console.error('❌ WebSocket error:', error.message);
          // Don't reject, continue with mock functionality
          resolve();
        });

        this.ws.on('close', () => {
          console.log('🔌 WebSocket connection closed');
          this.connected = false;
        });

        // Timeout fallback
        setTimeout(() => {
          if (!this.connected) {
            console.log('⚠️ WebSocket connection timeout, using mock mode');
            resolve();
          }
        }, 5000);

      } catch (error) {
        console.error('❌ Failed to connect to WebSocket:', error.message);
        console.log('⚠️ Continuing with mock functionality...');
        resolve();
      }
    });
  }

  async authenticateWebSocket() {
    const authMessage = {
      type: 'auth',
      address: this.authManager.getAddress(),
      timestamp: Date.now()
    };

    const signature = await this.authManager.signMessage(JSON.stringify(authMessage));
    
    const authRequest = {
      ...authMessage,
      signature
    };

    this.send(authRequest);
    console.log('🔐 WebSocket authentication sent');
  }

  send(message) {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('📋 Mock: Message would be sent:', message.type || 'unknown');
    }
  }

  handleMessage(message) {
    console.log('📨 Received message:', message);
    
    switch (message.type) {
      case 'auth_success':
        console.log('✅ WebSocket authentication successful');
        break;
      case 'channel_update':
        console.log('🔄 Channel state updated:', message.data);
        break;
      case 'transaction_received':
        console.log('💸 Transaction received:', message.data);
        break;
      case 'session_created':
        console.log('🎯 Application session created:', message.data);
        break;
      default:
        console.log('📦 Unknown message type:', message.type);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = WebSocketService;
