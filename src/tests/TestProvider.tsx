import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorProvider } from '@/context/ErrorContext';
import { ToolDetailProvider } from '@/context/ToolDetailContext';

const queryClient = new QueryClient();

export const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ErrorProvider>
      <ToolDetailProvider slug="test-tool">{children}</ToolDetailProvider>
    </ErrorProvider>
  </QueryClientProvider>
);
