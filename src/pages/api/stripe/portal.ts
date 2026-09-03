import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { withCors } from '@/lib/middleware/cors';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { applySecurityHeaders } from '@/utils/security';
import logger from '@/utils/logger';
import { getStripeClient } from '@/utils/stripe';
import { getUserByGithubId } from '@/utils/users';

/**
 * Creates a Stripe Billing Portal session and redirects the signed-in user
 * to it, so they can manage or cancel their own subscription. This is the
 * entirety of ToolTest's cancel/manage-subscription flow — no custom UI,
 * Stripe's hosted portal is the standard, correct way to do this.
 */
async function portalHandler(req: NextApiRequest, res: NextApiResponse) {
  applySecurityHeaders(req, res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  const githubId = session?.user?.githubId;

  if (!githubId) {
    return res.redirect(302, '/');
  }

  try {
    const user = await getUserByGithubId(githubId);

    if (!user?.stripe_customer_id) {
      return res.status(400).json({
        error: 'No billing account found. Subscribe first to manage billing.',
      });
    }

    const stripe = getStripeClient();
    const origin = `${req.headers['x-forwarded-proto'] ?? 'http'}://${req.headers.host}`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${origin}/`,
    });

    logger.info(
      `GET /api/stripe/portal - 303 - Portal session created for GitHub user ${githubId}`,
    );
    return res.redirect(303, portalSession.url);
  } catch (error) {
    logger.error(
      `Failed to create Stripe Billing Portal session: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return res
      .status(500)
      .json({ error: 'Failed to open billing portal. Please try again.' });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await withCors(withRateLimit(portalHandler))(req, res);
}
