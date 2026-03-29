// config/wagmi.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "My Next.js Web3 App",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!, // Lấy tại cloud.walletconnect.com

  chains: [mainnet, polygon, sepolia],
  // ssr: true, // Bật chế độ Server Side Rendering cho Next.js
});
