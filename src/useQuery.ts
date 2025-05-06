import { QueryClient } from './QueryClient';
import { QueryOptions, QueryState } from './types';

export class QueryObserver<TData = unknown> {
  private queryClient: QueryClient;
  private options: QueryOptions<TData>;
  private state: QueryState<TData>;
  private listeners: Set<(state: QueryState<TData>) => void> = new Set();

  constructor(queryClient: QueryClient, options: QueryOptions<TData>) {
    this.queryClient = queryClient;
    this.options = options;
    this.state = {
      data: options.initialData,
      error: null,
      status: options.initialData ? 'success' : 'idle',
      isFetching: false,
      fetchStatus: 'idle',
      isPaused: false,
      lastUpdated: options.initialData ? Date.now() : 0,
      isPlaceholderData: false
    };
  }

  subscribe(listener: (state: QueryState<TData>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  async fetch(): Promise<TData> {
    try {
      if (this.options.placeholderData && !this.state.isPlaceholderData) {
        this.state = {
          ...this.state,
          data: this.options.placeholderData,
          isPlaceholderData: true
        };
        this.notifyListeners();
      }

      const data = await this.queryClient.fetchQuery<TData>(this.options);
      this.state = {
        ...this.state,
        data,
        status: 'success',
        lastUpdated: Date.now(),
        isPlaceholderData: false,
        fetchStatus: 'idle',
        isPaused: false
      };
      this.notifyListeners();
      return data;
    } catch (error) {
      this.state = {
        ...this.state,
        error: error as Error,
        status: 'error',
        isPlaceholderData: false,
        fetchStatus: error instanceof Error && error.message.includes('pausada') ? 'paused' : 'idle',
        isPaused: error instanceof Error && error.message.includes('pausada')
      };
      this.notifyListeners();
      throw error;
    }
  }

  getState(): QueryState<TData> {
    return this.state;
  }
}

export function useQuery<TData = unknown>(
  queryClient: QueryClient,
  options: QueryOptions<TData>
): QueryObserver<TData> {
  return new QueryObserver(queryClient, options);
} 