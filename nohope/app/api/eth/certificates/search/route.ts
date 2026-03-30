import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { IssuerService } from "@/services/issuer.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const issuer = searchParams.get("issuer");
    const q = searchParams.get("q") || "";

    if (!issuer || !ethers.isAddress(issuer)) {
      return NextResponse.json(
        { error: "Invalid issuer address" },
        { status: 400 },
      );
    }

    if (!q.trim()) {
      return NextResponse.json({ success: true, certificates: [] });
    }

    const issuerService = new IssuerService();
    const certificates = await issuerService.searchCertificates(
      issuer,
      q.trim(),
    );

    return NextResponse.json({ success: true, certificates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";