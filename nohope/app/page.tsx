"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import CustomConnectButton from "@/components/custom-connect-button";
import { toast } from "sonner";
import { Lock, Zap, Globe } from "lucide-react";

export default function Home() {
  const [hash, setHash] = useState("");
  const { isConnected, isConnecting } = useAccount();
  const router = useRouter();

  const wasConnected = useRef(false);

  useEffect(() => {
    // Khi đã từng connect
    if (isConnected) {
      wasConnected.current = true;
      return;
    }

    // Nếu trước đó đã connect mà giờ mất connect => logout
    if (!isConnected && !isConnecting && wasConnected.current) {
      wasConnected.current = false;

      (async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          toast.success("Đăng xuất thành công");
          router.refresh();
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [isConnected, isConnecting, router]);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* NAV */}
      <nav className="flex justify-between items-center px-8 py-5 border-b">
        <h1 className="font-bold text-lg">CertChain</h1>

        <div className="flex items-center gap-4">
          <Button variant="ghost">Tính năng</Button>
          <Button variant="ghost">Tài liệu</Button>
          {!isConnected && !isConnecting && (
            <Link href={"/login"}>
              <Button>Bắt đầu</Button>
            </Link>
          )}
          {isConnected && !isConnecting && <CustomConnectButton />}
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-24 px-6">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Bằng cấp số <br />
          <span className="text-blue-600">không thể làm giả</span>
        </h1>

        <p className="max-w-xl mx-auto text-muted-foreground mb-8">
          Xác minh bằng cấp trên blockchain. Nhanh chóng, minh bạch và đáng tin
          cậy.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href={
              !isConnected && !isConnecting ? "/login" : "/student/certificates"
            }
          >
            <Button size="lg">Bắt đầu ngay</Button>
          </Link>
          <Button size="lg" variant="outline">
            Xem demo
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 bg-muted">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Bảo mật",
              icon: Lock,
              desc: "Dữ liệu được lưu trên blockchain, không thể thay đổi.",
            },
            {
              title: "Xác minh nhanh",
              icon: Zap,
              desc: "Chỉ mất vài giây để kiểm tra.",
            },
            {
              title: "Toàn cầu",
              icon: Globe,
              desc: "Dùng được ở mọi nơi.",
            },
          ].map((f, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <f.icon className="mb-4" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* VERIFY */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Xác minh bằng cấp</h2>
        <p className="text-muted-foreground mb-6">Nhập hash để kiểm tra</p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="0xabc..."
          />
          <Button>Xác minh</Button>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 bg-muted">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 text-center gap-6">
          {[
            ["2.4M+", "Bằng cấp"],
            ["320+", "Tổ chức"],
            ["99%", "Chính xác"],
            ["48ms", "Phản hồi"],
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl font-bold">{s[0]}</p>
              <p className="text-sm text-muted-foreground">{s[1]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Sẵn sàng bắt đầu?</h2>
        <Link
          href={
            !isConnected && !isConnecting ? "/login" : "/student/certificates"
          }
        >
          <Button size="lg">Tạo tài khoản miễn phí</Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2026 CertChain
      </footer>
    </div>
  );
}
