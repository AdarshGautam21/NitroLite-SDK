# Nitrolite SDK Showcase

A comprehensive demonstration of the Nitrolite SDK, showcasing authentication, WebSocket connection, application sessions, transfer functionality, and transaction settlement using ERC-7824 state channels.

***

## Features Demonstrated

- **Authentication:** Wallet authentication with Ether.js and Viem
- **WebSocket Connectivity:** Real-time connection to Yellow ClearNode for off-chain messaging
- **Nitrolite Client Integration:** Off-chain state channel client using the Nitrolite SDK
- **Channel Management:** Create and monitor state channels between participants
- **Application Sessions:** Manage off-chain application session state and interactions
- **Transfer Functions:** Single and batch transfers with mock and real functionality
- **Transaction Settlement:** View and finalize channel states

***

## Prerequisites

- Node.js (version 16 or later)
- An Ethereum wallet private key (testnet recommended)
- Infura or Alchemy API key for Ethereum RPC access
- Basic understanding of blockchain, state channels, and JavaScript

***

## Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nitrolite-showcase.git
cd nitrolite-showcase
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file based on `.env.example` with correct values:

```
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key
CLEARNODE_URL=wss://clearnet.yellow.com/ws
CONTRACT_ADDRESS=nitrolite_contract_address
CHAIN_ID=11155111
PARTICIPANT_ADDRESS=second_wallet_address
```

4. **Run the showcase**
```bash
npm start
```

***

## Usage

- The showcase will authenticate your wallet and connect to the ClearNode WebSocket.
- It tries to create a state channel with initial deposits. If deployed contracts are unavailable, it falls back to demo mocks.
- The app session is created and updated with sample transfer transactions.
- Transfer history and final channel state are logged.

***

## Notes

- **Demo Mode:** Since Nitrolite contracts may not be deployed on mainnet or testnets yet, this showcase uses mock data to simulate channel creation, sessions, and transfers.
- **Switching Networks:** Update the `CHAIN_ID` and `RPC_URL` in `.env` to target different Ethereum networks.
- **Security:** Use test wallets for demos. Never expose your private key in public repositories.

***

## Architecture

- **AuthManager:** Handles wallet authentication using ethers and Viem
- **WebSocketService:** Connects to ClearNode for off-chain messaging
- **NitroliteClientWrapper:** Wraps Nitrolite SDK client functionality
- **SessionManager:** Manages application sessions and state updates
- **TransferDemo:** Demonstrates transfer functions with fallback to mocks

***

## Contributions

Contributions and improvements are welcome! Feel free to fork the repo, create feature branches, and open pull requests.

***

## License

This project is licensed under the MIT License.

***

For more information on the Nitrolite SDK and ERC-7824 protocol, visit [https://erc7824.org/](https://erc7824.org/).

***

This README provides a clear overview and setup instructions for your Nitrolite SDK project, highlighting both real and demo functionality to facilitate successful usage and development.

[1](https://github.com/erc7824/nitrolite)
