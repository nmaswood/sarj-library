import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Author {
  name: string;
}

interface Book {
  id: number;
  title: string;
  authors: Author[];
}

interface UseBookSearchReturn {
  query: string;
  setQuery: (value: string) => void;
  results: Book[];
  loading: boolean;
  error: string | null;
}

// Custom hook for debouncing values
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // Cleanup timeout on value or delay change
    };
  }, [value, delay]);

  return debouncedValue;
};

const useBookSearch = (): UseBookSearchReturn => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300); // Debounce query with a 300ms delay

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://gutendex.com/books?search=${encodeURIComponent(searchQuery)}`
      );
      setResults(response.data.results || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching search results.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      fetchResults(debouncedQuery);
    } else {
      setResults([]); // Clear results if the query is empty
    }
  }, [debouncedQuery, fetchResults]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  };
};

export default useBookSearch;
