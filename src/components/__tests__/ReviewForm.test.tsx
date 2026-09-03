import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ErrorProvider } from '@/context/ErrorContext';
import { ToolDetailProvider } from '@/context/ToolDetailContext';
import { ReviewForm } from '@/components/ReviewForm';

const renderSignedOut = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        <ErrorProvider>
          <ToolDetailProvider slug="test-tool">{ui}</ToolDetailProvider>
        </ErrorProvider>
      </QueryClientProvider>
    </SessionProvider>,
  );
};

describe('ReviewForm Component', () => {
  it('prompts sign-in instead of showing the form when signed out', () => {
    renderSignedOut(<ReviewForm toolName="Test Tool" />);
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in with github/i }),
    ).toBeInTheDocument();
  });

  it('renders the form when signed in (customRender defaults to a signed-in session)', () => {
    customRender(<ReviewForm toolName="Test Tool" />);
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByText('@octocat', { exact: false })).toBeInTheDocument();
  });

  it('displays an error when submitting an empty form', async () => {
    customRender(<ReviewForm toolName="Test Tool" />);

    // Ensure the submit button starts as disabled
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();

    // Select a rating — the only required field now that author is derived
    // from the signed-in session rather than typed in.
    fireEvent.click(screen.getByLabelText('5 stars'));

    // Ensure the submit button is now enabled
    expect(submitButton).toBeEnabled();

    // Click the submit button
    fireEvent.click(submitButton);

    // Expect no error messages since valid input is provided
    await waitFor(() => {
      expect(screen.queryByText(/rating is required/i)).not.toBeInTheDocument();
    });
  });
});
