/**
 * FHE Encryption Utilities
 * Uses fhevmjs to encrypt values client-side before sending to the blockchain.
 * The contract only ever sees ciphertexts + ZK proofs — never plaintext values.
 */

import { BrowserProvider } from "ethers";
import { CONTRACT_ADDRESSES } from "./contracts";

// Lazy-loaded fhevm instance (browser-only)
let fhevmInstance: import("fhevmjs").FhevmInstance | null = null;

/**
 * Initialize the FHEVM instance with the network's public key.
 * Must be called before any encryption.
 */
export async function initFhevm(provider: BrowserProvider): Promise<import("fhevmjs").FhevmInstance> {
  if (fhevmInstance) return fhevmInstance;

  const { createInstance } = await import("fhevmjs");

  // Fetch the network's FHE public key from the blockchain
  const network = await provider.getNetwork();

  fhevmInstance = await createInstance({
    chainId: Number(network.chainId),
    networkUrl: "https://rpc.sepolia.org",
    gatewayUrl: "https://gateway.sepolia.zama.ai",
  });

  return fhevmInstance;
}

/**
 * Encrypt a budget value for TaskManager.createTask()
 * Returns the encrypted input handle + ZK proof ready for on-chain submission.
 */
export async function encryptBudget(
  provider: BrowserProvider,
  amount: bigint,
  contractAddress?: string
): Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }> {
  const instance = await initFhevm(provider);
  const signer = await provider.getSigner();

  const input = instance.createEncryptedInput(
    contractAddress ?? CONTRACT_ADDRESSES.taskManager,
    await signer.getAddress()
  );

  // Add the budget as a uint64 (amounts in wei/token units)
  input.add64(amount);

  const encrypted = await input.encrypt();
  return encrypted;
}

/**
 * Encrypt a bid amount for BidManager.submitBid()
 */
export async function encryptBid(
  provider: BrowserProvider,
  amount: bigint,
  contractAddress?: string
): Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }> {
  const instance = await initFhevm(provider);
  const signer = await provider.getSigner();

  const input = instance.createEncryptedInput(
    contractAddress ?? CONTRACT_ADDRESSES.bidManager,
    await signer.getAddress()
  );

  input.add64(amount);

  const encrypted = await input.encrypt();
  return encrypted;
}

/**
 * Format bytes to hex string for contract calls
 */
export function toHex(bytes: Uint8Array): `0x${string}` {
  return `0x${Buffer.from(bytes).toString("hex")}` as `0x${string}`;
}

/**
 * Encode handle for contract input (bytes32)
 */
export function encodeHandle(handles: Uint8Array[]): `0x${string}` {
  if (handles.length === 0) throw new Error("No handles");
  return toHex(handles[0]);
}

// ── Mock encryption for demo/development (no wallet needed) ──────────────────
/**
 * Simulated encryption for demo mode.
 * Returns fake ciphertext bytes for UI demonstration without a real wallet.
 */
export function mockEncrypt(amount: bigint): {
  handles: Uint8Array[];
  inputProof: Uint8Array;
  displayHash: string;
} {
  // Generate deterministic-ish fake bytes for demo
  const seed = Number(amount % 1000000n);
  const handle = new Uint8Array(32);
  const proof = new Uint8Array(64);

  for (let i = 0; i < 32; i++) {
    handle[i] = (seed * (i + 1) * 137) % 256;
  }
  for (let i = 0; i < 64; i++) {
    proof[i] = (seed * (i + 7) * 251) % 256;
  }

  const displayHash = `0x${Buffer.from(handle).toString("hex").slice(0, 16)}...`;

  return { handles: [handle], inputProof: proof, displayHash };
}

/**
 * Format an address for display (truncated)
 */
export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Format wei to ETH display string
 */
export function formatAmount(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}
