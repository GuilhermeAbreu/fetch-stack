import { QueryClient } from '../src/QueryClient';
import { useQuery } from '../src/useQuery';

async function main() {
  const queryClient = new QueryClient();

  // Função para buscar dados
  const fetchData = async (id: number) => {
    console.log(`\nIniciando busca ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar dados');
    console.log(`Busca ${id} concluída!`);
    return response.json();
  };

  // Criar uma query
  const query = useQuery(queryClient, {
    queryKey: ['data', 1],
    queryFn: () => fetchData(1)
  });

  // Observar o estado global de fetching
  const unsubscribeGlobal = queryClient.subscribeToFetching((count) => {
    console.log(`\nStatus Global: ${count} queries em execução`);
  });

  // Observar o estado individual da query
  const unsubscribeQuery = query.subscribe((state) => {
    console.log('\nStatus da Query:', {
      isFetching: state.isFetching,
      fetchStatus: state.fetchStatus,
      status: state.status
    });
  });

  try {
    console.log('\n=== Primeira Busca ===');
    await query.fetch();

    console.log('\n=== Busca em Background ===');
    // Simular uma atualização em background
    setTimeout(async () => {
      try {
        await query.fetch();
      } catch (error) {
        console.error('Erro na busca em background:', error);
      }
    }, 2000);

    // Esperar um pouco para ver a busca em background
    await new Promise(resolve => setTimeout(resolve, 3500));

    console.log('\n=== Múltiplas Queries Paralelas ===');
    // Criar várias queries para testar o contador global
    const queries = [2, 3, 4].map(id => ({
      queryKey: ['data', id],
      queryFn: () => fetchData(id)
    }));

    await queryClient.fetchQueriesInParallel(queries);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    }
  } finally {
    // Limpar as inscrições
    unsubscribeGlobal();
    unsubscribeQuery();
  }
}

main().catch(console.error); 