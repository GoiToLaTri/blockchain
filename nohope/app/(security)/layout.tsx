"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export default function SecurityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isConnected, isReconnecting } = useAccount();
  const router = useRouter();
  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      const id = setTimeout(async () => {
        await fetch("/api/auth/logout", { method: "POST" });

        toast.success("Đăng xuất thành công");

        router.replace("/login");
      }, 0);

      return () => clearTimeout(id);
    }
  }, [isConnected, isReconnecting]);
  return <div>{children}</div>;
}
