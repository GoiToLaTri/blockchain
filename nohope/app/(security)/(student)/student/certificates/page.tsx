"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import CustomConnectButton from "@/components/custom-connect-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  Fingerprint,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Certificate = {
  certHash: string;
  studentAddress: string;
  issuerAddress: string;
  studentName: string;
  certificateType: string;
  specialization?: string | null;
  gpa?: number | null;
  graduationDate?: string | null;
  graduationYear?: number | null;
  ipfsCID: string;
  txHash: string;
  isRevoked: boolean;
  revokedAt?: string | null;
  revokedTxHash?: string | null;
  revokedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CertificateResponse = {
  success?: boolean;
  certificates?: Certificate[];
  stats?: {
    total: number;
    active: number;
    revoked: number;
  };
  error?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatGpa(value?: number | null) {
  if (value === undefined || value === null) return "Không có";

  const normalizedValue = value > 10 ? value / 100 : value;
  return normalizedValue.toFixed(2).replace(/\.00$/, "");
}

function truncateHash(value: string) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

export default function CertificatesPage() {
  const { address, isConnected } = useAccount();

  const certificatesQuery = useQuery({
    queryKey: ["student-certificates", address],
    enabled: !!address,
    queryFn: async () => {
      const response = await fetch(`/api/eth/certificates/student?address=${address}`, {
        cache: "no-store",
      });

      const data = (await response.json()) as CertificateResponse;
      if (!response.ok) {
        throw new Error(data.error || "Không thể tải danh sách bằng cấp");
      }

      return data;
    },
  });

  const certificates = certificatesQuery.data?.certificates ?? [];
  const stats = certificatesQuery.data?.stats;

  const statusSummary = useMemo(
    () => [
      { label: "Tổng chứng chỉ", value: stats?.total ?? 0 },
      { label: "Còn hiệu lực", value: stats?.active ?? 0 },
      { label: "Đã thu hồi", value: stats?.revoked ?? 0 },
    ],
    [stats],
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.28em] text-zinc-500 shadow-sm">
            <Sparkles className="size-3.5" /> Kho chứng chỉ
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Kho chứng chỉ cá nhân, rõ ràng và dễ tra cứu.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Một không gian monochrome để xem lại chứng chỉ đã được cấp, trạng thái
              hiện tại và toàn bộ dấu vết blockchain đi kèm.
            </p>
          </div>
          <div className="flex flex-wrap">
            <Button asChild size="lg" variant="outline" className="border-zinc-200 bg-white text-zinc-950 hover:white/50!">
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </div>

        <Card className="border-zinc-200 bg-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-950">
              <Fingerprint className="size-5" /> Ví sinh viên
            </CardTitle>
            <CardDescription>
              Kết nối ví để tải danh sách chứng chỉ gắn với địa chỉ của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              {isConnected && address ? (
                <>
                  <p className="text-zinc-500">Địa chỉ đang kết nối</p>
                  <p className="mt-1 break-all font-mono text-xs text-zinc-950">{address}</p>
                </>
              ) : (
                <p>Chưa kết nối ví. Vui lòng kết nối để xem danh sách chứng chỉ.</p>
              )}
            </div>
            <CustomConnectButton />
          </CardContent>
        </Card>
      </section>

      <Card className="border-zinc-200 bg-white shadow-sm">
        <CardContent className="grid gap-3 px-6 py-5 sm:grid-cols-3">
          {statusSummary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Danh sách bằng cấp</h2>
            <p className="text-sm text-zinc-500">
              Mỗi thẻ dưới đây đại diện cho một chứng chỉ đã được ghi nhận trên blockchain.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100">
              <ShieldCheck className="mr-1 size-3.5" /> Đối chiếu on-chain
            </Badge>
            <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100">
              <BadgeCheck className="mr-1 size-3.5" /> Dữ liệu chuẩn hóa
            </Badge>
          </div>
        </div>

        {certificatesQuery.isLoading && (
          <Card className="border-zinc-200 bg-white shadow-sm">
              <CardContent className="py-8 text-sm text-zinc-500">
              Đang tải dữ liệu chứng chỉ...
            </CardContent>
          </Card>
        )}

        {certificatesQuery.error && (
          <Card className="border-zinc-200 bg-white shadow-sm">
              <CardContent className="py-8 text-sm text-zinc-500">
              Không thể tải danh sách chứng chỉ.
            </CardContent>
          </Card>
        )}

        {!certificatesQuery.isLoading && !certificatesQuery.error && certificates.length === 0 && (
          <Card className="border-dashed border-zinc-300 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <GraduationCap className="size-10 text-zinc-400" />
              <div>
                <p className="font-medium text-zinc-950">Chưa có dữ liệu chứng chỉ</p>
                <p className="text-sm text-zinc-500">
                  Khi có chứng chỉ được cấp cho ví này, chúng sẽ xuất hiện tại đây.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {certificates.map((certificate) => (
            <Card
              key={certificate.certHash}
              className="border-zinc-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader className="space-y-3 border-b border-zinc-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-zinc-950">{certificate.studentName}</CardTitle>
                    <CardDescription className="mt-1 text-zinc-500">{certificate.certificateType}</CardDescription>
                  </div>
                  <Badge
                    variant={certificate.isRevoked ? "destructive" : "secondary"}
                    className={certificate.isRevoked ? "" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-100"}
                  >
                    {certificate.isRevoked ? "Đã thu hồi" : "Hợp lệ"}
                  </Badge>
                </div>
                <p className="break-all font-mono text-xs text-zinc-500">{truncateHash(certificate.certHash)}</p>
              </CardHeader>

              <CardContent className="grid gap-4 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Chuyên ngành</p>
                    <p className="mt-1 text-sm text-zinc-950">{certificate.specialization || "Không có"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Năm tốt nghiệp</p>
                    <p className="mt-1 text-sm text-zinc-950">{certificate.graduationYear ?? "Không có"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Ngày tốt nghiệp</p>
                    <p className="mt-1 text-sm text-zinc-950">{formatDate(certificate.graduationDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">GPA</p>
                    <p className="mt-1 text-sm text-zinc-950">{formatGpa(certificate.gpa)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
                  <div className="flex items-center justify-between gap-2">
                    <span>TxHash</span>
                    <span className="font-mono text-zinc-950">{truncateHash(certificate.txHash)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span>IPFS CID</span>
                    <span className="font-mono text-zinc-950">{truncateHash(certificate.ipfsCID)}</span>
                  </div>
                </div>

                {certificate.isRevoked && (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                    <p className="font-medium text-zinc-950">Chứng chỉ đã được thu hồi</p>
                    <p className="mt-1">Thời điểm thu hồi: {formatDate(certificate.revokedAt)}</p>
                  </div>
                )}
              </CardContent>

              <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-4">
                <p className="text-xs text-zinc-500">Cập nhật lần cuối: {formatDate(certificate.updatedAt)}</p>
                <Button asChild size="sm" variant="outline" className="border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50">
                  <Link href={`/certificates/${certificate.certHash}`}>
                    Xem chi tiết
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
