import { useState } from 'react';
import axios from 'axios';

interface BookAnalysisData {
  summary: string;
  plot_summary: {
    summary: string;
    arabic: string;
  };
  main_chars: string[];
  sentiment_analysis: string;
  languages: string[];
}

interface BookAnalysisResponse {
  message: string;
  book: {
    id: number;
    title: string;
    aiData: BookAnalysisData;
  };
}

const useBookAnalysis = (bookId: number) => {
  const [data, setData] = useState<BookAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookAnalysis = async () => {
    setLoading(true);
    setError(null); // Reset error state before the request

    try {
      const response = await axios.post<BookAnalysisResponse>('/api/processBook', {
        id: bookId,
      });

      setData(response.data); 
      return response.data;
    } catch (err) {
      setError('Failed to fetch book analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchBookAnalysis,
  };
};

export default useBookAnalysis;
