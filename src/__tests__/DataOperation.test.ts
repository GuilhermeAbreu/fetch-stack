import { DataOperation } from '../DataOperation';

interface TestData {
  id: number;
  name: string;
}

describe('DataOperation', () => {
  describe('execute', () => {
    it('deve executar uma operação com sucesso', async () => {
      const mockData: TestData = { id: 1, name: 'Test' };
      const operation = new DataOperation<TestData, Error, string>({
        mutationFn: async (name: string) => ({ id: 1, name })
      });

      const result = await operation.execute('Test');
      expect(result).toEqual(mockData);

      const state = operation.getState();
      expect(state.status).toBe('success');
      expect(state.data).toEqual(mockData);
      expect(state.error).toBeNull();
    });

    it('deve lidar com erros corretamente', async () => {
      const error = new Error('Erro de teste');
      const operation = new DataOperation<any, Error, void>({
        mutationFn: async () => { throw error; }
      });

      await expect(operation.execute()).rejects.toThrow(error);

      const state = operation.getState();
      expect(state.status).toBe('error');
      expect(state.error).toBe(error);
    });

    it('deve executar callbacks na ordem correta', async () => {
      const order: string[] = [];
      const mockData: TestData = { id: 1, name: 'Test' };
      const context = { previousData: null };

      const operation = new DataOperation<TestData, Error, string, typeof context>({
        mutationFn: async (name: string) => {
          order.push('mutate');
          return { id: 1, name };
        },
        onMutate: async () => {
          order.push('onMutate');
          return context;
        },
        onSuccess: async () => {
          order.push('onSuccess');
        },
        onSettled: async () => {
          order.push('onSettled');
        }
      });

      await operation.execute('Test');
      expect(order).toEqual(['onMutate', 'mutate', 'onSuccess', 'onSettled']);
    });

    it('deve executar callbacks de erro na ordem correta', async () => {
      const order: string[] = [];
      const error = new Error('Erro de teste');
      const context = { previousData: null };

      const operation = new DataOperation<any, Error, void, typeof context>({
        mutationFn: async () => {
          order.push('mutate');
          throw error;
        },
        onMutate: async () => {
          order.push('onMutate');
          return context;
        },
        onError: async () => {
          order.push('onError');
        },
        onSettled: async () => {
          order.push('onSettled');
        }
      });

      try {
        await operation.execute();
      } catch {}

      expect(order).toEqual(['onMutate', 'mutate', 'onError', 'onSettled']);
    });

    it('deve passar variáveis e contexto corretamente para os callbacks', async () => {
      const mockData: TestData = { id: 1, name: 'Test Variables' };
      const variables = 'Test Variables';
      const context = { previousData: null };
      let capturedVariables: string | undefined;
      let capturedContext: typeof context | undefined;

      const operation = new DataOperation<TestData, Error, string, typeof context>({
        mutationFn: async (name: string) => ({ id: 1, name }),
        onMutate: async (vars) => {
          capturedVariables = vars;
          return context;
        },
        onSuccess: async (data, vars, ctx) => {
          expect(data).toEqual(mockData);
          expect(vars).toBe(variables);
          expect(ctx).toBe(context);
        }
      });

      await operation.execute(variables);
      expect(capturedVariables).toBe(variables);
    });

    it('deve manter o estado correto durante a execução', async () => {
      const operation = new DataOperation<TestData, Error, string>({
        mutationFn: async (name: string) => {
          const state = operation.getState();
          expect(state.status).toBe('loading');
          expect(state.variables).toBe('Test');
          return { id: 1, name };
        }
      });

      const promise = operation.execute('Test');
      
      let state = operation.getState();
      expect(state.status).toBe('loading');
      expect(state.variables).toBe('Test');

      await promise;

      state = operation.getState();
      expect(state.status).toBe('success');
      expect(state.data).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('reset', () => {
    it('deve resetar o estado da operação', async () => {
      const operation = new DataOperation<any, Error, void>({
        mutationFn: async () => ({ id: 1 })
      });

      await operation.execute();
      operation.reset();

      const state = operation.getState();
      expect(state.status).toBe('idle');
      expect(state.data).toBeUndefined();
      expect(state.error).toBeNull();
      expect(state.variables).toBeUndefined();
      expect(state.context).toBeUndefined();
    });

    it('deve permitir nova execução após reset', async () => {
      const mockData: TestData = { id: 1, name: 'Test 2' };
      const operation = new DataOperation<TestData, Error, string>({
        mutationFn: async (name: string) => ({ id: 1, name })
      });

      await operation.execute('Test 1');
      operation.reset();
      
      const result = await operation.execute('Test 2');
      expect(result).toEqual(mockData);

      const state = operation.getState();
      expect(state.status).toBe('success');
      expect(state.data).toEqual(mockData);
    });
  });

  describe('getState', () => {
    it('deve retornar uma cópia do estado atual', async () => {
      const mockData: TestData = { id: 1, name: 'Test' };
      const operation = new DataOperation<TestData, Error, string>({
        mutationFn: async (name: string) => ({ id: 1, name })
      });

      await operation.execute('Test');
      const state1 = operation.getState();
      const state2 = operation.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2);
    });

    it('deve refletir mudanças no estado', async () => {
      const operation = new DataOperation<TestData, Error, string>({
        mutationFn: async (name: string) => {
          const state1 = operation.getState();
          expect(state1.status).toBe('loading');

          const result = { id: 1, name };

          const state2 = operation.getState();
          expect(state2.status).toBe('loading');
          expect(state2.data).toBeUndefined();

          return result;
        }
      });

      await operation.execute('Test');

      const finalState = operation.getState();
      expect(finalState.status).toBe('success');
      expect(finalState.data).toEqual({ id: 1, name: 'Test' });
    });
  });
}); 