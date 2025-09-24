require('dotenv').config();

const config = {
  chainId: parseInt(process.env.CHAIN_ID) || 1,
  rpcUrl: process.env.RPC_URL || 'https://rpc.ankr.com/eth',
  privateKey: process.env.PRIVATE_KEY || '0x1234567890123456789012345678901234567890123456789012345678901234',
  clearNodeUrl: process.env.CLEARNODE_URL || 'wss://clearnet.yellow.com/ws',
  contractAddress: process.env.CONTRACT_ADDRESS || '0x742d35Cc6632C0532c718b5a0Ae5e90F31b9C60E',
  participantAddress: process.env.PARTICIPANT_ADDRESS || '0x8ba1f109551bD432803012645Hac136c57d754e5',
  
  // Nitrolite specific configs
  challengeDuration: 86400,    // 24 hours in seconds
  finalizationPeriod: 3600,    // 1 hour in seconds
  disputePeriod: 7200,         // 2 hours in seconds
  maxChannels: 100,            // Maximum number of channels
  defaultTimeout: 30000        // 30 seconds timeout
};

// Validate required fields
if (!config.privateKey || config.privateKey === '0x1234567890123456789012345678901234567890123456789012345678901234') {
  console.log('⚠️ Warning: Using default/demo private key. Please update .env file with your actual private key.');
}

if (!config.rpcUrl.includes('your_project_id') && !config.rpcUrl.includes('your_api_key')) {
  console.log('✅ RPC URL configured');
} else {
  console.log('⚠️ Warning: Please update RPC_URL in .env file with your actual Alchemy/Infura endpoint.');
}

module.exports = config;
