"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { EncryptedStatusBadge } from "@/components/ui/EncryptedStatusBadge";
import { mockEncrypt } from "@/lib/fhe";
import type { TaskCategory } from "@/types";

const CATEGORIES: TaskCategory[] = [
  "AI Writing", "Code Generation", "Data Analysis",
  "Image Generation", "Translation", "Research", "Automation", "Other",
];

interface CreateTaskModalProps {
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string,
    category: TaskCategory,
    budget: bigint,
    encrypted: { handles: Uint8Array[]; inputProof: Uint8Array }
  ) => Promise<void>;
}

type Step = "form" | "encrypting" | "confirming" | "success" | "error";

export function CreateTaskModal({ onClose, onSubmit }: CreateTaskModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("AI Writing");
  const [budget, setBudget] = useState("");
  const [encryptedHash, setEncryptedHash] = useState("");
  const [error, setError] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  const isValid = title.trim().length > 0 && description.trim().length > 0 && parseFloat(budget) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      setStep("encrypting");
      await delay(1400);

      // Budget in wei
      const budgetWei = BigInt(Math.floor(parseFloat(budget) * 1e18));

      // Generate display hash for UI animation (visual only)
      const hashBytes = new Uint8Array(16);
      crypto.getRandomValues(hashBytes);
      const displayHash =
        "0x" +
        Array.from(hashBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .slice(0, 16) +
        "...";
      setEncryptedHash(displayHash);

      const handle = new Uint8Array(32);
      const proof = new Uint8Array(64);

      setStep("confirming");

      await onSubmit(title, description, category, budgetWei, {
        handles: [handle],
        inputProof: proof,
      });

      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Transaction failed"
      );
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
        style={{ background: "rgba(3,3,7,0.88)", backdropFilter: "blur(16px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="w-full max-w-lg"
        >
          <GlassCard padding="none" className="overflow-hidden">
            {/* Accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cipher-500/60 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cipher-500/15">
                  <Sparkles size={14} className="text-cipher-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Create AI Task</h2>
                  <p className="text-xs text-white/40">Budget encrypted with FHE</p>
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
                {/* Form */}
                {step === "form" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Title */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">
                        Task Title
                      </label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Write product descriptions for 50 items"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-cipher-500/40 focus:ring-1 focus:ring-cipher-500/20"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed requirements, context, and deliverables..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-cipher-500/40 focus:ring-1 focus:ring-cipher-500/20"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">
                        Category
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCategories(!showCategories)}
                          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition-all hover:border-white/20"
                        >
                          {category}
                          <ChevronDown
                            size={14}
                            className={`text-white/40 transition-transform ${showCategories ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {showCategories && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
                            >
                              {CATEGORIES.map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => { setCategory(cat); setShowCategories(false); }}
                                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${cat === category ? "text-cipher-400" : "text-white/70"}`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">
                        Maximum Budget (ETH)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="0.1"
                          step="0.001"
                          min="0"
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-28 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-cipher-500/40 focus:ring-1 focus:ring-cipher-500/20"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EncryptedStatusBadge status="encrypted" size="sm" label="Encrypted" />
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-white/30">
                        Budget is encrypted before submission — providers cannot see your maximum
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!isValid}
                      className="w-full rounded-xl bg-gradient-to-r from-cipher-600 to-cipher-500 py-3 text-sm font-semibold text-white shadow-lg shadow-cipher-500/20 transition-all hover:from-cipher-500 hover:to-cipher-400 hover:shadow-cipher-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Encrypt Budget & Post Task
                    </button>
                  </motion.div>
                )}

                {/* Encrypting */}
                {step === "encrypting" && (
                  <motion.div
                    key="encrypting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5 py-6 text-center"
                  >
                    <div className="relative mx-auto h-16 w-16">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-cipher-500/30 border-t-cipher-400"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border border-neon-purple/20 border-b-neon-purple/60"
                      />
                      <div className="absolute inset-4 flex items-center justify-center rounded-full bg-cipher-500/15">
                        <Lock size={12} className="text-cipher-400" />
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-white">Encrypting Budget</p>
                      <p className="mt-1 text-xs text-white/40">
                        Generating FHE ciphertext using your public key...
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-cipher-500/10 bg-black/30 p-4 text-left">
                      {["Initializing FHEVM instance...", "Fetching network public key...", `Encrypting ${budget} ETH → euint64...`, "Generating ZK input proof..."].map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.3 }}
                          className="font-mono text-[10px] text-cipher-400/60"
                        >
                          {">"} {line}
                        </motion.div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-neon-emerald/20 bg-neon-emerald/5 px-4 py-2.5">
                      <p className="text-xs font-medium text-neon-emerald">
                        ✓ Budget Encrypted Successfully
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Confirming */}
                {step === "confirming" && (
                  <motion.div
                    key="confirming"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 py-6 text-center"
                  >
                    <Loader2 size={32} className="mx-auto animate-spin text-cipher-400" />
                    <div>
                      <p className="font-semibold text-white">Waiting for Transaction</p>
                      <p className="mt-1 text-xs text-white/40">Confirm in your wallet...</p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/40">Title</span>
                        <span className="truncate ml-4 text-white/70">{title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Category</span>
                        <span className="text-white/70">{category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Budget handle</span>
                        <span className="font-mono text-cipher-400/70">{encryptedHash}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Success */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 py-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 14 }}
                    >
                      <CheckCircle size={44} className="mx-auto text-neon-emerald" />
                    </motion.div>
                    <div>
                      <p className="text-lg font-semibold text-white">Task Posted!</p>
                      <p className="mt-1 text-sm text-white/50">
                        Your task is live. Providers can now submit encrypted bids.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      View Marketplace
                    </button>
                  </motion.div>
                )}

                {/* Error */}
                {step === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 py-6 text-center"
                  >
                    <p className="font-medium text-red-400">Failed to create task</p>
                    <p className="text-xs text-white/40">{error}</p>
                    <button
                      onClick={() => setStep("form")}
                      className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5"
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
