import { FocusManager } from './FocusManager';
import { NetworkManager } from './NetworkManager';
import { NetworkMode, Query, QueryKey, QueryOptions, QueryState } from './types';

export class QueryClient {
  private queries: Map<string, Query<unknown>> = new Map();
  private networkManager: NetworkManager;
  private fetchingQueries: Set<string> = new Set();
  private globalFetchingListeners: Set<(count: number) => void> = new Set();
  private focusManager: FocusManager;
  private refetchOnWindowFocus: boolean;
  private refetchIntervals: Map<string, NodeJS.Timeout> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(options: { refetchOnWindowFocus?: boolean } = {}) {
    this.queries = new Map();
    this.networkManager = new NetworkManager();
    this.fetchingQueries = new Set();
    this.globalFetchingListeners = new Set();
    this.refetchOnWindowFocus = options.refetchOnWindowFocus ?? true;
    this.focusManager = new FocusManager();
    this.refetchIntervals = new Map();

    if (this.refetchOnWindowFocus) {
      this.setupFocusRefetching();
    }
  }

  private setupFocusRefetching() {
    this.focusManager.subscribe((focused) => {
      if (focused) {
        this.queries.forEach(query => {
          if (query.state.status === 'success') {
            this.fetchQuery(query.options);
          }
        });
      }
    });
  }

  private getQueryHash(queryKey: QueryKey): string {
    return Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey);
  }

  private createQueryState<TData>(options: QueryOptions<TData>): QueryState<TData> {
    return {
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

  private shouldPauseQuery(networkMode: NetworkMode = 'online'): boolean {
    if (networkMode === 'online') return false;
    if (networkMode === 'offline') return true;
    return !this.networkManager.isOnline();
  }

  private notifyFetchingListeners(): void {
    const count = this.fetchingQueries.size;
    this.globalFetchingListeners.forEach(listener => listener(count));
  }

  subscribeToFetching(listener: (count: number) => void): () => void {
    this.globalFetchingListeners.add(listener);
    listener(this.fetchingQueries.size);
    return () => this.globalFetchingListeners.delete(listener);
  }

  getFetchingQueriesCount(): number {
    return this.fetchingQueries.size;
  }

  private setupRefetchInterval<TData>(queryHash: string, options: QueryOptions<TData>): void {
    this.clearRefetchInterval(queryHash);

    if (options.refetchInterval && options.refetchInterval > 0) {
      const interval = setInterval(() => {
        if (!this.fetchingQueries.has(queryHash)) {
          this.fetchQuery(options).catch(console.error);
        }
      }, options.refetchInterval);

      this.refetchIntervals.set(queryHash, interval);
    }
  }

  private clearRefetchInterval(queryHash: string): void {
    const existingInterval = this.refetchIntervals.get(queryHash);
    if (existingInterval) {
      clearInterval(existingInterval);
      this.refetchIntervals.delete(queryHash);
    }
  }

  async fetchQuery<TData>(options: QueryOptions<TData>): Promise<TData> {
    const queryHash = this.getQueryHash(options.queryKey);
    let query = this.queries.get(queryHash) as Query<TData> | undefined;

    this.setupRefetchInterval(queryHash, options);

    if (!query) {
      query = {
        queryKey: options.queryKey,
        state: this.createQueryState(options),
        options,
      };
      this.queries.set(queryHash, query);
    }

    if (query.state.status === 'loading' && query.promise) {
      return query.promise;
    }

    const shouldPause = this.shouldPauseQuery(options.networkMode);
    if (shouldPause) {
      query.state.fetchStatus = 'paused';
      query.state.isPaused = true;
      throw new Error('Query pausada: sem conexão com a rede');
    }

    if (options.placeholderData && !query.state.isPlaceholderData) {
      query.state.data = options.placeholderData;
      query.state.isPlaceholderData = true;
    }

    const abortController = new AbortController();
    this.abortControllers.set(queryHash, abortController);

    this.fetchingQueries.add(queryHash);
    this.notifyFetchingListeners();

    query.state.status = 'loading';
    query.state.isFetching = true;
    query.state.fetchStatus = 'fetching';
    query.state.isPaused = false;

    try {
      query.promise = options.queryFn({ signal: abortController.signal });
      const data = await query.promise;
      
      query.state = {
        ...query.state,
        data,
        status: 'success',
        lastUpdated: Date.now(),
        isPlaceholderData: false,
        fetchStatus: 'idle',
        isFetching: false,
        error: null
      };
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Query cancelada:', queryHash);
      }

      query.state = {
        ...query.state,
        error: error as Error,
        status: 'error',
        fetchStatus: 'idle',
        isFetching: false
      };
      throw error;
    } finally {
      this.fetchingQueries.delete(queryHash);
      this.notifyFetchingListeners();
      this.abortControllers.delete(queryHash);
    }
  }

  async fetchQueriesInParallel<TData>(queries: QueryOptions<TData>[]): Promise<TData[]> {
    return Promise.all(queries.map(query => this.fetchQuery(query)));
  }

  getQueryData<TData>(queryKey: QueryKey): TData | undefined {
    const queryHash = this.getQueryHash(queryKey);
    const query = this.queries.get(queryHash) as Query<TData> | undefined;
    return query?.state.data;
  }

  getQueryState<TData>(queryKey: QueryKey): QueryState<TData> | undefined {
    const queryHash = this.getQueryHash(queryKey);
    const query = this.queries.get(queryHash) as Query<TData> | undefined;
    return query?.state;
  }

  setQueryData<TData>(queryKey: QueryKey, data: TData): void {
    const queryHash = this.getQueryHash(queryKey);
    const query = this.queries.get(queryHash) as Query<TData> | undefined;

    if (query) {
      query.state.data = data;
      query.state.lastUpdated = Date.now();
      query.state.isPlaceholderData = false;
    }
  }

  invalidateQueries(options: { queryKey: QueryKey }): void {
    const queryHash = this.getQueryHash(options.queryKey);
    const query = this.queries.get(queryHash);
    
    if (query) {
      this.queries.delete(queryHash);
      this.clearRefetchInterval(queryHash);
      this.fetchQuery(query.options).catch(console.error);
    }
  }

  mockOffline(): void {
    this.networkManager.mockOffline();
  }

  mockOnline(): void {
    this.networkManager.mockOnline();
  }

  public setRefetchOnWindowFocus(enabled: boolean) {
    this.refetchOnWindowFocus = enabled;
    if (enabled) {
      this.setupFocusRefetching();
    }
  }

  public setWindowFocused(focused: boolean) {
    this.focusManager.setFocused(focused);
  }

  public cleanup() {
    this.refetchIntervals.forEach(interval => clearInterval(interval));
    this.refetchIntervals.clear();
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  async cancelQueries(options: { queryKey: QueryKey }): Promise<void> {
    const queryHash = this.getQueryHash(options.queryKey);
    const controller = this.abortControllers.get(queryHash);
    
    if (controller) {
      controller.abort();
      this.abortControllers.delete(queryHash);
    }
  }
} 