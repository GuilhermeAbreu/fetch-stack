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
        // Função para buscar dados com delay variável
        const fetchData = (id, delay) => __awaiter(this, void 0, void 0, function* () {
            console.log(`\nIniciando busca do usuário ${id}...`);
            yield new Promise(resolve => setTimeout(resolve, delay));
            const response = yield fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
            if (!response.ok)
                throw new Error('Falha ao buscar dados');
            console.log(`Busca do usuário ${id} concluída!`);
            return response.json();
        });
        // Criar uma query para um usuário específico
        const userQuery = (0, useQuery_1.useQuery)(queryClient, {
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
            yield userQuery.fetch();
            // Simular atualizações em background
            console.log('\n=== Atualizações em Background ===');
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield userQuery.fetch();
                }
                catch (error) {
                    console.error('Erro na atualização:', error);
                }
            }), 3000);
            // Simular erro
            console.log('\n=== Simulando Erro ===');
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Forçar um erro alterando a URL
                    yield fetch('https://jsonplaceholder.typicode.com/error');
                }
                catch (error) {
                    console.error('Erro simulado:', error);
                }
            }), 6000);
            // Esperar para ver todas as atualizações
            yield new Promise(resolve => setTimeout(resolve, 8000));
        }
        catch (error) {
            console.error('Erro:', error);
        }
        finally {
            // Limpar a inscrição
            unsubscribe();
        }
    });
}
main().catch(console.error);
