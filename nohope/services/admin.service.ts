import { ContractService } from "@/lib/contract";

export class AdminService {
  private contractService: ContractService;
  constructor() {
    this.contractService = new ContractService();
  }
}
