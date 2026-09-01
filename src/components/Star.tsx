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
  size?: 'sm' | 'lg';
}

const SIZE_CLASS: Record<'sm' | 'lg', string> = {
  sm: 'text-base',
  lg: 'text-3xl',
};

const Star: React.FC<StarProps> = ({
  starId,
  marked,
  onClick,
  onKeyDown,
  allowUserInput,
  interactive = true,
  size = 'lg',
}) => {
  const markedClass = marked ? 'text-signal-text' : 'text-ink-muted';

  if (!interactive) {
    return (
      <span
        data-star-id={starId}
        className={`${SIZE_CLASS[size]} ${markedClass}`}
        aria-hidden="true"
      >
        {marked ? '★' : '☆'}
      </span>
    );
  }

  return (
    <span
      data-star-id={starId}
      className={`${SIZE_CLASS[size]} ${markedClass} cursor-pointer`}
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
