import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from '@/components/SkeletonLoader';

describe('SkeletonLoader Component', () => {
  it('renders the skeleton loader correctly', () => {
    render(<SkeletonLoader />);
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });
});
