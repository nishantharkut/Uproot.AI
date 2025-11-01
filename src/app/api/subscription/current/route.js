import { NextResponse } from "next/server";
import { getUserSubscription } from "@/actions/subscription";

export async function GET() {
  try {
    const subscription = await getUserSubscription();
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error getting subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get subscription" },
      { status: 500 }
    );
  }
}

