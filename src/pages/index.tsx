import { Seo } from '@/components/Seo';
import { ToolsProvider, useTools } from '@/context/ToolsContext';
import { ToolCard } from '@/components/ToolCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { CATEGORY_LABELS, ToolCategory } from '@/data/Tool';
import clsx from 'clsx';

const CATEGORY_FILTERS: (ToolCategory | null)[] = [
  null,
  'cli',
  'ide_plugin',
  'mcp_server',
  'agent_skill',
  'other',
];

const ToolCatalog = () => {
  const { tools, isLoading, isError, category, setCategory } = useTools();

  return (
    <div className="px-6 md:px-10 py-12 max-w-6xl mx-auto">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-ink-primary text-balance">
          Real ratings for the tools engineers actually use
        </h1>
        <p className="mt-4 text-lg text-ink-secondary text-balance">
          Reviews of AI coding tools, MCP servers, and agent skills from
          people who&apos;ve run them — not marketing pages.
        </p>
      </div>

      <div
        role="group"
        aria-label="Filter by category"
        className="mt-10 flex flex-wrap justify-center gap-2"
      >
        {CATEGORY_FILTERS.map(filter => (
          <button
            key={filter ?? 'all'}
            type="button"
            aria-pressed={category === filter}
            onClick={() => setCategory(filter)}
            className={clsx(
              'px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold border transition',
              category === filter
                ? 'bg-signal text-white border-signal'
                : 'bg-surface text-ink-secondary border-line hover:border-signal-text',
            )}
          >
            {filter ? CATEGORY_LABELS[filter] : 'All'}
          </button>
        ))}
      </div>

      {isError && (
        <p className="mt-10 text-center text-signal-text font-semibold">
          Failed to load tools. Please try again later.
        </p>
      )}

      {isLoading ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      ) : tools.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-ink-muted italic">
          No tools in this category yet.
        </p>
      )}
    </div>
  );
};

export default function Home() {
  return (
    <>
      <Seo
        title="ToolTest"
        description="Real ratings and reviews for the AI coding tools, MCP servers, and agent skills engineers actually use."
        path="/"
      />
      <main>
        <ToolsProvider>
          <ToolCatalog />
        </ToolsProvider>
      </main>
    </>
  );
}
