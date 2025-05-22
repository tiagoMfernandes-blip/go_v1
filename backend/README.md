# GoFolio - Backend API

## Visão Geral
Este é o backend da aplicação GoFolio, implementado em Go. Fornece uma API REST para gestão de criptoativos, incluindo autenticação, análise de portfólio, análise técnica e análise sentimental.

## Requisitos
- Go 1.16 ou superior
- PostgreSQL (para produção)
- Redis (para cache e sessões)

## Instalação

### 1. Instalar Go
Se ainda não tiver o Go instalado, siga as instruções em [golang.org/doc/install](https://golang.org/doc/install).

### 2. Instalar dependências
```bash
go mod download
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=gofolio
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu_segredo_jwt
```

## Desenvolvimento

### Executar o servidor
```bash
go run cmd/api/main.go
```

### Compilar o projeto
```bash
go build -o gofolio cmd/api/main.go
```

### Executar os testes
```bash
go test ./...
```

## Estrutura do Projeto
- `cmd/api`: Ponto de entrada da aplicação
- `internal/api`: Implementação da API REST
- `internal/auth`: Autenticação e autorização
- `internal/models`: Definições de modelos de dados
- `internal/middleware`: Middlewares HTTP
- `internal/services`: Serviços de negócio
- `internal/utils`: Funções utilitárias

## Rotas da API

### Públicas
- `GET /api/health`: Verificar saúde da API
- `POST /api/auth/login`: Login de usuário
- `POST /api/auth/register`: Registro de usuário

### Protegidas (requerem autenticação)
- `GET /api/portfolio`: Obter visão geral do portfólio
- `GET /api/portfolio/assets`: Obter lista de ativos no portfólio
- `GET /api/technical/{symbol}`: Obter análise técnica para um ativo específico
- `GET /api/sentiment`: Obter análise sentimental para todos os ativos
- `GET /api/sentiment/{symbol}`: Obter análise sentimental para um ativo específico

## Detalhes de Implementação
Este projeto segue o Model Context Protocol (MCP) para gerenciamento de contexto, usando o `context.Context` do Go para propagar metadados, timeouts e cancelamentos através da aplicação. 