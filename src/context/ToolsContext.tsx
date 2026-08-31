import { createContext, useContext, ReactNode, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Tool, { ToolCategory } from '@/data/Tool';

interface IToolsContext {
  tools: Tool[];
  isLoading: boolean;
  isError: boolean;
  category: ToolCategory | null;
  setCategory: (category: ToolCategory | null) => void;
}

const ToolsContext = createContext<IToolsContext | null>(null);

const fetchTools = async (category: ToolCategory | null): Promise<Tool[]> => {
  const url = category ? `/api/tools?category=${category}` : '/api/tools';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tools.');
  }
  return response.json();
};

export const ToolsProvider = ({ children }: { children: ReactNode }) => {
  const [category, setCategory] = useState<ToolCategory | null>(null);

  const {
    data: tools = [],
    isLoading,
    isError,
  } = useQuery<Tool[], Error>({
    queryKey: ['tools', category],
    queryFn: () => fetchTools(category),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  return (
    <ToolsContext.Provider
      value={{ tools, isLoading, isError, category, setCategory }}
    >
      {children}
    </ToolsContext.Provider>
  );
};

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error('useTools must be used within a ToolsProvider');
  }
  return context;
};
