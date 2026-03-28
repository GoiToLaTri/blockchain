import { ethers } from "ethers";
import { NextResponse } from "next/server";
import { ContractService } from "@/lib/contract";
import { UserService } from "@/services/user.service";

export async function POST(req: Request) {
  try {
    const userService = new UserService();
    const contract = new ContractService();
    const { address, message, signature } = await req.json();

    const recoveredAddress = ethers.verifyMessage(message, signature);

    console.log("Recovered:", recoveredAddress);

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

    return NextResponse.json({
      success: true,
      message: "Xác thực thành công",
      address: recoveredAddress,
      data: user,
    });

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
