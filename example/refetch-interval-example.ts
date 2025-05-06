import { QueryClient } from '../src/QueryClient';

interface User {
  id: number;
  name: string;
  email: string;
}

async function main() {
  const queryClient = new QueryClient();

  // Função para buscar um usuário aleatório
  const fetchRandomUser = async (): Promise<User> => {
    const id = Math.floor(Math.random() * 10) + 1;
    console.log(`\nBuscando usuário ${id}...`);
    
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    
    if (!response.ok) throw new Error('Falha ao buscar usuário');
    
    const user = await response.json();
    console.log(`Usuário carregado: ${user.name}`);
    return user;
  };

  try {
    console.log('Iniciando query com refetch a cada 3 segundos...');
    
    // Criar query com refetch automático
    const query = await queryClient.fetchQuery({
      queryKey: ['randomUser'],
      queryFn: fetchRandomUser,
      refetchInterval: 3000 // refetch a cada 3 segundos
    });

    // Mantém o programa rodando por 15 segundos
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('\nFinalizando...');
    queryClient.cleanup();

  } catch (error) {
    console.error('Erro:', error);
  }
}

main().catch(console.error); 