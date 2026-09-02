import type { DefaultSession } from 'next-auth';

// Augments next-auth's built-in Session type with the two GitHub identity
// fields set in the jwt/session callbacks (src/pages/api/auth/[...nextauth].ts).
// These are what /api/tools/[slug].ts reads server-side to attribute a
// review to a real, authenticated identity.
declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      githubId?: number;
      githubLogin?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    githubId?: number;
    githubLogin?: string;
  }
}
