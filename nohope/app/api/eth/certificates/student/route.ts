import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import Mongo from "@/database/connect";
import { Certificate } from "@/model/certificate.model";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid student address" },
        { status: 400 },
      );
    }

    await Mongo.connect();

    const normalizedAddress = address.toLowerCase();
    const certificates = await Certificate.find({
      studentAddress: normalizedAddress,
    })
      .sort({ createdAt: -1 })
      .lean();

    const total = certificates.length;
    const revoked = certificates.filter((certificate) => certificate.isRevoked)
      .length;

    return NextResponse.json({
      success: true,
      certificates,
      stats: {
        total,
        active: Math.max(total - revoked, 0),
        revoked,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";