'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

const AuthControl = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  if (status === 'authenticated') {
    return (
      <div className="flex items-center gap-3">
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
