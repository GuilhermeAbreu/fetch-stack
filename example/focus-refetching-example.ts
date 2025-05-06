import { QueryClient } from '../src/QueryClient';
import { useQuery } from '../src/useQuery';

async function main() {
  // Criar QueryClient com refetchOnWindowFocus habilitado
  const queryClient = new QueryClient({
    refetchOnWindowFocus: true
  });

  // Função para buscar dados com timestamp
  const fetchData = async () => {
    console.log('\nIniciando busca...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    if (!response.ok) throw new Error('Falha ao buscar dados');
    const data = await response.json();
    console.log('Busca concluída!');
    return {
      ...data,
      timestamp: new Date().toISOString()
    };
  };

  // Criar uma query
  const userQuery = useQuery(queryClient, {
    queryKey: ['user', 1],
    queryFn: fetchData
  });

  // Observar o estado da query
  const unsubscribe = userQuery.subscribe((state) => {
    console.log('\nStatus da Query:', {
      isFetching: state.isFetching,
      status: state.status,
      data: state.data ? {
        name: state.data.name,
        timestamp: state.data.timestamp
      } : null,
      error: state.error ? state.error.message : null
    });
  });

  try {
    // Primeira busca
    console.log('\n=== Primeira Busca ===');
    await userQuery.fetch();

    // Simular mudança de foco
    console.log('\n=== Simulando Mudança de Foco ===');
    console.log('1. Mudando para background...');
    queryClient.setWindowFocused(false);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('2. Voltando para primeiro plano...');
    queryClient.setWindowFocused(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Desabilitar refetchOnWindowFocus
    console.log('\n=== Desabilitando Refetch on Focus ===');
    queryClient.setRefetchOnWindowFocus(false);
    
    console.log('1. Mudando para background...');
    queryClient.setWindowFocused(false);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('2. Voltando para primeiro plano (não deve refetch)...');
    queryClient.setWindowFocused(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    // Limpar recursos
    unsubscribe();
    queryClient.cleanup();
  }
}

main().catch(console.error); 