import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { ContractService } from "@/lib/contract";
import { AdminService } from "@/services/admin.service";
import { TransactionService } from "@/services/transaction.service";

export async function POST(req: NextRequest) {
  try {
    const adminService: AdminService = new AdminService();
    const transactionService: TransactionService = new TransactionService();
    // 1. Lấy dữ liệu từ body request
    const { issuerAddr, name, message, signature, address } = await req.json();

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!issuerAddr || !name)
      return NextResponse.json(
        { error: "Thiếu địa chỉ ví hoặc tên tổ chức" },
        { status: 400 },
      );

    if (!ethers.isAddress(issuerAddr))
      return NextResponse.json(
        { error: "Địa chỉ ví không hợp lệ" },
        { status: 400 },
      );

    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Chữ ký không hợp lệ" },
        { status: 401 },
      );
    }

    // 2. Thiết lập Admin Signer từ Private Key (Server-side)
    // Lưu ý: Việc thêm Issuer chỉ Admin mới làm được, nên ta dùng key của Admin
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const adminWallet = new ethers.Wallet(
      process.env.ADMIN_PRIVATE_KEY as string,
      provider,
    );

    // 3. Khởi tạo service với signer
    const service = new ContractService(adminWallet);

    // 4. Gọi hàm addIssuer trên Smart Contract
    // Hàm này sẽ đợi đến khi giao dịch được xác nhận (receipt)
    const receipt = await service.addIssuer(issuerAddr, name);
    await adminService.addIssuer({
      address: issuerAddr,
      isActive: true,
      name: name,
    });

    await transactionService.create({
      txHash: receipt.hash,
      action: "ADD_ISSUER",
      fromAddress: receipt.from, // Admin
      targetAddress: issuerAddr, // Tổ chức mới
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      metadata: {
        universityName: name,
      },
      status: receipt.status === 1 ? "SUCCESS" : "FAILED",
      createdAt: new Date(),
    });

    // 5. Trả về kết quả thành công
    return NextResponse.json({
      success: true,
      message: "Thêm tổ chức thành công",
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("[API_ADD_ISSUER_ERROR]", error);

    // Xử lý lỗi từ Smart Contract (ví dụ: không phải admin, hoặc issuer đã tồn tại)
    const errorMessage = error.reason || error.message || "Lỗi không xác định";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
