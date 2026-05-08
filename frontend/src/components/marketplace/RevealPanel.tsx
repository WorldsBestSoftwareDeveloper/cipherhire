"use client";

import { motion } from "framer-motion";
import { Trophy, EyeOff, Lock, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Task } from "@/types";

interface RevealPanelProps {
  task: Task;
}

export function RevealPanel({ task }: RevealPanelProps) {
  if (task.status !== "Completed" || !task.winner) return null;

  const winningBidEth = task.revealedWinningBid
    ? (Number(task.revealedWinningBid) / 1e18).toFixed(4)
    : "—";

  return (
    <GlassCard variant="emerald" glow className="overflow-hidden">
      {/* Glow bar at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-emerald/60 to-transparent" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-emerald/15"
        >
          <Trophy size={18} className="text-neon-emerald" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-white">Winner Selected</h3>
          <p className="text-xs text-white/40">Matching complete — result revealed</p>
        </div>
        <CheckCircle size={16} className="ml-auto text-neon-emerald" />
      </div>

      {/* Winner info */}
      <div className="mb-4 space-y-3">
        <div className="rounded-xl border border-neon-emerald/20 bg-neon-emerald/8 p-4">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-widest text-neon-emerald/60">
            Winning Provider
          </div>
          <div className="font-mono text-sm text-white break-all">{task.winner}</div>
        </div>

        <div className="rounded-xl border border-neon-emerald/20 bg-neon-emerald/8 p-4">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-widest text-neon-emerald/60">
            Winning Bid
          </div>
          <div className="font-mono text-2xl font-bold text-neon-emerald">
            {winningBidEth} <span className="text-base font-normal text-white/50">ETH</span>
          </div>
        </div>
      </div>

      {/* Privacy assurance */}
      <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/5">
          <EyeOff size={13} className="text-white/40" />
        </div>
        <div>
          <div className="text-xs font-medium text-white/60">Losing Bids Remain Encrypted</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-white/30">
            All non-winning bids are permanently encrypted on-chain. They were never decrypted
            during computation — not by the contract, not by the Gateway, not by anyone.
          </p>
        </div>
      </div>

      {/* Encrypted bids count */}
      {task.bidCount > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <Lock size={11} className="text-white/30" />
          <span className="text-[11px] text-white/30">
            {task.bidCount - 1} other bid{task.bidCount - 1 !== 1 ? "s" : ""} remain permanently
            encrypted
          </span>
        </div>
      )}
    </GlassCard>
  );
}
