import { screen, waitFor } from '@testing-library/react';
import ToolReviews from '@/components/ToolReviews';

const mockToolResponse = {
  tool: {
    id: 1,
    slug: 'test-tool',
    name: 'Test Tool',
    category: 'cli',
    description: 'A tool used for testing.',
    homepage_url: null,
    avg_rating: 4,
    review_count: 2,
  },
  reviews: [
    {
      id: 1,
      tool_id: 1,
      rating: 5,
      review: 'Great tool!',
      author_github_id: 101,
      author_login: 'jane-dev',
    },
    {
      id: 2,
      tool_id: 1,
      rating: 3,
      review: null,
      author_github_id: 102,
      author_login: 'john-dev',
    },
  ],
};

describe('ToolReviews Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockToolResponse),
    });
  });

  it('renders reviews for the tool once loaded', async () => {
    customRender(<ToolReviews />);

    await waitFor(() => {
      expect(screen.getByText('@jane-dev')).toBeInTheDocument();
    });

    expect(screen.getByText('Great tool!')).toBeInTheDocument();
    expect(screen.getByText('@john-dev')).toBeInTheDocument();
    expect(screen.getByText('No written review')).toBeInTheDocument();
  });

  it('renders the review form scoped to the tool name', async () => {
    customRender(<ToolReviews />);

    await waitFor(() => {
      expect(screen.getByText('Review Test Tool')).toBeInTheDocument();
    });
  });
});
