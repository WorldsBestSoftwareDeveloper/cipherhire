"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Shield, Zap } from "lucide-react";
import Link from "next/link";

// Animated particle canvas
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      radius: number; alpha: number; color: string;
    }> = [];

    const colors = ["79,142,255", "139,92,246", "16,217,124", "6,182,212"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(79,142,255,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 0.7 }}
    />
  );
}

// Animated encrypted text
function CipherText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "0123456789abcdef";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let revealed = 0;
    const scramble = () => {
      interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, i) => {
              if (char === " ") return " ";
              if (i < revealed) return char;
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );
        if (revealed < text.length) revealed += 0.5;
        else clearInterval(interval);
      }, 40);
    };
    const timeout = setTimeout(scramble, 600);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [text]);

  return <span className="font-mono">{displayText}</span>;
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24">
      {/* Background effects */}
      <div className="absolute inset-0">
        <ParticleField />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(79,142,255,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 70% 80%, rgba(139,92,246,0.05) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-cipher-500/30 bg-cipher-500/10 px-4 py-1.5 text-xs font-medium text-cipher-300"
        >
          <Lock size={10} className="text-cipher-400" />
          Powered by Zama FHEVM · Fully Homomorphic Encryption
          <span className="flex h-1.5 w-1.5 rounded-full bg-neon-emerald">
            <span className="animate-ping absolute h-1.5 w-1.5 rounded-full bg-neon-emerald opacity-75" />
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Confidential AI Service
          <br />
          <span
            className="bg-gradient-to-r from-cipher-400 via-neon-purple to-cipher-300 bg-clip-text text-transparent"
          >
            Coordination Onchain
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/50"
        >
          Bids and budgets remain fully encrypted while smart contracts compute
          optimal matches — using{" "}
          <span className="text-cipher-400">Fully Homomorphic Encryption</span>.
          No plaintext ever touches the blockchain.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/marketplace"
            className="group flex items-center gap-2.5 rounded-xl bg-cipher-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cipher-500/25 transition-all hover:bg-cipher-400 hover:shadow-cipher-400/35"
          >
            Create Task
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Explore Marketplace
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mx-auto mt-16 grid max-w-md grid-cols-3 gap-4"
        >
          {[
            { label: "Bid Visibility", value: "0%", color: "text-neon-emerald" },
            { label: "FHE Ops", value: "TFHE", color: "text-cipher-400" },
            { label: "Plaintext Leaks", value: "None", color: "text-neon-purple" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="mt-0.5 text-[11px] text-white/30">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="h-8 w-px bg-gradient-to-b from-transparent to-white/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </motion.div>
      </motion.div>
    </section>
  );
}
