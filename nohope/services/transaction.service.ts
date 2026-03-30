import {
  ITransactionHistory,
  TransactionHistory,
} from "@/model/transaction-history.model";
import Mongo from "../database/connect";

export interface createTransactionHistoryDTO {
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

export class TransactionService {
  async create(createTransactionHistory: createTransactionHistoryDTO) {
    await Mongo.connect();
    return TransactionHistory.create({
      ...createTransactionHistory,
    });
  }

  async findByAddress(fromAddress: string) {
    await Mongo.connect();
    return TransactionHistory.find({ fromAddress });
  }
}
