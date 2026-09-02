import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorProvider } from '@/context/ErrorContext';
import { ToolDetailProvider } from '@/context/ToolDetailContext';

const queryClient = new QueryClient();

// Defaults every test to a signed-in session so existing form-interaction
// tests don't all need to know about auth. Tests that specifically need
// the signed-out state pass their own <SessionProvider session={null}>
// wrapper instead of using customRender (see ReviewForm.test.tsx).
const testSession = {
  user: { githubId: 1, githubLogin: 'octocat', name: 'octocat' },
  expires: '2099-01-01T00:00:00.000Z',
};

export const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={testSession}>
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <ToolDetailProvider slug="test-tool">{children}</ToolDetailProvider>
      </ErrorProvider>
    </QueryClientProvider>
  </SessionProvider>
);
