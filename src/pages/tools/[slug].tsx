import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Seo } from '@/components/Seo';
import { ToolDetailProvider, useToolDetail } from '@/context/ToolDetailContext';
import { CategoryBadge } from '@/components/CategoryBadge';
import StarRating from '@/components/StarRating';
import ToolReviews from '@/components/ToolReviews';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import Tool from '@/data/Tool';
import Review from '@/data/Review';
import pool from '@/utils/db';

const PAGE_SIZE = 10;

interface ToolPageProps {
  slug: string;
  initialData: { tool: Tool; reviews: Review[] } | null;
}

const ToolDetail = () => {
  const { tool, isLoading, isError } = useToolDetail();

  if (isLoading || !tool) {
    return (
      <div className="px-6 md:px-10 py-12 max-w-3xl mx-auto">
        <SkeletonLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 md:px-10 py-12 max-w-3xl mx-auto text-center text-signal-text font-semibold">
        Failed to load this tool. Please try again later.
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-12 max-w-3xl mx-auto">
      <Seo
        title={tool.name}
        description={tool.description}
        path={`/tools/${tool.slug}`}
      />
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-wider font-semibold text-ink-secondary hover:text-ink-primary transition"
      >
        ← All tools
      </Link>

      <div className="mt-4 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="mb-2">
            <CategoryBadge category={tool.category} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-primary">
            {tool.name}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            {tool.review_count === 0 ? (
              <span className="inline-flex items-center rounded-full border border-signal-text/40 px-2.5 py-1 font-mono text-xs font-semibold text-signal-text">
                Not yet rated — be the first, verified by GitHub
              </span>
            ) : (
              <>
                <StarRating rating={Math.round(tool.avg_rating ?? 0)} />
                <span className="font-mono text-sm text-ink-muted">
                  {tool.review_count} review{tool.review_count === 1 ? '' : 's'}
                </span>
              </>
            )}
          </div>
        </div>

        {tool.review_count > 0 && (
          <div className="rounded-xl border border-line bg-surface px-5 py-3 text-center shrink-0">
            <p className="font-mono text-3xl font-bold tabular-nums text-signal-text">
              {(tool.avg_rating ?? 0).toFixed(1)}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              avg rating
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-ink-secondary leading-relaxed">
        {tool.description}
      </p>

      {tool.homepage_url && (
        <a
          href={tool.homepage_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-signal-text hover:underline"
        >
          Visit homepage →
        </a>
      )}

      <div className="mt-12 border-t border-line pt-8">
        <ToolReviews />
      </div>
    </div>
  );
};

export default function ToolPage({ slug, initialData }: ToolPageProps) {
  return (
    <main>
      <ToolDetailProvider slug={slug} initialData={initialData ?? undefined}>
        <ToolDetail />
      </ToolDetailProvider>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<
  ToolPageProps
> = async context => {
  const slug = context.params?.slug as string;

  try {
    const toolResult = await pool.query(
      `SELECT
         tools.*,
         COALESCE(AVG(reviews.rating), 0)::float AS avg_rating,
         COUNT(reviews.id)::int AS review_count
       FROM tools
       LEFT JOIN reviews ON reviews.tool_id = tools.id
       WHERE tools.slug = $1
       GROUP BY tools.id`,
      [slug],
    );

    if (toolResult.rows.length === 0) {
      return { notFound: true };
    }

    const reviewsResult = await pool.query(
      `SELECT * FROM reviews WHERE tool_id = $1 ORDER BY featured DESC, id DESC LIMIT $2`,
      [toolResult.rows[0].id, PAGE_SIZE],
    );

    return {
      props: {
        slug,
        initialData: {
          tool: JSON.parse(JSON.stringify(toolResult.rows[0])),
          reviews: JSON.parse(JSON.stringify(reviewsResult.rows)),
        },
      },
    };
  } catch (error) {
    console.error(
      `[SSR_DB_ERROR]: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return { props: { slug, initialData: null } };
  }
};
