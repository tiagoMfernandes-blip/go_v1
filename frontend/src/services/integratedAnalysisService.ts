import axios from 'axios';
import technicalAnalysisService from './technicalAnalysisService';

interface Candle {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlePattern {
  type: string;
  position: number;
  significance: 'low' | 'medium' | 'high';
  description: string;
  implication: 'bullish' | 'bearish' | 'neutral';
}

interface IntegratedData {
  ohlcv: Candle[];
  indicators: any[];
  patterns: CandlePattern[];
  lastUpdated: string;
  isMock?: boolean;
}

// Cache para evitar chamadas API excessivas
const cache: Record<string, {data: IntegratedData, timestamp: number}> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Função para formatar dados para diferentes componentes
const formatDataForComponents = (data: any[]): IntegratedData => {
  // Extrai dados de OHLCV (Open, High, Low, Close, Volume)
  const ohlcv = data.map((item: any) => ({
    timestamp: item[0],
    date: new Date(item[0]).toISOString().split('T')[0],
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
    volume: parseFloat(item[5])
  }));

  // Calcular indicadores técnicos
  const prices = ohlcv.map(candle => candle.close);
  const currentPrice = prices[prices.length - 1];
  const indicators = technicalAnalysisService.generateIndicators(prices, currentPrice);

  // Identifica padrões de candles
  const patterns = detectCandlePatterns(ohlcv);

  return {
    ohlcv,
    indicators,
    patterns,
    lastUpdated: new Date().toISOString()
  };
};

// Detecta padrões de candles
const detectCandlePatterns = (candles: Candle[]): CandlePattern[] => {
  const patterns: CandlePattern[] = [];
  
  // Implementação de detecção de padrões comuns
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i-1];
    const curr = candles[i];
    
    // Doji (abertura e fechamento quase iguais)
    if (Math.abs(curr.open - curr.close) < (curr.high - curr.low) * 0.1) {
      patterns.push({
        type: 'doji',
        position: i,
        significance: 'medium',
        description: 'Uma vela onde o preço de abertura e fechamento são quase iguais, indicando indecisão no mercado.',
        implication: 'neutral'
      });
    }
    
    // Hammer (Martelo)
    if (curr.close > curr.open && // Vela de alta
        (curr.high - curr.close) < (curr.close - curr.low) * 0.3 && // Sombra superior pequena
        (curr.open - curr.low) > (curr.close - curr.open) * 2) { // Sombra inferior grande
      patterns.push({
        type: 'hammer',
        position: i,
        significance: 'high',
        description: 'Padrão de reversão de baixa com corpo pequeno e sombra inferior longa, indicando rejeição de preços mais baixos.',
        implication: 'bullish'
      });
    }
    
    // Shooting Star (Estrela Cadente)
    if (curr.close < curr.open && // Vela de baixa
        (curr.open - curr.close) < (curr.high - curr.open) * 0.3 && // Corpo pequeno
        (curr.high - curr.open) > (curr.open - curr.close) * 2 && // Sombra superior grande
        (curr.close - curr.low) < (curr.open - curr.close)) { // Sombra inferior pequena
      patterns.push({
        type: 'shooting_star',
        position: i,
        significance: 'high',
        description: 'Padrão de reversão de alta com corpo pequeno e sombra superior longa, indicando rejeição de preços mais altos.',
        implication: 'bearish'
      });
    }
    
    // Engulfing Bullish (Engolfo de Alta)
    if (i > 0 && 
        prev.close < prev.open && // Vela anterior de baixa
        curr.close > curr.open && // Vela atual de alta
        curr.open < prev.close && // Abre abaixo do fechamento anterior
        curr.close > prev.open) { // Fecha acima da abertura anterior
      patterns.push({
        type: 'engulfing_bullish',
        position: i,
        significance: 'high',
        description: 'Padrão de reversão onde uma vela de alta engole completamente a vela de baixa anterior, indicando força compradora.',
        implication: 'bullish'
      });
    }
    
    // Engulfing Bearish (Engolfo de Baixa)
    if (i > 0 && 
        prev.close > prev.open && // Vela anterior de alta
        curr.close < curr.open && // Vela atual de baixa
        curr.open > prev.close && // Abre acima do fechamento anterior
        curr.close < prev.open) { // Fecha abaixo da abertura anterior
      patterns.push({
        type: 'engulfing_bearish',
        position: i,
        significance: 'high',
        description: 'Padrão de reversão onde uma vela de baixa engole completamente a vela de alta anterior, indicando força vendedora.',
        implication: 'bearish'
      });
    }
    
    // Morning Star (Estrela da Manhã) - Padrão de 3 velas
    if (i >= 2 && 
        candles[i-2].close < candles[i-2].open && // Primeira vela de baixa
        Math.abs(candles[i-1].close - candles[i-1].open) < (candles[i-1].high - candles[i-1].low) * 0.3 && // Segunda vela pequena
        curr.close > curr.open && // Terceira vela de alta
        curr.close > (candles[i-2].open + candles[i-2].close) / 2) { // Fecha acima do meio da primeira vela
      patterns.push({
        type: 'morning_star',
        position: i,
        significance: 'high',
        description: 'Padrão de reversão de baixa composto por três velas: uma grande vela de baixa, seguida por uma vela pequena e finalmente uma grande vela de alta.',
        implication: 'bullish'
      });
    }
    
    // Evening Star (Estrela da Noite) - Padrão de 3 velas
    if (i >= 2 && 
        candles[i-2].close > candles[i-2].open && // Primeira vela de alta
        Math.abs(candles[i-1].close - candles[i-1].open) < (candles[i-1].high - candles[i-1].low) * 0.3 && // Segunda vela pequena
        curr.close < curr.open && // Terceira vela de baixa
        curr.close < (candles[i-2].open + candles[i-2].close) / 2) { // Fecha abaixo do meio da primeira vela
      patterns.push({
        type: 'evening_star',
        position: i,
        significance: 'high',
        description: 'Padrão de reversão de alta composto por três velas: uma grande vela de alta, seguida por uma vela pequena e finalmente uma grande vela de baixa.',
        implication: 'bearish'
      });
    }
  }
  
  return patterns;
};

const integratedAnalysisService = {
  // Busca dados históricos formatados para todos os componentes
  getIntegratedData: async (symbol: string, interval = '1d', limit = 100): Promise<IntegratedData> => {
    const cacheKey = `${symbol}_${interval}_${limit}`;
    
    // Verificar cache
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
      return cache[cacheKey].data;
    }
    
    try {
      // Usando Binance API (mesma fonte que TradingView usa para cripto)
      const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit
        }
      });
      
      const formattedData = formatDataForComponents(response.data);
      
      // Guardar em cache
      cache[cacheKey] = {
        data: formattedData,
        timestamp: Date.now()
      };
      
      return formattedData;
    } catch (error) {
      console.error('Erro ao buscar dados integrados:', error);
      
      // Tentar CoinGecko como alternativa
      try {
        const coinId = symbol.toLowerCase().replace('usdt', '');
        const days = limit <= 30 ? 30 : 90;
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: interval === '1d' ? 'daily' : 'hourly'
          }
        });
        
        // Converter formato do CoinGecko para formato compatível
        const cgData = [];
        for (let i = 0; i < Math.min(response.data.prices.length, limit); i++) {
          const timestamp = response.data.prices[i][0];
          const close = response.data.prices[i][1];
          
          // Estimar valores OHLC a partir do preço (simplificado)
          const volatility = close * 0.02; // 2% volatilidade estimada
          const open = i > 0 ? response.data.prices[i-1][1] : close * 0.99;
          const high = Math.max(open, close) + volatility * 0.3;
          const low = Math.min(open, close) - volatility * 0.3;
          
          // Volume (se disponível)
          const volume = response.data.total_volumes && response.data.total_volumes[i] 
            ? response.data.total_volumes[i][1] 
            : close * 1000; // Volume estimado
            
          cgData.push([timestamp, open, high, low, close, volume]);
        }
        
        const formattedData = formatDataForComponents(cgData);
        
        // Guardar em cache
        cache[cacheKey] = {
          data: formattedData,
          timestamp: Date.now()
        };
        
        return formattedData;
      } catch (cgError) {
        console.error('Erro ao buscar dados do CoinGecko:', cgError);
        // Em caso de erro em ambas as APIs, gerar dados simulados
        return generateMockData(symbol, interval, limit);
      }
    }
  },
  
  // Método para limpar cache
  clearCache: () => {
    Object.keys(cache).forEach(key => delete cache[key]);
  }
};

// Função para gerar dados simulados quando as APIs falham
const generateMockData = (symbol: string, interval: string, limit: number): IntegratedData => {
  const now = Date.now();
  const intervalMs = interval === '1d' ? 86400000 : 3600000; // 1d ou 1h em ms
  
  const mockCandles: Candle[] = [];
  let basePrice = 20000; // Preço base para BTC, ajustar para outros
  
  if (symbol.toLowerCase().includes('eth')) basePrice = 1500;
  if (symbol.toLowerCase().includes('bnb')) basePrice = 300;
  if (symbol.toLowerCase().includes('ada')) basePrice = 0.5;
  if (symbol.toLowerCase().includes('xrp')) basePrice = 0.5;
  if (symbol.toLowerCase().includes('sol')) basePrice = 50;
  
  for (let i = 0; i < limit; i++) {
    const timestamp = now - (limit - i) * intervalMs;
    const volatility = basePrice * 0.02; // 2% de volatilidade
    
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = basePrice * 10 * (0.5 + Math.random());
    
    mockCandles.push({
      timestamp,
      date: new Date(timestamp).toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume
    });
    
    // Ajustar o preço base para o próximo período
    basePrice = close;
  }
  
  const prices = mockCandles.map(candle => candle.close);
  const indicators = technicalAnalysisService.generateIndicators(prices, prices[prices.length - 1]);
  const patterns = detectCandlePatterns(mockCandles);
  
  return {
    ohlcv: mockCandles,
    indicators,
    patterns,
    lastUpdated: new Date().toISOString(),
    isMock: true
  };
};

export default integratedAnalysisService;
