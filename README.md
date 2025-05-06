# Fetch Stack

[![npm version](https://badge.fury.io/js/%40guilhermeabreudev%2Ffetch-stack.svg)](https://badge.fury.io/js/%40guilhermeabreudev%2Ffetch-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

Uma biblioteca simples e eficiente para gerenciamento de estado e cache de dados, inspirada no React Query, mas com uma implementação mais leve e flexível.

## ✨ Características

- 🚀 Gerenciamento de cache eficiente
- 🔄 Atualizações otimistas
- 🔌 Sistema de callbacks flexível
- 📦 Tipagem completa com TypeScript
- 🎯 Suporte a operações assíncronas
- 🔍 Invalidação de cache inteligente
- 🛠️ API simples e intuitiva

## 📦 Instalação

```bash
npm install @guilhermeabreudev/fetch-stack
```

ou

```bash
yarn add @guilhermeabreudev/fetch-stack
```

## 🚀 Uso Rápido

```typescript
import { DataManager, DataOperation } from '@guilhermeabreudev/fetch-stack';

// Criando uma instância do DataManager
const dataManager = new DataManager();

// Buscando dados com cache
const userData = await dataManager.fetchData('user-123', async () => {
  const response = await fetch('https://api.example.com/users/123');
  return response.json();
});
```

## 📚 Documentação

A documentação completa está disponível em:

- [Documentação em Português](docs/pt/README.md)
- [English Documentation](docs/en/README.md)

### Recursos Adicionais

- [Exemplos Detalhados](docs/examples.md)
- [Referência de Tipos](docs/types.md)

## 🛠️ Tecnologias

- TypeScript
- Jest para testes
- ESLint para linting
- Prettier para formatação

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia nosso [guia de contribuição](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📫 Contato

Guilherme Abreu - [@guilhermeabreudev](https://github.com/guilhermeabreudev)

Link do Projeto: [https://github.com/guilhermeabreudev/fetch-stack](https://github.com/guilhermeabreudev/fetch-stack)

## 🙏 Agradecimentos

- Inspirado no [React Query](https://tanstack.com/query/latest)
- Comunidade TypeScript
- Todos os contribuidores 