import { useState } from 'react';

const useBookContent = () => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookContent = async (bookId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/books/${bookId}.txt`);
      if (!response.ok) {
        throw new Error(`Failed to fetch book content: ${response.statusText}`);
      }
      const text = await response.text();
      setContent(text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return { content, isLoading, error, fetchBookContent };
};

export default useBookContent;
