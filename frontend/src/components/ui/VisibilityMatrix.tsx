"use client";

import { motion } from "framer-motion";
import { Eye, Lock, Shield, EyeOff, FileText, DollarSign, BarChart2, Cpu, XCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { EncryptedStatusBadge } from "./EncryptedStatusBadge";

interface VisibilityRow {
  icon: React.ElementType;
  dataType: string;
  status: "public" | "encrypted" | "confidential" | "never";
  description: string;
}

const rows: VisibilityRow[] = [
  {
    icon: FileText,
    dataType: "Task Description",
    status: "public",
    description: "Task title, category, and requirements are visible to all",
  },
  {
    icon: DollarSign,
    dataType: "User Budget",
    status: "encrypted",
    description: "Maximum budget stored as FHE ciphertext — never on-chain as plaintext",
  },
  {
    icon: BarChart2,
    dataType: "Provider Bids",
    status: "encrypted",
    description: "All bid amounts stored as FHE ciphertexts throughout the process",
  },
  {
    icon: Cpu,
    dataType: "Match Computation",
    status: "confidential",
    description: "TFHE.lt() + TFHE.select() operate on ciphertexts — no plaintext used",
  },
  {
    icon: XCircle,
    dataType: "Losing Bids",
    status: "never",
    description: "Losing bids are permanently encrypted — revealed to no one, ever",
  },
];

const statusConfig = {
  public: { label: "Public", color: "text-slate-300", dotColor: "bg-slate-400" },
  encrypted: { label: "Encrypted", color: "text-cipher-400", dotColor: "bg-cipher-400" },
  confidential: { label: "Confidential", color: "text-neon-purple", dotColor: "bg-neon-purple" },
  never: { label: "Never Revealed", color: "text-slate-500", dotColor: "bg-slate-600" },
};

export function VisibilityMatrix() {
  return (
    <GlassCard className="overflow-hidden" padding="none">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cipher-500/15">
            <Shield size={14} className="text-cipher-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Privacy Visibility Matrix</h3>
            <p className="text-xs text-white/40">What information is visible to whom</p>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/[0.04] px-6 py-3">
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">
          Data Type
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">
          Visibility
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {rows.map((row, i) => {
          const Icon = row.icon;
          const cfg = statusConfig[row.status];

          return (
            <motion.div
              key={row.dataType}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="group grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                  <Icon size={13} className="text-white/40" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">{row.dataType}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-white/40">
                    {row.description}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <EncryptedStatusBadge status={row.status} size="sm" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-white/[0.06] px-6 py-4">
        <div className="flex flex-wrap gap-4">
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
              <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
