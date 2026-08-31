# AgentRadar

A review board where engineers rate and review the AI coding tools, MCP
servers, and agent skills they've actually used in production — not
vendor marketing pages.

## Problem it solves

Teams are adopting AI coding tools faster than they can evaluate them.
There's no shared, honest signal for "is this MCP server actually good"
beyond vendor pages and social media hype. AgentRadar is a catalog of
tools, organized by category, with real star ratings and written
reviews attached to each one.

## Tech Stack

- **Framework:** Next.js (Pages Router), TypeScript, Tailwind CSS
- **State Management:** React Query
- **Database:** PostgreSQL
- **API:** Next.js API routes, rate-limited and CORS-restricted
- **Testing:** Jest, React Testing Library

## Features

- Browse and filter the tool catalog by category (IDE plugin, CLI, MCP
  server, agent skill)
- Per-tool detail page with average rating, review count, and full
  review history
- Star rating + written review submission, sanitized and rate-limited
  server-side

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
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```

Then open [http://localhost:3000](http://localhost:3000)

## Testing

```sh
npm run test
```
