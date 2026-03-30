import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { IssuerService } from "@/services/issuer.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const issuer = searchParams.get("issuer");

    if (!issuer || !ethers.isAddress(issuer)) {
      return NextResponse.json(
        { error: "Invalid issuer address" },
        { status: 400 },
      );
    }

    const issuerService = new IssuerService();
    const stats = await issuerService.getCertificateStats(issuer);

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";