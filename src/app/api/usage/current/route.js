import { NextResponse } from "next/server";
import { getUserUsage } from "@/actions/usage";

export async function GET() {
  try {
    const usageData = await getUserUsage();
    return NextResponse.json(usageData);
  } catch (error) {
    console.error("Error getting usage:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get usage data" },
      { status: 500 }
    );
  }
}

