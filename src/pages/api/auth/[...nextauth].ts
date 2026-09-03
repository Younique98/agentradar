import NextAuth, { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

// GitHub OAuth, scoped to read-only profile access (the default
// `read:user` scope — no `repo` scope, since ToolTest has no reason to
// touch anyone's repositories). This exists for exactly one purpose: tying
// each review to a real, checkable GitHub identity instead of a free-text
// name anyone could type. See ReviewForm.tsx and /api/tools/[slug].ts,
// which derive the reviewer's identity from this session server-side and
// never trust a client-submitted name.
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  session: {
    // JWT sessions avoid needing a sessions table/adapter for what is,
    // today, a single-purpose "prove who you are to leave a review" login
    // — there's no other per-user state to persist server-side yet.
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, profile }) {
      // `profile` is only present on the initial sign-in request; on
      // subsequent requests it's undefined and the token already carries
      // what we stored the first time, so only overwrite these fields
      // when we actually have a fresh profile to read them from.
      if (profile && 'id' in profile && 'login' in profile) {
        const githubProfile = profile as unknown as {
          id: number;
          login: string;
        };
        token.githubId = githubProfile.id;
        token.githubLogin = githubProfile.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.githubId = token.githubId as number;
        session.user.githubLogin = token.githubLogin as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
