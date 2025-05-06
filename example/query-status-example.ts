import { QueryClient } from '../src/QueryClient';
import { useQuery } from '../src/useQuery';

async function main() {
  const queryClient = new QueryClient();

  // Função para buscar dados com delay variável
  const fetchData = async (id: number, delay: number) => {
    console.log(`\nIniciando busca do usuário ${id}...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar dados');
    console.log(`Busca do usuário ${id} concluída!`);
    return response.json();
  };

  // Criar uma query para um usuário específico
  const userQuery = useQuery(queryClient, {
    queryKey: ['user', 1],
    queryFn: () => fetchData(1, 2000)
  });

  // Observar o estado da query em tempo real
  const unsubscribe = userQuery.subscribe((state) => {
    console.log('\nStatus da Query em Tempo Real:', {
      isFetching: state.isFetching,
      fetchStatus: state.fetchStatus,
      status: state.status,
      data: state.data ? `Usuário: ${state.data.name}` : 'Sem dados',
      error: state.error ? state.error.message : null
    });
  });

  try {
    // Primeira busca
    console.log('\n=== Primeira Busca ===');
    await userQuery.fetch();

    // Simular atualizações em background
    console.log('\n=== Atualizações em Background ===');
    setTimeout(async () => {
      try {
        await userQuery.fetch();
      } catch (error) {
        console.error('Erro na atualização:', error);
      }
    }, 3000);

    // Simular erro
    console.log('\n=== Simulando Erro ===');
    setTimeout(async () => {
      try {
        // Forçar um erro alterando a URL
        await fetch('https://jsonplaceholder.typicode.com/error');
      } catch (error) {
        console.error('Erro simulado:', error);
      }
    }, 6000);

    // Esperar para ver todas as atualizações
    await new Promise(resolve => setTimeout(resolve, 8000));

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    // Limpar a inscrição
    unsubscribe();
  }
}

main().catch(console.error); 