import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import CONFIG from '../config/config';

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

const fetcher = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
  return response.json();
};

const useFetchData = <T>(
  endpoint: string,
  options?: FetchOptions,
  queryOptions?: UseQueryOptions<T>
): UseQueryResult<T> & { refetch: () => void } => {
  const queryResult = useQuery<T>({
    queryKey: [endpoint],
    queryFn: () => fetcher<T>(endpoint, options),
    ...queryOptions,
  });

  return queryResult;
};

export default useFetchData;
