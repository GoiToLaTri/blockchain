"use client";
import CustomConnectButton from "@/components/custom-connect-button";
import { useAccount } from "wagmi";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) return <p>Vui lòng kết nối ví</p>;

  return (
    <div>
      <p>Ví của bạn: {address}</p>
      <CustomConnectButton />
    </div>
  );
}
