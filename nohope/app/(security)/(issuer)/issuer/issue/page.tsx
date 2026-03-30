"use client";

import CustomConnectButton from "@/components/custom-connect-button";
import { IssueCertificate } from "@/components/issue-certificates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, FileText, GraduationCap, ShieldCheck } from "lucide-react";

export default function IssuersPage() {
  const { address, isConnected } = useAccount();

  const fetchStats = async () => {
    const res = await fetch(`/api/eth/certificates/stats?issuer=${address}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["issuer-stats", address],
    queryFn: fetchStats,
    enabled: !!address,
  });

  const stats = data?.stats;

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            Phát hành văn bằng
          </h1>
          <p className="text-muted-foreground italic">
            Đồng bộ với dashboard admin, ghi nhận blockchain và lưu lịch sử truy vết.
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
            <CardDescription>Tổng số chứng chỉ thành công</CardDescription>
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
              <FileText className="w-5 h-5" /> Đã thu hồi
            </CardTitle>
            <CardDescription>Số chứng chỉ đã khóa</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? "..." : stats?.totalRevoked ?? 0}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" /> Khu vực phát hành
            </CardTitle>
            <CardDescription>
              Điền dữ liệu sinh viên và tạo giao dịch phát hành theo contract hiện tại.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/issuer/certificates">
                Xem lịch sử
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
            <IssueCertificate onIssued={() => refetch()} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <p className="font-medium">Luồng phát hành</p>
            <p className="text-sm text-muted-foreground">
              1. Nhập thông tin sinh viên. 2. Hệ thống tính certHash off-chain.
              3. Gửi giao dịch lên blockchain. 4. Ghi transaction history vào database.
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <p className="font-medium">Trạng thái kết nối</p>
            <p className="text-sm text-muted-foreground">
              {isConnected && address
                ? `Ví issuer đang kết nối: ${address}`
                : "Chưa kết nối ví. Hãy kết nối trước khi phát hành."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
