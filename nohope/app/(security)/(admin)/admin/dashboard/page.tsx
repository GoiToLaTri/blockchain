"use client";

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
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { useEffect } from "react";

export default function AdminDashboard() {
  const findAllTrans = async () => {
    const res = await fetch("/api/trans", {
      cache: "no-store",
      method: "GET",
    });
    if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu");
    return res.json();
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trans"],
    queryFn: findAllTrans,
  });

  useEffect(() => {
    (async () => await refetch())();
  }, [refetch]);

  const transactions = data?.trans || [];

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            Bảng điều khiển
          </h1>
          <p className="text-muted-foreground italic">
            Quản lý tài sản phi tập trung và lịch sử nghiên cứu chuỗi khối.
          </p>
        </div>
        <div className="min-w-52">
          <CustomConnectButton />
        </div>
      </div>
      {/* Phần bản điều khiển */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-card border rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Tổng người dùng</p>
          <h3 className="text-2xl font-bold">{data?.numberOfUsers ?? 0}</h3>
          <p className="text-xs text-green-600">+12% từ tháng trước</p>
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Giao dịch</p>
          <h3 className="text-2xl font-bold">{transactions.length ?? 0}</h3>
          <p className="text-xs text-green-600">+8% từ tháng trước</p>
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Tổng giá trị</p>
          <h3 className="text-2xl font-bold">
            {transactions
              ?.reduce(
                (total: number, tx: { gasUsed: string | number }) =>
                  total + Number(tx.gasUsed),
                0,
              )
              .toLocaleString()}
          </h3>
          <p className="text-xs text-green-600">+5% từ tháng trước</p>
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Trạng thái hệ thống</p>
          <h3 className="text-2xl font-bold">98.5%</h3>
          <p className="text-xs text-green-600">Hoạt động bình thường</p>
        </div>
      </div>

      {/* Activity Section */}
      <Card className="md:col-span-2 shadow-md">
        <CardHeader>
          <div>
            <CardTitle>Hoạt động hệ thống</CardTitle>
            <CardDescription>
              Lịch sử các giao dịch trên blockchain
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <p className="text-sm text-muted-foreground">Đang lấy dữ liệu...</p>
          )}

          {error && <p className="text-sm text-red-500">Lỗi khi lấy dữ liệu</p>}

          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Gas</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="text-right">Tx</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {transactions?.map(
                  (tx: {
                    _id: string;
                    action: string;
                    status: string;
                    gasUsed: string;
                    createdAt: string;
                    targetAddress: string;
                    txHash: string;
                  }) => (
                    <TableRow key={tx._id}>
                      {/* Action */}
                      <TableCell className="font-medium">{tx.action}</TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={
                            tx.status === "SUCCESS"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {tx.status === "SUCCESS" ? "Thành công" : "Thất bại"}
                        </Badge>
                      </TableCell>

                      {/* Time */}
                      <TableCell className="text-muted-foreground">
                        {tx.gasUsed}
                      </TableCell>

                      {/* Time */}
                      <TableCell className="text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>

                      {/* Address */}
                      <TableCell className="font-mono text-xs">
                        {tx.targetAddress?.slice(0, 6)}...
                        {tx.targetAddress?.slice(-4)}
                      </TableCell>

                      {/* Tx */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(
                              `https://hoodi.etherscan.io//tx/${tx.txHash}`,
                              "_blank",
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
