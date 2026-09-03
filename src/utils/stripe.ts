import Stripe from 'stripe';

// Re-exported for convenience so server-side billing code can import both
// the client and the price display constant from one place. See
// src/data/pricing.ts for why the constant itself lives in a separate,
// zero-dependency module (client components need it without pulling in
// this file's `stripe` Node SDK import).
export { PREMIUM_MONTHLY_PRICE_USD } from '@/data/pricing';

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? '';

// Pinned to the API version this `stripe` package version was generated
// against (see node_modules/stripe/esm/apiVersion.ts). Pinning avoids
// silently picking up breaking API changes if the Stripe account's default
// version is bumped later — upgrade deliberately by bumping both the
// package and this string together.
const STRIPE_API_VERSION =
  '2026-08-26.dahlia' satisfies Stripe.LatestApiVersion;

let stripeClient: Stripe | null = null;

/**
 * Lazily-constructed Stripe client. Lazy so importing this module (e.g. to
 * read PREMIUM_MONTHLY_PRICE_USD from a page that renders without Stripe
 * keys configured) never throws — only routes that actually talk to
 * Stripe do, and only when they're called without STRIPE_SECRET_KEY set.
 */
export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not configured. Set it in your environment (see .env.example) — get it from the Stripe Dashboard under Developers > API keys.',
    );
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  });
  return stripeClient;
}
