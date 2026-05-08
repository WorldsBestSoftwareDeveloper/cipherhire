"use client";

import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

type BadgeStatus = "public" | "encrypted" | "confidential" | "never" | "computing";

interface EncryptedStatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

const configs: Record<
  BadgeStatus,
  { icon: React.ElementType; color: string; bg: string; border: string; text: string }
> = {
  public: {
    icon: Eye,
    color: "text-slate-300",
    bg: "bg-white/5",
    border: "border-white/10",
    text: "Public",
  },
  encrypted: {
    icon: Lock,
    color: "text-cipher-400",
    bg: "bg-cipher-500/10",
    border: "border-cipher-500/20",
    text: "Encrypted",
  },
  confidential: {
    icon: Shield,
    color: "text-neon-purple",
    bg: "bg-neon-purple/10",
    border: "border-neon-purple/20",
    text: "Confidential",
  },
  never: {
    icon: EyeOff,
    color: "text-slate-500",
    bg: "bg-white/[0.03]",
    border: "border-white/5",
    text: "Never Revealed",
  },
  computing: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "Computing",
  },
};

const sizes = {
  sm: { pill: "px-2 py-0.5 text-xs gap-1", icon: 10 },
  md: { pill: "px-3 py-1 text-xs gap-1.5", icon: 12 },
  lg: { pill: "px-4 py-1.5 text-sm gap-2", icon: 14 },
};

export function EncryptedStatusBadge({
  status,
  label,
  animate = true,
  size = "md",
}: EncryptedStatusBadgeProps) {
  const cfg = configs[status];
  const sz = sizes[size];
  const Icon = cfg.icon;

  return (
    <motion.span
      initial={animate ? { opacity: 0, scale: 0.9 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      className={clsx(
        "inline-flex items-center rounded-full border font-mono font-medium",
        cfg.color,
        cfg.bg,
        cfg.border,
        sz.pill
      )}
    >
      {/* Animated dot for active states */}
      {(status === "encrypted" || status === "computing") && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={clsx(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              status === "computing" ? "animate-ping bg-amber-400" : "animate-ping bg-cipher-400"
            )}
          />
          <span
            className={clsx(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              status === "computing" ? "bg-amber-400" : "bg-cipher-400"
            )}
          />
        </span>
      )}
      <Icon size={sz.icon} />
      {label ?? cfg.text}
    </motion.span>
  );
}
