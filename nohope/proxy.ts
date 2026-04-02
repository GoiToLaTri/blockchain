import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/token.edge";

const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  // 1. Kiểm tra nếu là Public Path
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    // Nếu đã đăng nhập mà còn vào trang login thì về trang chủ
    if (token && (await verifyToken(token)))
      return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // 2. Kiểm tra Token (Authentication)
  const decoded = await verifyToken(token!); // Giả sử hàm này trả về { role: 'ADMIN' } hoặc null
  if (!decoded) return NextResponse.redirect(new URL("/login", request.url));
  // 3. Phân quyền theo vai trò (Authorization)
  const userRole = decoded.scopes;
  // Nếu truy cập vào /admin nhưng không phải ADMIN
  if (pathname.startsWith("/admin") && userRole !== "ADMIN")
    return NextResponse.redirect(new URL("/403", request.url)); // Trang từ chối truy cập

  if (pathname.startsWith("/issuer") && userRole !== "ISSUER")
    return NextResponse.redirect(new URL("/403", request.url)); // Trang từ chối truy cập

  if (pathname.startsWith("/student") && userRole !== "STUDENT")
    return NextResponse.redirect(new URL("/403", request.url)); // Trang từ chối truy cập

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/issuer/:path*", "/student/:path*"],
};
