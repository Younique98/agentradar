import StarRating from '@/components/StarRating';
import { useToolDetail } from '@/context/ToolDetailContext';
import { SkeletonLoader } from './SkeletonLoader';
import toast from 'react-hot-toast';
import { RefObject, useEffect, useRef } from 'react';
import { ReviewForm } from './ReviewForm';
import clsx from 'clsx';

const pageButtonClass =
  'px-5 py-2 rounded-lg border border-line font-semibold text-sm text-ink-secondary hover:border-signal-text hover:text-ink-primary transition disabled:opacity-40 disabled:pointer-events-none';

const ToolReviews = () => {
  const {
    tool,
    reviews,
    isError,
    hasMoreReviews,
    isFetching,
    isLoading,
    prevPage,
    nextPage,
    page,
  } = useToolDetail();
  const reviewSectionRef: RefObject<HTMLHeadingElement> = useRef(null);
  const onFirstPage = page !== 1;

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load reviews. Please try again later.');
    }
  }, [isError]);

  if (isFetching || !tool) {
    return (
      <div className="space-y-3">
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div>
      <h2
        className="font-display text-2xl font-bold text-ink-primary text-center mb-8"
        ref={reviewSectionRef}
      >
        Reviews
      </h2>

      <ReviewForm toolName={tool.name} />

      {reviews.length > 0 ? (
        <ul className="space-y-3 max-w-3xl mx-auto" aria-live="polite">
          {reviews.map(review => (
            <li
              key={review.id}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-display font-bold text-ink-primary">{review.author}</p>
                <StarRating
                  rating={review.rating}
                  aria-label={`Rating: ${review.rating} stars`}
                  size="sm"
                />
              </div>
              {review.review ? (
                <p className="mt-2 text-sm text-ink-secondary leading-relaxed break-words">
                  {review.review}
                </p>
              ) : (
                <p className="mt-2 text-sm text-ink-muted italic">
                  No written review
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-ink-muted italic">
          No reviews yet — be the first to review {tool.name}.
        </p>
      )}

      <div className="flex justify-center mt-8 gap-3">
        {onFirstPage && (
          <button
            className={pageButtonClass}
            type="button"
            aria-label={`Go to previous page, page ${page - 1}`}
            aria-disabled={page === 1 || isLoading}
            tabIndex={page === 1 || isLoading ? -1 : 0}
            onClick={prevPage}
          >
            Previous
          </button>
        )}
        {hasMoreReviews && (
          <button
            onClick={nextPage}
            type="button"
            aria-label={`Go to next page, page ${page + 1}`}
            aria-disabled={!hasMoreReviews || isLoading}
            tabIndex={!hasMoreReviews || isLoading ? -1 : 0}
            className={clsx(pageButtonClass)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

ToolReviews.displayName = 'ToolReviews';
export default ToolReviews;
