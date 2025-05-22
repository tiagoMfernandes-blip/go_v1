import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  InputLabel, 
  MenuItem, 
  FormControl, 
  Select, 
  SelectChangeEvent,
  Button,
  Divider,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { 
  TradingSignal
} from '../../services/tradingSignalService';
import TradingSignalService from '../../services/tradingSignalService';
import TradingSignalCard from './TradingSignalCard';
import MarketSentimentService from '../../services/marketSentimentService';
import OnChainAnalysisService from '../../services/onChainAnalysisService';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';

// Definição do tipo de timeframe
type TradingSignalTimeframe = '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

// Interface para filtros de sinais
interface SignalFilters {
  symbol: string;
  timeframe: TradingSignalTimeframe | 'all';
  signalType: 'all' | 'buy' | 'sell' | 'strong_buy' | 'strong_sell';
  minConfidence: number;
}

const TradingSignalsPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<TradingSignal[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [onChainData, setOnChainData] = useState<any>(null);
  
  // Filtros
  const [filters, setFilters] = useState<SignalFilters>({
    symbol: 'all',
    timeframe: 'all',
    signalType: 'all',
    minConfidence: 0
  });
  
  // Lista de símbolos disponíveis
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  
  // Carregar dados
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carregar sinais de trading
      const tradingSignals = await TradingSignalService.getSignals();
      setSignals(tradingSignals);
      
      // Extrair símbolos únicos
      const uniqueSymbols = tradingSignals.map(signal => signal.symbol);
      const symbols = Array.from(new Set(uniqueSymbols));
      setAvailableSymbols(symbols);
      
      // Carregar sentimento de mercado
      const sentiment = await MarketSentimentService.getMarketSentiment();
      setMarketSentiment(sentiment);
      
      // Carregar dados on-chain para Bitcoin
      if (symbols.includes('BTC')) {
        const btcOnChainData = await OnChainAnalysisService.getBitcoinMetrics();
        setOnChainData((prev: any) => ({ ...prev, BTC: btcOnChainData }));
      }
      
      // Carregar dados on-chain para Ethereum
      if (symbols.includes('ETH')) {
        const ethOnChainData = await OnChainAnalysisService.getEthereumMetrics();
        setOnChainData((prev: any) => ({ ...prev, ETH: ethOnChainData }));
      }
      
      // Aplicar filtros iniciais
      applyFilters(tradingSignals, filters);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os sinais de trading. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar sinais
  const applyFilters = (allSignals: TradingSignal[], currentFilters: SignalFilters) => {
    let filtered = [...allSignals];
    
    // Filtrar por símbolo
    if (currentFilters.symbol !== 'all') {
      filtered = filtered.filter(signal => signal.symbol === currentFilters.symbol);
    }
    
    // Filtrar por timeframe
    if (currentFilters.timeframe !== 'all') {
      filtered = filtered.filter(signal => signal.timeframe === currentFilters.timeframe);
    }
    
    // Filtrar por tipo de sinal
    if (currentFilters.signalType !== 'all') {
      filtered = filtered.filter(signal => signal.type === currentFilters.signalType);
    }
    
    // Filtrar por confiança mínima
    filtered = filtered.filter(signal => signal.confidence >= currentFilters.minConfidence);
    
    // Ordenar por data (mais recente primeiro) e depois por confiança (maior primeiro)
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      
      return b.confidence - a.confidence;
    });
    
    setFilteredSignals(filtered);
  };
  
  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, []);
  
  // Aplicar filtros quando os filtros ou sinais mudarem
  useEffect(() => {
    applyFilters(signals, filters);
  }, [signals, filters]);
  
  // Manipular mudança de filtros
  const handleFilterChange = (key: keyof SignalFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Manipular mudança de tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  // Renderizar filtros
  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Filtros</Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Símbolo</InputLabel>
            <Select
              value={filters.symbol}
              label="Símbolo"
              onChange={(e: SelectChangeEvent) => handleFilterChange('symbol', e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              {availableSymbols.map(symbol => (
                <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={filters.timeframe}
              label="Timeframe"
              onChange={(e: SelectChangeEvent) => handleFilterChange('timeframe', e.target.value as TradingSignalTimeframe | 'all')}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="5m">5 minutos</MenuItem>
              <MenuItem value="15m">15 minutos</MenuItem>
              <MenuItem value="1h">1 hora</MenuItem>
              <MenuItem value="4h">4 horas</MenuItem>
              <MenuItem value="1d">1 dia</MenuItem>
              <MenuItem value="1w">1 semana</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de Sinal</InputLabel>
            <Select
              value={filters.signalType}
              label="Tipo de Sinal"
              onChange={(e: SelectChangeEvent) => handleFilterChange('signalType', e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="strong_buy">Compra Forte</MenuItem>
              <MenuItem value="buy">Compra</MenuItem>
              <MenuItem value="sell">Venda</MenuItem>
              <MenuItem value="strong_sell">Venda Forte</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Confiança Mínima</InputLabel>
            <Select
              value={filters.minConfidence.toString()}
              label="Confiança Mínima"
              onChange={(e: SelectChangeEvent) => handleFilterChange('minConfidence', parseInt(e.target.value))}
            >
              <MenuItem value="0">Qualquer</MenuItem>
              <MenuItem value="50">50% ou mais</MenuItem>
              <MenuItem value="70">70% ou mais</MenuItem>
              <MenuItem value="85">85% ou mais</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
  
  // Renderizar conteúdo da tab selecionada
  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: // Sinais Ativos
        return (
          <>
            {renderFilters()}
            
            {filteredSignals.length > 0 ? (
              filteredSignals.map(signal => (
                <TradingSignalCard key={`${signal.symbol}-${signal.timeframe}-${signal.timestamp}`} signal={signal} />
              ))
            ) : (
              <Alert severity="info">
                Nenhum sinal de trading encontrado com os filtros atuais.
              </Alert>
            )}
          </>
        );
        
      case 1: // Sentimento de Mercado
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Sentimento de Mercado</Typography>
            
            {marketSentiment ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">
                    Sentimento Global: {marketSentiment.overallSentiment}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atualizado em: {new Date(marketSentiment.timestamp).toLocaleString('pt-PT')}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                    <Typography variant="subtitle2" gutterBottom>Índice de Medo e Ganância</Typography>
                    <Typography variant="h4" color={
                      marketSentiment.fearGreedIndex < 30 ? 'error.main' : 
                      marketSentiment.fearGreedIndex > 70 ? 'success.main' : 
                      'warning.main'
                    }>
                      {marketSentiment.fearGreedIndex}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {marketSentiment.fearGreedIndex < 30 ? 'Medo Extremo' : 
                       marketSentiment.fearGreedIndex < 40 ? 'Medo' :
                       marketSentiment.fearGreedIndex < 60 ? 'Neutro' :
                       marketSentiment.fearGreedIndex < 80 ? 'Ganância' : 'Ganância Extrema'}
                    </Typography>
                  </Grid>
                  
                  <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                    <Typography variant="subtitle2" gutterBottom>Dominância BTC</Typography>
                    <Typography variant="h4">
                      {marketSentiment.btcDominance.toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {marketSentiment.btcDominance > 50 
                        ? 'Alta dominância - mercado mais conservador' 
                        : 'Baixa dominância - ciclo de altcoins possível'}
                    </Typography>
                  </Grid>
                  
                  <Grid sx={{ gridColumn: 'span 12' }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>Análise Detalhada</Typography>
                    <Typography variant="body1">
                      {marketSentiment.analysis}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            ) : loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Alert severity="warning">
                Dados de sentimento de mercado não disponíveis.
              </Alert>
            )}
          </Paper>
        );
        
      case 2: // Análise On-Chain
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Análise On-Chain</Typography>
            
            {onChainData ? (
              <Tabs 
                value={filters.symbol !== 'all' ? filters.symbol : 'BTC'} 
                onChange={(_e, val) => handleFilterChange('symbol', val)}
                sx={{ mb: 3 }}
              >
                {Object.keys(onChainData).map(symbol => (
                  <Tab key={symbol} value={symbol} label={symbol} />
                ))}
              </Tabs>
            ) : null}
            
            {onChainData && filters.symbol !== 'all' && onChainData[filters.symbol] ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">
                    {filters.symbol === 'BTC' ? 'Bitcoin' : 'Ethereum'} On-Chain Metrics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Último update: {new Date().toLocaleString('pt-PT')}
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {onChainData[filters.symbol].map((metric: any) => (
                    <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }} key={metric.name}>
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 2, 
                          height: '100%',
                          borderLeft: 3,
                          borderColor: metric.bullishSignal ? 'success.main' : 'error.main'
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {metric.name}
                        </Typography>
                        <Typography variant="h5">
                          {metric.value}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={metric.changePercent > 0 ? 'success.main' : 'error.main'}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mt: 1
                          }}
                        >
                          {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {metric.interpretation}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                <Box mt={3}>
                  <Alert severity={
                    OnChainAnalysisService.getOnChainSummary(filters.symbol).sentiment === 'bullish' 
                      ? 'success' 
                      : OnChainAnalysisService.getOnChainSummary(filters.symbol).sentiment === 'bearish'
                        ? 'error'
                        : 'info'
                  }>
                    {OnChainAnalysisService.getOnChainSummary(filters.symbol).summary}
                  </Alert>
                </Box>
              </>
            ) : loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Alert severity="info">
                Selecione uma criptomoeda para ver análise on-chain.
              </Alert>
            )}
          </Paper>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sinais de Trading
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Sinais Ativos" />
          <Tab label="Sentimento de Mercado" />
          <Tab label="Análise On-Chain" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        renderTabContent()
      )}
    </Container>
  );
};

export default TradingSignalsPage; 