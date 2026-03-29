import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 1. Khởi tạo response
    const response = NextResponse.json(
      { message: "Đăng xuất thành công" },
      { status: 200 },
    );

    // 2. Xóa cookie bằng cách set nó về quá khứ hoặc dùng method delete
    // Lưu ý: Các thuộc tính (path, domain) phải khớp với lúc bạn set cookie mới xóa được
    response.cookies.set("access_token", "", {
      path: "/",
      expires: new Date(0), // Set ngày hết hạn về năm 1970
      httpOnly: true,
    });

    // Hoặc cách ngắn gọn hơn của Next.js:
    // response.cookies.delete('access_token');

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi đăng xuất" },
      { status: 500 },
    );
  }
}
