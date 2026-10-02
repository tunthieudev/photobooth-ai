import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  const status: {
    status: "ok" | "degraded";
    mongodb: string;
    timestamp: string;
  } = {
    status: "ok",
    mongodb: "unknown",
    timestamp: new Date().toISOString(),
  };

  try {
    await connectToDatabase();
    status.mongodb = "connected";
  } catch (err: any) {
    status.mongodb = `error: ${err?.message || "connection failed"}`;
    status.status = "degraded";
  }

  return NextResponse.json(status);
}
