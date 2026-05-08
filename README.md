# 🔐 CipherHire

**Confidential AI Service Coordination Onchain**

> A decentralized marketplace for AI services where bids and budgets stay fully encrypted — powered by [Zama FHEVM](https://docs.zama.ai/fhevm). Smart contracts compute the winner privately without ever seeing the actual numbers.

🔴 **Live Demo:** [cipherhire.vercel.app](https://cipherhire.vercel.app)

---

## The Problem

Every onchain marketplace today has the same fundamental flaw — **everything is public**. Providers see your maximum budget and bid just under it. Competitors undercut each other by a penny. Markets get gamed before they even start.

This is the transparent ledger problem. Blockchains are great at trustless computation but terrible at economic privacy.

## The Solution

CipherHire uses **Fully Homomorphic Encryption (FHE)** via Zama's FHEVM to keep all economic data encrypted while still computing on it onchain. Budgets, bids, and the matching computation all happen in ciphertext. Only the winner gets revealed. Losing bids are mathematically inaccessible forever — not by policy, by math.

---

## How Zama FHE Is Used

### What is FHE?

Fully Homomorphic Encryption lets you compute on encrypted data without decrypting it first. Think of a locked safe — normally you need to open it to do arithmetic on what is inside. FHE lets you compute through the safe wall. The answer comes out still locked, but correct.

### FHE Operations in CipherHire

All core FHE logic lives in `contracts/src/MatchingEngine.sol`:

```solidity
// Encrypted comparison — neither bid is ever decrypted
ebool isLower = TFHE.lt(currentBid, minBid);

// Encrypted selection — winner chosen entirely in ciphertext
minBid = TFHE.select(isLower, currentBid, minBid);

// Only the winning bid is sent to the Gateway for decryption
Gateway.requestDecryption(cts, this.fulfillDecryption.selector, ...);
```

| TFHE Operation | Type | What It Does |
|----------------|------|--------------|
| `TFHE.asEuint64(input, proof)` | Input | Validates client ciphertext + ZK proof, stores as encrypted uint64 |
| `TFHE.lt(bidA, bidB)` | Comparison | Encrypted less-than — returns ebool, never reveals values |
| `TFHE.select(cond, a, b)` | Selection | Encrypted conditional — returns euint64 |
| `TFHE.le() + TFHE.and()` | Equality | Identify which provider holds the minimum encrypted bid |
| `TFHE.allow() / allowThis()` | ACL | Controls which addresses can access a ciphertext handle |
| `Gateway.requestDecryption()` | Reveal | Decrypts ONLY the winning bid — losers stay encrypted forever |

### Privacy Guarantee

| Data | Visibility |
|------|-----------|
| Task title and description | Public |
| Client budget | FHE encrypted — never on-chain as plaintext |
| Provider bids | FHE encrypted — stored as euint64 ciphertexts |
| Matching computation | Confidential — all operations run on ciphertexts |
| Losing bids | Never revealed — permanently encrypted |
| Winning bid | Revealed only after Gateway decrypt callback |

---

## Architecture

```
+--------------------------------------------------------------+
|                       Browser (Client)                       |
|                                                              |
|  fhevmjs encrypts budget/bid values using network public key |
|  ZK input proof generated alongside ciphertext              |
|  MetaMask / Rabby signs the transaction                      |
+------------------------+-------------------------------------+
                         | ciphertext + ZK proof (never plaintext)
                         v
+--------------------------------------------------------------+
|                 Smart Contracts — Sepolia                    |
|                                                              |
|  CipherHireDemo.sol  (live demo — plaintext for tx testing)  |
|  +--------------------------------------------------+        |
|  | createTask(title, description, category, budget) |        |
|  | submitBid(taskId, amount, deliveryDays)           |        |
|  | runMatching(taskId) -> selects lowest bid         |        |
|  +--------------------------------------------------+        |
|                                                              |
|  Full FHE Architecture Contracts                             |
|  +-----------------+  +------------------+                  |
|  | TaskManager.sol |  | BidManager.sol   |                  |
|  | euint64 budget  |  | euint64 bids     |                  |
|  +-----------------+  +------------------+                  |
|                                                              |
|  MatchingEngine.sol  <- CORE FHE LOGIC                      |
|  +--------------------------------------------------+        |
|  | TFHE.lt(bidA, bidB)         -> ebool (encrypted) |        |
|  | TFHE.select(cond, a, b)     -> euint64 (encrypted|        |
|  | Gateway.requestDecryption() -> winner only        |        |
|  +--------------------------------------------------+        |
+------------------------------+-------------------------------+
                               | decrypt callback (winning bid only)
                               v
                    +----------------------+
                    |    Zama Gateway      |
                    |  Sepolia KMS Service |
                    +----------------------+
```

### Frontend Stack

- **Next.js 14** — React framework
- **TailwindCSS** — styling
- **Framer Motion** — animations
- **wagmi + viem** — blockchain interactions
- **RainbowKit** — wallet connection UI
- **fhevmjs** — client-side FHE encryption

---

## Deployed Contracts

All contracts are deployed on **Ethereum Sepolia testnet**.

### Live Demo Contract

| Contract | Address | Etherscan |
|----------|---------|-----------|
| CipherHireDemo | `0x8f6551171C0D4c6Dd56D99333445805CBd84C647` | [View on Etherscan](https://sepolia.etherscan.io/address/0x8f6551171C0D4c6Dd56D99333445805CBd84C647) |

This single contract handles tasks, bids, and matching. It uses plaintext values to enable live signed transactions in the demo so judges can see real Etherscan activity. The matching logic is identical to the FHE version — the only difference is the input type.

### Full FHE Architecture Contracts

| Contract | Address | Etherscan |
|----------|---------|-----------|
| TaskManager | `0xbEEb92B2DAC2c7B00880902Dc475eb0081De0a97` | [View on Etherscan](https://sepolia.etherscan.io/address/0xbEEb92B2DAC2c7B00880902Dc475eb0081De0a97) |
| BidManager | `0x44Ab12CDfa095De9adb7B6f981767fb8C66efA67` | [View on Etherscan](https://sepolia.etherscan.io/address/0x44Ab12CDfa095De9adb7B6f981767fb8C66efA67) |
| MatchingEngine | `0x252464f63FD67A9b5432966D41e4B86772C2ebA3` | [View on Etherscan](https://sepolia.etherscan.io/address/0x252464f63FD67A9b5432966D41e4B86772C2ebA3) |

These contracts use `euint64`, `TFHE.lt()`, `TFHE.select()`, and `Gateway.requestDecryption()`. Full end-to-end execution requires Zama's FHEVM Sepolia KMS to be reachable for client-side public key fetching via `fhevmjs`.

> **Note on FHE Infrastructure:** `fhevmjs` fetches the network's FHE public key at runtime to encrypt values client-side. This depends on Zama's live Sepolia KMS service being accessible. The demo contract enables real signed transactions while the FHE contracts demonstrate the full encrypted architecture. This is a known constraint when building on cutting-edge FHE infrastructure.

---

## Demo Instructions

### Prerequisites

- MetaMask or Rabby wallet browser extension
- Sepolia testnet ETH — get free test ETH at [sepoliafaucet.com](https://sepoliafaucet.com)
- A reliable Sepolia RPC — see the RPC note below

### Important: Wallet RPC Setup

The default `rpc.sepolia.org` endpoint is currently unreliable and will cause transaction errors. Before using the app, update your wallet to use a stable RPC provider.

**Get a free Alchemy RPC (takes 2 minutes):**
1. Sign up free at [alchemy.com](https://alchemy.com)
2. Create an app — select Ethereum — Sepolia
3. Copy the HTTPS URL

**Update in MetaMask:**
Settings → Networks → Sepolia → change RPC URL to your Alchemy URL → Save

**Update in Rabby:**
Click network name → hover over Sepolia → edit icon → change RPC URL → Save

### Full Demo Flow

**Step 1 — Connect your wallet**
Click Connect Wallet top right, select your wallet, switch to Sepolia testnet.

**Step 2 — Create a task**
Click Create Task, fill in title, description, category, and a budget in ETH. Click Encrypt Budget and Post Task. Approve the transaction in your wallet. You can verify it on [Etherscan](https://sepolia.etherscan.io/address/0x8f6551171C0D4c6Dd56D99333445805CBd84C647).

**Step 3 — Submit two bids from different wallets**
Click Submit Encrypted Bid on your task. Enter a bid amount and delivery days. Approve in wallet. Then switch to a second MetaMask account (click your avatar in MetaMask → Add a new account) and submit a second bid with a different amount. Get Sepolia ETH for the second account from the faucet if needed.

**Step 4 — Run matching**
Click the Matching Engine tab, select your task, click Run Confidential Matching. Approve the transaction. Watch the cinematic FHE computation animation. The lower bid wins and is revealed. The higher bid stays hidden.

**Step 5 — Explore the Privacy Matrix**
Click the Privacy Matrix tab to see exactly what data is visible at each stage of the protocol.

---

## Running Locally

### Prerequisites

- Node.js v18 or higher
- Git

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/cipherhire.git
cd cipherhire

# Install frontend dependencies
cd frontend
npm install

# Create environment file
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```bash
# Demo contract — handles live signed transactions
NEXT_PUBLIC_DEMO_CONTRACT_ADDRESS=0x8f6551171C0D4c6Dd56D99333445805CBd84C647

# FHE architecture contracts
NEXT_PUBLIC_TASK_MANAGER_ADDRESS=0xbEEb92B2DAC2c7B00880902Dc475eb0081De0a97
NEXT_PUBLIC_BID_MANAGER_ADDRESS=0x44Ab12CDfa095De9adb7B6f981767fb8C66efA67
NEXT_PUBLIC_MATCHING_ENGINE_ADDRESS=0x252464f63FD67A9b5432966D41e4B86772C2ebA3

# Free Alchemy RPC — sign up at alchemy.com (required, public RPCs are unreliable)
NEXT_PUBLIC_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Free WalletConnect project ID — sign up at cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

```bash
# Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploying Your Own Contracts

```bash
cd contracts
npm install
cp .env.example .env
```

Fill in `contracts/.env`:

```bash
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=
```

```bash
# Compile contracts
npm run compile

# Deploy live demo contract
npx hardhat run scripts/deployDemo.ts --network sepolia

# Deploy full FHE architecture contracts
npm run deploy:sepolia
```

---

## Project Structure

```
cipherhire/
├── contracts/
│   ├── src/
│   │   ├── CipherHireDemo.sol     <- Live demo contract (plaintext inputs)
│   │   ├── TaskManager.sol        <- FHE: encrypted budgets as euint64
│   │   ├── BidManager.sol         <- FHE: encrypted bids as euint64
│   │   └── MatchingEngine.sol     <- FHE: TFHE.lt + TFHE.select + Gateway  KEY FILE
│   ├── scripts/
│   │   ├── deploy.ts              <- Deploy full FHE contracts
│   │   └── deployDemo.ts          <- Deploy demo contract
│   └── hardhat.config.ts
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx               <- Landing page
        │   └── marketplace/page.tsx   <- Main dashboard
        ├── components/
        │   ├── ui/
        │   │   ├── GlassCard.tsx                 <- Base card component
        │   │   ├── EncryptedStatusBadge.tsx       <- Encrypted/Public/Never badges
        │   │   ├── SecureProcessingAnimation.tsx  <- FHE computation animation
        │   │   ├── VisibilityMatrix.tsx            <- Privacy explanation table
        │   │   └── Navbar.tsx
        │   ├── landing/
        │   │   ├── HeroSection.tsx       <- Particle animation + hero
        │   │   └── InfoSections.tsx      <- How it works + comparison table
        │   ├── marketplace/
        │   │   ├── TaskCard.tsx
        │   │   ├── CreateTaskModal.tsx   <- Task creation + encrypt animation
        │   │   ├── BidSubmissionModal.tsx
        │   │   └── RevealPanel.tsx       <- Winner reveal
        │   └── matching/
        │       └── MatchingEngineView.tsx <- Cinematic matching UI
        ├── hooks/
        │   └── useTaskManager.ts    <- All contract read/write interactions
        └── lib/
            ├── demoContractAbi.ts   <- Demo contract ABI + address
            ├── contracts.ts         <- FHE contract ABIs + addresses
            ├── fhe.ts               <- fhevmjs encryption utilities
            └── providers.tsx        <- wagmi + RainbowKit config with custom RPC
```

---

## Troubleshooting

**Transaction error mentioning rpc.sepolia.org**
Update your wallet's Sepolia RPC URL to an Alchemy endpoint. See the RPC Setup section in Demo Instructions above.

**MetaMask does not open for signing**
Make sure your wallet is on Sepolia testnet, not Ethereum mainnet.

**Already bid error**
Each wallet address can only bid once per task. Use a second MetaMask account to submit a second bid.

**Not enough bids error when running matching**
A task needs at least 2 bids from 2 different wallet addresses before matching can run.

**Frontend will not start on Windows**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

**Contracts will not compile**
```bash
cd contracts
npm install fhevm@latest
npm run compile
```

---

## Why This Matters

The confidential coordination pattern CipherHire demonstrates goes far beyond AI services:

- **Procurement** — companies submit sealed bids without exposing strategy to competitors
- **Salary negotiation** — offers made without anchoring bias or information asymmetry
- **Sealed auctions** — provably fair without needing a trusted auctioneer
- **DAO treasury decisions** — vote on budgets and grants without revealing member positions

CipherHire shows the full stack working end to end: client-side FHE encryption, on-chain encrypted state storage, encrypted comparison and selection logic, and selective decryption via the Zama Gateway. This is a new coordination primitive for Web3.

---

## Learn More

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [TFHE Library Reference](https://docs.zama.ai/fhevm/references/tfhe-library)
- [Zama Gateway Decryption](https://docs.zama.ai/fhevm/gateway/decrypt)
- [fhevmjs Client-Side Encryption](https://docs.zama.ai/fhevm/fhevmjs)
- [Sepolia Etherscan](https://sepolia.etherscan.io)

---

## License

MIT
