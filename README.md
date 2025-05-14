# Importação e Exportação (Import/Export) Application

## Descrição do Projeto
Sistema completo de Gestão de Importação e Exportação, projetado para empresas que necessitam de controle preciso e eficiente de seus processos logísticos e comerciais internacionais.

## Funcionalidades Principais
### 1. Painel de Controle
- Visão geral de atividades de importação e exportação
- Métricas de desempenho em tempo real

### 2. Gerenciamento de Estoque
- Controle detalhado de produtos
- Rastreamento de níveis de estoque
- Monitoramento de entrada e saída de mercadorias

### 3. Gestão de Pedidos
- Criação e acompanhamento de pedidos de importação/exportação
- Controle de status de pedidos
- Documentação automatizada

### 4. Catálogo de Produtos
- Registro completo de produtos
- Classificação e categorização
- Informações detalhadas de cada item

### 5. Relatórios Avançados
- Relatórios personalizados de importação/exportação
- Análises financeiras
- Relatórios de desempenho de estoque e pedidos

## Tecnologias e Frameworks

### Backend
- **Linguagem:** TypeScript
- **Servidor:** Express.js
- **Runtime:** Node.js
- **ORM:** Drizzle ORM
- **Banco de Dados:** PostgreSQL (Neon Serverless)

### Frontend
- **Framework:** React
- **Biblioteca de UI:** Radix UI
- **Gerenciamento de Estado:** React Query
- **Construção:** Vite

### Ferramentas de Desenvolvimento
- **Transpilador:** TSX
- **Gerenciamento de Ambiente:** Dotenv
- **Construção:** esbuild

## Requisitos do Sistema
- Node.js (versão recomendada: 16.x ou superior)
- PostgreSQL
- Gerenciador de pacotes npm

## Instalação

### Pré-requisitos
1. Certifique-se de ter o Node.js instalado
2. Clone o repositório
```bash
git clone https://github.com/seu-usuario/ImportacaoExportacao.git
cd ImportacaoExportacao
```

### Instalação de Dependências
```bash
npm install
```

## Configuração
1. Copie o arquivo `.env.example` para `.env`
2. Preencha as configurações necessárias no arquivo `.env`

## Executando a Aplicação

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## Estrutura do Projeto
```
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
├── db/
│   └── seed.ts
├── tests/
└── README.md
```

## Banco de Dados
- Utilize o script `db/seed.ts` para popular dados iniciais
- Verifique as configurações de conexão no arquivo de configuração do banco de dados

## Contribuição
1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFuncionalidade'`)
4. Faça o Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## Contato
Lucas Gadelha
(92) 98163-4154
gadelhadev0@gmail.com
