import { QueryClient } from '../src/QueryClient';
import { useQuery } from '../src/useQuery';

async function main() {
  const queryClient = new QueryClient();

  // Funções de busca
  const fetchUser = async (id: number) => {
    console.log(`Buscando usuário ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar usuário');
    return response.json();
  };

  const fetchPost = async (id: number) => {
    console.log(`Buscando post ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar post');
    return response.json();
  };

  const fetchComment = async (id: number) => {
    console.log(`Buscando comentário ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    const response = await fetch(`https://jsonplaceholder.typicode.com/comments/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar comentário');
    return response.json();
  };

  console.log('\n=== Queries Paralelas Manuais ===');
  
  // Criar queries manualmente
  const userQuery = useQuery(queryClient, {
    queryKey: ['user', 1],
    queryFn: () => fetchUser(1)
  });

  const postQuery = useQuery(queryClient, {
    queryKey: ['post', 1],
    queryFn: () => fetchPost(1)
  });

  const commentQuery = useQuery(queryClient, {
    queryKey: ['comment', 1],
    queryFn: () => fetchComment(1)
  });

  // Executar queries manualmente em paralelo
  console.log('\nExecutando queries manualmente em paralelo...');
  const startManual = Date.now();
  
  try {
    const [user, post, comment] = await Promise.all([
      userQuery.fetch(),
      postQuery.fetch(),
      commentQuery.fetch()
    ]);

    console.log('\nResultados das queries manuais:');
    console.log('Tempo total:', Date.now() - startManual, 'ms');
    console.log('User:', user.name);
    console.log('Post:', post.title);
    console.log('Comment:', comment.email);
  } catch (error) {
    console.error('Erro nas queries manuais:', error);
  }

  console.log('\n=== Queries Paralelas Dinâmicas ===');

  // Array de IDs para buscar
  const userIds = [2, 3, 4];

  // Criar queries dinamicamente
  const queries = userIds.map(id => ({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id)
  }));

  // Executar queries dinâmicas em paralelo
  console.log('\nExecutando queries dinâmicas em paralelo...');
  const startDynamic = Date.now();

  try {
    const users = await queryClient.fetchQueriesInParallel(queries);
    
    console.log('\nResultados das queries dinâmicas:');
    console.log('Tempo total:', Date.now() - startDynamic, 'ms');
    users.forEach(user => console.log('User:', user.name));
  } catch (error) {
    console.error('Erro nas queries dinâmicas:', error);
  }
}

main().catch(console.error); 