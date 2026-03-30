"use client";

import { AddIssuerDialog } from "@/components/add-issuer-dialog";
import CustomConnectButton from "@/components/custom-connect-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ExternalLink, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function IssuersPage() {
  const [loading, setLoading] = useState(false);
  const fetchIssuers = async () => {
    const res = await fetch("/api/eth/issuers/all", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["issuers"],
    queryFn: fetchIssuers,
  });

  const removeIssuerMutation = useMutation({
    mutationFn: async (issuerAddr: string) => {
      setLoading(true);

      const res = await fetch("/api/eth/issuers/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issuerAddr }),
      });
      if (!res.ok) throw new Error("Remove failed");
      setLoading(false);

      return res.json();
    },
    onSuccess: () => {
      toast.success("Khóa thành công");
      refetch();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    },
  });

  const issuers = data?.issuers || [];
  const refetchData = async () => {
    await refetch();
  };

  const handleRemoveIssuer = (issuerAddr: string) => {
    removeIssuerMutation.mutate(issuerAddr);
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            Người phát hành
          </h1>
          <p className="text-muted-foreground italic">
            Quản lý tài sản phi tập trung và lịch sử nghiên cứu chuỗi khối.
          </p>
        </div>

        <div className="min-w-52">
          <CustomConnectButton />
        </div>
      </div>
      {/* Main Content Grid */}
      <Card className="md:col-span-2 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="w-5 h-5" /> Danh sách người phát hành
            </CardTitle>
            <CardDescription>
              Những người phát hành bằng cấp trên hệ thống
            </CardDescription>
          </div>
          {/* <Button variant="outline" size="sm">
            Thêm
          </Button> */}
          <AddIssuerDialog refetch={refetchData} />
        </CardHeader>
        <CardContent>
          {isLoading && "Đang lấy dữ liệu"}
          {error && "Lỗi khi lấy dữ liệu"}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tổ chức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {issuers?.map(
                  (issuer: {
                    _id: string;
                    name: string;
                    address: string;
                    isActive: boolean;
                  }) => (
                    <TableRow key={issuer._id}>
                      {/* Tên */}
                      <TableCell className="font-medium flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                        {issuer.name}
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell>
                        <Badge
                          variant={
                            issuer.isActive ? "secondary" : "destructive"
                          }
                        >
                          {issuer.isActive ? "Hoạt động" : "Bị khóa"}
                        </Badge>
                      </TableCell>

                      {/* Thời gian */}
                      <TableCell className="text-muted-foreground">
                        {new Date(
                          parseInt(issuer._id.substring(0, 8), 16) * 1000,
                        ).toLocaleString()}
                      </TableCell>

                      {/* Address */}
                      <TableCell className="font-mono">
                        {issuer.address.slice(0, 6)}...
                        {issuer.address.slice(-4)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleRemoveIssuer(issuer.address)}
                          disabled={!issuer.isActive}
                          variant="destructive"
                        >
                          Khóa
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
