// ─── Task Types ──────────────────────────────────────────────────────────────

export type TaskStatus = "Open" | "Computing" | "Completed" | "Cancelled";

export interface Task {
  id: number;
  creator: string;
  title: string;
  description: string;
  category: TaskCategory;
  createdAt: number;
  status: TaskStatus;
  bidCount: number;
  winner?: string;
  revealedWinningBid?: bigint;
}

export type TaskCategory =
  | "AI Writing"
  | "Code Generation"
  | "Data Analysis"
  | "Image Generation"
  | "Translation"
  | "Research"
  | "Automation"
  | "Other";

// ─── Bid Types ────────────────────────────────────────────────────────────────

export interface Bid {
  taskId: number;
  provider: string;
  deliveryDays: number;
  submittedAt: number;
  // Note: encrypted amount is never exposed in UI
}

export interface BidSubmission {
  taskId: number;
  amount: bigint; // plaintext, encrypted client-side before submission
  deliveryDays: number;
}

// ─── Encryption Types ─────────────────────────────────────────────────────────

export interface EncryptedInput {
  handles: Uint8Array[];
  inputProof: Uint8Array;
}

export interface EncryptionState {
  isEncrypting: boolean;
  isEncrypted: boolean;
  error?: string;
}

// ─── Matching Types ───────────────────────────────────────────────────────────

export type MatchingStage =
  | "idle"
  | "encrypting"
  | "computing"
  | "comparing"
  | "selecting"
  | "decrypting"
  | "complete";

export interface MatchingState {
  stage: MatchingStage;
  taskId?: number;
  winner?: string;
  winningBid?: bigint;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export interface VisibilityEntry {
  label: string;
  status: "public" | "encrypted" | "confidential" | "never";
  description: string;
}

export interface ContractAddresses {
  taskManager: string;
  bidManager: string;
  matchingEngine: string;
  chainId: number;
  network: string;
}
