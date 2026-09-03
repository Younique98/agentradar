import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { withCors } from '@/lib/middleware/cors';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { applySecurityHeaders } from '@/utils/security';
import logger from '@/utils/logger';
import { getStripeClient, STRIPE_PRICE_ID } from '@/utils/stripe';
import { getUserByGithubId } from '@/utils/users';

/**
 * Starts a Stripe Checkout session for the ToolTest Premium monthly
 * subscription and redirects the signed-in user straight to it.
 *
 * Linked to directly (e.g. <a href="/api/stripe/checkout">Upgrade</a>) —
 * this is a GET that ends in a redirect, not a fetch() call.
 */
async function checkoutHandler(req: NextApiRequest, res: NextApiResponse) {
  applySecurityHeaders(req, res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  const githubId = session?.user?.githubId;
  const githubLogin = session?.user?.githubLogin;

  if (!githubId || !githubLogin) {
    // Not signed in — send them to sign in first rather than erroring.
    return res.redirect(302, '/');
  }

  if (!STRIPE_PRICE_ID) {
    logger.error('STRIPE_PRICE_ID is not configured');
    return res.status(503).json({
      error: 'Billing is not configured yet. Please try again later.',
    });
  }

  try {
    const user = await getUserByGithubId(githubId);

    // Already on premium — send them to the portal to manage the existing
    // subscription instead of starting a second one.
    if (user?.plan === 'PREMIUM' && user.stripe_customer_id) {
      return res.redirect(303, '/api/stripe/portal');
    }

    const stripe = getStripeClient();
    const origin = `${req.headers['x-forwarded-proto'] ?? 'http'}://${req.headers.host}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      // Reuse the existing Stripe customer if this user has one (e.g. a
      // lapsed subscriber resubscribing); otherwise let Checkout collect
      // an email, seeded from their GitHub account email.
      ...(user?.stripe_customer_id
        ? { customer: user.stripe_customer_id }
        : { customer_email: user?.email ?? undefined }),
      client_reference_id: String(githubId),
      subscription_data: {
        metadata: { githubId: String(githubId), githubLogin },
      },
      metadata: { githubId: String(githubId), githubLogin },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });

    if (!checkoutSession.url) {
      throw new Error('Stripe did not return a Checkout URL');
    }

    logger.info(
      `GET /api/stripe/checkout - 303 - Checkout started for GitHub user ${githubLogin}`,
    );
    return res.redirect(303, checkoutSession.url);
  } catch (error) {
    logger.error(
      `Failed to create Stripe Checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return res
      .status(500)
      .json({ error: 'Failed to start checkout. Please try again.' });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await withCors(withRateLimit(checkoutHandler))(req, res);
}
