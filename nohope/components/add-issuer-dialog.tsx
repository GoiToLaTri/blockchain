"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function AddIssuerDialog({ refetch }: { refetch: () => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const addIssuer = async (data: {
    issuerAddr: FormDataEntryValue | null;
    name: FormDataEntryValue | null;
  }) => {
    setLoading(true);
    const res = await fetch("/api/eth/issuers/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result?.error || "Add issuer failed");
    setLoading(false);
    return result;
  };

  const mutation = useMutation({
    mutationFn: addIssuer,
    onSuccess: async (data) => {
      toast.success(`Thành công! Tx Hash: ${data.transactionHash}`);
      // refresh lại danh sách issuers
      queryClient.invalidateQueries({ queryKey: ["issuers"] });
      await refetch();
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    mutation.mutate({
      issuerAddr: formData.get("issuerAddr"),
      name: formData.get("name"),
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Thêm Người Phát Hành</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm tổ chức cấp bằng</DialogTitle>
            <DialogDescription>
              Nhập thông tin tổ chức (Trường ĐH, Trung tâm) để cấp quyền phát
              hành văn bằng trên hệ thống.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="issuer-address">
                Địa chỉ ví (Wallet Address)
              </Label>
              <Input
                id="issuer-address"
                name="issuerAddr"
                placeholder="0x..."
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Địa chỉ ví công khai của tổ chức.
              </p>
            </Field>

            <Field>
              <Label htmlFor="issuer-name">Tên tổ chức</Label>
              <Input
                id="issuer-name"
                name="name"
                placeholder="Ví dụ: Đại học Bách Khoa"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tên hiển thị on-chain để tiện tra cứu.
              </p>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={loading}>
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
