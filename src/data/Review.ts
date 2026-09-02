type Review = {
  id: number;
  tool_id: number;
  rating: number;
  review: string | null;
  author_github_id: number;
  author_login: string;
};

export default Review;
