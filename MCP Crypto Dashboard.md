# Model Context Protocol (MCP) for Crypto Asset Management Dashboard

## 1. Objetivo
Definir um protocolo para gerenciar o contexto (dados, estados, interações) do dashboard de criptoativos, garantindo consistência, escalabilidade e usabilidade.

## 2. Componentes do Contexto
### 2.1. Dados do Usuário
- **Atributos**: ID, email, chaves de carteira (criptografadas), preferências (idioma, tema).
- **Gerenciamento**: Armazenado em PostgreSQL, com cache em Redis para sessões.
- **Contexto**: Passado via `context.Context` no backend (Go) com metadados como `userID`.

### 2.2. Dados de Portfólio
- **Atributos**: Lista de ativos (ex.: BTC, ETH), saldos, histórico de transações.
- **Fonte**: Integração com carteiras (Web3.js) e APIs de mercado (CoinGecko).
- **Contexto**: Cacheado em Redis para acesso rápido; atualizado em tempo real via WebSocket.

### 2.3. Análise Técnica
- **Atributos**: Preços, indicadores (RSI, MACD), alertas configurados.
- **Fonte**: TradingView para gráficos; CoinGecko para preços.
- **Contexto**: Dados temporais armazenados em memória (Redis) com expiração.

### 2.4. Análise Sentimental
- **Atributos**: Scores de sentimento por ativo (ex.: 0.7 positivo para BTC).
- **Fonte**: APIs de NLP (Hugging Face) ou scraping de posts do X.
- **Contexto**: Processado em batch (Go worker) e cacheado para exibição.

### 2.5. Estado da Interface
- **Atributos**: Tema (claro/escuro), layout de widgets, idioma.
- **Gerenciamento**: Armazenado no frontend (React Context) e sincronizado com backend.

## 3. Fluxos de Contexto
### 3.1. Autenticação
- **Fluxo**:
  1. Usuário faz login (email/senha + 2FA).
  2. Backend cria JWT e armazena `userID` no `context.Context`.
  3. Frontend recebe token e inicializa estado do usuário.
- **Contexto**: `userID` e permissões passados em todas as requisições.

### 3.2. Visualização de Portfólio
- **Fluxo**:
  1. Usuário acessa dashboard.
  2. Backend consulta carteira e APIs de mercado via `context.WithTimeout`.
  3. Frontend renderiza cards com dados de saldo e desempenho.
- **Contexto**: Dados de portfólio cacheados com TTL de 1min.

### 3.3. Análise Técnica
- **Fluxo**:
  1. Usuário seleciona ativo e indicadores.
  2. Backend fornece dados via WebSocket com `context.Context`.
  3. Frontend renderiza gráficos com TradingView.
- **Contexto**: Timeout de 5s para consultas; cache de indicadores.

### 3.4. Análise Sentimental
- **Fluxo**:
  1. Backend processa dados de sentimento em batch (ex.: a cada 10min).
  2. Resultados armazenados em Redis e expostos via API.
  3. Frontend exibe scores em widget.
- **Contexto**: Metadados de fonte (ex.: "X posts") incluídos no contexto.

### 3.5. Transações
- **Fluxo**:
  1. Usuário inicia transação (enviar/receber).
  2. Backend valida com `context.WithTimeout` e 2FA.
  3. Frontend exibe confirmação com feedback imediato.
- **Contexto**: `transactionID` e `userID` passados no contexto.

## 4. Implementação no Cursor
- **Backend (Go)**:
  - Prompt: "Crie uma API REST em Go com endpoints /portfolio, /technical, /sentimental, usando context.Context para timeouts e metadados userID."
  - Exemplo: Use `context.WithValue` para passar `userID` nos handlers.
- **Frontend (React)**:
  - Prompt: "Crie um dashboard em React com Tailwind CSS, integrando TradingView para gráficos e Web3.js para carteiras."
  - Exemplo: Use React Context para gerenciar tema e preferências.
- **Testes**:
  - Prompt: "Escreva testes unitários em Go para o endpoint /portfolio com mocks para CoinGecko API."
  - Exemplo: Use `testify` para mocks e assertions.

## 5. Diretrizes de Execução
- **Segurança**:
  - Criptografar dados sensíveis com AES-256.
  - Implementar 2FA em todas as ações críticas.
- **Escalabilidade**:
  - Usar Redis para cache e WebSocket para atualizações em tempo real.
  - Deploy em AWS ECS com auto-scaling.
- **Manutenção**:
  - Monitorar performance com Prometheus/Grafana.
  - Logs estruturados com `logrus` em Go.

## 6. Validação
- **Testes de Usabilidade**: Conduzir testes com 10 usuários (5 iniciantes, 5 experientes).
- **Testes de Segurança**: Pentesting para endpoints e carteiras.
- **Testes de Performance**: Simular 10.000 usuários com Locust.

## 7. Entregáveis
- **Backend**: API em Go com documentação OpenAPI.
- **Frontend**: Dashboard React com design system em Figma.
- **Prototipo**: Protótipo interativo em Figma.
- **Relatórios**: Documentação de testes e performance.

## 8. Riscos e Mitigações
- **Risco**: APIs externas (ex.: CoinGecko) falharem.
  - **Mitigação**: Implementar fallback com cache local.
- **Risco**: Interface confusa para iniciantes.
  - **Mitigação**: Onboarding guiado e tooltips contextuais.
- **Risco**: Vulnerabilidades de segurança.
  - **Mitigação**: Auditorias regulares e 2FA mandatório.


Estrutura do Projeto (Gerente de Projeto)
Visão Geral do Projeto
O dashboard será uma aplicação web para gerenciamento de criptoativos, voltada para investidores (de iniciantes a experientes), com foco em:

Análise técnica: Ferramentas para gráficos de preços, indicadores (RSI, MACD, médias móveis, etc.).
Análise analítica: Métricas de portfólio, como saldo, desempenho e alocação de ativos.
Análise sentimental: Insights baseados em sentimentos do mercado (ex.: análise de posts no X ou notícias).
Funcionalidades: Integração com carteiras, transações, histórico, e segurança robusta.
Objetivos
Criar uma interface intuitiva e sofisticada que simplifique a gestão de criptoativos.
Oferecer visualizações de dados em tempo real com alta performance.
Garantir segurança (ex.: 2FA, criptografia) e conformidade com padrões de blockchain.
Suportar múltiplos dispositivos (desktop, tablet, smartphone) com design responsivo.
Escalar para suportar grande volume de dados e usuários.
Escopo
Frontend: Interface web com React (para dinamismo e componentes reutilizáveis).
Backend: API REST em Go (para performance e concorrência).
Integrações:
APIs de mercado (ex.: CoinGecko, CoinMarketCap) para preços e análises.
Carteiras blockchain (ex.: MetaMask) via Web3.js.
Fontes de dados sentimentais (ex.: APIs de análise de texto ou scraping do X).
Banco de dados: PostgreSQL para dados de usuários e transações; Redis para cache de dados em tempo real.
Segurança: Autenticação 2FA, OAuth2, e criptografia AES-256.
Análise sentimental: Integração com APIs de NLP (ex.: Hugging Face) ou scraping de dados do X.