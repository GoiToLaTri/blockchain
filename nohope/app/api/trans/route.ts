import { TransactionService } from "@/services/transaction.service";
import { UserService } from "@/services/user.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transactionService: TransactionService = new TransactionService();
    const userService: UserService = new UserService();
    const trans = await transactionService.findAll();
    const numberOfUsers = await userService.countUsers();

    return NextResponse.json({
      success: true,
      message: "Lấy danh sách giao dịch thành công",
      trans,
      numberOfUsers,
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
