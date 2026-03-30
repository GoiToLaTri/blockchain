import mongoose, { Schema, Document } from "mongoose";

export interface ITransactionHistory extends Document {
  txHash: string; // Mã định danh giao dịch trên Blockchain
  action: string; // Loại hành động: "ADD_ISSUER", "REMOVE_ISSUER", "ISSUE_CERT", v.v.
  fromAddress: string; // Địa chỉ ví thực hiện (Admin/Issuer)
  targetAddress?: string; // Địa chỉ ví thụ hưởng (Ví dụ: địa chỉ của Issuer mới)
  blockNumber: number; // Số Block xác nhận giao dịch
  status: string; // "PENDING", "SUCCESS", "FAILED"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>; // Lưu các thông tin bổ sung (tên tổ chức, IPFS CID...)
  gasUsed?: string; // Phí gas đã tiêu tốn (lưu dạng string vì BigInt)
  createdAt: Date;
}

const TransactionHistorySchema: Schema = new Schema({
  txHash: {
    type: String,
    required: true,
    unique: true,
    index: true, // Đánh index để tìm kiếm nhanh trên Etherscan link
  },
  action: {
    type: String,
    required: true,
    enum: [
      "ADD_ISSUER",
      "REMOVE_ISSUER",
      "ISSUE_CERTIFICATE",
      "REVOKE_CERTIFICATE",
      "TRANSFER_ADMIN",
    ],
  },
  fromAddress: { type: String, required: true, lowercase: true },
  targetAddress: { type: String, lowercase: true },
  blockNumber: { type: Number },
  status: {
    type: String,
    default: "SUCCESS",
    enum: ["PENDING", "SUCCESS", "FAILED"],
  },
  metadata: {
    type: Object, // Lưu các tham số input như universityName, studentName...
    default: {},
  },
  gasUsed: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const TransactionHistory =
  mongoose.models.TransactionHistory ||
  mongoose.model<ITransactionHistory>(
    "TransactionHistory",
    TransactionHistorySchema,
  );
