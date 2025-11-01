import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      subscription: user.subscription,
      hasSubscription: !!user.subscription && user.subscription.status === "active",
      tier: user.subscription?.tier || "Free",
    });
  } catch (error) {
    console.error("Verify subscription error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

