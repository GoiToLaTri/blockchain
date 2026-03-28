"use client";
import { useAccount } from "wagmi";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) return <p>Vui lòng kết nối ví</p>;

  return <p>Ví của bạn: {address}</p>;
}
