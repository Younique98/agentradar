import React from 'react';

interface StarProps {
  starId: number;
  marked: boolean;
  onClick?: (starId: number) => void;
  onKeyDown?: (event: React.KeyboardEvent, starId: number) => void;
  allowUserInput?: boolean;
}

const Star: React.FC<StarProps> = ({
  starId,
  marked,
  onClick,
  onKeyDown,
  allowUserInput,
}) => {
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
