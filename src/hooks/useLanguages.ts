import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

export interface Language {
  code: string;
  language: string;
}

const fetcher = async <T>(endpoint: string): Promise<T> => {
  const response = await axios.get<T>(endpoint);
  return response.data;
};

const useLanguages = (
  queryOptions?: UseQueryOptions<Language[]>
): UseQueryResult<Language[]> => {
  const queryResult = useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: () => fetcher<Language[]>('/api/languages'),
    ...queryOptions,
  });

  return queryResult;
};

export default useLanguages;
