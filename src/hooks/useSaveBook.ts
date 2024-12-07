import { useState } from 'react';
import axios from 'axios';

export const useSaveBook = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveBook = async (bookData:unknown): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      await axios.post('/api/saveBook', bookData);
      return true;
    } catch (err: unknown) {
      setError('Failed to save the book.');
      console.error('Save error:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveBook, isSaving, error };
};
