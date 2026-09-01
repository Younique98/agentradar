'use client';

import Link from 'next/link';

export const Navbar = () => {
  return (
    <header className="w-full border-b border-line bg-surface">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tight text-ink-primary"
        >
          Agent<span className="text-signal-text">Radar</span>
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
        </nav>
      </div>
    </header>
  );
};
