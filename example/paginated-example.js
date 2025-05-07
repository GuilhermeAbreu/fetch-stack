"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const QueryClient_1 = require("../src/QueryClient");
const usePaginatedQuery_1 = require("../src/usePaginatedQuery");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryClient = new QueryClient_1.QueryClient();
        // Função para buscar usuários paginados
        const fetchUsers = (page, pageSize) => __awaiter(this, void 0, void 0, function* () {
            console.log(`\nBuscando página ${page}...`);
            yield new Promise(resolve => setTimeout(resolve, 1000));
            const response = yield fetch(`https://jsonplaceholder.typicode.com/users?_page=${page}&_limit=${pageSize}`);
            if (!response.ok)
                throw new Error('Falha ao buscar usuários');
            const totalCount = parseInt(response.headers.get('x-total-count') || '0');
            const users = yield response.json();
            console.log(`Página ${page} carregada!`);
            return {
                items: users,
                currentPage: page,
                nextPage: users.length === pageSize ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
                totalPages: Math.ceil(totalCount / pageSize)
            };
        });
        try {
            let currentPage = 1;
            const pageSize = 3;
            // Criar query paginada
            const paginatedQuery = (0, usePaginatedQuery_1.usePaginatedQuery)(queryClient, {
                queryKey: ['users'],
                queryFn: () => fetchUsers(currentPage, pageSize),
                page: currentPage,
                pageSize,
                keepPreviousData: true
            });
            // Primeira busca (página 1)
            console.log('\n=== Estado Inicial (Página 1) ===');
            const page1Data = yield paginatedQuery.fetch();
            console.log('Status:', paginatedQuery.status);
            console.log('Dados:', page1Data.items.map(u => u.name));
            console.log('Página atual:', page1Data.currentPage);
            console.log('Total de páginas:', page1Data.totalPages);
            console.log('Próxima página:', page1Data.nextPage);
            console.log('Página anterior:', page1Data.previousPage);
            // Navegar para a próxima página (página 2)
            console.log('\n=== Próxima Página (Página 2) ===');
            currentPage = 2;
            const page2Data = yield paginatedQuery.fetchNextPage();
            console.log('Status:', paginatedQuery.status);
            console.log('Dados:', page2Data.items.map(u => u.name));
            console.log('Página atual:', page2Data.currentPage);
            console.log('Próxima página:', page2Data.nextPage);
            console.log('Página anterior:', page2Data.previousPage);
            // Voltar para a página anterior (página 1)
            console.log('\n=== Página Anterior (Página 1) ===');
            currentPage = 1;
            const page1DataAgain = yield paginatedQuery.fetchPreviousPage();
            console.log('Status:', paginatedQuery.status);
            console.log('Dados:', page1DataAgain.items.map(u => u.name));
            console.log('Página atual:', page1DataAgain.currentPage);
            console.log('Próxima página:', page1DataAgain.nextPage);
            console.log('Página anterior:', page1DataAgain.previousPage);
            // Tentar ir além do limite (página 0)
            console.log('\n=== Tentando Ir Além do Limite (Página 0) ===');
            currentPage = 0;
            try {
                yield paginatedQuery.fetchPreviousPage();
            }
            catch (error) {
                if (error instanceof Error) {
                    console.log('Erro esperado:', error.message);
                }
            }
        }
        catch (error) {
            console.error('Erro:', error);
        }
    });
}
main().catch(console.error);
