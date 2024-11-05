import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { isProd } from "./lib/utils";

export const config = getDefaultConfig({
  appName: "TApp for OpenSea",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [isProd ? base : baseSepolia],
  ssr: true,
});

export const CHAIN_ID = isProd ? 8453 : baseSepolia.id;
