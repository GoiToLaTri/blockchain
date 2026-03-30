import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { IssuerService } from "@/services/issuer.service";

export async function POST(req: NextRequest) {
  try {
    const { certHash, issuerAddress } = await req.json();

    if (!certHash || !issuerAddress) {
      return NextResponse.json(
        { error: "Missing required fields: certHash, issuerAddress" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(certHash)) {
      return NextResponse.json(
        { error: "Invalid cert hash" },
        { status: 400 },
      );
    }

    if (!ethers.isAddress(issuerAddress)) {
      return NextResponse.json(
        { error: "Invalid issuer address" },
        { status: 400 },
      );
    }

    const issuerService = new IssuerService();
    const result = await issuerService.revokeCertificate(
      certHash,
      issuerAddress,
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";