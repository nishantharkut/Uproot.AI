import Stripe from "stripe";

/**
 * Initialize Stripe client
 * Returns null if STRIPE_SECRET_KEY is not configured (for development/testing)
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    })
  : null;

export default stripe;
