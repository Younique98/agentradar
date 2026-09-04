'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { PREMIUM_MONTHLY_PRICE_USD } from '@/data/pricing';

type Plan = 'FREE' | 'PREMIUM';

const fetchPlan = async (): Promise<Plan> => {
  const response = await fetch('/api/user/me');
  if (!response.ok) {
    throw new Error('Failed to fetch plan.');
  }
  const data = await response.json();
  return data.plan;
};

/**
 * Honest, minimal plan indicator: shows what plan the signed-in user is on
 * and the one relevant action for it (upgrade, or manage billing). Both
 * links are plain GETs to route handlers that redirect to Stripe — no
 * client JS needed for the billing part itself, only for reading the
 * current plan.
 */
const PlanBadge = () => {
  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan'],
    queryFn: fetchPlan,
    staleTime: 1000 * 60,
  });

  if (isLoading || !plan) return null;

  const isPremium = plan === 'PREMIUM';

  return (
    <div className="flex items-center gap-2">
      <span
        className={clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
          isPremium
            ? 'bg-signal text-white'
            : 'bg-surface-2 text-ink-secondary',
        )}
      >
        {isPremium ? 'Premium' : 'Free plan'}
      </span>
      <a
        href={isPremium ? '/api/stripe/portal' : '/api/stripe/checkout'}
        className="font-mono text-xs uppercase tracking-wider font-semibold text-signal-text hover:underline rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-text"
      >
        {isPremium ? 'Manage' : `Upgrade — $${PREMIUM_MONTHLY_PRICE_USD}/mo`}
      </a>
    </div>
  );
};

const AuthControl = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  if (status === 'authenticated') {
    return (
      <div className="flex items-center gap-3">
        <PlanBadge />
        <span className="font-mono text-xs text-ink-secondary">
          @{session.user?.githubLogin}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="font-mono text-xs uppercase tracking-wider font-semibold text-ink-secondary hover:text-ink-primary transition"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn('github')}
      className="font-mono text-xs uppercase tracking-wider font-semibold text-ink-secondary hover:text-ink-primary transition"
    >
      Sign in with GitHub
    </button>
  );
};

export const Navbar = () => {
  return (
    <header className="w-full border-b border-line bg-surface">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tight text-ink-primary"
        >
          Tool<span className="text-signal-text">Test</span>
        </Link>

        <nav className="flex items-center gap-6">
          <a
            href="https://github.com/Younique98/agentradar"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-wider font-semibold text-ink-secondary hover:text-ink-primary transition"
          >
            Source
          </a>
          <AuthControl />
        </nav>
      </div>
    </header>
  );
};
