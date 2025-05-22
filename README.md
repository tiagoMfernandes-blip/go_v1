# GoFolio - Plataforma de Análise de Criptomoedas

Uma plataforma completa para análise de criptomoedas, incluindo dados de mercado, análise técnica, sentimento de mercado e ferramentas de portfólio.

## Funcionalidades

- 📊 **Dashboard de Mercado**: Visão geral do mercado de criptomoedas com dados em tempo real.
- 📈 **Análise Técnica**: Indicadores técnicos (RSI, MACD, médias móveis) calculados no servidor.
- 🔍 **Análise de Sentimento**: Análise de sentimento do mercado baseada em dados de redes sociais e notícias.
- 💼 **Gestão de Portfólio**: Acompanhe seus investimentos em criptomoedas.
- 🔔 **Alertas de Preço**: Configure alertas personalizados para movimentos de preço.
- 📱 **Design Responsivo**: Interface otimizada para desktop e dispositivos móveis.
- 🛠️ **Raspagem de Dados**: Sistema de coleta automática de dados de múltiplas fontes com fallbacks.

## Tecnologias

### Frontend
- React
- TypeScript
- Chakra UI
- Chart.js
- React Router

### Backend
- Go (Golang)
- PostgreSQL (para armazenamento persistente)
- API REST com Gorilla Mux
- Sistema de cache eficiente
- Agendador de tarefas para coleta de dados

## Arquitetura

O GoFolio utiliza uma arquitetura cliente-servidor:

1. **Backend em Go**: 
   - API REST para servir dados ao frontend
   - Sistema de raspagem de dados que coleta informações de múltiplas fontes
   - Cache de dados para reduzir chamadas às APIs externas
   - Persistência de dados históricos em PostgreSQL
   - Cálculo de indicadores técnicos e sinais de trading

2. **Frontend em React**:
   - Interface de usuário responsiva
   - Visualização de dados em gráficos interativos
   - Componentes reutilizáveis
   - Gerenciamento de estado com React Hooks

## Fontes de Dados

O sistema utiliza múltiplas fontes de dados com fallbacks automáticos:

- CoinGecko API
- CryptoCompare API
- Alternative.me API
- Raspagem de sites como CoinMarketCap e TradingView
- Fear & Greed Index

## Instalação e Execução

### Pré-requisitos
- Node.js 16+
- Go 1.16+
- PostgreSQL

### Backend

```bash
# Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Editar .env com suas configurações

# Instalar dependências e executar
cd backend
go mod download
go run cmd/api/main.go
```

### Frontend

```bash
# Instalar dependências
cd frontend
npm install

# Executar em modo de desenvolvimento
npm run dev

# Ou gerar build de produção
npm run build
```

## Estrutura do Projeto

```
gofolio/
├── backend/              # Servidor Go
│   ├── cmd/              # Pontos de entrada
│   │   ├── internal/         # Código interno
│   │   │   ├── api/          # Handlers da API
│   │   │   ├── models/       # Modelos de dados
│   │   │   ├── services/     # Lógica de negócios
│   │   │   │   ├── scraper/  # Serviço de raspagem
│   │   │   │   └── scheduler/# Agendador de tarefas
│   │   │   └── utils/        # Funções utilitárias
│   │   └── README.md         # Documentação do backend
│   └── README.md             # Documentação geral
```

## Contribuição

Contribuições são bem-vindas! Por favor, siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Faça commit das suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes. 