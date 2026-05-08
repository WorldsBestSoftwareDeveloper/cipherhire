import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection, WhyFHESection } from "@/components/landing/InfoSections";

export default function HomePage() {
  return (
    <div className="bg-animated-gradient">
      <HeroSection />
      <HowItWorksSection />
      <WhyFHESection />

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-12 text-center">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cipher-500/30" />
            <span className="font-mono text-[11px] text-white/20">
              CipherHire · Powered by Zama FHEVM · Deployed on Sepolia
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-cipher-500/30" />
          </div>
          <p className="text-xs text-white/20">
            Confidential Coordination Infrastructure for AI Services
          </p>
        </div>
      </footer>
    </div>
  );
}
