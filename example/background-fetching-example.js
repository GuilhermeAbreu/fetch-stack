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
const useQuery_1 = require("../src/useQuery");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryClient = new QueryClient_1.QueryClient();
        // Função para buscar dados
        const fetchData = (id) => __awaiter(this, void 0, void 0, function* () {
            console.log(`\nIniciando busca ${id}...`);
            yield new Promise(resolve => setTimeout(resolve, 1000));
            const response = yield fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
            if (!response.ok)
                throw new Error('Falha ao buscar dados');
            console.log(`Busca ${id} concluída!`);
            return response.json();
        });
        // Criar uma query
        const query = (0, useQuery_1.useQuery)(queryClient, {
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
            yield query.fetch();
            console.log('\n=== Busca em Background ===');
            // Simular uma atualização em background
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield query.fetch();
                }
                catch (error) {
                    console.error('Erro na busca em background:', error);
                }
            }), 2000);
            // Esperar um pouco para ver a busca em background
            yield new Promise(resolve => setTimeout(resolve, 3500));
            console.log('\n=== Múltiplas Queries Paralelas ===');
            // Criar várias queries para testar o contador global
            const queries = [2, 3, 4].map(id => ({
                queryKey: ['data', id],
                queryFn: () => fetchData(id)
            }));
            yield queryClient.fetchQueriesInParallel(queries);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Erro:', error.message);
            }
        }
        finally {
            // Limpar as inscrições
            unsubscribeGlobal();
            unsubscribeQuery();
        }
    });
}
main().catch(console.error);
