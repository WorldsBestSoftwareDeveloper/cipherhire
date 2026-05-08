"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "blue" | "purple" | "emerald" | "dark";
  hover?: boolean;
  glow?: boolean;
  padding?: "sm" | "md" | "lg" | "xl" | "none";
}

const glowColors = {
  default: "hover:shadow-cipher",
  blue: "hover:shadow-cipher-hover border-cipher-500/20",
  purple: "hover:shadow-purple border-neon-purple/20",
  emerald: "hover:shadow-emerald border-neon-emerald/20",
  dark: "border-white/5",
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

export function GlassCard({
  children,
  className,
  variant = "default",
  hover = true,
  glow = false,
  padding = "md",
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={clsx(
        // Base glass style
        "relative rounded-2xl border backdrop-blur-sm",
        "bg-gradient-to-br from-white/[0.04] to-white/[0.01]",
        "border-white/[0.08]",
        // Padding
        paddings[padding],
        // Variant glow
        glowColors[variant],
        // Hover transition
        hover && "transition-all duration-300",
        // Optional persistent glow
        glow && "shadow-cipher",
        className
      )}
      {...props}
    >
      {/* Subtle inner shine */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
