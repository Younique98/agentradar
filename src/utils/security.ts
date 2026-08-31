import { NextApiRequest, NextApiResponse } from 'next';
import helmet from 'helmet';

// Apply security headers
export const applySecurityHeaders = (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  helmet({
    contentSecurityPolicy: false, // Handled in `next.config.mjs`
    frameguard: { action: 'sameorigin' },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })(req as any, res as any, () => {});
};
