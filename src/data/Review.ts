type Review = {
  id: number;
  tool_id: number;
  rating: number;
  review: string | null;
  author_github_id: number;
  author_login: string;
  // True when the reviewer was on the Premium plan at submission time —
  // featured reviews sort first in the listing (see ToolReviews.tsx).
  // Optional so older API responses/mocks without the column still typecheck.
  featured?: boolean;
};

export default Review;
