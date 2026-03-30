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
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IssueCertificateProps = {
  onIssued?: () => void;
};

type IssueFormState = {
  studentName: string;
  studentAddress: string;
  certificateType: string;
  specialization: string;
  gpa: string;
  graduationDate?: Date;
};

const initialFormState: IssueFormState = {
  studentName: "",
  studentAddress: "",
  certificateType: "Bachelor of Information Technology",
  specialization: "",
  gpa: "",
  graduationDate: undefined,
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
      graduationDate: form.graduationDate
        ? form.graduationDate.toISOString().slice(0, 10)
        : undefined,
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
      ? ContractService.computeCertificateHashOffchain({
          studentName: form.studentName.trim(),
          studentAddress: form.studentAddress.trim(),
          certificateType: form.certificateType.trim(),
          specialization: form.specialization.trim() || null,
          gpa: form.gpa ? Math.round(Number(form.gpa) * 100) : null,
          graduationDate: form.graduationDate
            ? form.graduationDate.toISOString().slice(0, 10)
            : null,
          issuerAddress: address,
        })
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
                  <Label>Ngày tốt nghiệp</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "justify-start font-normal",
                          !form.graduationDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {form.graduationDate
                          ? form.graduationDate.toLocaleDateString("vi-VN")
                          : "Chọn ngày tốt nghiệp"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.graduationDate}
                        onSelect={(date) =>
                          setForm((current) => ({
                            ...current,
                            graduationDate: date,
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
