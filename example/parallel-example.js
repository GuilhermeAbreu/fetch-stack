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
        // Funções de busca
        const fetchUser = (id) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Buscando usuário ${id}...`);
            yield new Promise(resolve => setTimeout(resolve, 1000));
            const response = yield fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
            if (!response.ok)
                throw new Error('Falha ao buscar usuário');
            return response.json();
        });
        const fetchPost = (id) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Buscando post ${id}...`);
            yield new Promise(resolve => setTimeout(resolve, 1500));
            const response = yield fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
            if (!response.ok)
                throw new Error('Falha ao buscar post');
            return response.json();
        });
        const fetchComment = (id) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Buscando comentário ${id}...`);
            yield new Promise(resolve => setTimeout(resolve, 800));
            const response = yield fetch(`https://jsonplaceholder.typicode.com/comments/${id}`);
            if (!response.ok)
                throw new Error('Falha ao buscar comentário');
            return response.json();
        });
        console.log('\n=== Queries Paralelas Manuais ===');
        // Criar queries manualmente
        const userQuery = (0, useQuery_1.useQuery)(queryClient, {
            queryKey: ['user', 1],
            queryFn: () => fetchUser(1)
        });
        const postQuery = (0, useQuery_1.useQuery)(queryClient, {
            queryKey: ['post', 1],
            queryFn: () => fetchPost(1)
        });
        const commentQuery = (0, useQuery_1.useQuery)(queryClient, {
            queryKey: ['comment', 1],
            queryFn: () => fetchComment(1)
        });
        // Executar queries manualmente em paralelo
        console.log('\nExecutando queries manualmente em paralelo...');
        const startManual = Date.now();
        try {
            const [user, post, comment] = yield Promise.all([
                userQuery.fetch(),
                postQuery.fetch(),
                commentQuery.fetch()
            ]);
            console.log('\nResultados das queries manuais:');
            console.log('Tempo total:', Date.now() - startManual, 'ms');
            console.log('User:', user.name);
            console.log('Post:', post.title);
            console.log('Comment:', comment.email);
        }
        catch (error) {
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
            const users = yield queryClient.fetchQueriesInParallel(queries);
            console.log('\nResultados das queries dinâmicas:');
            console.log('Tempo total:', Date.now() - startDynamic, 'ms');
            users.forEach(user => console.log('User:', user.name));
        }
        catch (error) {
            console.error('Erro nas queries dinâmicas:', error);
        }
    });
}
main().catch(console.error);
