import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '@/components/StarRating';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
test('StarRating component is accessible', async () => {
  const { container } = render(<StarRating rating={3} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

describe('StarRating Component', () => {
  it('renders five stars', () => {
    render(<StarRating rating={3} />);
    expect(screen.getAllByRole('radio').length).toBe(5);
  });

  it('highlights stars correctly based on rating', () => {
    render(<StarRating rating={3} />);
    const stars = screen.getAllByRole('radio');
    expect(stars[2]).toHaveAttribute('aria-checked', 'true');
    expect(stars[4]).toHaveAttribute('aria-checked', 'false');
  });

  it('updates rating when a star is clicked', () => {
    const onRatingChangeMock = jest.fn();
    render(
      <StarRating
        rating={2}
        allowUserInput
        onRatingChange={onRatingChangeMock}
      />,
    );

    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[4]); // Click 5th star
    expect(onRatingChangeMock).toHaveBeenCalledWith(4);
  });

  it('allows keyboard navigation (ArrowLeft, ArrowRight)', () => {
    const onRatingChangeMock = jest.fn();
    render(
      <StarRating
        rating={2}
        allowUserInput
        onRatingChange={onRatingChangeMock}
      />,
    );
    const stars = screen.getAllByRole('radio');

    fireEvent.keyDown(stars[2], { key: 'ArrowRight' });
    expect(onRatingChangeMock).toHaveBeenCalledWith(3);

    fireEvent.keyDown(stars[2], { key: 'ArrowLeft' });
    expect(onRatingChangeMock).toHaveBeenCalledWith(1);
  });
});
