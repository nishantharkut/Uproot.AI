import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!stripe) {
      console.error("Stripe is not configured");
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Webhook secret is optional - if not configured, skip signature verification
    // This allows the app to work without webhooks (using session verification instead)
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("STRIPE_WEBHOOK_SECRET is not configured - webhooks will not work. Using session verification instead.");
      // If no webhook secret, we can't verify the signature, so skip this request
      // In production, you should always use webhooks with proper verification
      return NextResponse.json(
        { error: "Webhook secret is not configured. Please set STRIPE_WEBHOOK_SECRET or use session verification instead." },
        { status: 500 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session) {
  try {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    if (!userId || !tier) {
      console.error("Missing userId or tier in checkout session metadata", session.metadata);
      return;
    }

    // Extract IDs - handle both string IDs and expanded objects
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;
    
    const customerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;

    // Get subscription details from Stripe
    let subscriptionData = null;
    let priceId = null;
    if (subscriptionId) {
      subscriptionData = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price"],
      });
      priceId = subscriptionData?.items?.data?.[0]?.price?.id || null;
    }

    // Update or create subscription
    const subscription = await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier,
        status: subscriptionData?.status || "active",
        stripeSubscriptionId: subscriptionId || null,
        stripePriceId: priceId,
        stripeCustomerId: customerId || null,
        currentPeriodStart: subscriptionData?.current_period_start
          ? new Date(subscriptionData.current_period_start * 1000)
          : new Date(),
        currentPeriodEnd: subscriptionData?.current_period_end
          ? new Date(subscriptionData.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: subscriptionData?.cancel_at_period_end || false,
      },
      update: {
        tier,
        status: subscriptionData?.status || "active",
        stripeSubscriptionId: subscriptionId || null,
        stripePriceId: priceId,
        stripeCustomerId: customerId || null,
        currentPeriodStart: subscriptionData?.current_period_start
          ? new Date(subscriptionData.current_period_start * 1000)
          : undefined,
        currentPeriodEnd: subscriptionData?.current_period_end
          ? new Date(subscriptionData.current_period_end * 1000)
          : undefined,
        cancelAtPeriodEnd: subscriptionData?.cancel_at_period_end || false,
      },
    });

    // Update user's stripeCustomerId if not set
    if (customerId) {
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    console.log(`Subscription created/updated for user ${userId}: ${tier}`);
  } catch (error) {
    console.error("Error handling checkout completed:", error);
  }
}

async function handleSubscriptionUpdate(subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error("Missing userId in subscription metadata");
      return;
    }

    const tier = subscription.metadata?.tier || "Free";

    // Extract customer ID - handle both string ID and expanded object
    const customerId = typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || null;

    // Retrieve full subscription with expanded price data if needed
    let fullSubscription = subscription;
    if (!subscription.items || !subscription.items.data) {
      fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
        expand: ["items.data.price"],
      });
    }

    const priceId = fullSubscription?.items?.data?.[0]?.price?.id || null;

    await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCustomerId: customerId || null,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
      update: {
        tier,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCustomerId: customerId || null,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    });

    console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
  } catch (error) {
    console.error("Error handling subscription update:", error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await db.subscription.updateMany({
      where: { userId },
      data: {
        status: "canceled",
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    console.log(`Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

