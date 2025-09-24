const AuthManager = require('./components/AuthManager');
const WebSocketService = require('./services/WebSocketService');
const NitroliteClientWrapper = require('./components/NitroliteClient');
const SessionManager = require('./services/SessionManager');
const TransferDemo = require('./components/TransferDemo');
const config = require('./utils/config');

class NitroliteShowcase {
  constructor() {
    this.authManager = null;
    this.webSocketService = null;
    this.nitroliteClient = null;
    this.sessionManager = null;
    this.transferDemo = null;
  }

  async run() {
    try {
      console.log('🎉 Welcome to Nitrolite SDK Showcase!');
      console.log('=====================================\n');

      await this.authenticate();
      await this.connectWebSocket();
      await this.initializeNitrolite();
      await this.createChannel();
      await this.createSession();
      await this.runTransferDemo();
      await this.showSettlement();

      console.log('\n🎉 Showcase completed successfully!');
      
    } catch (error) {
      console.error('❌ Showcase failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async authenticate() {
    console.log('Step 1: Authentication');
    console.log('=====================');
    
    this.authManager = new AuthManager();
    await this.authManager.authenticate();
    console.log('');
  }

  async connectWebSocket() {
    console.log('Step 2: WebSocket Connection');
    console.log('============================');
    
    this.webSocketService = new WebSocketService(this.authManager);
    await this.webSocketService.connect();
    console.log('');
  }

  async initializeNitrolite() {
    console.log('Step 3: Nitrolite Client Initialization');
    console.log('=======================================');
    
    this.nitroliteClient = new NitroliteClientWrapper(this.authManager, this.webSocketService);
    await this.nitroliteClient.initialize();
    console.log('');
  }

  async createChannel() {
    console.log('Step 4: Channel Creation');
    console.log('=======================');
    
    const participantAddress = config.participantAddress;
    await this.nitroliteClient.createChannel(participantAddress);
    await this.nitroliteClient.getChannelState();
    console.log('');
  }

  async createSession() {
    console.log('Step 5: Application Session Creation');
    console.log('===================================');
    
    this.sessionManager = new SessionManager(this.nitroliteClient);
    await this.sessionManager.createApplicationSession();
    console.log('');
  }

  async runTransferDemo() {
    console.log('Step 6: Transfer Function Demo');
    console.log('=============================');
    
    this.transferDemo = new TransferDemo(this.nitroliteClient, this.sessionManager);
    
    const recipient = config.participantAddress;
    
    // Single transfer
    await this.transferDemo.sendTransfer(recipient, '100000000000000000', 'Demo transfer #1');
    
    // Batch transfers
    const batchTransfers = [
      { recipient, amount: '50000000000000000', description: 'Batch transfer #1' },
      { recipient, amount: '25000000000000000', description: 'Batch transfer #2' }
    ];
    await this.transferDemo.batchTransfers(batchTransfers);
    
    this.transferDemo.displayTransferHistory();
    await this.transferDemo.getChannelBalance();
    console.log('');
  }

  async showSettlement() {
    console.log('Step 7: Transaction Settlement');
    console.log('=============================');
    
    console.log('�� Final Channel State:');
    await this.nitroliteClient.getChannelState();
    
    console.log('\n🔒 Closing application session...');
    await this.sessionManager.closeSession();
    
    console.log('✅ Settlement demonstration completed');
    console.log('');
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    
    if (this.webSocketService) {
      this.webSocketService.disconnect();
    }
    
    console.log('✅ Cleanup completed');
    process.exit(0);
  }
}

const showcase = new NitroliteShowcase();
showcase.run().catch(console.error);
