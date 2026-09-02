import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
} from '@tanstack/react-query';
import Tool from '@/data/Tool';
import Review from '@/data/Review';
import { useError } from '@/context/ErrorContext';

interface ToolDetailResponse {
  tool: Tool;
  reviews: Review[];
}

interface NewReview {
  rating: number;
  review?: string;
}

interface IToolDetailContext {
  tool: Tool | null;
  reviews: Review[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  hasMoreReviews: boolean;
  page: number;
  nextPage: () => void;
  prevPage: () => void;
  submitReview: UseMutationResult<any, Error, NewReview, any>;
}

const ToolDetailContext = createContext<IToolDetailContext | null>(null);

const PAGE_SIZE = 10;

const fetchTool = async (
  slug: string,
  page: number,
): Promise<ToolDetailResponse> => {
  const response = await fetch(
    `/api/tools/${slug}?page=${page}&pageSize=${PAGE_SIZE}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch tool.');
  }
  return response.json();
};

export const ToolDetailProvider = ({
  slug,
  initialData,
  children,
}: {
  slug: string;
  initialData?: ToolDetailResponse;
  children: ReactNode;
}) => {
  const { setError } = useError();
  const [page, setPage] = useState<number>(1);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useQuery<ToolDetailResponse, Error>({
    queryKey: ['tool', slug, page],
    queryFn: () => fetchTool(slug, page),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    initialData: page === 1 ? initialData : undefined,
  });

  const reviews = data?.reviews ?? [];
  const tool = data?.tool ?? null;

  const nextPage = useCallback(() => {
    if (reviews.length === PAGE_SIZE) {
      setPage(prev => prev + 1);
    }
  }, [reviews.length]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const submitReview = useMutation({
    mutationFn: async (newReview: NewReview) => {
      try {
        const response = await fetch(`/api/tools/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReview),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit review.');
        }
        return response.json();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Something went wrong while submitting the review.';
        setError(errorMessage);
        throw error;
      }
    },
    onSuccess: () => {
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ['tool', slug] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  const hasMoreReviews = reviews.length === PAGE_SIZE;

  return (
    <ToolDetailContext.Provider
      value={{
        tool,
        reviews,
        isLoading,
        isError,
        isFetching,
        hasMoreReviews,
        page,
        nextPage,
        prevPage,
        submitReview,
      }}
    >
      {children}
    </ToolDetailContext.Provider>
  );
};

export const useToolDetail = () => {
  const context = useContext(ToolDetailContext);
  if (!context) {
    throw new Error('useToolDetail must be used within a ToolDetailProvider');
  }
  return context;
};
