// utils/api.ts
import axios from 'axios';

export const fetchBookData = async (bookId: string) => {
  const [data1, data2] = await Promise.all([
    axios.get(`http://ip1/api/books/${bookId}`),
    axios.get(`http://ip2/api/details/${bookId}`),
  ]);
  return { ...data1.data, ...data2.data };
};
