# Tipos e Interfaces

## Tipos Básicos

### State

```typescript
type State = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: any;
  error?: Error;
};
```

### Query

```typescript
type Query = {
  key: string;
  fn: () => Promise<any>;
  options?: QueryOptions;
};
```

### Operation

```typescript
type Operation = {
  key: string;
  fn: () => Promise<any>;
  options?: OperationOptions;
};
```

## Opções de Configuração

### QueryOptions

```typescript
interface QueryOptions {
  staleTime?: number;      // Tempo em ms antes dos dados serem considerados stale
  cacheTime?: number;      // Tempo em ms antes dos dados serem removidos do cache
  retry?: number;          // Número de tentativas em caso de erro
  retryDelay?: number;     // Delay entre tentativas em ms
  enabled?: boolean;       // Se a query deve ser executada
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: any, error: Error | undefined) => void;
}
```

### OperationOptions

```typescript
interface OperationOptions {
  onMutate?: (data: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: any, error: Error | undefined) => void;
  optimisticUpdate?: boolean;
}
```

## Tipos de Cache

### CacheEntry

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime?: number;
}
```

### CacheConfig

```typescript
interface CacheConfig {
  maxSize?: number;        // Tamanho máximo do cache
  ttl?: number;           // Time to live em ms
  staleTime?: number;     // Tempo em ms antes dos dados serem considerados stale
}
```

## Tipos de Paginação

### PaginatedData

```typescript
interface PaginatedData<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### PaginationOptions

```typescript
interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
}
```

## Tipos de Erro

### FetchError

```typescript
interface FetchError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
}
```

### RetryError

```typescript
interface RetryError extends Error {
  attempts: number;
  lastError?: Error;
}
```

## Tipos de Callback

### MutationCallback

```typescript
type MutationCallback<T> = (data: T) => void | Promise<void>;
```

### ErrorCallback

```typescript
type ErrorCallback = (error: Error) => void | Promise<void>;
```

### SettledCallback

```typescript
type SettledCallback<T> = (
  data: T | undefined,
  error: Error | undefined
) => void | Promise<void>;
```

## Tipos de Configuração Global

### DataManagerConfig

```typescript
interface DataManagerConfig {
  defaultOptions?: {
    staleTime?: number;
    cacheTime?: number;
    retry?: number;
    retryDelay?: number;
  };
  cache?: CacheConfig;
  devtools?: boolean;
}
```

## Tipos de Eventos

### DataEvent

```typescript
type DataEvent = {
  type: 'fetch' | 'mutate' | 'cache' | 'error';
  key: string;
  timestamp: number;
  data?: any;
  error?: Error;
};
```

### CacheEvent

```typescript
type CacheEvent = {
  type: 'set' | 'get' | 'delete' | 'clear';
  key: string;
  timestamp: number;
  data?: any;
};
```

## Tipos de Utilitários

### DeepPartial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### Nullable

```typescript
type Nullable<T> = T | null | undefined;
```

### PromiseOrValue

```typescript
type PromiseOrValue<T> = T | Promise<T>;
```

## Tipos de Configuração de Desenvolvimento

### DevToolsConfig

```typescript
interface DevToolsConfig {
  enabled: boolean;
  name?: string;
  maxAge?: number;
  trace?: boolean;
  traceLimit?: number;
}
```

## Tipos de Middleware

### Middleware

```typescript
type Middleware = (
  operation: Operation,
  next: () => Promise<any>
) => Promise<any>;
```

### MiddlewareConfig

```typescript
interface MiddlewareConfig {
  before?: Middleware[];
  after?: Middleware[];
  error?: Middleware[];
}
``` 