# Exemplos Detalhados

## Gerenciamento de Cache

### Cache Básico

```typescript
import { DataManager } from '@guilhermeabreudev/fetch-stack';

const dataManager = new DataManager();

// Buscando dados com cache
const userData = await dataManager.fetchData('user-123', async () => {
  const response = await fetch('https://api.example.com/users/123');
  return response.json();
});

// Os dados serão cacheados automaticamente
// Próximas chamadas usarão o cache
const cachedData = await dataManager.fetchData('user-123', async () => {
  // Esta função não será executada se houver cache
  return null;
});
```

### Invalidação de Cache

```typescript
// Limpando cache específico
dataManager.refreshData('user-123');

// Forçando nova busca
const freshData = await dataManager.fetchData('user-123', async () => {
  const response = await fetch('https://api.example.com/users/123');
  return response.json();
});
```

## Operações de Mutação

### Atualização Básica

```typescript
import { DataOperation } from '@guilhermeabreudev/fetch-stack';

const updateUser = new DataOperation({
  key: 'update-user',
  fn: async (userData) => {
    const response = await fetch('https://api.example.com/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
});

// Executando a atualização
const result = await updateUser.execute({
  name: 'Novo Nome',
  email: 'novo@email.com',
});
```

### Atualização com Callbacks

```typescript
const updateUser = new DataOperation({
  key: 'update-user',
  fn: async (userData) => {
    const response = await fetch('https://api.example.com/users', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.json();
  },
});

updateUser
  .onMutate((newData) => {
    console.log('Iniciando mutação:', newData);
  })
  .onSuccess((data) => {
    console.log('Sucesso:', data);
  })
  .onError((error) => {
    console.error('Erro:', error);
  })
  .onSettled((data, error) => {
    console.log('Operação finalizada:', { data, error });
  })
  .execute(newData);
```

## Integração com React

### Hook Personalizado

```typescript
import { useState, useEffect } from 'react';
import { DataOperation } from '@guilhermeabreudev/fetch-stack';

function useDataOperation<T>(operation: DataOperation) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    operation
      .onMutate(() => setIsLoading(true))
      .onSuccess((newData) => {
        setData(newData);
        setError(null);
      })
      .onError((newError) => {
        setError(newError);
        setData(null);
      })
      .onSettled(() => setIsLoading(false))
      .execute();

    return () => {
      operation.reset();
    };
  }, [operation]);

  return { data, error, isLoading };
}

// Uso do hook
function UserProfile({ userId }: { userId: string }) {
  const operation = new DataOperation({
    key: `user-${userId}`,
    fn: async () => {
      const response = await fetch(`https://api.example.com/users/${userId}`);
      return response.json();
    },
  });

  const { data, error, isLoading } = useDataOperation(operation);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

### Gerenciamento de Estado Global

```typescript
import { DataManager } from '@guilhermeabreudev/fetch-stack';
import { createContext, useContext } from 'react';

const DataContext = createContext<DataManager | null>(null);

function DataProvider({ children }: { children: React.ReactNode }) {
  const dataManager = new DataManager();

  return (
    <DataContext.Provider value={dataManager}>
      {children}
    </DataContext.Provider>
  );
}

function useDataManager() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataManager deve ser usado dentro de um DataProvider');
  }
  return context;
}

// Uso em componentes
function UserList() {
  const dataManager = useDataManager();

  const fetchUsers = async () => {
    return dataManager.fetchData('users', async () => {
      const response = await fetch('https://api.example.com/users');
      return response.json();
    });
  };

  // ... resto do componente
}
```

## Tratamento de Erros

### Retry com Backoff

```typescript
import { DataOperation } from '@guilhermeabreudev/fetch-stack';

const operation = new DataOperation({
  key: 'retry-operation',
  fn: async () => {
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        const response = await fetch('https://api.example.com/data');
        return response.json();
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => 
            setTimeout(resolve, (3 - retries) * 1000)
          );
        }
      }
    }

    throw lastError;
  },
});

// Executando com retry
try {
  const result = await operation.execute();
  console.log('Sucesso após retries:', result);
} catch (error) {
  console.error('Falha após todas as tentativas:', error);
}
```

## Paginação

### Implementação de Paginação

```typescript
import { DataManager } from '@guilhermeabreudev/fetch-stack';

const dataManager = new DataManager();

interface PaginatedData<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

async function fetchPaginatedData<T>(
  page: number,
  pageSize: number
): Promise<PaginatedData<T>> {
  return dataManager.fetchData(
    `paginated-data-${page}-${pageSize}`,
    async () => {
      const response = await fetch(
        `https://api.example.com/data?page=${page}&pageSize=${pageSize}`
      );
      return response.json();
    }
  );
}

// Uso
const firstPage = await fetchPaginatedData(1, 10);
console.log('Primeira página:', firstPage);

// Próxima página
const secondPage = await fetchPaginatedData(2, 10);
console.log('Segunda página:', secondPage);
```

## Cache com TTL (Time To Live)

### Implementação de Cache com Expiração

```typescript
import { DataManager } from '@guilhermeabreudev/fetch-stack';

class CacheManager extends DataManager {
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) { // 5 minutos padrão
    super();
    this.ttl = ttl;
  }

  async fetchDataWithTTL<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const cachedData = this.getCachedData<{ data: T; timestamp: number }>(key);
    
    if (cachedData && Date.now() - cachedData.timestamp < this.ttl) {
      return cachedData.data;
    }

    const data = await fn();
    this.setCachedData(key, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }
}

// Uso
const cacheManager = new CacheManager(60 * 1000); // 1 minuto de TTL

const data = await cacheManager.fetchDataWithTTL('temporary-data', async () => {
  const response = await fetch('https://api.example.com/temp-data');
  return response.json();
});
``` 