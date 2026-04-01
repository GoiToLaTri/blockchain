import { TransactionService } from "@/services/transaction.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;
    const transactionService: TransactionService = new TransactionService();
    const trans = await transactionService.findByAddress(address);

    return NextResponse.json({
      success: true,
      message: "Lấy danh sách giao dịch thành công",
      trans,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Lỗi khi lấy dữ liệu",
    });
  }
}

export const dynamic = "force-dynamic";
