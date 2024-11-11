import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia, mainnet, polygon, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
    appName: "TApp for OpenSea",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [mainnet, base, polygon, baseSepolia, sepolia],
    ssr: true,
});
