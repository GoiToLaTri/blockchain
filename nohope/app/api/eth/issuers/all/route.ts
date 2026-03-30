import { AdminService } from "@/services/admin.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminService: AdminService = new AdminService();
    const issuers = await adminService.allIssuers();
    return NextResponse.json({
      success: true,
      message: "Lấy danh sách tổ chức thành công",
      issuers,
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
