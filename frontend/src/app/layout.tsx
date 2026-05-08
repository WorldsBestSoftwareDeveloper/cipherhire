import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/lib/providers";
import { Navbar } from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "CipherHire — Confidential AI Service Marketplace",
  description:
    "Confidential coordination infrastructure for AI services. Powered by Zama FHEVM — encrypted bids, encrypted budgets, private matching.",
  keywords: ["FHE", "FHEVM", "Zama", "encrypted marketplace", "confidential computing", "blockchain"],
  openGraph: {
    title: "CipherHire",
    description: "Confidential AI Service Coordination Onchain",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#030307] text-white antialiased">
        <Web3Provider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}