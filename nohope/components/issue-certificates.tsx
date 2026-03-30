"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContractService } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type IssueCertificateProps = {
  onIssued?: () => void;
};

type IssueFormState = {
  studentName: string;
  studentAddress: string;
  certificateType: string;
  specialization: string;
  gpa: string;
  graduationDate: string;
};

const initialFormState: IssueFormState = {
  studentName: "",
  studentAddress: "",
  certificateType: "Bachelor of Information Technology",
  specialization: "",
  gpa: "",
  graduationDate: "",
};

export function IssueCertificate({ onIssued }: IssueCertificateProps) {
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<IssueFormState>(initialFormState);

  const issueCertificate = async () => {
    if (!address) {
      throw new Error("Vui lòng kết nối ví issuer trước khi phát hành.");
    }

    const payload = {
      studentAddress: form.studentAddress,
      studentName: form.studentName,
      certificateType: form.certificateType,
      issuerAddress: address,
      gpa: form.gpa ? Number(form.gpa) : undefined,
      graduationDate: form.graduationDate || undefined,
      specialization: form.specialization || undefined,
    };

    const res = await fetch("/api/eth/certificates/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result?.error || "Issue certificate failed");
    return result as {
      transactionHash: string;
      certHash: string;
      ipfsCID: string;
    };
  };

  const mutation = useMutation({
    mutationFn: issueCertificate,
    onSuccess: async (data) => {
      toast.success(`Phát hành thành công: ${data.transactionHash}`);
      setForm(initialFormState);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["issuer-stats"] });
      queryClient.invalidateQueries({ queryKey: ["issuer-history"] });
      await onIssued?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Issue failed");
    },
  });

  const previewHash =
    form.studentName &&
    form.studentAddress &&
    form.certificateType &&
    address
      ? ContractService.computeCertHashOffchain(
          form.studentName.trim(),
          form.certificateType.trim(),
          form.graduationDate
            ? new Date(form.graduationDate).getFullYear()
            : new Date().getFullYear(),
          Math.round(Number(form.gpa || 0) * 100),
          form.studentAddress.trim(),
        )
      : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#F97316] text-white hover:bg-[#ea580c] shadow-lg shadow-orange-500/20">
          Phát hành văn bằng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>Phát hành chứng chỉ cho sinh viên</DialogTitle>
            <DialogDescription>
              Nhập thông tin sinh viên, hệ thống sẽ tự tạo certHash và lưu dấu vết giao dịch vào database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <FieldGroup>
              <Field>
                <Label htmlFor="studentName">Họ và tên sinh viên</Label>
                <Input
                  id="studentName"
                  value={form.studentName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      studentName: event.target.value,
                    }))
                  }
                  placeholder="Nguyễn Văn A"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="studentAddress">Địa chỉ ví sinh viên</Label>
                <Input
                  id="studentAddress"
                  value={form.studentAddress}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      studentAddress: event.target.value,
                    }))
                  }
                  placeholder="0x..."
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="certificateType">Loại bằng</Label>
                <Input
                  id="certificateType"
                  value={form.certificateType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      certificateType: event.target.value,
                    }))
                  }
                  placeholder="Bachelor of Information Technology"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="specialization">Chuyên ngành</Label>
                <Input
                  id="specialization"
                  value={form.specialization}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      specialization: event.target.value,
                    }))
                  }
                  placeholder="Software Engineering"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                    value={form.gpa}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        gpa: event.target.value,
                      }))
                    }
                    placeholder="3.85"
                  />
                </Field>

                <Field>
                  <Label htmlFor="graduationDate">Ngày tốt nghiệp</Label>
                  <Input
                    id="graduationDate"
                    type="date"
                    value={form.graduationDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        graduationDate: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </FieldGroup>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Issuer hiện tại</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground break-all">
                  {isConnected && address ? address : "Chưa kết nối ví"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">certHash dự kiến</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground break-all">
                  {previewHash || "Nhập đủ thông tin để tính hash"}
                </p>
              </div>

              <div className="rounded-lg bg-background p-3 text-sm text-muted-foreground">
                Giao dịch sẽ được ghi vào blockchain và đồng thời lưu lịch sử vào database để phục vụ truy vết.
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending || !isConnected}>
              {mutation.isPending ? "Đang phát hành..." : "Xác nhận phát hành"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
