import { jwtVerify, importSPKI } from "jose";

export async function verifyToken(token: string) {
  try {
    // Chuyển đổi string key thành định dạng chuẩn của jose
    const publicKey = await importSPKI(process.env.JWT_PUBLIC_KEY!, "RS256");
    const { payload } = await jwtVerify(token, publicKey);
    return payload;
  } catch (error) {
    console.error("Token không hợp lệ hoặc đã hết hạn:", error);
    return null;
  }
}
