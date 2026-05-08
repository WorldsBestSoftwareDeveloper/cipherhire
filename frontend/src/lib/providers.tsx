"use client";

import { WagmiProvider, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const ALCHEMY_RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://eth-sepolia.g.alchemy.com/v2/d0T0yGFAkDwEK7x78XeUJ";

// Define Sepolia with your RPC explicitly set
// This tells every connected wallet — Rabby, MetaMask, any wallet —
// to use this RPC for Sepolia instead of their own default
const sepoliaWithCustomRPC = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [ALCHEMY_RPC],
    },
    public: {
      http: [ALCHEMY_RPC],
    },
  },
};

const config = getDefaultConfig({
  appName: "CipherHire",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "365f55be1bdd22874fca6503435c4d6b",
  chains: [sepoliaWithCustomRPC],
  transports: {
    [sepolia.id]: http(ALCHEMY_RPC),
  },
  ssr: true,
});

const queryClient = new QueryClient();

const cipherTheme = darkTheme({
  accentColor: "#4f8eff",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={cipherTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}