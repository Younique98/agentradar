import type { NextApiRequest, NextApiResponse } from 'next';
import type Stripe from 'stripe';
import { getStripeClient } from '@/utils/stripe';
import logger from '@/utils/logger';
import {
  syncUserBillingFromStripe,
  downgradeUserByStripeCustomerId,
  getUserByStripeCustomerId,
} from '@/utils/users';

// Stripe's signature is computed over the exact raw request bytes, so the
// body must not be parsed/re-serialized before verification — disable
// Next's default JSON body parser for this route only and read the raw
// stream ourselves below.
export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Stripe webhook endpoint. Verifies the signature, then keeps the `users`
 * row's plan/subscription fields in sync with Stripe.
 *
 * Configure this URL (https://<your-domain>/api/stripe/webhook) in the
 * Stripe Dashboard under Developers > Webhooks, subscribed to at least:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 * and set STRIPE_WEBHOOK_SECRET to the signing secret Stripe shows you for
 * that endpoint (see .env.example).
 *
 * Deliberately not wrapped in withCors/withRateLimit — this is a
 * server-to-server callback from Stripe, not a browser request (Stripe
 * sends no Origin header, and rate-limiting Stripe's own retry bursts
 * would just cause it to keep retrying).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not configured - rejecting webhook');
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  const rawBody = await readRawBody(req);

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    logger.warn(
      `Stripe webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(checkoutSession);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        // Other event types are ignored - not an error, just not something
        // this app tracks.
        break;
    }
  } catch (error) {
    // Log and 500 so Stripe retries delivery, but don't leak internals.
    logger.error(
      `Failed to process Stripe webhook event ${event.type}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  return res.status(200).json({ received: true });
}

function parseGithubId(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function resolveGithubIdentity(params: {
  metadataGithubId?: string | null;
  metadataGithubLogin?: string | null;
  stripeCustomerId?: string | null;
}): Promise<{ githubId: number; githubLogin: string | null } | null> {
  const { metadataGithubId, metadataGithubLogin, stripeCustomerId } = params;

  const fromMetadata = parseGithubId(metadataGithubId);
  if (fromMetadata) {
    return { githubId: fromMetadata, githubLogin: metadataGithubLogin ?? null };
  }

  if (stripeCustomerId) {
    const user = await getUserByStripeCustomerId(stripeCustomerId);
    if (user)
      return { githubId: user.github_id, githubLogin: user.github_login };
  }

  return null;
}

async function handleCheckoutCompleted(
  checkoutSession: Stripe.Checkout.Session,
) {
  const identity = await resolveGithubIdentity({
    metadataGithubId:
      checkoutSession.metadata?.githubId ?? checkoutSession.client_reference_id,
    metadataGithubLogin: checkoutSession.metadata?.githubLogin,
    stripeCustomerId:
      typeof checkoutSession.customer === 'string'
        ? checkoutSession.customer
        : null,
  });

  if (!identity) {
    logger.error(
      `checkout.session.completed: could not resolve a GitHub user id (session ${checkoutSession.id})`,
    );
    return;
  }

  const customerId =
    typeof checkoutSession.customer === 'string'
      ? checkoutSession.customer
      : checkoutSession.customer?.id;
  const subscriptionId =
    typeof checkoutSession.subscription === 'string'
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id;

  if (!customerId || !subscriptionId) {
    logger.error(
      `checkout.session.completed: missing customer or subscription id (session ${checkoutSession.id})`,
    );
    return;
  }

  // Fetch the subscription directly rather than trusting checkout.session's
  // own snapshot - customer.subscription.updated (handled below) will also
  // fire and is the source of truth going forward, but doing this here
  // means the user is marked PREMIUM immediately instead of waiting on a
  // second webhook delivery.
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await syncUserBillingFromStripe({
    githubId: identity.githubId,
    githubLogin: identity.githubLogin,
    email: checkoutSession.customer_details?.email ?? null,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    plan: isActiveSubscriptionStatus(subscription.status) ? 'PREMIUM' : 'FREE',
    stripeCurrentPeriodEnd: getCurrentPeriodEnd(subscription),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  const identity = await resolveGithubIdentity({
    metadataGithubId: subscription.metadata?.githubId,
    metadataGithubLogin: subscription.metadata?.githubLogin,
    stripeCustomerId: customerId,
  });

  if (!identity) {
    logger.error(
      `customer.subscription.updated: could not resolve a GitHub user id (subscription ${subscription.id}, customer ${customerId})`,
    );
    return;
  }

  await syncUserBillingFromStripe({
    githubId: identity.githubId,
    githubLogin: identity.githubLogin,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    plan: isActiveSubscriptionStatus(subscription.status) ? 'PREMIUM' : 'FREE',
    stripeCurrentPeriodEnd: getCurrentPeriodEnd(subscription),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;
  await downgradeUserByStripeCustomerId(customerId);
}

function isActiveSubscriptionStatus(
  status: Stripe.Subscription.Status,
): boolean {
  return status === 'active' || status === 'trialing';
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription): Date | null {
  // current_period_end lives on the subscription item in recent API
  // versions, not the subscription itself.
  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end;
  return typeof periodEnd === 'number' ? new Date(periodEnd * 1000) : null;
}
