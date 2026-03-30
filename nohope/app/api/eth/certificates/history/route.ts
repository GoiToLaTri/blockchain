import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { IssuerService } from "@/services/issuer.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const issuer = searchParams.get("issuer");
    const skip = Number(searchParams.get("skip") || "0");
    const limit = Number(searchParams.get("limit") || "10");

    if (!issuer || !ethers.isAddress(issuer)) {
      return NextResponse.json(
        { error: "Invalid issuer address" },
        { status: 400 },
      );
    }

    const issuerService = new IssuerService();
    const data = await issuerService.getIssuedCertificates(
      issuer,
      Number.isNaN(skip) ? 0 : Math.max(skip, 0),
      Number.isNaN(limit) ? 10 : Math.min(Math.max(limit, 1), 100),
    );

    return NextResponse.json({
      success: true,
      certificates: data.certificates,
      pagination: {
        skip,
        limit,
        total: data.total,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";