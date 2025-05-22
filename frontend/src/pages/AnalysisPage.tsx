import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import HistoryIcon from '@mui/icons-material/History';
import StorageIcon from '@mui/icons-material/Storage';

// Componente de TradingView para renderizar gráficos
const TradingViewChart: React.FC<{ symbol: string, timeframe: string }> = ({ symbol, timeframe }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remover qualquer widget anterior
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      // Criar o novo script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        if (typeof window.TradingView !== 'undefined' && containerRef.current) {
          new window.TradingView.widget({
            width: '100%',
            height: 600,
            symbol: symbol,
            interval: timeframe,
            timezone: 'Europe/Lisbon',
            theme: 'light',
            style: '1',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            withdateranges: true,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            save_image: true,
            studies: [
              'BB@tv-basicstudies',
              'RSI@tv-basicstudies',
              'MACD@tv-basicstudies'
            ],
            studies_overrides: {
              "bollinger bands.median.color": "#e91e63",
              "bollinger bands.upper.color": "#4caf50",
              "bollinger bands.lower.color": "#4caf50",
              "bollinger bands.median.linewidth": 2,
              "macd.macd.color": "#2196f3",
              "macd.signal.color": "#ff9800",
              "rsi.upper line.color": "#f44336",
              "rsi.lower line.color": "#f44336",
              "volume.volume.color.0": "#f44336",
              "volume.volume.color.1": "#4caf50"
            },
            loading_screen: { backgroundColor: "#f4f4f4", foregroundColor: "#2962FF" },
            container_id: containerRef.current.id,
            // Chamar função após inicialização do widget
            onChartReady: function(chart: any) {
              // Adicionar médias móveis com períodos específicos
              chart.createStudy('Moving Average', false, false, { length: 20 }, { 'plot.color': '#ff9800', 'plot.linewidth': 1 });
              chart.createStudy('Moving Average', false, false, { length: 50 }, { 'plot.color': '#2196f3', 'plot.linewidth': 1 });
              chart.createStudy('Moving Average', false, false, { length: 100 }, { 'plot.color': '#9c27b0', 'plot.linewidth': 1 });
              chart.createStudy('Moving Average', false, false, { length: 200 }, { 'plot.color': '#000000', 'plot.linewidth': 2 });
            }
          });
        }
      };
      
      document.head.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [symbol, timeframe]);
  
  return (
    <Box 
      ref={containerRef} 
      id={`tradingview_${Math.random().toString(36).substring(7)}`}
      sx={{ height: '600px', width: '100%' }}
    />
  );
};

// Definição de tipos para o objeto TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

const AnalysisPage: React.FC = () => {
  // Estado para controlar a aba atual
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCEUR');
  const [loadingChart, setLoadingChart] = useState(false);
  const [timeframe, setTimeframe] = useState('D'); // Novo estado para timeframe
  
  // Função para lidar com a mudança de aba
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Função para lidar com a mudança de símbolo
  const handleSymbolChange = (symbol: string) => {
    setLoadingChart(true);
    setSelectedSymbol(symbol);
    // Simular tempo de carregamento
    setTimeout(() => {
      setLoadingChart(false);
    }, 1000);
  };
  
  // Função para lidar com a mudança de timeframe
  const handleTimeframeChange = (newTimeframe: string) => {
    setLoadingChart(true);
    setTimeframe(newTimeframe);
    // Simular tempo de carregamento
    setTimeout(() => {
      setLoadingChart(false);
    }, 1000);
  };
  
  // Renderizar gráfico TradingView ou cards de ferramentas com base na aba selecionada
  const renderContent = () => {
    if (activeTab === 0) {
      return (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2">
              Gráfico Interativo com Indicadores
            </Typography>
            <Box>
              <Button 
                variant={selectedSymbol === 'BTCEUR' ? "contained" : "outlined"} 
                size="small" 
                onClick={() => handleSymbolChange('BTCEUR')}
                sx={{ mr: 1 }}
              >
                BTC/EUR
              </Button>
              <Button 
                variant={selectedSymbol === 'ETHEUR' ? "contained" : "outlined"}
                size="small" 
                onClick={() => handleSymbolChange('ETHEUR')}
                sx={{ mr: 1 }}
              >
                ETH/EUR
              </Button>
              <Button 
                variant={selectedSymbol === 'ADAEUR' ? "contained" : "outlined"}
                size="small" 
                onClick={() => handleSymbolChange('ADAEUR')}
              >
                ADA/EUR
              </Button>
            </Box>
          </Box>
          
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Indicadores pré-configurados: RSI, MACD, Bandas de Bollinger, Médias Móveis (20, 50, 100, 200)
            </Typography>
            <Box>
              <Button 
                variant={timeframe === '15' ? "contained" : "outlined"} 
                size="small" 
                onClick={() => handleTimeframeChange('15')}
                sx={{ mr: 1 }}
              >
                15m
              </Button>
              <Button 
                variant={timeframe === '60' ? "contained" : "outlined"} 
                size="small" 
                onClick={() => handleTimeframeChange('60')}
                sx={{ mr: 1 }}
              >
                1h
              </Button>
              <Button 
                variant={timeframe === 'D' ? "contained" : "outlined"} 
                size="small" 
                onClick={() => handleTimeframeChange('D')}
                sx={{ mr: 1 }}
              >
                1d
              </Button>
              <Button 
                variant={timeframe === 'W' ? "contained" : "outlined"} 
                size="small" 
                onClick={() => handleTimeframeChange('W')}
              >
                1w
              </Button>
            </Box>
          </Box>
          
          {loadingChart ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="600px">
              <CircularProgress />
            </Box>
          ) : (
            <TradingViewChart symbol={selectedSymbol} timeframe={timeframe} />
          )}
        </Paper>
      );
    } else {
      return (
        <Grid container spacing={3}>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <ShowChartIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Análise Técnica
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Aceda a gráficos interativos com indicadores técnicos avançados para analisar o movimento de preços e identificar tendências.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inclui: Médias móveis, RSI, MACD, Bollinger Bands, Fibonacci e mais.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  onClick={() => setActiveTab(0)} 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Ver Gráficos
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <SignalCellularAltIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Sinais de Trading
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Receba sinais de compra e venda baseados em algoritmos avançados de machine learning e análise técnica.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visualize sinais para diversos timeframes: 1h, 4h, 1d e 1w.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  component={RouterLink} 
                  to="/sinais" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Ver Sinais de Trading
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <NotificationsActiveIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Alertas Inteligentes
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Configure alertas inteligentes baseados em múltiplos fatores para ser notificado sobre oportunidades de mercado.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Combine indicadores técnicos, sentimento do mercado e análise on-chain para criar alertas personalizados.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  component={RouterLink} 
                  to="/alertas" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Gerir Alertas
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 6' } }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <HistoryIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Backtesting
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Teste as suas estratégias de trading contra dados históricos para validar a sua eficácia antes de aplicá-las em mercados reais.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analise resultados detalhados: retorno total, win rate, drawdown máximo, Sharpe ratio e mais.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  component={RouterLink} 
                  to="/analysis/backtesting" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Iniciar Backtesting
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 6' } }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <StorageIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Análise On-Chain
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Explore dados on-chain para Bitcoin e Ethereum para identificar tendências e padrões baseados em atividade da blockchain.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Métricas incluem: atividade de endereços, fluxos de exchange, distribuição de holdings e muito mais.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  component={RouterLink} 
                  to="/sinais" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Ver Análise On-Chain
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Análise e Inteligência de Mercado
        </Typography>
        <Typography variant="body1" paragraph>
          Explore o nosso conjunto de ferramentas avançadas para análise de mercado, sinais de trading e gestão de alertas inteligentes.
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ mt: 2 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Gráficos" />
          <Tab label="Ferramentas" />
        </Tabs>
      </Paper>

      {renderContent()}
    </Container>
  );
};

export default AnalysisPage; 