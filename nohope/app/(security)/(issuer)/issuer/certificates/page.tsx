"use client";

import CustomConnectButton from "@/components/custom-connect-button";
import { CertificateHistory } from "@/components/certificate-history";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi";
import { BadgeCheck, History, Search, ShieldCheck } from "lucide-react";

export default function CertificatesPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            Chứng chỉ
          </h1>
          <p className="text-muted-foreground italic">
            Tra cứu lịch sử phát hành, tìm kiếm chứng chỉ và thu hồi khi cần.
          </p>
        </div>

        <div className="min-w-52">
          <CustomConnectButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md border-t-4 border-t-[#0ea5e9]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> Nhật ký blockchain
            </CardTitle>
            <CardDescription>Giao dịch phát hành gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Kết quả truy vấn được đồng bộ từ database và blockchain.
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-[#22c55e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" /> Kiểm soát
            </CardTitle>
            <CardDescription>Thu hồi khi chứng chỉ sai lệch</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Hành động thu hồi sẽ được ghi nhận lại để truy vết sau này.
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-[#f59e0b]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" /> Tìm kiếm
            </CardTitle>
            <CardDescription>Lọc theo tên, loại bằng hoặc hash</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tìm nhanh trong lịch sử phát hành của issuer hiện tại.
          </CardContent>
        </Card>
      </div>

      {isConnected && address ? (
        <CertificateHistory issuerAddress={address} />
      ) : (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Kết nối ví
            </CardTitle>
            <CardDescription>
              Cần kết nối ví issuer để xem lịch sử chứng chỉ.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
