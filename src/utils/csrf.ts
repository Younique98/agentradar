import { createHash } from 'crypto';
import type { NextApiRequest } from 'next';

// This endpoint isn't one of NextAuth's own /api/auth/* routes, so it has to
// validate the CSRF token itself. It reuses the token NextAuth already
// issues rather than inventing a second mechanism: the client fetches one
// with getCsrfToken() (next-auth/react) and sends it back on the request;
// this checks it against the httpOnly cookie NextAuth set alongside it.
//
// The cookie value is `${token}|${hash}` where
// hash = sha256(token + NEXTAUTH_SECRET) — the same pairing next-auth's own
// core/lib/csrf-token.ts creates and verifies, so a request can't just make
// up a token: it has to be the one from the visitor's own cookie.
export function verifyCsrfToken(
  req: NextApiRequest,
  submittedToken: string | string[] | undefined,
): boolean {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = Array.isArray(submittedToken)
    ? submittedToken[0]
    : submittedToken;

  if (!secret || !token) return false;

  // Cookie name depends on whether NextAuth is issuing secure (__Host-)
  // cookies for this deployment; check both rather than re-deriving that
  // decision here.
  const cookieValue =
    req.cookies['__Host-next-auth.csrf-token'] ??
    req.cookies['next-auth.csrf-token'];
  if (!cookieValue) return false;

  const [csrfToken, csrfTokenHash] = cookieValue.split('|');
  if (!csrfToken || !csrfTokenHash) return false;

  const expectedHash = createHash('sha256')
    .update(`${csrfToken}${secret}`)
    .digest('hex');

  return csrfTokenHash === expectedHash && csrfToken === token;
}
