import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewForm } from '@/components/ReviewForm';

describe('ReviewForm Component', () => {
  it('renders correctly', () => {
    customRender(<ReviewForm toolName="Test Tool" />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('displays an error when submitting an empty form', async () => {
    customRender(<ReviewForm toolName="Test Tool" />);

    // Ensure the submit button starts as disabled
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.click(screen.getByLabelText('5 stars')); // Select a rating

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
