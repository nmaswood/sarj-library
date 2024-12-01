import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const useDeleteBook = () => {
  return useMutation({
    mutationFn: async (bookId: number) => {
      await axios.delete('/api/deleteBook', {
        data: { id: bookId},
      });
    },
    onError: (error: unknown) => {
      console.error('Error deleting book:', error);
    },
  });
};

export default useDeleteBook;
