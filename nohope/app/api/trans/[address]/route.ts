import { TransactionService } from "@/services/transaction.service";
import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;
    const transactionService: TransactionService = new TransactionService();
    const trans = await transactionService.findByAddress(address);

    const rpcUrl = process.env.RPC_URL;
    const provider = rpcUrl ? new ethers.JsonRpcProvider(rpcUrl) : null;

    const enrichedTrans = await Promise.all(
      trans.map(async (transaction) => {
        if (!provider) {
          return {
            ...transaction.toObject(),
            gasFeeEth: "0",
          };
        }

        const receipt = await provider.getTransactionReceipt(transaction.txHash);
        const gasPrice = receipt?.gasPrice ?? receipt?.effectiveGasPrice ?? 0n;
        const gasFeeWei = receipt ? receipt.gasUsed * gasPrice : 0n;

        return {
          ...transaction.toObject(),
          gasFeeEth: ethers.formatEther(gasFeeWei),
        };
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Lấy danh sách giao dịch thành công",
      trans: enrichedTrans,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Lỗi khi lấy dữ liệu",
    });
  }
}

export const dynamic = "force-dynamic";
