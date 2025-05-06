export type QueryKey = string | number | Array<string | number>;

export type NetworkMode = 'online' | 'offline';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export type FetchStatus = 'fetching' | 'paused' | 'idle';

export interface QueryFunctionContext {
  signal?: AbortSignal;
}

export interface QueryOptions<TData> {
  queryKey: QueryKey;
  queryFn: (context: QueryFunctionContext) => Promise<TData>;
  initialData?: TData;
  placeholderData?: TData;
  refetchInterval?: number;
  networkMode?: NetworkMode;
}

export interface QueryState<TData> {
  data: TData | undefined;
  error: Error | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  isFetching: boolean;
  fetchStatus: FetchStatus;
  isPaused: boolean;
  lastUpdated: number;
  isPlaceholderData: boolean;
}

export interface PaginatedData<TData> {
  items: TData[];
  nextPage: number | null;
  previousPage: number | null;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedQueryOptions<TData> extends QueryOptions<PaginatedData<TData>> {
  page: number;
  pageSize: number;
  keepPreviousData?: boolean;
}

export interface Query<TData> {
  queryKey: QueryKey;
  state: QueryState<TData>;
  options: QueryOptions<TData>;
  promise?: Promise<TData>;
}

export interface MutationState<TData, TError = Error, TVariables = unknown, TContext = unknown> {
  status: 'idle' | 'loading' | 'success' | 'error';
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: TData;
  error: TError | null;
  variables?: TVariables;
  context?: TContext;
}

export interface OperationState<TData, TError, TVariables, TContext> {
  status: QueryStatus;
  data: TData | undefined;
  error: TError | null;
  variables: TVariables | undefined;
  context: TContext | undefined;
}

export interface OperationOptions<TData, TError, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => Promise<TContext>;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => Promise<void>;
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined
  ) => Promise<void>;
}

export interface DataFetchOptions<T> {
  queryKey: string[];
  queryFn: (context: { signal?: AbortSignal }) => Promise<T>;
  initialData?: T;
  refetchInterval?: number;
  networkMode?: NetworkMode;
}

export interface MutationOptions<TData, TError = Error, TVariables = unknown, TContext = unknown> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => Promise<TContext>;
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => Promise<void>;
  onError?: (error: TError, variables: TVariables, context: TContext) => Promise<void>;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext) => Promise<void>;
  retry?: boolean | number;
} 