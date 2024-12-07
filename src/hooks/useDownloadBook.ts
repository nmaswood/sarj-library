import { useState } from 'react';
import axios from 'axios';

export const useDownloadBook = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadBook = async (bookId: number, title: string): Promise<boolean> => {
    setIsDownloading(true);
    setError(null);

    try {
      await axios.post('/api/downloadBook', { bookId, title });
      return true;
    } catch (err: any) {
      setError('Failed to download and save the book.');
      console.error('Error:', err);
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadBook, isDownloading, error };
};
