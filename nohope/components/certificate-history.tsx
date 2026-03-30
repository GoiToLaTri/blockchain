"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { History, Search, ShieldCheck } from "lucide-react";

type CertificateRecord = {
  _id: string;
  txHash: string;
  action: string;
  status: string;
  createdAt: string;
  metadata?: {
    studentName?: string;
    certificateType?: string;
    certHash?: string;
    ipfsCID?: string;
  };
};

export function CertificateHistory({
  issuerAddress,
  hideRevokeAction = false,
}: {
  issuerAddress: string;
  hideRevokeAction?: boolean;
}) {
  const queryClient = useQueryClient();
  const [skip, setSkip] = useState(0);
  const [keyword, setKeyword] = useState("");

  const historyQuery = useQuery({
    queryKey: ["issuer-history", issuerAddress, skip, keyword],
    enabled: !!issuerAddress,
    queryFn: async () => {
      const endpoint = keyword.trim()
        ? `/api/eth/certificates/search?issuer=${issuerAddress}&q=${encodeURIComponent(
            keyword.trim(),
          )}`
        : `/api/eth/certificates/history?issuer=${issuerAddress}&skip=${skip}&limit=10`;

      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fetch history failed");
      }

      return keyword.trim()
        ? { certificates: data.certificates, pagination: { total: data.certificates?.length || 0 } }
        : data;
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (certHash: string) => {
      const response = await fetch("/api/eth/certificates/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certHash, issuerAddress }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Revoke failed");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Thu hồi chứng chỉ thành công");
      queryClient.invalidateQueries({ queryKey: ["issuer-history"] });
      queryClient.invalidateQueries({ queryKey: ["issuer-stats"] });
      queryClient.invalidateQueries({ queryKey: ["issuer-certificate-stats"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Revoke failed");
    },
  });

  const certificates = (historyQuery.data?.certificates || []) as CertificateRecord[];
  const total = historyQuery.data?.pagination?.total || 0;

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" /> Lịch sử phát hành
          </CardTitle>
          <CardDescription>
            Tra cứu chứng chỉ đã phát hành, tìm kiếm theo tên hoặc hash.
          </CardDescription>
        </div>

        <div className="flex w-full max-w-sm items-center gap-2">
          <Input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setSkip(0);
            }}
            placeholder="Tìm theo tên, loại bằng, certHash"
          />
          <Button variant="outline" size="icon" type="button">
            <Search className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {historyQuery.isLoading && <p>Đang tải dữ liệu...</p>}
        {historyQuery.error && (
          <p className="text-sm text-destructive">Lỗi khi tải lịch sử</p>
        )}

        {!historyQuery.isLoading && !historyQuery.error && (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sinh viên</TableHead>
                  <TableHead>Loại bằng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Hash</TableHead>
                  {!hideRevokeAction && <TableHead className="text-right">Hành động</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((record) => {
                  const certHash = record.metadata?.certHash || record.txHash;
                  const isRevoked = record.action === "REVOKE_CERTIFICATE" || record.status === "FAILED";

                  return (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">
                        {record.metadata?.studentName || "Không có dữ liệu"}
                      </TableCell>
                      <TableCell>{record.metadata?.certificateType || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={isRevoked ? "destructive" : "secondary"}>
                          {isRevoked ? "Đã thu hồi" : "Hợp lệ"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(record.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {certHash.slice(0, 10)}...{certHash.slice(-8)}
                      </TableCell>
                      {!hideRevokeAction && (
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => revokeMutation.mutate(certHash)}
                            disabled={revokeMutation.isPending || isRevoked}
                          >
                            <ShieldCheck className="mr-2 size-4" />
                            Thu hồi
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {!certificates.length && (
                  <TableRow>
                    <TableCell colSpan={hideRevokeAction ? 5 : 6} className="py-10 text-center text-muted-foreground">
                      Chưa có dữ liệu phát hành.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Tổng số bản ghi: {total}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={skip === 0}
                  onClick={() => setSkip((current) => Math.max(current - 10, 0))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={skip + 10 >= total}
                  onClick={() => setSkip((current) => current + 10)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}