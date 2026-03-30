"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export default function SecurityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isConnected, isReconnecting } = useAccount();
  const router = useRouter();
  const wasConnected = useRef(false);

  useEffect(() => {
    if (isConnected) {
      wasConnected.current = true;
      return;
    }

    if (!isConnected && !isReconnecting && wasConnected.current) {
      wasConnected.current = false;

      const id = setTimeout(async () => {
        await fetch("/api/auth/logout", { method: "POST" });

        toast.success("Đăng xuất thành công");
        router.replace("/");
        router.refresh();
      }, 0);

      return () => clearTimeout(id);
    }
  }, [isConnected, isReconnecting, router]);
  return <div>{children}</div>;
}
