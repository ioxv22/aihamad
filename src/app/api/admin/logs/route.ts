import { getRecentLogs } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logs = await getRecentLogs(10);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
