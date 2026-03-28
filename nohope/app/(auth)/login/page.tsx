import CustomConnectButton from "@/components/custom-connect-button";
import { LoginButton } from "@/components/login-button";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="mx-auto w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-white text-xl font-semibold">
          Đăng nhập với tài khoản của bạn
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm">
          Bằng cách đăng nhập bạn đồng ý với chính sách và điều khoản của hệ
          thống.
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-col gap-3">
        <CustomConnectButton />
        <LoginButton />
        <p className="text-md text-gray-800 text-center">
          Bạn sẽ ký một thông điệp để xác minh quyền sở hữu ví. Không mất phí.
        </p>
      </CardFooter>
    </Card>
  );
}
