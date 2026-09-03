/**
 * Monthly price for ToolTest Premium, in whole US dollars — display copy
 * only (e.g. "Upgrade — $9/mo" in the navbar plan badge). The actual
 * amount charged is whatever Price object STRIPE_PRICE_ID points at in the
 * Stripe Dashboard; this constant does not control billing.
 *
 * Kept in its own zero-dependency module (rather than alongside
 * src/utils/stripe.ts, which imports the `stripe` Node SDK) so client
 * components like NavBar.tsx can import just the number without pulling
 * server-only code into the browser bundle.
 */
export const PREMIUM_MONTHLY_PRICE_USD = 9;
