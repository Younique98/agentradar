import pool from '@/utils/db';
import {
  REVIEW_RATE_LIMIT_FREE,
  REVIEW_RATE_LIMIT_PREMIUM,
} from '@/lib/middleware/rateLimit';

// Deliberately does NOT import authOptions/getServerSession from
// src/pages/api/auth/[...nextauth].ts — that file imports
// upsertUserOnSignIn from this one (see its jwt callback), so importing
// back from here would create a circular module dependency. Every function
// below takes an already-resolved githubId instead of fetching the session
// itself; callers (API routes) already have it via getServerSession.

export type Plan = 'FREE' | 'PREMIUM';

/**
 * Ensures a `users` row exists for this GitHub account, called from the
 * NextAuth `jwt` callback on every fresh sign-in (see
 * src/pages/api/auth/[...nextauth].ts). Cheap upsert — creates the row on
 * first sign-in, otherwise just refreshes the login/email GitHub reports
 * (both of which can change).
 *
 * Never throws into the auth flow — a DB hiccup here should not block
 * sign-in (the row gets created/updated on the next sign-in, or lazily by
 * the Stripe checkout route). Callers should still wrap this in try/catch
 * as a second line of defense, same as the caller in [...nextauth].ts does.
 */
export async function upsertUserOnSignIn(params: {
  githubId: number;
  githubLogin: string;
  email?: string | null;
}): Promise<void> {
  const { githubId, githubLogin, email } = params;
  await pool.query(
    `INSERT INTO users (github_id, github_login, email)
     VALUES ($1, $2, $3)
     ON CONFLICT (github_id)
     DO UPDATE SET
       github_login = EXCLUDED.github_login,
       email = COALESCE(EXCLUDED.email, users.email),
       updated_at = now()`,
    [githubId, githubLogin, email ?? null],
  );
}

/**
 * Looks up a user's current plan for feature-gating decisions (rate
 * limits, the "featured review" flag, the pricing UI, etc). Defaults to
 * FREE on any failure or missing row — a DB outage, or a user who has
 * never signed in since this table existed, should degrade to the free
 * tier, never silently grant premium.
 */
export async function getUserPlan(githubId: number): Promise<Plan> {
  try {
    const result = await pool.query<{
      plan: Plan;
      stripe_current_period_end: string | null;
    }>(
      `SELECT plan, stripe_current_period_end FROM users WHERE github_id = $1`,
      [githubId],
    );

    const user = result.rows[0];
    if (!user) return 'FREE';

    // Safety net: if the webhook that should have downgraded this user on
    // cancellation/non-payment never arrived, don't let a stale PREMIUM
    // flag outlive the period Stripe actually paid for.
    if (
      user.plan === 'PREMIUM' &&
      user.stripe_current_period_end &&
      new Date(user.stripe_current_period_end).getTime() < Date.now()
    ) {
      return 'FREE';
    }

    return user.plan;
  } catch (error) {
    console.error('Failed to look up user plan, defaulting to FREE:', error);
    return 'FREE';
  }
}

/**
 * Resolves the rate limit config for a review submission
 * (POST /api/tools/[slug]) based on the requester's plan — FREE keeps the
 * previous default limit, PREMIUM gets a higher one (see
 * REVIEW_RATE_LIMIT_FREE/PREMIUM in src/lib/middleware/rateLimit.ts).
 * `githubId` is null/undefined for unauthenticated requests, which get the
 * FREE limit — they're rejected with 401 inside the handler regardless,
 * this just avoids letting them burn through a request budget meant for
 * signed-in users.
 */
export async function getReviewRateLimitConfig(
  githubId: number | null | undefined,
) {
  if (!githubId) return REVIEW_RATE_LIMIT_FREE;

  try {
    const plan = await getUserPlan(githubId);
    return plan === 'PREMIUM'
      ? REVIEW_RATE_LIMIT_PREMIUM
      : REVIEW_RATE_LIMIT_FREE;
  } catch (error) {
    console.error(
      'Failed to resolve plan-aware rate limit, defaulting to FREE limit:',
      error,
    );
    return REVIEW_RATE_LIMIT_FREE;
  }
}

interface UserBillingRow {
  github_id: number;
  github_login: string | null;
  email: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export async function getUserByGithubId(
  githubId: number,
): Promise<UserBillingRow | null> {
  const result = await pool.query<UserBillingRow>(
    `SELECT github_id, github_login, email, plan, stripe_customer_id, stripe_subscription_id
     FROM users WHERE github_id = $1`,
    [githubId],
  );
  return result.rows[0] ?? null;
}

export async function getUserByStripeCustomerId(
  stripeCustomerId: string,
): Promise<UserBillingRow | null> {
  const result = await pool.query<UserBillingRow>(
    `SELECT github_id, github_login, email, plan, stripe_customer_id, stripe_subscription_id
     FROM users WHERE stripe_customer_id = $1`,
    [stripeCustomerId],
  );
  return result.rows[0] ?? null;
}

/**
 * Syncs a user's plan/subscription fields from Stripe. Used by the webhook
 * handler (src/pages/api/stripe/webhook.ts) on checkout completion and
 * subscription updates. Upserts rather than updates-only so a webhook that
 * arrives before this user's own sign-in-triggered row exists (shouldn't
 * normally happen, since checkout requires being signed in, but Stripe
 * event delivery ordering isn't guaranteed) still lands correctly.
 */
export async function syncUserBillingFromStripe(params: {
  githubId: number;
  githubLogin?: string | null;
  email?: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: Plan;
  stripeCurrentPeriodEnd: Date | null;
}): Promise<void> {
  const {
    githubId,
    githubLogin,
    email,
    stripeCustomerId,
    stripeSubscriptionId,
    plan,
    stripeCurrentPeriodEnd,
  } = params;

  await pool.query(
    `INSERT INTO users (
       github_id, github_login, email,
       plan, stripe_customer_id, stripe_subscription_id, stripe_current_period_end
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (github_id)
     DO UPDATE SET
       github_login = COALESCE(EXCLUDED.github_login, users.github_login),
       email = COALESCE(EXCLUDED.email, users.email),
       plan = EXCLUDED.plan,
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       stripe_subscription_id = EXCLUDED.stripe_subscription_id,
       stripe_current_period_end = EXCLUDED.stripe_current_period_end,
       updated_at = now()`,
    [
      githubId,
      // github_login is NOT NULL — fall back to a placeholder derived from
      // the id on the (rare, webhook-arrives-before-sign-in) insert path so
      // the constraint can't reject an otherwise-valid billing sync. The
      // user's real login is filled in for real on their next sign-in.
      githubLogin ?? `github-${githubId}`,
      email ?? null,
      plan,
      stripeCustomerId,
      stripeSubscriptionId,
      stripeCurrentPeriodEnd,
    ],
  );
}

/**
 * Downgrades a user to FREE on subscription cancellation
 * (customer.subscription.deleted). Deliberately keeps stripe_customer_id /
 * stripe_subscription_id — the customer record still exists in Stripe
 * (useful if they resubscribe, or open the billing portal to view past
 * invoices) — and only clears the period end and plan.
 */
export async function downgradeUserByStripeCustomerId(
  stripeCustomerId: string,
): Promise<void> {
  await pool.query(
    `UPDATE users
     SET plan = 'FREE', stripe_current_period_end = NULL, updated_at = now()
     WHERE stripe_customer_id = $1`,
    [stripeCustomerId],
  );
}
