// Mock Nitrolite SDK for demonstration
class MockNitroliteClient {
  constructor(config) {
    this.config = config;
    this.channels = new Map();
    this.sessions = new Map();
    this.events = new Map();
  }

  async initialize() {
    console.log('🚀 Mock Nitrolite Client initialized');
    return true;
  }

  async createChannel(config) {
    const channelId = `channel_${Date.now()}`;
    const channel = {
      channelId,
      participants: config.participants,
      initialDeposits: config.initialDeposits,
      appDefinition: config.appDefinition,
      challengePeriod: config.challengePeriod,
      state: {
        turnNum: 0,
        isFinal: false,
        balances: config.initialDeposits
      }
    };
    
    this.channels.set(channelId, channel);
    return channel;
  }

  async getChannelState(channelId) {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error('Channel not found');
    return channel.state;
  }

  async getChannelParticipants(channelId) {
    const channel = this.channels.get(channelId);
    return channel?.participants || [];
  }

  async createApplicationSession(config) {
    const sessionId = `session_${Date.now()}`;
    const session = {
      sessionId,
      channelId: config.channelId,
      appDefinition: config.appDefinition,
      initialState: config.initialState,
      participants: config.participants
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  async updateApplicationState(update) {
    const session = this.sessions.get(update.sessionId);
    if (!session) throw new Error('Session not found');
    
    session.state = update.state;
    return { stateHash: `hash_${Date.now()}` };
  }

  async getApplicationState(sessionId) {
    const session = this.sessions.get(sessionId);
    return session?.state || {};
  }

  async closeApplicationSession(sessionId) {
    this.sessions.delete(sessionId);
    return true;
  }

  async sendTransaction(txData) {
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const transaction = {
      txHash,
      channelId: txData.channelId,
      to: txData.to,
      amount: txData.amount,
      data: txData.data,
      timestamp: Date.now()
    };
    
    setTimeout(() => {
      this.emit('transactionReceived', transaction);
    }, 100);
    
    return transaction;
  }

  async batchTransactions(channelId, transactionData) {
    const batchId = `batch_${Date.now()}`;
    const transactions = transactionData.map((tx, index) => ({
      ...tx,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    }));
    
    return { batchId, transactions };
  }

  async getChannelBalance(channelId) {
    return '5.0';
  }

  async closeChannel(config) {
    this.channels.delete(config.channelId);
    return true;
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.events.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

const NitroliteClient = MockNitroliteClient;
const NitroliteConfig = {};

module.exports = { NitroliteClient, NitroliteConfig };
