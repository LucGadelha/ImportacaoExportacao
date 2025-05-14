# Importação e Exportação (Import/Export) Application

## Descrição do Projeto
Este projeto é uma aplicação de gerenciamento de importação e exportação, projetada para facilitar o controle e rastreamento de processos de importação e exportação.

## Funcionalidades Principais
- Gerenciamento de registros de importação
- Controle de exportações
- Rastreamento de documentos e transações
- Geração de relatórios

## Requisitos do Sistema
- Node.js (versão recomendada: 16.x ou superior)
- TypeScript
- Banco de dados (conforme configuração no projeto)

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
