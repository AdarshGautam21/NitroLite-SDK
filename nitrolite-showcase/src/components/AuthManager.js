const { ethers } = require('ethers');
const config = require('../utils/config');

class AuthManager {
  constructor() {
    this.wallet = null;
    this.provider = null;
  }

  async authenticate() {
    try {
      console.log('🔐 Authenticating wallet...');
      
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
      
      console.log(`✅ Authenticated with address: ${this.wallet.address}`);
      
      try {
        const balance = await this.provider.getBalance(this.wallet.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
      } catch (error) {
        console.log(`💰 Balance: Unable to fetch (${error.message})`);
      }
      
      return {
        address: this.wallet.address,
        wallet: this.wallet,
        provider: this.provider
      };
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  async signMessage(message) {
    if (!this.wallet) {
      throw new Error('Wallet not authenticated');
    }
    return await this.wallet.signMessage(message);
  }

  getAddress() {
    return this.wallet?.address;
  }
}

module.exports = AuthManager;
