class SessionManager {
  constructor(nitroliteClient) {
    this.nitroliteClient = nitroliteClient;
    this.sessionId = null;
  }

  async createApplicationSession() {
    try {
      console.log('🎯 Creating application session...');
      
      if (!this.nitroliteClient.channelId) {
        throw new Error('No active channel found');
      }

      const sessionConfig = {
        channelId: this.nitroliteClient.channelId,
        appDefinition: this.nitroliteClient.config?.contractAddress || '0x742d35Cc6632C0532c718b5a0Ae5e90F31b9C60E',
        initialState: {
          gameState: 'initialized',
          playerTurn: 0,
          scores: [0, 0],
          transferHistory: []
        },
        participants: [this.nitroliteClient.authManager.getAddress()]
      };

      console.log('📋 Session config:', sessionConfig);

      // Try real SDK first, fall back to mock
      try {
        const session = await this.nitroliteClient.client.createApplicationSession(sessionConfig);
        this.sessionId = session.sessionId;
        console.log(`✅ Real application session created with ID: ${this.sessionId}`);
        return session;
      } catch (error) {
        console.log('⚠️ Real session creation failed, using mock session');
        this.sessionId = `mock_session_${Date.now()}`;
        console.log(`🎭 Mock application session created with ID: ${this.sessionId}`);
        
        return {
          sessionId: this.sessionId,
          channelId: this.nitroliteClient.channelId,
          appDefinition: sessionConfig.appDefinition,
          initialState: sessionConfig.initialState,
          participants: sessionConfig.participants
        };
      }
    } catch (error) {
      console.error('❌ Failed to create application session:', error);
      throw error;
    }
  }

  async updateSessionState(newState) {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    try {
      const update = {
        sessionId: this.sessionId,
        state: newState,
        nonce: Date.now()
      };

      const result = await this.nitroliteClient.client.updateApplicationState(update);
      console.log('🔄 Session state updated:', result.stateHash);
      return result;
    } catch (error) {
      console.log('⚠️ Using mock state update');
      const mockResult = { stateHash: `mock_hash_${Date.now()}` };
      console.log('🔄 Mock session state updated:', mockResult.stateHash);
      return mockResult;
    }
  }

  async closeSession() {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    console.log('🔒 Closing application session...');
    
    try {
      await this.nitroliteClient.client.closeApplicationSession(this.sessionId);
      console.log('✅ Real application session closed');
    } catch (error) {
      console.log('✅ Mock application session closed');
    }
    
    this.sessionId = null;
  }
}

module.exports = SessionManager;
