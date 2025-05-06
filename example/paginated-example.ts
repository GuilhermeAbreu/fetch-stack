import { QueryClient } from '../src/QueryClient';
import { PaginatedData } from '../src/types';
import { usePaginatedQuery } from '../src/usePaginatedQuery';

interface User {
  id: number;
  name: string;
  email: string;
}

async function main() {
  const queryClient = new QueryClient();

  // Função para buscar usuários paginados
  const fetchUsers = async (page: number, pageSize: number): Promise<PaginatedData<User>> => {
    console.log(`\nBuscando página ${page}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users?_page=${page}&_limit=${pageSize}`
    );
    
    if (!response.ok) throw new Error('Falha ao buscar usuários');
    
    const totalCount = parseInt(response.headers.get('x-total-count') || '0');
    const users = await response.json() as User[];
    
    console.log(`Página ${page} carregada!`);
    
    return {
      items: users,
      currentPage: page,
      nextPage: users.length === pageSize ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  };

  try {
    let currentPage = 1;
    const pageSize = 3;

    // Criar query paginada
    const paginatedQuery = usePaginatedQuery<User>(queryClient, {
      queryKey: ['users'],
      queryFn: () => fetchUsers(currentPage, pageSize),
      page: currentPage,
      pageSize,
      keepPreviousData: true
    });

    // Primeira busca (página 1)
    console.log('\n=== Estado Inicial (Página 1) ===');
    const page1Data = await paginatedQuery.fetch();
    console.log('Status:', paginatedQuery.status);
    console.log('Dados:', page1Data.items.map(u => u.name));
    console.log('Página atual:', page1Data.currentPage);
    console.log('Total de páginas:', page1Data.totalPages);
    console.log('Próxima página:', page1Data.nextPage);
    console.log('Página anterior:', page1Data.previousPage);

    // Navegar para a próxima página (página 2)
    console.log('\n=== Próxima Página (Página 2) ===');
    currentPage = 2;
    const page2Data = await paginatedQuery.fetchNextPage();
    console.log('Status:', paginatedQuery.status);
    console.log('Dados:', page2Data.items.map(u => u.name));
    console.log('Página atual:', page2Data.currentPage);
    console.log('Próxima página:', page2Data.nextPage);
    console.log('Página anterior:', page2Data.previousPage);

    // Voltar para a página anterior (página 1)
    console.log('\n=== Página Anterior (Página 1) ===');
    currentPage = 1;
    const page1DataAgain = await paginatedQuery.fetchPreviousPage();
    console.log('Status:', paginatedQuery.status);
    console.log('Dados:', page1DataAgain.items.map(u => u.name));
    console.log('Página atual:', page1DataAgain.currentPage);
    console.log('Próxima página:', page1DataAgain.nextPage);
    console.log('Página anterior:', page1DataAgain.previousPage);

    // Tentar ir além do limite (página 0)
    console.log('\n=== Tentando Ir Além do Limite (Página 0) ===');
    currentPage = 0;
    try {
      await paginatedQuery.fetchPreviousPage();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log('Erro esperado:', error.message);
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  }
}

main().catch(console.error); 