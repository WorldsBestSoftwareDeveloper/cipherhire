"use client";

import { motion } from "framer-motion";
import { Lock, Users, Clock, ChevronRight, Trophy, Cpu } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { EncryptedStatusBadge } from "@/components/ui/EncryptedStatusBadge";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  index?: number;
  onSelect?: (task: Task) => void;
  onBid?: (task: Task) => void;
  onRunMatching?: (task: Task) => void;
}

const categoryColors: Record<string, string> = {
  "AI Writing": "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "Code Generation": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "Data Analysis": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Image Generation": "text-pink-400 bg-pink-500/10 border-pink-500/20",
  "Translation": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Research": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Automation": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Other": "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const statusBadge: Record<string, { label: string; class: string }> = {
  Open: { label: "Open", class: "text-neon-emerald bg-neon-emerald/10 border-neon-emerald/20" },
  Computing: { label: "Computing", class: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  Completed: { label: "Completed", class: "text-slate-400 bg-white/5 border-white/10" },
  Cancelled: { label: "Cancelled", class: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export function TaskCard({ task, index = 0, onSelect, onBid, onRunMatching }: TaskCardProps) {
  const catColor = categoryColors[task.category] ?? categoryColors["Other"];
  const badge = statusBadge[task.status];
  const timeAgo = formatTimeAgo(task.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <GlassCard
        hover
        className="group cursor-pointer"
        whileHover={{ y: -2 }}
        onClick={() => onSelect?.(task)}
      >
        {/* Top row */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${catColor}`}>
              {task.category}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.class}`}>
              {badge.label}
            </span>
          </div>
          <ChevronRight
            size={16}
            className="flex-shrink-0 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-cipher-400"
          />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-base font-semibold leading-snug text-white group-hover:text-cipher-200 transition-colors">
          {task.title}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/50">
          {task.description}
        </p>

        {/* Stats row */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-white/40">
          <div className="flex items-center gap-1.5">
            <Lock size={11} className="text-cipher-400/70" />
            <span>Budget Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={11} />
            <span>
              {task.bidCount} encrypted bid{task.bidCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Winner reveal */}
        {task.status === "Completed" && task.winner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 overflow-hidden rounded-xl border border-neon-emerald/20 bg-neon-emerald/5 px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Trophy size={13} className="text-neon-emerald" />
              <span className="text-xs font-medium text-neon-emerald">Winner Selected</span>
            </div>
            <div className="mt-1 font-mono text-[11px] text-white/60">
              {shortAddr(task.winner)}
            </div>
          </motion.div>
        )}

        {/* CTA buttons */}
        {task.status === "Open" && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onBid?.(task)}
              className="flex-1 rounded-xl border border-cipher-500/30 bg-cipher-500/10 px-4 py-2 text-xs font-semibold text-cipher-300 transition-all hover:border-cipher-500/50 hover:bg-cipher-500/20 hover:text-cipher-200"
            >
              Submit Encrypted Bid
            </button>
            {task.bidCount >= 2 && (
              <button
                onClick={() => onRunMatching?.(task)}
                className="flex items-center gap-1.5 rounded-xl border border-neon-purple/30 bg-neon-purple/10 px-3 py-2 text-xs font-semibold text-neon-purple transition-all hover:border-neon-purple/50 hover:bg-neon-purple/20"
              >
                <Cpu size={11} />
                Match
              </button>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
