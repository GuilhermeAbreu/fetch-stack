import { MutationObserver } from '../src/MutationObserver';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function main() {
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

  // Criar mutation observer
  const mutation = new MutationObserver({
    mutationFn: createTodo,
    onMutate: (variables) => {
      console.log('\nPré-processando mutation:', variables);
      return { timestamp: Date.now() };
    },
    onSuccess: (data, variables, context) => {
      console.log('\nMutation bem sucedida!');
      console.log('Dados:', data);
      console.log('Variáveis:', variables);
      console.log('Contexto:', context);
    },
    onError: (error, variables, context) => {
      console.log('\nErro na mutation!');
      console.log('Erro:', error);
      console.log('Variáveis:', variables);
      console.log('Contexto:', context);
    },
    retry: 3,
  });

  try {
    // Exemplo 1: Mutation bem sucedida
    console.log('\n=== Exemplo 1: Mutation bem sucedida ===');
    await mutation.mutate('Comprar pão');
    console.log('Estado após sucesso:', mutation.getState());

    // Exemplo 2: Mutation com erro (URL inválida)
    console.log('\n=== Exemplo 2: Mutation com erro ===');
    try {
      const errorMutation = new MutationObserver({
        mutationFn: async () => {
          throw new Error('URL inválida');
        },
        retry: 2,
      });
      await errorMutation.mutate('Dados inválidos');
    } catch (error) {
      console.log('Erro capturado:', error);
    }

    // Exemplo 3: Mutation assíncrona
    console.log('\n=== Exemplo 3: Mutation assíncrona ===');
    try {
      const todo = await mutation.mutateAsync('Estudar TypeScript');
      console.log('Todo criado (async):', todo);
    } catch (error) {
      console.log('Erro na mutation assíncrona:', error);
    }

    // Exemplo 4: Reset do estado
    console.log('\n=== Exemplo 4: Reset do estado ===');
    await mutation.reset();
    console.log('Estado após reset:', mutation.getState());

  } catch (error) {
    console.error('Erro:', error);
  }
}

main().catch(console.error); 