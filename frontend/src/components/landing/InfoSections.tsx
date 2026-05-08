"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Lock, Cpu, Trophy, Check, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    icon: Lock,
    title: "Encrypted Budget Submission",
    description:
      "You encrypt your maximum budget client-side using fhevmjs. A ZK proof is generated alongside the ciphertext. The smart contract never sees your plaintext budget.",
    color: "text-cipher-400",
    bg: "bg-cipher-500/10",
    border: "border-cipher-500/20",
    code: "TFHE.asEuint64(input, proof)",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Providers Submit Encrypted Bids",
    description:
      "Service providers encrypt their bid amounts the same way. Multiple encrypted bids accumulate on-chain — visible as ciphertexts only, never as values.",
    color: "text-neon-purple",
    bg: "bg-neon-purple/10",
    border: "border-neon-purple/20",
    code: "BidManager.submitBid(encInput, proof)",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Smart Contract Computes Winner Privately",
    description:
      "The MatchingEngine runs TFHE.lt() + TFHE.select() on ciphertexts to find the lowest bid — all in encrypted space. Only the winner is decrypted via the Zama Gateway.",
    color: "text-neon-emerald",
    bg: "bg-neon-emerald/10",
    border: "border-neon-emerald/20",
    code: "TFHE.select(TFHE.lt(a,b), a, b)",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Bid Amounts",
    traditional: { value: "Publicly visible", bad: true },
    cipherhire: { value: "FHE-encrypted", bad: false },
  },
  {
    feature: "User Budgets",
    traditional: { value: "Exposed on-chain", bad: true },
    cipherhire: { value: "Confidential", bad: false },
  },
  {
    feature: "Matching Logic",
    traditional: { value: "Plaintext computation", bad: true },
    cipherhire: { value: "TFHE operations", bad: false },
  },
  {
    feature: "Losing Bids",
    traditional: { value: "Permanently public", bad: true },
    cipherhire: { value: "Never revealed", bad: false },
  },
  {
    feature: "Market Manipulation",
    traditional: { value: "Trivially possible", bad: true },
    cipherhire: { value: "Impossible", bad: false },
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-3 font-mono text-xs tracking-widest text-cipher-400/60 uppercase">
            How It Works
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Three steps to confidential coordination
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <GlassCard hover className="h-full" whileHover={{ y: -4 }}>
                  {/* Number */}
                  <div className="mb-5 flex items-center justify-between">
                    <span
                      className={`font-mono text-4xl font-bold opacity-20 ${step.color}`}
                    >
                      {step.number}
                    </span>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${step.bg} ${step.border}`}
                    >
                      <Icon size={18} className={step.color} />
                    </div>
                  </div>

                  <h3 className="mb-3 text-base font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-white/50">
                    {step.description}
                  </p>

                  {/* Code snippet */}
                  <div
                    className={`rounded-lg border px-3 py-2 ${step.bg} ${step.border}`}
                  >
                    <code className={`font-mono text-[11px] ${step.color}`}>
                      {step.code}
                    </code>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyFHESection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 text-center"
        >
          <div className="mb-3 font-mono text-xs tracking-widest text-neon-purple/60 uppercase">
            Why FHE Matters
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Traditional vs Confidential Marketplace
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/40">
            Fully Homomorphic Encryption lets smart contracts compute on encrypted data —
            opening up economic coordination that was previously impossible onchain.
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-white/[0.07]"
          style={{ background: "rgba(10,10,18,0.8)", backdropFilter: "blur(12px)" }}
        >
          {/* Table header */}
          <div className="grid grid-cols-3 border-b border-white/[0.07]">
            <div className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-white/30">
              Feature
            </div>
            <div className="border-x border-white/[0.07] px-6 py-4 text-xs font-medium uppercase tracking-widest text-red-400/60">
              Traditional Blockchain
            </div>
            <div className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-cipher-400/60">
              CipherHire (FHE)
            </div>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="grid grid-cols-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.01] transition-colors"
            >
              <div className="px-6 py-4 text-sm font-medium text-white/70">
                {row.feature}
              </div>
              <div className="flex items-center gap-2 border-x border-white/[0.04] px-6 py-4">
                <X size={13} className="flex-shrink-0 text-red-400/60" />
                <span className="text-sm text-red-300/50">{row.traditional.value}</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-4">
                <Check size={13} className="flex-shrink-0 text-neon-emerald" />
                <span className="text-sm text-neon-emerald/80">{row.cipherhire.value}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
