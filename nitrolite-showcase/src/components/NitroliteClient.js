let NitroliteClient, NitroliteConfig;

try {
  const nitrolite = require('@erc7824/nitrolite');
  NitroliteClient = nitrolite.NitroliteClient;
  NitroliteConfig = nitrolite.NitroliteConfig;
  console.log('✅ Using real Nitrolite SDK');
} catch (error) {
  console.log('⚠️ Nitrolite SDK not found, using mock implementation');
  const mock = require('../mock-nitrolite');
  NitroliteClient = mock.NitroliteClient;
  NitroliteConfig = mock.NitroliteConfig;
}

const { createPublicClient, createWalletClient, http } = require('viem');
const { mainnet } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const config = require('../utils/config');

class NitroliteClientWrapper {
  constructor(authManager, webSocketService) {
    this.client = null;
    this.authManager = authManager;
    this.webSocketService = webSocketService;
    this.channelId = null;
    this.config = null;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Nitrolite Client...');
      
      let privateKey = config.privateKey;
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }
      
      console.log(`🔑 Using private key: ${privateKey.substring(0, 8)}...${privateKey.substring(privateKey.length - 4)}`);

      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http(config.rpcUrl)
      });

      const account = privateKeyToAccount(privateKey);
      const walletClient = createWalletClient({
        account,
        chain: mainnet,
        transport: http(config.rpcUrl)
      });

      console.log(`✅ Viem account created: ${account.address}`);

      const nitroliteConfig = {
        chainId: config.chainId,
        publicClient: publicClient,
        walletClient: walletClient,
        clearNodeUrl: config.clearNodeUrl,
        challengeDuration: 86400,
        contractAddress: config.contractAddress,
        
        addresses: {
          custody: config.contractAddress,           
          token: '0x0000000000000000000000000000000000000000', 
          nitrolite: config.contractAddress,        
          resolver: config.contractAddress,         
          registry: config.contractAddress,         
          adjudicator: config.contractAddress,      
          guestAddress: config.participantAddress
        }
      };

      this.config = nitroliteConfig;

      console.log('🔧 Nitrolite config:', {
        chainId: nitroliteConfig.chainId,
        clearNodeUrl: nitroliteConfig.clearNodeUrl,
        challengeDuration: nitroliteConfig.challengeDuration,
        addresses: nitroliteConfig.addresses
      });

      this.client = new NitroliteClient(nitroliteConfig);
      
      console.log('✅ Nitrolite Client created successfully');
      this.setupEventHandlers();
      
      return this.client;
    } catch (error) {
      console.error('❌ Failed to initialize Nitrolite Client:', error);
      throw error;
    }
  }

  async createChannel(participantAddress, initialDeposit = '1000000000000000000') {
    try {
      console.log('🔗 Creating state channel...');
      console.log(`👥 Participants: ${this.authManager.getAddress()} & ${participantAddress}`);
      
      // Proper channel configuration based on Nitrolite SDK docs
      const channelConfig = {
        participants: [this.authManager.getAddress(), participantAddress],
        initialDeposits: {
          '0x0000000000000000000000000000000000000000': BigInt(initialDeposit)
        },
        appDefinition: config.contractAddress,
        challengePeriod: 86400
      };

      console.log('📋 Channel config:', {
        participants: channelConfig.participants,
        initialDeposits: channelConfig.initialDeposits,
        appDefinition: channelConfig.appDefinition,
        challengePeriod: channelConfig.challengePeriod
      });

      const channel = await this.client.createChannel(channelConfig);
      this.channelId = channel.channelId;
      
      console.log(`✅ Channel created with ID: ${this.channelId}`);
      return channel;
    } catch (error) {
      console.error('❌ Failed to create channel:', error);
      console.log('📝 Error details:', error.message);
      
      // Create mock channel for demo
      const mockChannelId = `mock_channel_${Date.now()}`;
      this.channelId = mockChannelId;
      console.log(`🎭 Using mock channel ID: ${this.channelId}`);
      
      return {
        channelId: this.channelId,
        participants: [this.authManager.getAddress(), participantAddress],
        status: 'mock_created'
      };
    }
  }

  async getChannelState() {
    if (!this.channelId) {
      throw new Error('No active channel');
    }

    try {
      const state = await this.client.getChannelState(this.channelId);
      console.log('�� Real Channel State:', state);
      return state;
    } catch (error) {
      console.log('📊 Using mock channel state');
      const mockState = {
        channelId: this.channelId,
        participants: [this.authManager.getAddress(), config.participantAddress],
        balances: { 
          ETH: '1.0',
          [this.authManager.getAddress()]: '0.5',
          [config.participantAddress]: '0.5'
        },
        turnNum: 0,
        isFinal: false,
        status: 'open'
      };
      
      console.log('📊 Mock Channel State:', mockState);
      return mockState;
    }
  }

  setupEventHandlers() {
    try {
      if (this.client.on) {
        this.client.on('channelStateUpdate', (event) => {
          console.log('🔄 Channel state changed:', event);
        });

        this.client.on('transactionReceived', (event) => {
          console.log('💰 Transaction received:', event);
        });

        this.client.on('channelClosed', (event) => {
          console.log('🔒 Channel closed:', event);
        });

        this.client.on('applicationEvent', (event) => {
          console.log('🎯 Application event:', event);
        });

        console.log('✅ Event handlers set up successfully');
      } else {
        console.log('⚠️ Event handlers not available');
      }
    } catch (error) {
      console.log('⚠️ Event handlers setup skipped:', error.message);
    }
  }
}

module.exports = NitroliteClientWrapper;
