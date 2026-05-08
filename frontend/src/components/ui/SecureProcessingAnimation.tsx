"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Cpu, GitCompare, Trophy, Shield } from "lucide-react";
import { clsx } from "clsx";
import type { MatchingStage } from "@/types";

interface SecureProcessingAnimationProps {
  stage: MatchingStage;
  className?: string;
}

const stages: {
  key: MatchingStage;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    key: "encrypting",
    label: "Encrypting Inputs",
    sublabel: "Generating FHE ciphertexts + ZK proofs",
    icon: Lock,
    color: "text-cipher-400",
  },
  {
    key: "computing",
    label: "Secure Computation Running",
    sublabel: "TFHE operations executing on encrypted data",
    icon: Cpu,
    color: "text-neon-purple",
  },
  {
    key: "comparing",
    label: "Comparing Encrypted Values",
    sublabel: "TFHE.lt() + TFHE.select() — no plaintext used",
    icon: GitCompare,
    color: "text-neon-cyan",
  },
  {
    key: "selecting",
    label: "Selecting Optimal Match",
    sublabel: "Encrypted argmin complete — requesting decrypt",
    icon: Shield,
    color: "text-amber-400",
  },
  {
    key: "decrypting",
    label: "Gateway Decrypting Winner",
    sublabel: "Only winning bid revealed — losers stay encrypted",
    icon: Trophy,
    color: "text-neon-emerald",
  },
];

export function SecureProcessingAnimation({
  stage,
  className,
}: SecureProcessingAnimationProps) {
  const currentIdx = stages.findIndex((s) => s.key === stage);

  return (
    <div className={clsx("space-y-3", className)}>
      {/* Cinematic header */}
      <div className="mb-6 text-center">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs tracking-widest text-cipher-400/60 uppercase"
        >
          Confidential Matching Engine
        </motion.div>

        {/* Glowing spinner */}
        <div className="relative mx-auto my-4 h-16 w-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-cipher-500/30 border-t-cipher-400"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-neon-purple/20 border-b-neon-purple"
          />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-cipher-500/10">
            <Lock size={14} className="text-cipher-400" />
          </div>
        </div>
      </div>

      {/* Stage steps */}
      <div className="space-y-2">
        {stages.map((s, idx) => {
          const isActive = s.key === stage;
          const isDone = currentIdx > idx;
          const isPending = currentIdx < idx;
          const Icon = s.icon;

          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={clsx(
                "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500",
                isActive
                  ? "border-cipher-500/30 bg-cipher-500/10"
                  : isDone
                  ? "border-neon-emerald/20 bg-neon-emerald/5"
                  : "border-white/5 bg-white/[0.02]"
              )}
            >
              <div
                className={clsx(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                  isActive ? "bg-cipher-500/20" : isDone ? "bg-neon-emerald/15" : "bg-white/5"
                )}
              >
                {isActive ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Icon size={14} className={s.color} />
                  </motion.div>
                ) : (
                  <Icon
                    size={14}
                    className={isDone ? "text-neon-emerald" : "text-white/20"}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={clsx(
                    "text-sm font-medium",
                    isActive ? "text-white" : isDone ? "text-neon-emerald" : "text-white/30"
                  )}
                >
                  {s.label}
                </div>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-0.5 font-mono text-xs text-cipher-400/70"
                  >
                    {s.sublabel}
                  </motion.div>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                {isActive && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-cipher-400"
                  />
                )}
                {isDone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-2 w-2 rounded-full bg-neon-emerald"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Encrypted data stream visual */}
      <AnimatePresence>
        {(stage === "computing" || stage === "comparing") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-cipher-500/10 bg-black/30 p-4"
          >
            <div className="font-mono text-[10px] leading-relaxed text-cipher-400/50">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5] }}
                  transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity }}
                  className="truncate"
                >
                  {generateFakeCiphertext()}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function generateFakeCiphertext(): string {
  const chars = "0123456789abcdef";
  let result = "0x";
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
