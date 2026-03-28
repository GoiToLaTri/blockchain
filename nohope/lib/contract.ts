import { ethers } from "ethers";
import contractJson from "../abi/CertificateRegistry.json";

export class ContractService {
  private address: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private abi: any;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private contract: ethers.Contract;

  constructor(signer?: ethers.Signer) {
    const address = process.env.CONTRACT_ADDRESS;
    const rpcUrl = process.env.RPC_URL;

    if (!address) throw new Error("Missing CONTRACT_ADDRESS");
    if (!rpcUrl) throw new Error("Missing RPC_URL");

    this.address = address;
    this.abi = contractJson.abi;

    // Nếu có signer (MetaMask) → ưu tiên
    if (signer) {
      this.signer = signer;
      this.provider = signer.provider!;
    } else {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    this.contract = new ethers.Contract(
      this.address,
      this.abi,
      this.signer ?? this.provider,
    );
  }

  // Read data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async call(functionName: string, ...args: any[]) {
    return await this.contract[functionName](...args);
  }

  // Write data (gửi transaction)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async send(functionName: string, ...args: any[]) {
    if (!this.signer)
      throw new Error("No signer available for write operation");

    const tx = await this.contract[functionName](...args);
    return await tx.wait();
  }

  // Lấy contract raw
  getInstance() {
    return this.contract;
  }
}
