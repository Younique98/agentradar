import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { withCors } from '@/lib/middleware/cors';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { applySecurityHeaders } from '@/utils/security';
import { getUserPlan } from '@/utils/users';

/**
 * Returns the signed-in user's plan, for the plan badge in the navbar
 * (src/components/NavBar.tsx). Not tool- or review-specific, so it doesn't
 * live under /api/tools like everything else — this is account-level data.
 */
async function meHandler(req: NextApiRequest, res: NextApiResponse) {
  applySecurityHeaders(req, res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  const githubId = session?.user?.githubId;

  if (!githubId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const plan = await getUserPlan(githubId);
  return res.status(200).json({ plan });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await withCors(withRateLimit(meHandler))(req, res);
}
