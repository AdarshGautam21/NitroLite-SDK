class TransferDemo {
  constructor(nitroliteClient, sessionManager) {
    this.nitroliteClient = nitroliteClient;
    this.sessionManager = sessionManager;
    this.transferHistory = [];
  }

  async sendTransfer(recipient, amount, description = 'Transfer') {
    try {
      console.log(`💸 Sending transfer: ${amount} Wei to ${recipient.substring(0, 8)}...`);
      
      const txData = {
        channelId: this.nitroliteClient.channelId,
        to: recipient,
        amount: BigInt(amount),
        data: JSON.stringify({ description, timestamp: Date.now() })
      };

      let transaction;
      
      // Try real SDK first, fall back to mock
      try {
        if (this.nitroliteClient.client.sendTransaction) {
          transaction = await this.nitroliteClient.client.sendTransaction(txData);
          console.log(`✅ Real transfer sent! TX Hash: ${transaction.txHash}`);
        } else {
          throw new Error('sendTransaction method not available');
        }
      } catch (error) {
        console.log('⚠️ Real transfer not available, creating mock transaction');
        // Create mock transaction
        transaction = {
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          channelId: txData.channelId,
          to: txData.to,
          amount: txData.amount,
          data: txData.data,
          timestamp: Date.now(),
          status: 'mock_sent'
        };
        console.log(`🎭 Mock transfer sent! TX Hash: ${transaction.txHash}`);
      }
      
      // Record transfer in history
      this.transferHistory.push({
        txHash: transaction.txHash,
        to: recipient,
        amount: amount,
        description: description,
        timestamp: new Date().toISOString(),
        status: transaction.status || 'sent'
      });
      
      // Update session state with new transfer
      await this.updateSessionWithTransfer(transaction);
      
      return transaction;
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      throw error;
    }
  }

  async batchTransfers(transfers) {
    try {
      console.log(`📦 Processing batch of ${transfers.length} transfers...`);
      
      const transactionData = transfers.map(transfer => ({
        channelId: this.nitroliteClient.channelId,
        to: transfer.recipient,
        amount: BigInt(transfer.amount),
        data: JSON.stringify({ 
          description: transfer.description || 'Batch transfer',
          timestamp: Date.now()
        })
      }));

      let batch;

      // Try real SDK first, fall back to mock
      try {
        if (this.nitroliteClient.client.batchTransactions) {
          batch = await this.nitroliteClient.client.batchTransactions(
            this.nitroliteClient.channelId,
            transactionData
          );
          console.log(`✅ Real batch processed! Batch ID: ${batch.batchId}`);
        } else {
          throw new Error('batchTransactions method not available');
        }
      } catch (error) {
        console.log('⚠️ Real batch transfer not available, creating mock batch');
        // Create mock batch
        batch = {
          batchId: `mock_batch_${Date.now()}`,
          transactions: transactionData.map((tx, index) => ({
            ...tx,
            txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
            status: 'mock_sent'
          })),
          status: 'mock_processed'
        };
        console.log(`🎭 Mock batch processed! Batch ID: ${batch.batchId}`);
      }

      // Record batch transfers in history
      batch.transactions.forEach((tx, index) => {
        this.transferHistory.push({
          txHash: tx.txHash,
          to: transfers[index].recipient,
          amount: transfers[index].amount,
          description: transfers[index].description || 'Batch transfer',
          timestamp: new Date().toISOString(),
          status: tx.status || 'sent'
        });
      });

      return batch;
    } catch (error) {
      console.error('❌ Batch transfer failed:', error);
      throw error;
    }
  }

  async updateSessionWithTransfer(transaction) {
    if (!this.sessionManager.sessionId) {
      console.log('⚠️ No session available for transfer update');
      return;
    }

    try {
      // Try to get current state
      let currentState = {};
      try {
        if (this.nitroliteClient.client.getApplicationState) {
          currentState = await this.nitroliteClient.client.getApplicationState(this.sessionManager.sessionId);
        }
      } catch (error) {
        console.log('⚠️ Using mock current state');
        currentState = {
          gameState: 'active',
          transferHistory: []
        };
      }

      const newState = {
        ...currentState,
        transferHistory: [
          ...(currentState.transferHistory || []),
          {
            txHash: transaction.txHash,
            timestamp: Date.now(),
            amount: transaction.amount.toString()
          }
        ]
      };

      await this.sessionManager.updateSessionState(newState);
    } catch (error) {
      console.log('⚠️ Failed to update session state:', error.message);
    }
  }

  displayTransferHistory() {
    console.log('\n📋 Transfer History:');
    console.log('==================');
    
    if (this.transferHistory.length === 0) {
      console.log('No transfers yet.');
      return;
    }

    this.transferHistory.forEach((transfer, index) => {
      console.log(`${index + 1}. ${transfer.amount} Wei to ${transfer.to.substring(0, 8)}...`);
      console.log(`   Description: ${transfer.description}`);
      console.log(`   Time: ${transfer.timestamp}`);
      console.log(`   TX Hash: ${transfer.txHash}`);
      console.log(`   Status: ${transfer.status}`);
      console.log('');
    });
  }

  async getChannelBalance() {
    try {
      let balance;
      
      if (this.nitroliteClient.client.getChannelBalance) {
        balance = await this.nitroliteClient.client.getChannelBalance(this.nitroliteClient.channelId);
        console.log(`💰 Current channel balance: ${balance} ETH`);
      } else {
        console.log('⚠️ Real balance not available, using mock balance');
        balance = '5.0';
        console.log(`💰 Mock channel balance: ${balance} ETH`);
      }
      
      return balance;
    } catch (error) {
      console.log('⚠️ Failed to get channel balance, using mock');
      const mockBalance = '5.0';
      console.log(`💰 Mock channel balance: ${mockBalance} ETH`);
      return mockBalance;
    }
  }
}

module.exports = TransferDemo;
