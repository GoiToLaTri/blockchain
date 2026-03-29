import { ethers } from "ethers";
import { NextResponse } from "next/server";
import { ContractService } from "@/lib/contract";
import { UserService } from "@/services/user.service";
import { signToken } from "@/lib/token";

export async function POST(req: Request) {
  try {
    const userService = new UserService();
    const contract = new ContractService();
    const { address, message, signature } = await req.json();

    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Chữ ký không hợp lệ" },
        { status: 401 },
      );
    }
    const admin = await contract.getInstance().admin();
    const isAdmin: boolean =
      admin.toLowerCase() === recoveredAddress.toLowerCase();

    const user = await userService.create({
      name: null,
      address: recoveredAddress,
      email: null,
      role: isAdmin ? "ADMIN" : "STUDENT",
    });

    const now = Math.floor(Date.now() / 1000); // thời gian hiện tại tính bằng giây
    const token = signToken({
      iss: "nohope",
      sub: address,
      scopes: user.role,
      exp: now + 24 * 60 * 60,
    });

    const response = NextResponse.json({
      success: true,
      message: "Xác thực thành công",
      address: recoveredAddress,
      data: user,
    });

    response.cookies.set("access_token", token, {
      httpOnly: true, // Bảo mật: không cho JS truy cập
      secure: false, // Chỉ gửi qua HTTPS
      maxAge: 60 * 60 * 24, // Hết hạn sau 1 ngày (tính bằng giây)
      path: "/",
    });

    return response;

    // return NextResponse.json(
    //   { success: false, message: "Chữ ký không hợp lệ" },
    //   { status: 401 },
    // );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Lỗi Server" },
      { status: 500 },
    );
  }
}
