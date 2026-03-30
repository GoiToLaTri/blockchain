"use client";

import CustomConnectButton from "@/components/custom-connect-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, GraduationCap, History, ShieldCheck } from "lucide-react";

export default function IssuerDashboard() {
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ["issuer-stats", address],
    enabled: !!address,
    queryFn: async () => {
      const response = await fetch(`/api/eth/certificates/stats?issuer=${address}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Fetch stats failed");
      }
      return response.json();
    },
  });

  const stats = data?.stats;

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            Bảng điều khiển issuer
          </h1>
          <p className="text-muted-foreground italic">
            Theo dõi phát hành, thu hồi và trạng thái hoạt động của chứng chỉ.
          </p>
        </div>

        <div className="min-w-52">
          <CustomConnectButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md border-t-4 border-t-[#F97316]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" /> Đã phát hành
            </CardTitle>
            <CardDescription>Chứng chỉ hợp lệ trên hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? "..." : stats?.totalIssued ?? 0}
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-[#22c55e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Còn hiệu lực
            </CardTitle>
            <CardDescription>Chứng chỉ chưa bị thu hồi</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? "..." : stats?.totalActive ?? 0}
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-[#ef4444]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> Đã thu hồi
            </CardTitle>
            <CardDescription>Chứng chỉ không còn hiệu lực</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? "..." : stats?.totalRevoked ?? 0}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" /> Lối tắt thao tác
          </CardTitle>
          <CardDescription>
            Đi thẳng đến màn phát hành hoặc lịch sử để xử lý nhanh.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="bg-[#F97316] hover:bg-[#ea580c] text-white">
            <a href="/issuer/issue">Phát hành văn bằng</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/issuer/certificates">Xem lịch sử</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
