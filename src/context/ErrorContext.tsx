import { createContext, useContext, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface ErrorContextType {
  setError: (error: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const showError = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  return (
    <ErrorContext.Provider value={{ setError: showError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
