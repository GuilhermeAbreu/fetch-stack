# Fetch Stack

A simple and efficient library for state management and data caching.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
  - [DataManager](#datamanager)
  - [DataOperation](#dataoperation)
  - [Types](#types)
- [Examples](#examples)
- [Contributing](#contributing)

## Installation

```bash
npm install @guilhermeabreudev/fetch-stack
```

or

```bash
yarn add @guilhermeabreudev/fetch-stack
```

## Basic Usage

```typescript
import { DataManager, DataOperation } from '@guilhermeabreudev/fetch-stack';

// Creating a DataManager instance
const dataManager = new DataManager();

// Creating an operation
const operation = new DataOperation({
  key: 'user-data',
  fn: async () => {
    const response = await fetch('https://api.example.com/user');
    return response.json();
  }
});

// Executing the operation
const result = await operation.execute();
```

## API Reference

### DataManager

The `DataManager` is responsible for managing cache and data operations.

#### Methods

- `fetchData<T>(key: string, fn: () => Promise<T>): Promise<T>`
  - Fetches data with cache support
  - Returns cached data if available, otherwise executes the function

- `stopFetching(key: string): void`
  - Stops an ongoing query
  - Useful for canceling long operations

- `getCachedData<T>(key: string): T | undefined`
  - Retrieves data from cache
  - Returns undefined if no cached data exists

- `setCachedData<T>(key: string, data: T): void`
  - Sets data in cache
  - Overwrites existing data

- `refreshData(key: string): void`
  - Clears cached data
  - Forces a new fetch on next call

### DataOperation

The `DataOperation` manages individual data operations.

#### Methods

- `execute<T>(): Promise<T>`
  - Executes the operation
  - Returns the operation result

- `reset(): void`
  - Resets the operation state
  - Clears cache and current state

- `getState(): State`
  - Returns the current operation state

#### Callbacks

- `onMutate<T>(callback: (data: T) => void): void`
  - Called before mutation
  - Useful for optimistic updates

- `onSuccess<T>(callback: (data: T) => void): void`
  - Called after successful operation
  - Receives updated data

- `onError(callback: (error: Error) => void): void`
  - Called on error
  - Receives the occurred error

- `onSettled<T>(callback: (data: T | undefined, error: Error | undefined) => void): void`
  - Called after operation completion
  - Receives data or error, depending on the result

## Types

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

## Examples

### React Usage Example

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

  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Loading...</div>;

  return <div>{user.name}</div>;
}
```

### Optimistic Update Example

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

// Optimistic update
updateUser
  .onMutate((newData) => {
    // Update UI immediately
    setUser(newData);
  })
  .onError((error) => {
    // Revert UI on error
    setUser(previousData);
  })
  .execute(newData);
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT 