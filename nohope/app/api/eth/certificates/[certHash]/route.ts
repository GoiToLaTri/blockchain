import { ContractService } from "@/lib/contract";
import { UserService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certHash: string }> },
) {
  try {
    const { certHash } = await params;

    const contract = new ContractService();
    const userService: UserService = new UserService();
    // Xác thực chứng chỉ bằng smart contract
    const isVerified = await contract.verifyCertificate(certHash);

    if (!isVerified) {
      return NextResponse.json(
        { error: "Xác thực chứng chỉ thất bại" },
        { status: 401 },
      );
    }

    // Lấy thông tin chứng chỉ từ database
    const certificate = await userService.findCertificate(certHash);

    if (!certificate) {
      return NextResponse.json(
        { error: "Không tìm thấy chứng chỉ" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xác thực chứng chỉ thành công",
      certificate,
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
