'use client';

import Link from 'next/link';

export const Navbar = () => {
  return (
    <header className="w-full border-b bg-white dark:bg-slate-900">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Agent<span className="text-primary-600">Radar</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <a
            href="https://github.com/Younique98/agentradar"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-gray-700 hover:text-primary-700 dark:text-gray-300 dark:hover:text-white transition"
          >
            Source
          </a>
        </nav>
      </div>
    </header>
  );
};
