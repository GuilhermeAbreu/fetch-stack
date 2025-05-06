import { DataManager } from '../DataManager';
import { DataFetchOptions } from '../types';

interface TestData {
  id: number;
  name: string;
}

describe('DataManager', () => {
  let dataManager: DataManager;

  beforeEach(() => {
    dataManager = new DataManager();
  });

  describe('fetchData', () => {
    it('deve buscar dados com sucesso', async () => {
      const mockData: TestData = { id: 1, name: 'Test' };
      const key = 'test';
      const options: DataFetchOptions<TestData> = {
        queryKey: [key],
        queryFn: async () => mockData
      };

      const result = await dataManager.fetchData(key, () => options.queryFn({}));
      expect(result).toEqual(mockData);
    });

    it('deve retornar dados do cache se já estiver buscando', async () => {
      let callCount = 0;
      const mockData: TestData = { id: 1, name: 'Test' };
      const key = 'test';
      const options: DataFetchOptions<TestData> = {
        queryKey: [key],
        queryFn: async () => {
          callCount++;
          return mockData;
        }
      };

      const promise1 = dataManager.fetchData(key, () => options.queryFn({}));
      const promise2 = dataManager.fetchData(key, () => options.queryFn({}));

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      expect(callCount).toBe(1);
    });

    it('deve lidar com erros corretamente', async () => {
      const error = new Error('Erro de teste');
      const key = 'test';
      const options: DataFetchOptions<any> = {
        queryKey: [key],
        queryFn: async () => { throw error; }
      };

      await expect(dataManager.fetchData(key, () => options.queryFn({}))).rejects.toThrow(error);
    });

    it('deve permitir múltiplas buscas com chaves diferentes', async () => {
      const mockData1: TestData = { id: 1, name: 'Test 1' };
      const mockData2: TestData = { id: 2, name: 'Test 2' };
      const key1 = 'test1';
      const key2 = 'test2';
      
      const options1: DataFetchOptions<TestData> = {
        queryKey: [key1],
        queryFn: async () => mockData1
      };
      
      const options2: DataFetchOptions<TestData> = {
        queryKey: [key2],
        queryFn: async () => mockData2
      };

      const [result1, result2] = await Promise.all([
        dataManager.fetchData(key1, () => options1.queryFn({})),
        dataManager.fetchData(key2, () => options2.queryFn({}))
      ]);

      expect(result1).toEqual(mockData1);
      expect(result2).toEqual(mockData2);
    });

    it('deve manter dados no cache após a busca', async () => {
      const mockData: TestData = { id: 1, name: 'Test' };
      const key = 'test';
      
      await dataManager.fetchData(key, async () => mockData);

      const cachedData = dataManager.getCachedData<TestData>(key);
      expect(cachedData).toEqual(mockData);

      const error = new Error('Erro de teste');
      try {
        await dataManager.fetchData(key, async () => { throw error; });
      } catch {}

      const cachedDataAfterError = dataManager.getCachedData<TestData>(key);
      expect(cachedDataAfterError).toEqual(mockData);
    });
  });

  describe('stopFetching', () => {
    it('deve parar uma busca em andamento', async () => {
      const key = 'test';
      await dataManager.stopFetching(key);
      const cachedData = dataManager.getCachedData(key);
      expect(cachedData).toBeUndefined();
    });

    it('deve limpar a query do mapa de queries em andamento', async () => {
      const key = 'test';
      const mockData: TestData = { id: 1, name: 'Test' };
      
      const fetchPromise = dataManager.fetchData(key, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockData;
      });

      await dataManager.stopFetching(key);
      await fetchPromise;

      let callCount = 0;
      await dataManager.fetchData(key, async () => {
        callCount++;
        return mockData;
      });

      expect(callCount).toBe(1);
    });
  });

  describe('getCachedData', () => {
    it('deve retornar dados do cache', async () => {
      const mockData: TestData = { id: 1, name: 'Test' };
      const key = 'test';

      await dataManager.fetchData(key, async () => mockData);

      const cachedData = dataManager.getCachedData<TestData>(key);
      expect(cachedData).toEqual(mockData);
    });

    it('deve retornar undefined para dados não cacheados', () => {
      const cachedData = dataManager.getCachedData('nonexistent');
      expect(cachedData).toBeUndefined();
    });

    it('deve retornar undefined após limpar o cache', async () => {
      const mockData: TestData = { id: 1, name: 'Test' };
      const key = 'test';

      await dataManager.fetchData(key, async () => mockData);

      await dataManager.refreshData(key);
      const cachedData = dataManager.getCachedData<TestData>(key);
      expect(cachedData).toBeUndefined();
    });
  });

  describe('setCachedData', () => {
    it('deve definir dados no cache', () => {
      const mockData: TestData = { id: 1, name: 'Test' };
      const key = 'test';

      dataManager.setCachedData(key, mockData);
      const cachedData = dataManager.getCachedData<TestData>(key);
      expect(cachedData).toEqual(mockData);
    });

    it('deve sobrescrever dados existentes no cache', () => {
      const key = 'test';
      const mockData1: TestData = { id: 1, name: 'Test 1' };
      const mockData2: TestData = { id: 2, name: 'Test 2' };

      dataManager.setCachedData(key, mockData1);
      dataManager.setCachedData(key, mockData2);

      const cachedData = dataManager.getCachedData<TestData>(key);
      expect(cachedData).toEqual(mockData2);
    });
  });

  describe('refreshData', () => {
    it('deve limpar dados do cache', async () => {
      const mockData: TestData = { id: 1, name: 'Test' };
      const key = 'test';

      await dataManager.fetchData(key, async () => mockData);

      await dataManager.refreshData(key);
      const cachedData = dataManager.getCachedData(key);
      expect(cachedData).toBeUndefined();
    });

    it('não deve afetar outras chaves no cache', async () => {
      const mockData1: TestData = { id: 1, name: 'Test 1' };
      const mockData2: TestData = { id: 2, name: 'Test 2' };
      const key1 = 'test1';
      const key2 = 'test2';

      await dataManager.fetchData(key1, async () => mockData1);
      await dataManager.fetchData(key2, async () => mockData2);

      await dataManager.refreshData(key1);

      const cachedData1 = dataManager.getCachedData<TestData>(key1);
      const cachedData2 = dataManager.getCachedData<TestData>(key2);

      expect(cachedData1).toBeUndefined();
      expect(cachedData2).toEqual(mockData2);
    });
  });
}); 