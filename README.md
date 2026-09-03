# ToolTest

A review board where engineers rate and review the AI coding tools, MCP
servers, and agent skills they've actually used in production — not
vendor marketing pages.

## Problem it solves

Teams are adopting AI coding tools faster than they can evaluate them, and
the discovery layer is already crowded — Anthropic's own MCP registry,
Glama, Smithery, and PulseMCP all catalog thousands of MCP servers. None of
them are a review platform: they're crawled or claimed listings, not honest
signal from engineers who've actually used a tool in production. ToolTest
isn't competing to be another catalog. It's the review layer those
catalogs don't have — real star ratings and written reviews, each tied to
a verified GitHub identity so a rating can't be spoofed by the vendor
itself or a competitor.

## Tech Stack

- **Framework:** Next.js (Pages Router), TypeScript, Tailwind CSS
- **Auth:** NextAuth (GitHub OAuth) — every review requires a signed-in
  GitHub account; there is no anonymous or free-text-name review path
- **State Management:** React Query
- **Database:** PostgreSQL
- **API:** Next.js API routes, rate-limited and CORS-restricted
- **Testing:** Jest, React Testing Library
- **Billing:** Stripe Checkout + Billing Portal for the optional $9/mo
  Premium plan

## Features

- Browse and filter the tool catalog by category (IDE plugin, CLI, MCP
  server, agent skill)
- Per-tool detail page with average rating, review count, and full
  review history
- Star rating + written review submission, tied to the reviewer's GitHub
  account (sign-in required), sanitized and rate-limited server-side
- One review per person per tool — resubmitting updates your existing
  review rather than stacking duplicates
- Optional $9/mo Premium plan (Stripe Checkout + Billing Portal): a higher
  review-submission rate limit, and reviews are marked "Featured" and
  sorted first on the tool page when left by a Premium reviewer

## Getting Started

1. Clone the repository:
   ```sh
   git clone https://github.com/Younique98/agentradar.git
   cd agentradar
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up a local Postgres database and copy `.env.example` to `.env.local`
   with your connection details, then seed it:
   ```sh
   psql -U <user> -d <database> -f seed.sql
   psql -U <user> -d <database> -f migrations/0001_add_billing_and_featured_reviews.sql
   ```
4. Create a GitHub OAuth App at
   [github.com/settings/developers](https://github.com/settings/developers)
   (Authorization callback URL: `http://localhost:3000/api/auth/callback/github`)
   and add its Client ID/Secret plus a `NEXTAUTH_SECRET`
   (`openssl rand -base64 32`) to `.env.local` — see `.env.example` for the
   full list. Without this, the tool catalog and pages still work, but
   nobody can sign in to leave a review.
5. (Optional) Set up Stripe for the Premium plan — add
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_ID` to
   `.env.local` (see `.env.example` for where to get each). Without these,
   everything else works and `/api/stripe/checkout` just responds 503.
6. Start the development server:
   ```sh
   npm run dev
   ```

Then open [http://localhost:3000](http://localhost:3000)

## Testing

```sh
npm run test
```
