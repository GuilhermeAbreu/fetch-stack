import { QueryClient } from '../src/QueryClient';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function main() {
  const queryClient = new QueryClient();

  // Função para buscar todos com suporte a cancelamento
  const fetchTodos = async ({ signal }: { signal?: AbortSignal }): Promise<Todo[]> => {
    console.log('\nBuscando todos...');
    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
      signal // Passa o signal para o fetch
    });
    if (!response.ok) throw new Error('Falha ao buscar todos');
    const todos = await response.json();
    console.log('Todos carregados:', todos.length);
    return todos;
  };

  try {
    // Iniciar uma query que será cancelada
    console.log('\n=== Iniciando query que será cancelada ===');
    const queryPromise = queryClient.fetchQuery({
      queryKey: ['todos'],
      queryFn: fetchTodos
    });

    // Cancelar a query após 100ms
    setTimeout(() => {
      console.log('\nCancelando query...');
      queryClient.cancelQueries({ queryKey: ['todos'] });
    }, 100);

    try {
      await queryPromise;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Query foi cancelada com sucesso!');
      } else {
        throw error;
      }
    }

    // Iniciar uma nova query que não será cancelada
    console.log('\n=== Iniciando nova query ===');
    const todos = await queryClient.fetchQuery({
      queryKey: ['todos'],
      queryFn: fetchTodos
    });
    console.log('Query completada com sucesso!');
    console.log('Número de todos:', todos.length);

  } catch (error) {
    console.error('Erro:', error);
  }
}

main().catch(console.error); 