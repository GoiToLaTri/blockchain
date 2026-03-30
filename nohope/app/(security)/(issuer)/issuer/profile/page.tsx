"use client";

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
import {
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  History,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";

export default function ProfilePage() {
  const { isConnected, address } = useAccount();
  const { data } = useBalance({ address });
  const [ethPrice, setEthPrice] = useState<number>(0);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/eth/price");
      const price = await res.json();
      setEthPrice(price.ethereum?.usd || 0);
    })();
  }, []);

  if (!isConnected) return <p>Vui lòng kết nối ví</p>;

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            Tài khoản
          </h1>
          <p className="text-muted-foreground italic">
            Quản lý tài sản phi tập trung và lịch sử nghiên cứu chuỗi khối.
          </p>
        </div>

        <div className="min-w-52">
          <CustomConnectButton />
        </div>
      </div>

      <hr className="border-muted" />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Tổng quan số dư */}
        <Card className="md:col-span-1 shadow-md border-t-4 border-t-[#A594FF]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" /> Tài sản
            </CardTitle>
            <CardDescription>Tổng giá trị ước tính (USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              ${ethPrice * (Number(data?.value || 0) / 1e18)}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground text-sm font-semibold italic">
                  {data?.symbol === "ETH" && "Ethereum (ETH)"}
                </span>
                <span>
                  {data?.formatted ?? 0} {data?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground text-sm font-semibold italic">
                  Tether (USDT)
                </span>
                <span>$450.00</span>
              </div>
            </div>
            <Button className="w-full mt-6 bg-[#A594FF] hover:bg-[#917fff] text-white">
              Gửi tài sản <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Lịch sử giao dịch */}
        <Card className="md:col-span-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" /> Hoạt động gần đây
              </CardTitle>
              <CardDescription>
                Các tương tác Smart Contract mới nhất
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="text-right">Giá trị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-green-500" /> Nhận
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Thành công</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    2 giờ trước
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    +0.5 ETH
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-500" /> Mint NFT
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Thành công</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    1 ngày trước
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    -0.02 ETH
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Footer / Dev info section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Developer Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8">
              Etherscan
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              Faucet (Sepolia)
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              Gas Tracker
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
