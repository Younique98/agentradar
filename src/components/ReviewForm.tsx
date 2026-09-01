import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import Star from './Star';
import { Button } from './Button';
import { useToolDetail } from '@/context/ToolDetailContext';
import { useError } from '@/context/ErrorContext';

type TReviewFormData = {
  author: string;
  rating: number;
  review?: string;
};

interface IReviewForm {
  toolName: string;
}

export const ReviewForm: React.FC<IReviewForm> = ({ toolName }) => {
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
        author: data.author,
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

  return (
    <form
      role="form"
      aria-labelledby="review-form-title"
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 border rounded shadow mb-8 md:w-3/4 mx-auto"
    >
      <h2 id="review-form-title" className="text-lg font-semibold mb-2">
        Review {toolName}
      </h2>

      {/* Author Name */}
      <label className="block mb-2" htmlFor="author">
        <span className="text-sm font-medium">Your Name</span>{' '}
      </label>
      <input
        id="author"
        aria-labelledby="author"
        type="text"
        {...register('author', { required: 'Name is required.' })}
        placeholder="Your name"
        className="border rounded border-gray-300 px-4 py-2 focus:ring-primary-500 focus:border-primary-500 w-full"
      />
      {errors.author && (
        <p className="text-red-500 text-sm">{errors.author.message}</p>
      )}

      {/* Star Rating */}
      <div className="flex flex-col">
        <label htmlFor="rating" className="block text-sm font-medium">
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
          className="flex space-x-2"
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
                'w-8 h-8 flex items-center justify-center rounded-full ',
                rating > index ? 'text-yellow-500' : 'text-gray-400',
              )}
            >
              <Star starId={index} marked={index < rating} interactive={false} />
            </button>
          ))}
        </div>

        {/* Error Message */}
        {errors.rating && (
          <p className="text-red-500 text-sm">{errors.rating.message}</p>
        )}
      </div>

      {/* Review Text */}
      <label>
        <span>Your Review (Optional)</span>
        <textarea
          placeholder="Write your review..."
          {...register('review')}
          className="border rounded-md px-4 py-2 h-24  border-gray-300 focus:ring-primary-500 focus:border-primary-500 w-full"
        />
      </label>
      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !rating}
        className="w-full bg-primary-600 border text-white font-semibold py-3 p-2 rounded-md transition-all hover:bg-primary-700 mt-3 disabled:opacity-200"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};
