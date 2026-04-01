"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import CustomConnectButton from "@/components/custom-connect-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, GraduationCap, Search, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const { isConnected, isConnecting } = useAccount();
  const router = useRouter();

  const wasConnected = useRef(false);

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const isCertificateHash = (value: string) => /^0x[a-fA-F0-9]{64}$/.test(value);

  const handleVerify = async () => {
    const value = hash.trim();

    if (!value) {
      toast.error("Vui lòng nhập hash chứng chỉ");
      return;
    }

    if (!isCertificateHash(value)) {
      toast.error("Hash chứng chỉ không hợp lệ");
      return;
    }

    setLoading(true);

    await toast.promise(
      async () => {
        await sleep(800); // delay 0.8s

        await router.push(`/certificates/${encodeURIComponent(value)}`);
      },
      {
        loading: "Đang xác minh chứng chỉ",
        success: "Đã chuyển tới trang chi tiết",
        error: "Không thể xác minh chứng chỉ",
      },
    );

    setLoading(false);
  };

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,1),rgba(245,245,245,0.96)_30%,rgba(228,228,231,0.7)_100%)] text-zinc-950">
      <nav className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">NoHope</p>
            <h1 className="text-lg font-semibold tracking-tight">Certificate vault</h1>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/student/certificates">Bằng của tôi</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#verify">Tra cứu hash</Link>
            </Button>
            <CustomConnectButton />
          </div>
        </div>
      </nav>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-[0_32px_80px_rgba(0,0,0,0.22)] sm:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.05))]" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-zinc-300">
                  <Sparkles className="size-3.5" /> Monochrome edition
                </div>
                <div className="space-y-4">
                  <h2 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                    Tra cứu và xác thực chứng chỉ trên blockchain với dữ liệu minh bạch.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                    Hệ thống lưu trữ thông tin chứng chỉ trên blockchain để đảm bảo
                    khả năng đối chiếu, truy xuất và xác thực kết quả một cách nhất quán.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap">
                <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-white/50!">
                  <Link href={isConnected && !isConnecting ? "/student/certificates" : "/login"}>
                    Truy cập kho chứng chỉ
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-zinc-950">
                  <GraduationCap className="size-5" /> Bằng của tôi
                </CardTitle>
                <CardDescription>
                  Vault cá nhân để xem danh sách chứng chỉ đã được cấp.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-zinc-950">
                  <Search className="size-5" /> Xác minh
                </CardTitle>
                <CardDescription>
                  Tra cứu nhanh theo hash để mở trang chi tiết của chứng chỉ.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-zinc-950">
                  <ShieldCheck className="size-5" /> Dấu vết blockchain
                </CardTitle>
                <CardDescription>
                  Theo dõi phát hành và thu hồi trong cùng một nguồn dữ liệu.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-950">Trạng thái ví</p>
                  <p className="text-sm text-zinc-500">
                    {isConnected && !isConnecting ? "Đã sẵn sàng sử dụng" : "Chưa kết nối"}
                  </p>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {isConnected && !isConnecting ? "Đã kết nối" : "Chưa kết nối"}
                </div>
              </div>
              <div className="mt-4">
                <CustomConnectButton />
              </div>
            </div>
          </div>
        </section>

        <section id="verify" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-zinc-200 bg-white shadow-sm">
            <CardHeader className="border-b border-zinc-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-zinc-950">
                <Search className="size-5" /> Xác minh bằng hash
              </CardTitle>
              <CardDescription>
                Nhập hash để mở trang chứng chỉ chi tiết.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Input
                value={hash}
                onChange={(event) => setHash(event.target.value)}
                placeholder="0x... (64 ký tự hex)"
                className="border-zinc-200 bg-white"
              />
              <Button onClick={handleVerify} disabled={loading} className="w-full bg-zinc-950 text-white hover:bg-zinc-800">
                <ShieldCheck className="mr-2 size-4" />
                Xác minh ngay
              </Button>
              
            </CardContent>
          </Card>

          <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Bằng của tôi</p>
                <p className="mt-2 text-sm font-medium text-zinc-950">Vault dành cho sinh viên</p>
                <p className="mt-1 text-sm text-zinc-500">Xem danh sách chứng chỉ và trạng thái hiệu lực.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Xác minh</p>
                <p className="mt-2 text-sm font-medium text-zinc-950">Tra cứu tức thì</p>
                <p className="mt-1 text-sm text-zinc-500">Chuyển đến trang chi tiết bằng hash hợp lệ.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Dấu vết</p>
                <p className="mt-2 text-sm font-medium text-zinc-950">Minh bạch và nhất quán</p>
                <p className="mt-1 text-sm text-zinc-500">Theo dõi phát hành và thu hồi trong cùng một luồng.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-zinc-500 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 NoHope</p>
          <p>Monochrome certificate experience for students and issuers.</p>
        </div>
      </footer>
    </div>
  );
}
