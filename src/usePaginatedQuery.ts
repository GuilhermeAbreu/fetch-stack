import { QueryClient } from "./QueryClient";
import { PaginatedData } from "./types";

export interface PaginatedQueryOptions<TData> {
  queryKey: string[];
  queryFn: () => Promise<PaginatedData<TData>>;
  page: number;
  pageSize: number;
  keepPreviousData?: boolean;
}

export function usePaginatedQuery<TData>(
  queryClient: QueryClient,
  options: PaginatedQueryOptions<TData>,
) {
  let currentState: PaginatedData<TData> | undefined;
  let status: "idle" | "loading" | "error" | "success" = "idle";
  let error: Error | null = null;
  let totalPages = 0;

  const updateState = (newState: PaginatedData<TData>) => {
    currentState = newState;
    status = "success";
    totalPages = newState.totalPages;
  };

  const fetch = async () => {
    try {
      status = "loading";
      const result = await options.queryFn();
      updateState(result);
      return result;
    } catch (e) {
      status = "error";
      error = e instanceof Error ? e : new Error("Erro desconhecido");
      throw error;
    }
  };

  const fetchNextPage = async () => {
    if (!currentState?.nextPage) {
      throw new Error("Não há próxima página");
    }
    options.page = currentState.nextPage;
    return fetch();
  };

  const fetchPreviousPage = async () => {
    if (!currentState?.previousPage) {
      throw new Error("Não há página anterior");
    }
    options.page = currentState.previousPage;
    return fetch();
  };

  return {
    fetch,
    fetchNextPage,
    fetchPreviousPage,
    data: currentState,
    status,
    error,
    totalPages,
  };
}
