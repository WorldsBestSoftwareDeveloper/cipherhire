"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Play, Trophy, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SecureProcessingAnimation } from "@/components/ui/SecureProcessingAnimation";
import { RevealPanel } from "@/components/marketplace/RevealPanel";
import type { Task, MatchingStage } from "@/types";

interface MatchingEngineViewProps {
  task: Task;
  onRunMatching: () => Promise<void>;
}

const STAGES: MatchingStage[] = [
  "encrypting", "computing", "comparing", "selecting", "decrypting", "complete",
];

const STAGE_DURATIONS: Record<MatchingStage, number> = {
  idle: 0,
  encrypting: 1800,
  computing: 2400,
  comparing: 2000,
  selecting: 1600,
  decrypting: 2200,
  complete: 0,
};

export function MatchingEngineView({ task, onRunMatching }: MatchingEngineViewProps) {
  const [stage, setStage] = useState<MatchingStage>("idle");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (isRunning || task.bidCount < 2) return;
    setIsRunning(true);

    try {
      // Animate through stages while transaction processes
      let stageIdx = 0;
      const runStages = async () => {
        for (const s of STAGES.slice(0, -1)) {
          setStage(s);
          await delay(STAGE_DURATIONS[s]);
          stageIdx++;
        }
      };

      await Promise.all([runStages(), onRunMatching()]);
      setStage("complete");
    } catch {
      setStage("idle");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <GlassCard padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isRunning ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-purple/15"
          >
            <Cpu size={16} className="text-neon-purple" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-white">Confidential Matching Engine</h3>
            <p className="text-xs text-white/40">
              FHE comparison — no plaintext values used during computation
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-white">{task.bidCount}</div>
            <div className="mt-0.5 text-xs text-white/40">Encrypted Bids</div>
          </div>
          <div className="rounded-xl border border-cipher-500/15 bg-cipher-500/5 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-cipher-400">
              <Shield size={12} />
              <span className="text-xs font-medium">0 Revealed</span>
            </div>
            <div className="mt-1 text-xs text-white/40">During Computation</div>
          </div>
        </div>

        {/* Algorithm explanation */}
        {stage === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 space-y-2"
          >
            <div className="text-xs font-medium text-white/50 mb-2">
              FHE Algorithm (MatchingEngine.sol)
            </div>
            {[
              { code: "TFHE.lt(bidA, bidB)", desc: "Encrypted comparison" },
              { code: "TFHE.select(isLower, bidA, bidB)", desc: "Encrypted min selection" },
              { code: "Gateway.requestDecryption(minBid)", desc: "Decrypt winner only" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-2.5"
              >
                <code className="font-mono text-[11px] text-cipher-400/80">{item.code}</code>
                <span className="ml-auto text-[11px] text-white/30">{item.desc}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Matching animation */}
        <AnimatePresence>
          {stage !== "idle" && stage !== "complete" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <SecureProcessingAnimation stage={stage} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {stage === "complete" && task.status === "Completed" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <RevealPanel task={task} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Run button */}
        {task.status === "Open" && stage === "idle" && (
          <button
            onClick={handleRun}
            disabled={task.bidCount < 2}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-purple/20 to-cipher-500/20 border border-neon-purple/30 py-3.5 text-sm font-semibold text-white transition-all hover:border-neon-purple/50 hover:from-neon-purple/30 hover:to-cipher-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play size={14} className="text-neon-purple" />
            Run Confidential Matching
            {task.bidCount < 2 && (
              <span className="text-xs font-normal text-white/40">
                (need ≥2 bids)
              </span>
            )}
          </button>
        )}

        {isRunning && (
          <div className="mt-3 text-center text-xs text-white/30">
            Transaction submitted — animating computation stages...
          </div>
        )}
      </div>
    </GlassCard>
  );
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
