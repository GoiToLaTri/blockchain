"use client";
import { useSignMessage, useAccount } from "wagmi";
import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export function LoginButton() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!address) return toast.error("Vui lòng kết nối ví trước");

    setLoading(true);
    try {
      // 1. Giả sử lấy nonce từ API (hoặc tạo tạm thời để test)
      const message = `Chào mừng bạn. Mã xác thực của bạn là: ${Date.now()}`;

      // 2. Yêu cầu MetaMask ký
      const signature = await signMessageAsync({ message });

      // 3. Gửi lên Server để kiểm tra
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ address, message, signature }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.success) router.replace("/");
      router.refresh();
      return toast.success("Xác thực thành công");
    } catch (err) {
      console.error("Lỗi xác thực:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      size="lg"
      className="w-full bg-linear-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/30 cursor-pointer"
      disabled={loading}
    >
      <KeyRound className="size-4" />
      Xác thực ví
    </Button>
  );
}
