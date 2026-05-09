/**
 * FHE Encryption Utilities
 *
 * In production this uses fhevmjs to encrypt values client-side
 * before sending to the blockchain via Zama FHEVM.
 *
 * The full FHE flow requires kmsContractAddress and aclContractAddress
 * from Zama's deployed infrastructure on Sepolia.
 *
 * For the live demo we use CipherHireDemo which accepts plaintext
 * values to demonstrate real signed transactions on Sepolia.
 */

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

/**
 * Mock encryption for demo UI animations
 * Returns fake ciphertext bytes for visual demonstration
 */
export function mockEncrypt(amount: bigint): {
  handles: Uint8Array[];
  inputProof: Uint8Array;
  displayHash: string;
} {
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
