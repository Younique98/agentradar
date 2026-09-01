import React from 'react';

interface StarProps {
  starId: number;
  marked: boolean;
  onClick?: (starId: number) => void;
  onKeyDown?: (event: React.KeyboardEvent, starId: number) => void;
  allowUserInput?: boolean;
  // False when a parent element (e.g. ReviewForm's <button role="radio">)
  // already owns the interactive/radio semantics - rendering Star as
  // interactive too would nest a second focusable control inside the
  // first, which is invalid and confusing for keyboard/screen-reader
  // users. Defaults to true for StarRating's standalone usage, where
  // this span IS the interactive control.
  interactive?: boolean;
}

const Star: React.FC<StarProps> = ({
  starId,
  marked,
  onClick,
  onKeyDown,
  allowUserInput,
  interactive = true,
}) => {
  if (!interactive) {
    return (
      <span data-star-id={starId} className="text-3xl" aria-hidden="true">
        {marked ? '★' : '☆'}
      </span>
    );
  }

  return (
    <span
      data-star-id={starId}
      className="text-3xl cursor-pointer text-primary-600"
      role="radio"
      aria-checked={marked}
      tabIndex={allowUserInput ? 0 : -1}
      onClick={allowUserInput ? () => onClick?.(starId) : undefined}
      onKeyDown={
        allowUserInput ? event => onKeyDown?.(event, starId) : undefined
      }
    >
      {marked ? '★' : '☆'}
    </span>
  );
};

Star.displayName = 'Star';
export default Star;
