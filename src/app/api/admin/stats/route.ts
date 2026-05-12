import { getAdminStats } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await getAdminStats();

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
