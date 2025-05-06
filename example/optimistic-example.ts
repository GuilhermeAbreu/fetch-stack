import { MutationObserver } from '../src/MutationObserver';
import { QueryClient } from '../src/QueryClient';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function main() {
  const queryClient = new QueryClient();

  // Função para buscar todos
  const fetchTodos = async (): Promise<Todo[]> => {
    console.log('\nBuscando todos...');
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');
    if (!response.ok) throw new Error('Falha ao buscar todos');
    const todos = await response.json();
    console.log('Todos carregados:', todos.length);
    return todos;
  };

  // Função para criar um novo todo
  const createTodo = async (title: string): Promise<Todo> => {
    console.log('\nCriando todo:', title);
    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        completed: false,
      }),
    });
    
    if (!response.ok) throw new Error('Falha ao criar todo');
    
    const todo = await response.json();
    console.log('Todo criado:', todo);
    return todo;
  };

  try {
    // Primeiro, buscar a lista de todos
    console.log('\n=== Buscando lista inicial de todos ===');
    const initialTodos = await queryClient.fetchQuery({
      queryKey: ['todos'],
      queryFn: fetchTodos
    });
    console.log('Todos iniciais:', initialTodos.length);

    // Criar mutation com atualização otimista
    const addTodoMutation = new MutationObserver({
      mutationFn: createTodo,
      onMutate: async (newTodoTitle) => {
        console.log('\nIniciando atualização otimista...');
        
        // Cancelar queries em andamento
        // TODO: Implementar cancelamento de queries
        
        // Salvar estado anterior
        const previousTodos = queryClient.getQueryData<Todo[]>(['todos']) || [];
        
        // Criar novo todo otimista
        const optimisticTodo: Todo = {
          id: Date.now(), // ID temporário
          title: newTodoTitle,
          completed: false
        };
        
        // Atualizar cache otimisticamente
        queryClient.setQueryData(['todos'], [...previousTodos, optimisticTodo]);
        
        console.log('Cache atualizado otimisticamente');
        
        // Retornar contexto para possível rollback
        return { previousTodos };
      },
      onError: (error, variables, context) => {
        console.log('\nErro na mutation, fazendo rollback...');
        // Rollback para o estado anterior
        if (context?.previousTodos) {
          queryClient.setQueryData(['todos'], context.previousTodos);
        }
      },
      onSettled: () => {
        // Invalidar query para garantir dados atualizados
        queryClient.invalidateQueries({ queryKey: ['todos'] });
      }
    });

    // Adicionar um novo todo
    console.log('\n=== Adicionando novo todo ===');
    await addTodoMutation.mutate('Estudar TypeScript');

    // Buscar a lista atualizada de todos
    console.log('\n=== Buscando lista atualizada de todos ===');
    const updatedTodos = await queryClient.fetchQuery({
      queryKey: ['todos'],
      queryFn: fetchTodos
    });
    console.log('Todos atualizados:', updatedTodos.length);

  } catch (error) {
    console.error('Erro:', error);
  }
}

main().catch(console.error); 