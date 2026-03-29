import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/token.edge";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token");
  try {
    if (!token || !(await verifyToken(token.value))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
