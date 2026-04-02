// config/wagmi.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { flare, flareTestnet, mainnet, polygon, sepolia } from "wagmi/chains";

const ethereumHoodi = {
  id: 560048, // Thay bằng Chain ID thực tế của Hoodi
  name: "Ethereum Hoodi",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.hoodi.ethpandaops.io"] }, // Thay link RPC vào đây
  },
};

export const config = getDefaultConfig({
  appName: "My Next.js Web3 App",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!, // Lấy tại cloud.walletconnect.com

  chains: [flareTestnet],
  // ssr: true, // Bật chế độ Server Side Rendering cho Next.js
});
