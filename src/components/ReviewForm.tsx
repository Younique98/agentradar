import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { signIn, useSession } from 'next-auth/react';
import Star from './Star';
import { Button } from './Button';
import { useToolDetail } from '@/context/ToolDetailContext';
import { useError } from '@/context/ErrorContext';

type TReviewFormData = {
  rating: number;
  review?: string;
};

interface IReviewForm {
  toolName: string;
}

const inputClass =
  'border border-line rounded-lg px-3 py-2 bg-bg text-ink-primary focus:outline-none focus:ring-2 focus:ring-signal-text w-full';
const labelClass = 'block text-sm font-semibold text-ink-secondary mb-1';

export const ReviewForm: React.FC<IReviewForm> = ({ toolName }) => {
  const { data: session, status } = useSession();
  const { submitReview } = useToolDetail();
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TReviewFormData>({ mode: 'onChange' });
  const rating = watch('rating', 0);
  const allowUserInput = true;
  const { setError } = useError();

  const onSubmit = async (data: TReviewFormData) => {
    if (data.review && data.review.length > 500) {
      setError('Review cannot be more than 500 characters.');
      return;
    }
    try {
      await submitReview.mutateAsync({
        rating: data.rating,
        review: data.review,
      });
      toast.success('Review submitted successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to submit review.');
    }
  };

  // Enter/Space activation is handled natively by the <button> itself -
  // this only needs to cover roving focus between stars with the arrow
  // keys, matching radiogroup keyboard conventions. starId is 1-based,
  // matching the rating value the button's onClick sets.
  const handleKeyDown = (event: React.KeyboardEvent, starId: number) => {
    if (event.key === 'ArrowRight' && starId < 5) {
      setValue('rating', starId + 1);
      document.getElementById(`review-star-${starId + 1}`)?.focus();
    }
    if (event.key === 'ArrowLeft' && starId > 1) {
      setValue('rating', starId - 1);
      document.getElementById(`review-star-${starId - 1}`)?.focus();
    }
  };

  // Every review is tied to whoever is signed in via GitHub — there is no
  // free-text name field, on purpose. That's what makes a review here mean
  // something a review site with an unauthenticated "your name" box
  // doesn't: it can't be posted as someone else.
  if (status !== 'authenticated') {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 mb-8 md:w-3/4 mx-auto text-center space-y-3">
        <h2 className="font-display text-lg font-bold text-ink-primary">
          Review {toolName}
        </h2>
        <p className="text-sm text-ink-secondary">
          Reviews are tied to a real GitHub account, so ratings can&rsquo;t be
          faked or posted as someone else.
        </p>
        <Button
          type="button"
          onClick={() => signIn('github')}
          disabled={status === 'loading'}
        >
          Sign in with GitHub to review
        </Button>
      </div>
    );
  }

  return (
    <form
      role="form"
      aria-labelledby="review-form-title"
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-line bg-surface p-6 mb-8 md:w-3/4 mx-auto space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="review-form-title" className="font-display text-lg font-bold text-ink-primary">
          Review {toolName}
        </h2>
        <p className="text-xs text-ink-muted">
          Posting as <span className="font-semibold">@{session.user?.githubLogin}</span>
        </p>
      </div>

      {/* Star Rating */}
      <div>
        <label id="rating-label" htmlFor="rating" className={labelClass}>
          Rating
        </label>

        {/* Visually Hidden Input for Screen Readers */}
        <input
          type="number"
          id="rating"
          name="rating"
          value={rating}
          onChange={e => setValue('rating', Number(e.target.value))}
          className="sr-only"
          required
        />

        {/* Star Buttons */}
        <div
          role="radiogroup"
          aria-labelledby="rating-label"
          className="flex gap-1"
        >
          {[...Array(5)].map((_, index) => (
            <button
              key={index}
              id={`review-star-${index + 1}`}
              type="button"
              role="radio"
              aria-checked={rating === index + 1}
              aria-label={`${index + 1} star${index !== 0 ? 's' : ''}`}
              onClick={() => setValue('rating', index + 1)}
              onKeyDown={
                allowUserInput
                  ? event => handleKeyDown(event, index + 1)
                  : undefined
              }
              className={clsx(
                'w-9 h-9 flex items-center justify-center rounded-full transition',
                rating > index
                  ? 'bg-surface-2 text-signal-text'
                  : 'text-ink-muted hover:text-ink-secondary',
              )}
            >
              <Star starId={index} marked={index < rating} interactive={false} />
            </button>
          ))}
        </div>

        {/* Error Message */}
        {errors.rating && (
          <p className="mt-1 text-sm text-signal-text">{errors.rating.message}</p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label className={labelClass} htmlFor="review">
          Your Review (Optional)
        </label>
        <textarea
          id="review"
          placeholder="What was it like to use? What would you tell another engineer?"
          rows={3}
          {...register('review')}
          className={inputClass}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting || !rating}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};
