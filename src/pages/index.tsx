import { Inter } from 'next/font/google';
import { Seo } from '@/components/Seo';
import { ToolsProvider, useTools } from '@/context/ToolsContext';
import { ToolCard } from '@/components/ToolCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { CATEGORY_LABELS, ToolCategory } from '@/data/Tool';
import clsx from 'clsx';

const inter = Inter({ subsets: ['latin'] });

const CATEGORY_FILTERS: (ToolCategory | null)[] = [
  null,
  'cli',
  'ide_plugin',
  'mcp_server',
  'agent_skill',
];

const ToolCatalog = () => {
  const { tools, isLoading, isError, category, setCategory } = useTools();

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
          AgentRadar
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real ratings and reviews for the AI coding tools, MCP servers, and
          agent skills engineers actually use — not marketing pages.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORY_FILTERS.map(filter => (
          <button
            key={filter ?? 'all'}
            type="button"
            onClick={() => setCategory(filter)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-semibold border transition',
              category === filter
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400',
            )}
          >
            {filter ? CATEGORY_LABELS[filter] : 'All'}
          </button>
        ))}
      </div>

      {isError && (
        <p className="text-center text-red-500">
          Failed to load tools. Please try again later.
        </p>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      ) : tools.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 italic">
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
        title="AgentRadar"
        description="Real ratings and reviews for the AI coding tools, MCP servers, and agent skills engineers actually use."
        path="/"
      />
      <main className={inter.className}>
        <ToolsProvider>
          <ToolCatalog />
        </ToolsProvider>
      </main>
    </>
  );
}
