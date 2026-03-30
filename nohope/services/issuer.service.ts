import { ethers } from "ethers";
import Mongo from "../database/connect";
import { ContractService, CertificateHashInput } from "@/lib/contract";
import { Certificate } from "@/model/certificate.model";
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
    const graduationDate = dto.graduationDate || null;
    const graduationYear = graduationDate
      ? new Date(graduationDate).getFullYear()
      : null;
    const gpaScaled = dto.gpa === undefined || dto.gpa === null ? null : Math.round(dto.gpa * 100);

    const isActiveIssuer = await this.contractService.verifyIssuer(
      issuerAddress,
    );
    if (!isActiveIssuer) throw new Error("Issuer is not active on-chain");

    const certificateHashInput: CertificateHashInput = {
      studentName: dto.studentName,
      studentAddress,
      certificateType: dto.certificateType,
      specialization: dto.specialization || null,
      gpa: gpaScaled,
      graduationDate,
      issuerAddress,
    };

    const certHash = ContractService.computeCertificateHashOffchain(
      certificateHashInput,
    );

    const payload = {
      studentName: dto.studentName,
      studentAddress,
      certificateType: dto.certificateType,
      specialization: dto.specialization || null,
      gpa: gpaScaled,
      graduationDate,
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

    const certificate = await Certificate.findOneAndUpdate(
      { certHash },
      {
        $set: {
          certHash,
          studentAddress,
          issuerAddress,
          studentName: dto.studentName,
          certificateType: dto.certificateType,
          specialization: dto.specialization || null,
          gpa: gpaScaled,
          graduationDate,
          graduationYear,
          ipfsCID,
          txHash: receipt.hash,
          isRevoked: false,
          revokedAt: null,
          revokedTxHash: null,
          revokedBy: null,
        },
      },
      { upsert: true, new: true },
    );

    return {
      transactionHash: receipt.hash,
      certHash,
      ipfsCID,
      certificate,
      record,
    };
  }

  async revokeCertificate(certHash: string, issuerAddress: string) {
    await Mongo.connect();

    const normalizedIssuerAddress = issuerAddress.toLowerCase();
    const issued = await Certificate.findOne({ certHash });

    if (!issued) throw new Error("Certificate not found in database");

    if (issued.issuerAddress !== normalizedIssuerAddress) {
      throw new Error("Issuer is not allowed to revoke this certificate");
    }

    if (issued.isRevoked) {
      throw new Error("Certificate is already revoked");
    }

    const isActiveIssuer = await this.contractService.verifyIssuer(
      normalizedIssuerAddress,
    );
    if (!isActiveIssuer) throw new Error("Issuer is not active on-chain");

    const receipt = await this.contractService.revokeCertificate(certHash);
    issued.isRevoked = true;
    issued.revokedAt = new Date();
    issued.revokedTxHash = receipt.hash;
    issued.revokedBy = normalizedIssuerAddress;
    await issued.save();

    const record = await TransactionHistory.create({
      txHash: receipt.hash,
      action: "REVOKE_CERTIFICATE",
      fromAddress: receipt.from.toLowerCase(),
      targetAddress: issued.studentAddress,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? "SUCCESS" : "FAILED",
      gasUsed: receipt.gasUsed?.toString(),
      metadata: {
        certHash,
        issuerAddress: normalizedIssuerAddress,
        revokedFromTx: issued.txHash,
        studentName: issued.studentName,
        certificateType: issued.certificateType,
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
      issuerAddress: issuerAddress.toLowerCase(),
    };

    const total = await Certificate.countDocuments(query);
    const certificates = await Certificate.find(query)
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

    return await Certificate.find({
      issuerAddress: issuerAddress.toLowerCase(),
      $or: [
        { studentName: { $regex: keyword, $options: "i" } },
        { certificateType: { $regex: keyword, $options: "i" } },
        { certHash: { $regex: keyword, $options: "i" } },
        { studentAddress: { $regex: keyword, $options: "i" } },
        { ipfsCID: { $regex: keyword, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  async getCertificateStats(issuerAddress: string) {
    await Mongo.connect();

    const fromAddress = issuerAddress.toLowerCase();
    const totalIssued = await Certificate.countDocuments({
      issuerAddress: fromAddress,
    });
    const totalRevoked = await Certificate.countDocuments({
      issuerAddress: fromAddress,
      isRevoked: true,
    });

    return {
      totalIssued,
      totalRevoked,
      totalActive: Math.max(totalIssued - totalRevoked, 0),
    };
  }
}