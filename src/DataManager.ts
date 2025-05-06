import { Query, QueryOptions } from './types';

export class DataManager {
  private cache: Map<string, any>;
  private queries: Map<string, Query<any>>;

  constructor() {
    this.cache = new Map();
    this.queries = new Map();
  }

  async fetchData<T>(key: string, queryFn: () => Promise<T>, options?: Partial<QueryOptions<T>>): Promise<T> {
    if (this.queries.has(key)) {
      const existingQuery = this.queries.get(key)!;
      if (existingQuery.promise) {
        return existingQuery.promise;
      }
    }

    const queryOptions: QueryOptions<T> = {
      queryKey: key,
      queryFn: () => queryFn(),
      ...options
    };

    const promise = queryFn();
    const query: Query<T> = {
      queryKey: key,
      state: {
        data: undefined,
        error: null,
        status: 'loading',
        isFetching: true,
        fetchStatus: 'fetching',
        isPaused: false,
        lastUpdated: Date.now(),
        isPlaceholderData: false
      },
      options: queryOptions,
      promise
    };

    this.queries.set(key, query);

    try {
      const data = await promise;
      this.cache.set(key, data);
      this.queries.delete(key);
      return data;
    } catch (error) {
      this.queries.delete(key);
      throw error;
    }
  }

  stopFetching(key: string): void {
    this.queries.delete(key);
  }

  getCachedData<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, data);
  }

  refreshData(key: string): void {
    this.cache.delete(key);
  }
}