import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, useTheme, Typography, Paper, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import CandlestickChart from './CandlestickChart';
import TechnicalIndicator from './TechnicalIndicator';
import ChartTools, { ChartType, DrawingTool } from './ChartTools';
import TradingViewWidget from './TradingViewWidget';
import cryptoService from '../../services/cryptoService';
import technicalAnalysisService from '../../services/technicalAnalysisService';
import { MOCK_BITCOIN_DATA } from '../../mocks/cryptoMockData';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';

const AnalysisPage: React.FC = () => {
  const theme = useTheme();
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin');
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<string>('BTCUSDT');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estado para ferramentas de desenho
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  
  // Estado para sincronização entre gráfico e indicadores
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{start: number, end: number} | null>(null);
  const [visibleIndicators, setVisibleIndicators] = useState<string[]>(['rsi', 'macd', 'bollinger']);
  
  // Estado para alternar entre gráfico personalizado e TradingView
  const [chartSource, setChartSource] = useState<'custom' | 'tradingview'>('custom');

  useEffect(() => {
    fetchData();
  }, [selectedCrypto]);

  // Efeito para atualizar indicadores quando o intervalo de tempo muda
  useEffect(() => {
    if (selectedTimeRange && historicalData.length > 0) {
      const { start, end } = selectedTimeRange;
      const selectedData = historicalData.slice(start, end + 1);
      const prices = selectedData.map(item => item.price);
      const latestPrice = prices[prices.length - 1];
      
      const updatedIndicators = technicalAnalysisService.generateIndicators(prices, latestPrice);
      setIndicators(updatedIndicators);
    }
  }, [selectedTimeRange, historicalData]);
  
  // Mapear nome da criptomoeda para símbolo do TradingView
  useEffect(() => {
    switch (selectedCrypto.toLowerCase()) {
      case 'bitcoin':
        setSelectedCryptoSymbol('BTCUSDT');
        break;
      case 'ethereum':
        setSelectedCryptoSymbol('ETHUSDT');
        break;
      case 'litecoin':
        setSelectedCryptoSymbol('LTCUSDT');
        break;
      case 'ripple':
        setSelectedCryptoSymbol('XRPUSDT');
        break;
      case 'cardano':
        setSelectedCryptoSymbol('ADAUSDT');
        break;
      default:
        setSelectedCryptoSymbol('BTCUSDT');
    }
  }, [selectedCrypto]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Em ambiente de desenvolvimento, usar dados mockados
      if (process.env.NODE_ENV === 'development') {
        // Simulação de delay para parecer que está carregando
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Usando dados mockados
        const formattedData = MOCK_BITCOIN_DATA.map((item: any) => ({
          date: new Date(item.timestamp).toLocaleDateString(),
          price: item.price,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));

        setHistoricalData(formattedData);
        
        // Último preço
        const latestPrice = formattedData[formattedData.length - 1].price;
        
        // Extrair preços para calcular indicadores
        const prices = formattedData.map((item: any) => item.price);
        
        // Gerar indicadores técnicos
        const calculatedIndicators = technicalAnalysisService.generateIndicators(prices, latestPrice);
        setIndicators(calculatedIndicators);
        
      } else {
        // Ambiente de produção: buscar dados reais da API
        const cryptoData = await cryptoService.getHistoricalData(selectedCrypto, 'eur', 30);
        
        // Obter o último preço do histórico de dados
        const lastDataPoint = cryptoData.prices[cryptoData.prices.length - 1];
        const latestPrice = lastDataPoint ? lastDataPoint[1] : 0;
        
        // Formatar dados históricos
        const formattedData = cryptoData.prices.map((item: number[]) => ({
          date: new Date(item[0]).toLocaleDateString(),
          price: item[1],
          open: item[1] * (1 - Math.random() * 0.02), // Simulados para demo
          high: item[1] * (1 + Math.random() * 0.01),
          low: item[1] * (1 - Math.random() * 0.01),
          close: item[1],
          volume: Math.floor(Math.random() * 1000000)
        }));
        
        setHistoricalData(formattedData);
        
        // Extrair preços para calcular indicadores
        const prices = formattedData.map((item: any) => item.price);
        
        // Gerar indicadores técnicos
        const calculatedIndicators = technicalAnalysisService.generateIndicators(prices, latestPrice);
        setIndicators(calculatedIndicators);
      }
    } catch (error) {
      console.error('Erro ao buscar dados históricos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolChange = (tool: DrawingTool) => {
    setActiveTool(tool);
    setDrawingMode(tool !== 'none');
  };

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  const handleVolumeToggle = () => {
    setShowVolume(!showVolume);
  };

  const handleGridToggle = () => {
    setShowGrid(!showGrid);
  };

  const handleClearDrawings = () => {
    // Implementar limpeza de desenhos
    console.log('Limpando desenhos');
  };

  const handleZoomIn = () => {
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    console.log('Zoom out');
  };

  const handleResetZoom = () => {
    console.log('Reset zoom');
  };

  const handleDataPointHover = (index: number | null) => {
    setHoveredPointIndex(index);
  };

  const handleTimeRangeSelect = (start: number, end: number) => {
    setSelectedTimeRange({ start, end });
  };

  const toggleIndicatorVisibility = (indicatorName: string) => {
    if (visibleIndicators.includes(indicatorName)) {
      setVisibleIndicators(visibleIndicators.filter(name => name !== indicatorName));
    } else {
      setVisibleIndicators([...visibleIndicators, indicatorName]);
    }
  };
  
  const handleChartSourceChange = (_event: React.MouseEvent<HTMLElement>, newSource: 'custom' | 'tradingview' | null) => {
    if (newSource !== null) {
      setChartSource(newSource);
    }
  };

  // Filtra os indicadores visíveis
  const filteredIndicators = indicators.filter(ind => 
    visibleIndicators.includes(ind.name.toLowerCase())
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      padding: 2,
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Análise Técnica Avançada
        </Typography>
        
        <ToggleButtonGroup
          value={chartSource}
          exclusive
          onChange={handleChartSourceChange}
          aria-label="fonte do gráfico"
          size="small"
        >
          <ToggleButton value="custom" aria-label="gráfico personalizado">
            <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
            Gráfico Personalizado
          </ToggleButton>
          <ToggleButton value="tradingview" aria-label="tradingview">
            <TimelineIcon fontSize="small" sx={{ mr: 1 }} />
            TradingView
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 60px)' }}>
          {chartSource === 'custom' && (
            <ChartTools 
              selectedTool={activeTool}
              onSelectTool={handleToolChange}
              onClearDrawings={handleClearDrawings}
              selectedChartType={chartType}
              onSelectChartType={handleChartTypeChange}
              showVolume={showVolume}
              onToggleVolume={handleVolumeToggle}
              showGrid={showGrid}
              onToggleGrid={handleGridToggle}
            />
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            {/* Gráfico principal - 70% da altura */}
            <Box sx={{ height: '70%', width: '100%' }}>
              {chartSource === 'custom' ? (
                <CandlestickChart 
                  data={historicalData}
                  activeTool={activeTool}
                  drawingMode={drawingMode}
                  showVolume={showVolume}
                  chartType={chartType}
                  showGrid={showGrid}
                  onDataPointHover={handleDataPointHover}
                  onTimeRangeSelect={handleTimeRangeSelect}
                  hoveredPointIndex={hoveredPointIndex}
                />
              ) : (
                <TradingViewWidget 
                  symbol={selectedCryptoSymbol} 
                  theme={theme.palette.mode}
                />
              )}
            </Box>
            
            {/* Indicadores técnicos - 30% da altura */}
            <Paper sx={{ height: '30%', p: 2, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Indicadores Técnicos
                </Typography>
                {chartSource === 'custom' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['RSI', 'MACD', 'Bollinger'].map(ind => (
                      <Box 
                        key={ind}
                        sx={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: visibleIndicators.includes(ind.toLowerCase()) 
                            ? theme.palette.primary.main 
                            : theme.palette.action.disabledBackground,
                          color: visibleIndicators.includes(ind.toLowerCase()) 
                            ? theme.palette.primary.contrastText 
                            : theme.palette.text.secondary,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                        onClick={() => toggleIndicatorVisibility(ind.toLowerCase())}
                      >
                        {ind}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {selectedTimeRange && chartSource === 'custom' ? (
                <Typography variant="body2" sx={{ mb: 2, color: theme.palette.info.main }}>
                  Análise baseada nos dados de {selectedTimeRange.start} até {selectedTimeRange.end}
                </Typography>
              ) : null}
              
              {chartSource === 'custom' ? (
                <TechnicalIndicator 
                  indicators={filteredIndicators} 
                  highlightedIndex={hoveredPointIndex}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Os indicadores técnicos estão disponíveis diretamente no gráfico do TradingView.
                  Use as ferramentas integradas do TradingView para análise detalhada.
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AnalysisPage; 