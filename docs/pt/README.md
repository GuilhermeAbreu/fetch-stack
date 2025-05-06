# Fetch Stack

Uma biblioteca simples e eficiente para gerenciamento de estado e cache de dados.

## Índice

- [Instalação](#instalação)
- [Uso Básico](#uso-básico)
- [API Reference](#api-reference)
  - [DataManager](#datamanager)
  - [DataOperation](#dataoperation)
  - [Tipos](#tipos)
- [Exemplos](#exemplos)
- [Contribuindo](#contribuindo)

## Instalação

```bash
npm install @guilhermeabreudev/fetch-stack
```

ou

```bash
yarn add @guilhermeabreudev/fetch-stack
```

## Uso Básico

```typescript
import { DataManager, DataOperation } from '@guilhermeabreudev/fetch-stack';

// Criando uma instância do DataManager
const dataManager = new DataManager();

// Criando uma operação
const operation = new DataOperation({
  key: 'user-data',
  fn: async () => {
    const response = await fetch('https://api.example.com/user');
    return response.json();
  }
});

// Executando a operação
const result = await operation.execute();
```

## API Reference

### DataManager

O `DataManager` é responsável por gerenciar o cache e as operações de dados.

#### Métodos

- `fetchData<T>(key: string, fn: () => Promise<T>): Promise<T>`
  - Busca dados com suporte a cache
  - Retorna os dados do cache se disponíveis, caso contrário executa a função

- `stopFetching(key: string): void`
  - Para uma consulta em andamento
  - Útil para cancelar operações longas

- `getCachedData<T>(key: string): T | undefined`
  - Recupera dados do cache
  - Retorna undefined se não houver dados em cache

- `setCachedData<T>(key: string, data: T): void`
  - Define dados no cache
  - Sobrescreve dados existentes

- `refreshData(key: string): void`
  - Limpa dados do cache
  - Força uma nova busca na próxima chamada

### DataOperation

O `DataOperation` gerencia operações individuais de dados.

#### Métodos

- `execute<T>(): Promise<T>`
  - Executa a operação
  - Retorna o resultado da operação

- `reset(): void`
  - Reseta o estado da operação
  - Limpa o cache e o estado atual

- `getState(): State`
  - Retorna o estado atual da operação

#### Callbacks

- `onMutate<T>(callback: (data: T) => void): void`
  - Chamado antes da mutação
  - Útil para atualizações otimistas

- `onSuccess<T>(callback: (data: T) => void): void`
  - Chamado após sucesso da operação
  - Recebe os dados atualizados

- `onError(callback: (error: Error) => void): void`
  - Chamado em caso de erro
  - Recebe o erro ocorrido

- `onSettled<T>(callback: (data: T | undefined, error: Error | undefined) => void): void`
  - Chamado após conclusão da operação
  - Recebe dados ou erro, dependendo do resultado

## Tipos

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

## Exemplos

### Exemplo de Uso com React

```typescript
import { DataManager, DataOperation } from '@guilhermeabreudev/fetch-stack';
import { useState, useEffect } from 'react';

const dataManager = new DataManager();

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const operation = new DataOperation({
      key: `user-${userId}`,
      fn: async () => {
        const response = await fetch(`https://api.example.com/users/${userId}`);
        return response.json();
      }
    });

    operation
      .onSuccess(setUser)
      .onError(setError)
      .execute();
  }, [userId]);

  if (error) return <div>Erro: {error.message}</div>;
  if (!user) return <div>Carregando...</div>;

  return <div>{user.name}</div>;
}
```

### Exemplo de Atualização Otimista

```typescript
const updateUser = new DataOperation({
  key: 'update-user',
  fn: async (newData) => {
    const response = await fetch('https://api.example.com/user', {
      method: 'PUT',
      body: JSON.stringify(newData)
    });
    return response.json();
  }
});

// Atualização otimista
updateUser
  .onMutate((newData) => {
    // Atualiza a UI imediatamente
    setUser(newData);
  })
  .onError((error) => {
    // Reverte a UI em caso de erro
    setUser(previousData);
  })
  .execute(newData);
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

MIT 