import { ethers } from "ethers";
import Mongo from "../database/connect";
import { ContractService } from "@/lib/contract";
import { TransactionHistory } from "@/model/transaction-history.model";

export interface IssueCertificateDTO {
  studentAddress: string;
  studentName: string;
  certificateType: string;
  issuerAddress: string;
  gpa?: number;
  graduationDate?: string;
  specialization?: string;
}

export class IssuerService {
  private contractService: ContractService;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey =
      process.env.ISSUER_PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY;

    if (!rpcUrl) throw new Error("Missing RPC_URL");
    if (!privateKey)
      throw new Error("Missing ISSUER_PRIVATE_KEY or ADMIN_PRIVATE_KEY");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    this.contractService = new ContractService(signer);
  }

  async issueCertificate(dto: IssueCertificateDTO) {
    await Mongo.connect();

    const studentAddress = dto.studentAddress.toLowerCase();
    const issuerAddress = dto.issuerAddress.toLowerCase();

    const isActiveIssuer = await this.contractService.verifyIssuer(
      issuerAddress,
    );
    if (!isActiveIssuer) throw new Error("Issuer is not active on-chain");

    const graduationYear = dto.graduationDate
      ? new Date(dto.graduationDate).getFullYear()
      : new Date().getFullYear();
    const gpaScaled = Math.round((dto.gpa ?? 0) * 100);
    const certHash = ContractService.computeCertHashOffchain(
      dto.studentName,
      dto.certificateType,
      graduationYear,
      gpaScaled,
      studentAddress,
    );

    const payload = {
      studentName: dto.studentName,
      studentAddress,
      certificateType: dto.certificateType,
      specialization: dto.specialization || null,
      gpa: dto.gpa ?? null,
      graduationDate: dto.graduationDate || null,
      graduationYear,
      issuerAddress,
    };

    const ipfsCID = `Qm${ethers.id(JSON.stringify(payload)).slice(2, 46)}`;
    const receipt = await this.contractService.issueCertificate(
      studentAddress,
      certHash,
      ipfsCID,
    );

    const record = await TransactionHistory.create({
      txHash: receipt.hash,
      action: "ISSUE_CERTIFICATE",
      fromAddress: receipt.from.toLowerCase(),
      targetAddress: studentAddress,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? "SUCCESS" : "FAILED",
      gasUsed: receipt.gasUsed?.toString(),
      metadata: {
        ...payload,
        certHash,
        ipfsCID,
        issuedAt: new Date().toISOString(),
      },
      createdAt: new Date(),
    });

    return {
      transactionHash: receipt.hash,
      certHash,
      ipfsCID,
      record,
    };
  }

  async revokeCertificate(certHash: string, issuerAddress: string) {
    await Mongo.connect();

    const issued = await TransactionHistory.findOne({
      action: "ISSUE_CERTIFICATE",
      "metadata.certHash": certHash,
    });

    if (!issued) throw new Error("Certificate not found in database");

    const receipt = await this.contractService.revokeCertificate(certHash);
    const record = await TransactionHistory.create({
      txHash: receipt.hash,
      action: "REVOKE_CERTIFICATE",
      fromAddress: receipt.from.toLowerCase(),
      targetAddress: issued.targetAddress,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? "SUCCESS" : "FAILED",
      gasUsed: receipt.gasUsed?.toString(),
      metadata: {
        certHash,
        issuerAddress: issuerAddress.toLowerCase(),
        revokedFromTx: issued.txHash,
        studentName: issued.metadata?.studentName || null,
        revokedAt: new Date().toISOString(),
      },
      createdAt: new Date(),
    });

    return {
      transactionHash: receipt.hash,
      record,
    };
  }

  async getIssuedCertificates(issuerAddress: string, skip = 0, limit = 10) {
    await Mongo.connect();

    const query = {
      fromAddress: issuerAddress.toLowerCase(),
      action: { $in: ["ISSUE_CERTIFICATE", "REVOKE_CERTIFICATE"] },
    };

    const total = await TransactionHistory.countDocuments(query);
    const certificates = await TransactionHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      certificates,
      total,
    };
  }

  async searchCertificates(issuerAddress: string, keyword: string) {
    await Mongo.connect();

    return await TransactionHistory.find({
      fromAddress: issuerAddress.toLowerCase(),
      action: { $in: ["ISSUE_CERTIFICATE", "REVOKE_CERTIFICATE"] },
      $or: [
        { "metadata.studentName": { $regex: keyword, $options: "i" } },
        { "metadata.certificateType": { $regex: keyword, $options: "i" } },
        { "metadata.certHash": { $regex: keyword, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  async getCertificateStats(issuerAddress: string) {
    await Mongo.connect();

    const fromAddress = issuerAddress.toLowerCase();
    const totalIssued = await TransactionHistory.countDocuments({
      fromAddress,
      action: "ISSUE_CERTIFICATE",
      status: "SUCCESS",
    });
    const totalRevoked = await TransactionHistory.countDocuments({
      fromAddress,
      action: "REVOKE_CERTIFICATE",
      status: "SUCCESS",
    });

    return {
      totalIssued,
      totalRevoked,
      totalActive: Math.max(totalIssued - totalRevoked, 0),
    };
  }
}