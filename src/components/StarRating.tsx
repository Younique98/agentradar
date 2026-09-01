import { useEffect, useId, useState } from 'react';
import Star from '@/components/Star';

interface StarRatingProps {
  rating: number;
  onRatingSelect?: (rating: number) => void;
  allowUserInput?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  allowUserInput = false,
  onRatingChange,
  size = 'lg',
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(rating);
  // Every rendered instance (the tool detail page's own average-rating
  // display, plus one per review card) previously hardcoded the same
  // "rating"/"rating-label" ids - invalid duplicate HTML ids as soon as
  // more than one instance is on the page, which is the normal case.
  const labelId = useId();

  // In read-only mode the `rating` prop is the sole source of truth, so
  // keep local state in sync as it changes (e.g. after a new review
  // shifts the average). In editable mode this would clobber the user's
  // in-progress selection, so it's skipped there.
  useEffect(() => {
    if (!allowUserInput) {
      setSelectedRating(rating);
    }
  }, [rating, allowUserInput]);

  const handleRatingChange = (starId: number) => {
    if (!allowUserInput) return;
    setSelectedRating(starId);
    if (onRatingChange) {
      onRatingChange(starId);
    }
  };

  // TODO: (ET) clean up this function
  const handleKeyDown = (event: React.KeyboardEvent, starId: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleRatingChange(starId);
    }
    if (event.key === 'ArrowRight' && starId < 5) {
      handleRatingChange(starId + 1);
      document.getElementById(`star-${starId + 1}`)?.focus();
    }
    if (event.key === 'ArrowLeft' && starId > 1) {
      handleRatingChange(starId - 1);
      document.getElementById(`star-${starId - 1}`)?.focus();
    }
  };

  return (
    <section className="flex items-center" aria-labelledby={labelId}>
      <h2 id={labelId} className="sr-only">
        {allowUserInput ? 'Select a star rating' : 'User rating'}
      </h2>
      <div role="radiogroup" aria-labelledby={labelId}>
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            starId={index}
            marked={index < selectedRating}
            allowUserInput={allowUserInput}
            onKeyDown={handleKeyDown}
            onClick={handleRatingChange}
            size={size}
          />
        ))}
      </div>
      {allowUserInput && (
        <input
          type="submit"
          className="mt-10 h-10 px-6 font-semibold rounded-md bg-black text-white"
          value="Submit review"
          disabled={selectedRating === 0}
        />
      )}
    </section>
  );
};

StarRating.displayName = 'StarRating';
export default StarRating;
