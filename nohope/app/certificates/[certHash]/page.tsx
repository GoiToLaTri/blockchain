import { PrintButton } from "@/components/print-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Certificate = {
  certHash: string;
  studentAddress: string;
  issuerAddress: string;
  studentName: string;
  certificateType: string;
  specialization?: string | null;
  gpa?: number | null;
  graduationDate?: string | null;
  graduationYear?: number | null;
  ipfsCID: string;
  txHash: string;
  isRevoked: boolean;
  revokedAt?: string | null;
  revokedTxHash?: string | null;
  revokedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CertificateResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  certificate?: Certificate;
};

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatGpa(value?: number | null) {
  if (value === undefined || value === null) return "Không có";

  const normalizedValue = value > 10 ? value / 100 : value;
  return normalizedValue.toFixed(2).replace(/\.00$/, "");
}

export default async function CertificatesVerifyPage({
  params,
}: {
  params: Promise<{ certHash: string }>;
}) {
  const { certHash } = await params;
  const url = new URL(
    `/api/eth/certificates/${certHash}`,
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  );

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  const data = (await response.json()) as CertificateResponse;
  const certificate = data.certificate;

  if (!response.ok || !certificate) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tra cứu chứng chỉ
          </h1>
          <p className="text-muted-foreground mt-2">
            Không thể truy xuất chứng chỉ với hash đã cung cấp.
          </p>
        </div>

        <Card className="border border-destructive/30 bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle>Lỗi xác thực</CardTitle>
            <CardDescription>Có lỗi khi tải dữ liệu chứng chỉ.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              {data.error ?? "Vui lòng kiểm tra lại certHash và thử lại."}
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Hash truy vấn:{" "}
              <span className="font-mono break-all">{certHash}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Chi tiết chứng chỉ
            </h1>
            <p className="text-muted-foreground mt-2">
              Trang này truy vấn API để xác
              thực và hiển thị dữ liệu.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              variant={certificate.isRevoked ? "destructive" : "secondary"}
            >
              {certificate.isRevoked ? "Đã thu hồi" : "Đã xác thực"}
            </Badge>
            <Badge>{certificate.certificateType}</Badge>
            <PrintButton />
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Thông tin chung</CardTitle>
            <CardDescription>
              Thông tin chứng chỉ được lưu trữ trong cơ sở dữ liệu và xác thực
              bằng hợp đồng thông minh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Tên sinh viên</p>
                <p className="font-medium">{certificate.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Địa chỉ học viên
                </p>
                <p className="font-medium break-all">
                  {certificate.studentAddress}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Địa chỉ người cấp
                </p>
                <p className="font-medium break-all">
                  {certificate.issuerAddress}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Số hash chứng chỉ
                </p>
                <p className="font-medium break-all">{certificate.certHash}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Cập nhật: {formatDate(certificate.updatedAt)}
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Chi tiết bằng</CardTitle>
            <CardDescription>
              Thông tin học thuật và trạng thái chứng chỉ.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Loại bằng</p>
              <p className="font-medium">{certificate.certificateType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chuyên ngành</p>
              <p className="font-medium">
                {certificate.specialization || "Không có"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Điểm trung bình</p>
              <p className="font-medium">{formatGpa(certificate.gpa)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày tốt nghiệp</p>
              <p className="font-medium">
                {formatDate(certificate.graduationDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Năm tốt nghiệp</p>
              <p className="font-medium">
                {certificate.graduationYear ?? "Không có"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Blockchain & IPFS</CardTitle>
            <CardDescription>
              Thông tin giao dịch và nội dung lưu trữ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">TxHash</p>
              <p className="font-medium break-all">{certificate.txHash}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CID IPFS</p>
              <p className="font-medium break-all">{certificate.ipfsCID}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Nội dung chứng chỉ
              </p>
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={`https://ipfs.io/ipfs/${certificate.ipfsCID}`}
                target="_blank"
                rel="noreferrer"
              >
                Xem tài liệu trên IPFS
              </a>
            </div>
            {certificate.isRevoked ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm text-destructive font-semibold">
                  Chứng chỉ đã bị thu hồi
                </p>
                <p className="text-sm text-muted-foreground">
                  Địa chỉ thu hồi: {certificate.revokedBy || "Không rõ"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Thời gian thu hồi: {formatDate(certificate.revokedAt)}
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  TxHash thu hồi: {certificate.revokedTxHash || "Không có"}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4">
                <p className="text-sm text-success font-semibold">
                  Chứng chỉ đang hợp lệ
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
