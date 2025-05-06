import { QueryClient } from './QueryClient';
import { useQuery } from './useQuery';

async function main() {
  const queryClient = new QueryClient();

  const initialUser = {
    id: 1,
    name: 'Usuário Inicial',
    email: 'inicial@exemplo.com'
  };

  const placeholderUser = {
    id: 1,
    name: 'Carregando...',
    email: 'carregando@exemplo.com'
  };

  const fetchUser = async (id: number) => {
    console.log('Buscando usuário...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    if (!response.ok) {
      throw new Error('Falha ao buscar usuário');
    }
    return response.json();
  };

  console.log('\n=== Teste com modo online ===');
  const onlineQuery = useQuery(queryClient, {
    queryKey: ['user', 'online'],
    queryFn: () => fetchUser(1),
    initialData: initialUser,
    placeholderData: placeholderUser,
    networkMode: 'online'
  });

  console.log('\n=== Teste com modo online ===');
  const alwaysQuery = useQuery(queryClient, {
    queryKey: ['user', 'always'],
    queryFn: () => fetchUser(2),
    initialData: initialUser,
    placeholderData: placeholderUser,
    networkMode: 'online'
  });

  console.log('\n=== Teste com modo offline ===');
  const offlineFirstQuery = useQuery(queryClient, {
    queryKey: ['user', 'offlineFirst'],
    queryFn: () => fetchUser(3),
    initialData: initialUser,
    placeholderData: placeholderUser,
    networkMode: 'offline'
  });

  const showQueryState = (query: any, name: string) => {
    console.log(`\nEstado da query ${name}:`, {
      ...query.getState(),
      fetchStatus: query.getState().fetchStatus,
      isPaused: query.getState().isPaused ? 'Sim' : 'Não'
    });
  };

  try {
    console.log('\n--- Teste Online ---');
    await onlineQuery.fetch();
    showQueryState(onlineQuery, 'online');

    console.log('\n--- Teste Offline ---');
    queryClient.mockOffline();
    
    try {
      await onlineQuery.fetch();
    } catch (error) {
      if (error instanceof Error) {
        console.log('Erro esperado (online):', error.message);
      } else {
        console.log('Erro desconhecido:', error);
      }
    }
    showQueryState(onlineQuery, 'online');

    await alwaysQuery.fetch();
    showQueryState(alwaysQuery, 'always');

    await offlineFirstQuery.fetch();
    showQueryState(offlineFirstQuery, 'offlineFirst');

    console.log('\n--- Voltando Online ---');
    queryClient.mockOnline();
    
    await onlineQuery.fetch();
    showQueryState(onlineQuery, 'online');

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido:', error);
    }
  }
}

main().catch(console.error); 