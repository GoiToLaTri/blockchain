import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  certHash: string;
  studentAddress: string;
  issuerAddress: string;
  studentName: string;
  certificateType: string;
  specialization?: string | null;
  gpa?: number | null;
  graduationDate?: string | null;
  graduationYear?: number | null;
  ipfsCID: string;
  txHash: string;
  isRevoked: boolean;
  revokedAt?: Date | null;
  revokedTxHash?: string | null;
  revokedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema: Schema = new Schema(
  {
    certHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentAddress: { type: String, required: true, lowercase: true, index: true },
    issuerAddress: { type: String, required: true, lowercase: true, index: true },
    studentName: { type: String, required: true },
    certificateType: { type: String, required: true },
    specialization: { type: String, default: null },
    gpa: { type: Number, default: null },
    graduationDate: { type: String, default: null },
    graduationYear: { type: Number, default: null },
    ipfsCID: { type: String, required: true },
    txHash: { type: String, required: true, index: true },
    isRevoked: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
    revokedTxHash: { type: String, default: null },
    revokedBy: { type: String, default: null, lowercase: true },
  },
  {
    timestamps: true,
  },
);

CertificateSchema.index({ issuerAddress: 1, studentAddress: 1 });

export const Certificate =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);