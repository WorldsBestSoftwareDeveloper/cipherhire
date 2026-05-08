"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle, AlertCircle, Loader2, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { EncryptedStatusBadge } from "@/components/ui/EncryptedStatusBadge";
import { mockEncrypt } from "@/lib/fhe";
import type { Task } from "@/types";

interface BidSubmissionModalProps {
  task: Task;
  onClose: () => void;
  onSubmit: (taskId: number, amount: bigint, deliveryDays: number, encrypted: { handles: Uint8Array[]; inputProof: Uint8Array }) => Promise<void>;
}

type Step = "form" | "encrypting" | "confirming" | "success" | "error";

export function BidSubmissionModal({ task, onClose, onSubmit }: BidSubmissionModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [encryptedHash, setEncryptedHash] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      // Step 1: Encrypt
      setStep("encrypting");
      await delay(1200);

      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
      const { handles, inputProof, displayHash } = mockEncrypt(amountWei);
      setEncryptedHash(displayHash);

      // Step 2: Confirm transaction
      setStep("confirming");
      await delay(800);

      await onSubmit(task.id, amountWei, parseInt(deliveryDays), { handles, inputProof });

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setStep("error");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(3,3,7,0.85)", backdropFilter: "blur(12px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="w-full max-w-md"
        >
          <GlassCard padding="none" className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cipher-500/15">
                  <Lock size={14} className="text-cipher-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Submit Encrypted Bid</h2>
                  <p className="text-xs text-white/40">{task.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Form step */}
                {step === "form" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Privacy notice */}
                    <div className="flex items-start gap-3 rounded-xl border border-cipher-500/20 bg-cipher-500/8 p-3">
                      <Shield size={13} className="mt-0.5 flex-shrink-0 text-cipher-400" />
                      <p className="text-xs leading-relaxed text-cipher-300/80">
                        Your bid amount will be encrypted client-side using FHE before submission.
                        No one — including the contract — can read your bid value.
                      </p>
                    </div>

                    {/* Bid amount */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">
                        Bid Amount (ETH)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.05"
                          step="0.001"
                          min="0"
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-20 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-cipher-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-cipher-500/20"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EncryptedStatusBadge status="encrypted" size="sm" label="Will Encrypt" />
                        </div>
                      </div>
                    </div>

                    {/* Delivery days */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">
                        Estimated Delivery (days)
                      </label>
                      <input
                        type="number"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(e.target.value)}
                        min="1"
                        max="365"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-cipher-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-cipher-500/20"
                      />
                      <p className="mt-1 text-[10px] text-white/30">
                        Delivery estimate is public — only the amount is encrypted
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!amount || parseFloat(amount) <= 0}
                      className="w-full rounded-xl bg-cipher-500 py-3 text-sm font-semibold text-white transition-all hover:bg-cipher-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Encrypt & Submit Bid
                    </button>
                  </motion.div>
                )}

                {/* Encrypting step */}
                {step === "encrypting" && (
                  <motion.div
                    key="encrypting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 py-4 text-center"
                  >
                    <div className="relative mx-auto h-14 w-14">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-cipher-500/30 border-t-cipher-400"
                      />
                      <div className="absolute inset-3 flex items-center justify-center rounded-full bg-cipher-500/15">
                        <Lock size={12} className="text-cipher-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-white">Encrypting Bid Amount</p>
                      <p className="mt-1 text-xs text-white/40">
                        Generating FHE ciphertext + ZK proof...
                      </p>
                    </div>
                    {/* Animated hex stream */}
                    <div className="overflow-hidden rounded-xl border border-cipher-500/10 bg-black/30 px-4 py-3">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="font-mono text-[10px] text-cipher-400/60 truncate"
                      >
                        {`fhevm::encrypt_uint64(${amount} ETH) → 0x${randomHex(32)}...`}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Confirming step */}
                {step === "confirming" && (
                  <motion.div
                    key="confirming"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 py-4 text-center"
                  >
                    <Loader2 size={32} className="mx-auto animate-spin text-cipher-400" />
                    <div>
                      <p className="font-medium text-white">Submitting to Blockchain</p>
                      <p className="mt-1 text-xs text-white/40">
                        Confirm the transaction in your wallet...
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Encrypted bid handle</span>
                        <span className="font-mono text-cipher-400/70">{encryptedHash}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-white/40">Delivery estimate</span>
                        <span className="text-white/70">{deliveryDays} days</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Success step */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 py-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 16, stiffness: 200 }}
                    >
                      <CheckCircle size={40} className="mx-auto text-neon-emerald" />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-white">Bid Submitted Successfully</p>
                      <p className="mt-1 text-sm text-white/50">
                        Your encrypted bid is now on-chain.
                      </p>
                      <p className="mt-0.5 text-xs text-white/30">
                        No one can read your bid amount until matching completes.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Close
                    </button>
                  </motion.div>
                )}

                {/* Error step */}
                {step === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 py-4 text-center"
                  >
                    <AlertCircle size={36} className="mx-auto text-red-400" />
                    <div>
                      <p className="font-medium text-white">Submission Failed</p>
                      <p className="mt-1 text-xs text-white/50">{error}</p>
                    </div>
                    <button
                      onClick={() => setStep("form")}
                      className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomHex = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
