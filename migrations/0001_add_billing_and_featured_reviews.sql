-- Adds subscription billing + premium-review support on top of seed.sql's
-- base schema (tools, reviews). Apply after seed.sql:
--
--   psql -U <user> -d <database> -f seed.sql
--   psql -U <user> -d <database> -f migrations/0001_add_billing_and_featured_reviews.sql
--
-- Written idempotently (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS), matching
-- seed.sql's own style, so it's safe to re-run.

-- Prior to this migration, GitHub OAuth sign-in (see
-- src/pages/api/auth/[...nextauth].ts) never persisted anything to
-- Postgres — a review's author_github_id/author_login on the `reviews`
-- table was the only trace of a user. This table gives every signed-in
-- GitHub account a durable row, upserted on each sign-in (see
-- src/utils/users.ts) and kept in sync with Stripe by
-- src/pages/api/stripe/webhook.ts.
--
-- Keyed by the GitHub numeric user id (BIGINT, matching
-- reviews.author_github_id) rather than a generated id — there is exactly
-- one row per GitHub account, and every other table that references a user
-- already uses this id, so a surrogate key would just add a join.
CREATE TABLE IF NOT EXISTS users (
    github_id BIGINT PRIMARY KEY,
    github_login VARCHAR(255) NOT NULL,
    email VARCHAR(255),

    plan VARCHAR(16) NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PREMIUM')),

    -- Stripe billing fields. All nullable — a FREE user (or one who has
    -- never started checkout) has none of these.
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_current_period_end TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook handlers look a user up by Stripe customer id when an event's
-- metadata doesn't carry the GitHub id directly (see
-- src/pages/api/stripe/webhook.ts).
CREATE INDEX IF NOT EXISTS users_stripe_customer_id_idx ON users(stripe_customer_id);

-- Deliberately NOT a foreign key from reviews.author_github_id to
-- users.github_id: reviews predate this table (see seed.sql), and nothing
-- upstream guarantees every existing review's author signed in again after
-- this migration shipped to get a users row created. The two stay
-- soft-linked by id, same as before.

-- Reviews left by a PREMIUM-plan user at submission time get surfaced
-- ahead of other reviews in the tool detail listing (see
-- src/pages/api/tools/[slug].ts and src/components/ToolReviews.tsx).
-- Recomputed on every review submission/edit from the author's plan at
-- that moment — it is a snapshot, not a live join, so a later
-- upgrade/downgrade only affects reviews submitted after it, not
-- retroactively.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS reviews_tool_id_featured_idx ON reviews(tool_id, featured);
