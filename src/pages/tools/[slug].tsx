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
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <SkeletonLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto text-center text-red-500">
        Failed to load this tool. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Seo
        title={tool.name}
        description={tool.description}
        path={`/tools/${tool.slug}`}
      />
      <Link
        href="/"
        className="text-sm font-semibold text-primary-600 hover:underline"
      >
        ← All tools
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {tool.name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <CategoryBadge category={tool.category} />
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(tool.avg_rating ?? 0)} />
              <span className="text-sm text-gray-500">
                {tool.review_count === 0
                  ? 'No reviews yet'
                  : `${(tool.avg_rating ?? 0).toFixed(1)} (${tool.review_count} review${tool.review_count === 1 ? '' : 's'})`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-gray-700 leading-relaxed">{tool.description}</p>

      {tool.homepage_url && (
        <a
          href={tool.homepage_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline"
        >
          Visit homepage →
        </a>
      )}

      <div className="mt-10 border-t pt-6">
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

export const getServerSideProps: GetServerSideProps<ToolPageProps> = async (
  context,
) => {
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
      `SELECT * FROM reviews WHERE tool_id = $1 ORDER BY id DESC LIMIT $2`,
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
