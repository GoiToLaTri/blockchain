import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { IssuerService } from "@/services/issuer.service";

export async function POST(req: NextRequest) {
  try {
    const {
      studentAddress,
      studentName,
      certificateType,
      issuerAddress,
      gpa,
      graduationDate,
      specialization,
    } = await req.json();

    if (!studentAddress || !studentName || !certificateType || !issuerAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!ethers.isAddress(studentAddress) || !ethers.isAddress(issuerAddress)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 },
      );
    }

    if (gpa !== undefined && (Number(gpa) < 0 || Number(gpa) > 4)) {
      return NextResponse.json(
        { error: "GPA must be in range 0..4" },
        { status: 400 },
      );
    }

    const issuerService = new IssuerService();
    const result = await issuerService.issueCertificate({
      studentAddress,
      studentName,
      certificateType,
      issuerAddress,
      gpa: gpa !== undefined ? Number(gpa) : undefined,
      graduationDate: graduationDate || undefined,
      specialization: specialization || undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";