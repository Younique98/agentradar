import Link from 'next/link';
import { CategoryBadge } from '@/components/CategoryBadge';
import StarRating from '@/components/StarRating';
import Tool from '@/data/Tool';

export const ToolCard = ({ tool }: { tool: Tool }) => (
  <Link
    href={`/tools/${tool.slug}`}
    className="block h-full rounded-xl border border-line bg-surface p-5 transition hover:border-signal-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-text"
  >
    <div className="flex items-start justify-between gap-3">
      <h2 className="font-display text-lg font-bold text-ink-primary leading-snug">
        {tool.name}
      </h2>
      <CategoryBadge category={tool.category} />
    </div>

    <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
      {tool.description}
    </p>

    <div className="mt-4 flex items-center gap-3">
      {tool.review_count === 0 ? (
        <span className="inline-flex items-center rounded-full border border-signal-text/40 px-2.5 py-1 font-mono text-xs font-semibold text-signal-text">
          Be the first to review →
        </span>
      ) : (
        <>
          <StarRating rating={Math.round(tool.avg_rating ?? 0)} size="sm" />
          <span className="font-mono text-xs text-ink-muted">
            <span className="font-semibold text-ink-secondary">
              {(tool.avg_rating ?? 0).toFixed(1)}
            </span>
            {' · '}
            {tool.review_count} review{tool.review_count === 1 ? '' : 's'}
          </span>
        </>
      )}
    </div>
  </Link>
);
