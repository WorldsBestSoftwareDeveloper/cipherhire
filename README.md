# CipherHire

**Confidential AI Service Coordination Onchain**

CipherHire is a decentralized marketplace for AI services built with Zama FHEVM. Clients can create tasks with encrypted budgets, providers submit encrypted bids, and smart contracts privately compute the winning provider without exposing sensitive marketplace data.

🔴 **Live Demo:** `https://cipherhire.netlify.app`

---

## Overview

Traditional onchain marketplaces expose everything publicly:

* provider bids
* client budgets
* pricing strategies

CipherHire uses Fully Homomorphic Encryption (FHE) to keep marketplace coordination private while still allowing smart contracts to compute the best match onchain.

Only the winning provider and winning amount are revealed. Other bids remain encrypted.

---

## How FHE Is Used

CipherHire uses Zama FHEVM encrypted types and operations directly inside Solidity contracts.

Main encrypted operations used:

```solidity
// Compare encrypted bids
ebool isLower = TFHE.lt(currentBid, minBid);

// Select lower encrypted value
minBid = TFHE.select(isLower, currentBid, minBid);

// Reveal only the winning bid
Gateway.requestDecryption(cts, this.fulfillDecryption.selector, ...);
```

### Encrypted Data

| Data                 | Status                  |
| -------------------- | ----------------------- |
| Task description     | Public                  |
| Client budget        | Encrypted               |
| Provider bids        | Encrypted               |
| Matching computation | Confidential            |
| Losing bids          | Never revealed          |
| Winning bid          | Revealed after matching |

---

## Smart Contracts

### `TaskManager.sol`

Handles:

* task creation
* encrypted budgets

### `BidManager.sol`

Handles:

* encrypted provider bids

### `MatchingEngine.sol`

Core FHE logic:

* encrypted comparisons
* encrypted selection
* winner reveal

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* TailwindCSS
* Framer Motion
* wagmi / viem
* RainbowKit

### Smart Contracts

* Solidity
* Zama FHEVM
* fhevmjs

---

## Deployment

### Network

Ethereum Sepolia

### Frontend

`https://cipherhire.vercel.app`

### Contracts

| Contract       | Address                                      |
| -------------- | -------------------------------------------- |
| CipherHireDemo | `0x8f6551171C0D4c6Dd56D99333445805CBd84C647` |
| TaskManager    | `0xbEEb92B2DAC2c7B00880902Dc475eb0081De0a97` |
| BidManager     | `0x44Ab12CDfa095De9adb7B6f981767fb8C66efA67` |
| MatchingEngine | `0x252464f63FD67A9b5432966D41e4B86772C2ebA3` |

---

## Demo Flow

### 1. Create Task

A client creates a task and submits a confidential budget.

### 2. Submit Encrypted Bids

Providers submit encrypted bids from different wallets.

### 3. Run Confidential Matching

The smart contract compares encrypted bids privately using FHE operations.

### 4. Reveal Winner

Only the winning provider and winning amount are revealed.

---

## Running Locally

### Prerequisites

* Node.js 18+
* MetaMask or Rabby
* Sepolia ETH

### Install

```bash
git clone https://github.com/yourusername/cipherhire.git

cd cipherhire/frontend

npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_DEMO_CONTRACT_ADDRESS=
NEXT_PUBLIC_TASK_MANAGER_ADDRESS=
NEXT_PUBLIC_BID_MANAGER_ADDRESS=
NEXT_PUBLIC_MATCHING_ENGINE_ADDRESS=

NEXT_PUBLIC_SEPOLIA_RPC=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

Start frontend:

```bash
npm run dev
```

---

## Deploy Contracts

```bash
cd contracts

npm install

npm run compile
```

Deploy:

```bash
npx hardhat run scripts/deployDemo.ts --network sepolia
```

---

## Project Structure

```bash
contracts/
├── TaskManager.sol
├── BidManager.sol
├── MatchingEngine.sol
└── CipherHireDemo.sol

frontend/
├── app/
├── components/
├── hooks/
└── lib/
```

---

## Why This Matters

CipherHire demonstrates how FHE can enable confidential coordination directly onchain.

Potential use cases:

* sealed bidding
* procurement systems
* private salary negotiation
* DAO treasury coordination
* confidential marketplaces

---

## Resources

* Zama FHEVM Docs
* fhevmjs
* Sepolia Etherscan

---

## License

MIT
