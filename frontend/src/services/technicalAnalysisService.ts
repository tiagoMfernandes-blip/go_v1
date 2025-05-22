import axios from 'axios';
import { CryptoHistoricalData } from '../models/CryptoData';
import { IndicatorData } from '../components/Analysis/TechnicalIndicator';

// Caminho base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Cache para melhorar desempenho
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// Tipos de indicadores técnicos
export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
}

// Tipo para análise técnica completa
export interface TechnicalAnalysis {
  symbol: string;
  indicators: TechnicalIndicator[];
  summary: {
    signal: 'buy' | 'sell' | 'neutral';
    strength: number;
    description: string;
  };
  lastUpdated: string;
}

/**
 * Serviço para cálculo de indicadores de análise técnica
 */
const TechnicalAnalysisService = {
  /**
   * Calcula o RSI (Índice de Força Relativa)
   * @param prices Preços históricos
   * @param period Período para cálculo (padrão: 14)
   * @returns Valor do RSI
   */
  calculateRSI: (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) {
      return 50; // Valor neutro se não houver dados suficientes
    }

    let gains = 0;
    let losses = 0;

    // Calcular ganhos e perdas iniciais
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    // Médias iniciais
    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calcular RSI usando média móvel suavizada
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      let currentGain = 0;
      let currentLoss = 0;

      if (change >= 0) {
        currentGain = change;
      } else {
        currentLoss = Math.abs(change);
      }

      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }

    if (avgLoss === 0) {
      return 100; // Evitar divisão por zero
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  },

  /**
   * Calcula o histórico completo de RSI
   * @param prices Preços históricos
   * @param period Período para cálculo (padrão: 14)
   * @returns Histórico completo de RSI
   */
  calculateRSIHistory: (prices: number[], period: number = 14): number[] => {
    if (prices.length < period + 1) {
      return Array(prices.length).fill(50); // Valores neutros se não houver dados suficientes
    }

    const rsiHistory: number[] = Array(period).fill(50);
    let gains = 0;
    let losses = 0;

    // Calcular ganhos e perdas iniciais
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    // Médias iniciais
    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calcular o primeiro RSI após o período inicial
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiHistory.push(100 - (100 / (1 + rs)));

    // Calcular RSI usando média móvel suavizada para o restante da série
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      let currentGain = 0;
      let currentLoss = 0;

      if (change >= 0) {
        currentGain = change;
      } else {
        currentLoss = Math.abs(change);
      }

      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiHistory.push(100 - (100 / (1 + rs)));
    }

    return rsiHistory;
  },

  /**
   * Calcula o MACD (Moving Average Convergence Divergence)
   * @param prices Preços históricos
   * @param fastPeriod Período rápido para cálculo (padrão: 12)
   * @param slowPeriod Período lento para cálculo (padrão: 26)
   * @param signalPeriod Período do sinal (padrão: 9)
   * @returns Valor do MACD
   */
  calculateMACD: (prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { 
    macd: number, 
    signal: number, 
    histogram: number 
  } => {
    const fastEMA = TechnicalAnalysisService.calculateEMA(prices, fastPeriod);
    const slowEMA = TechnicalAnalysisService.calculateEMA(prices, slowPeriod);
    
    const macdLine = fastEMA - slowEMA;
    
    // Calcular a linha de sinal (média móvel do MACD)
    const macdHistory: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      const fastEMA = TechnicalAnalysisService.calculateEMA(prices.slice(0, i + 1), fastPeriod);
      const slowEMA = TechnicalAnalysisService.calculateEMA(prices.slice(0, i + 1), slowPeriod);
      macdHistory.push(fastEMA - slowEMA);
    }
    
    const signalLine = TechnicalAnalysisService.calculateEMA(macdHistory.slice(-signalPeriod), signalPeriod);
    
    // Calcular o histograma
    const histogram = macdLine - signalLine;
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  },

  /**
   * Calcula o histórico completo de MACD
   * @param prices Preços históricos
   * @param fastPeriod Período rápido para cálculo (padrão: 12)
   * @param slowPeriod Período lento para cálculo (padrão: 26)
   * @param signalPeriod Período do sinal (padrão: 9)
   * @returns Histórico completo de MACD
   */
  calculateMACDHistory: (prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: number[],
    signal: number[],
    histogram: number[]
  } => {
    // Precisamos de pelo menos slowPeriod + signalPeriod pontos para calcular o MACD completo
    const minDataPoints = Math.max(fastPeriod, slowPeriod) + signalPeriod;
    
    const macdLine: number[] = [];
    const signalLine: number[] = [];
    const histogram: number[] = [];
    
    // Preencher com zeros os primeiros pontos onde não temos dados suficientes
    const padLength = Math.max(fastPeriod, slowPeriod) - 1;
    for (let i = 0; i < padLength; i++) {
      macdLine.push(0);
      signalLine.push(0);
      histogram.push(0);
    }
    
    // Calcular o MACD para cada ponto
    for (let i = padLength; i < prices.length; i++) {
      const fastEMA = TechnicalAnalysisService.calculateEMA(prices.slice(0, i + 1), fastPeriod);
      const slowEMA = TechnicalAnalysisService.calculateEMA(prices.slice(0, i + 1), slowPeriod);
      const currentMACD = fastEMA - slowEMA;
      macdLine.push(currentMACD);
      
      // Para a linha de sinal, precisamos de signalPeriod pontos de MACD
      if (i >= padLength + signalPeriod - 1) {
        const validMACDs = macdLine.slice(-signalPeriod);
        const currentSignal = TechnicalAnalysisService.calculateEMA(validMACDs, signalPeriod);
        signalLine.push(currentSignal);
        histogram.push(currentMACD - currentSignal);
      } else {
        signalLine.push(0);
        histogram.push(0);
      }
    }
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  },

  /**
   * Calcula as Bandas de Bollinger
   * @param prices Preços históricos
   * @param period Período para cálculo (padrão: 20)
   * @param multiplier Multiplicador do desvio padrão (padrão: 2)
   * @returns Bandas de Bollinger
   */
  calculateBollingerBands: (prices: number[], period: number = 20, multiplier: number = 2): { upper: number; middle: number; lower: number } => {
    if (prices.length < period) {
      const lastPrice = prices[prices.length - 1] || 0;
      return {
        upper: lastPrice * 1.05,
        middle: lastPrice,
        lower: lastPrice * 0.95
      };
    }

    try {
      // Calcular a média móvel simples
      const sma = TechnicalAnalysisService.calculateSMA(prices, period);

      // Calcular o desvio padrão
      let sum = 0;
      for (let i = prices.length - period; i < prices.length; i++) {
        sum += Math.pow(prices[i] - sma, 2);
      }
      const stdDev = Math.sqrt(sum / period);

      // Calcular bandas
      const upper = sma + (multiplier * stdDev);
      const lower = sma - (multiplier * stdDev);

      return {
        upper: parseFloat(upper.toFixed(2)),
        middle: parseFloat(sma.toFixed(2)),
        lower: parseFloat(lower.toFixed(2))
      };
    } catch (error) {
      console.error('Erro ao calcular Bandas de Bollinger:', error);
      const lastPrice = prices[prices.length - 1] || 0;
      return {
        upper: lastPrice * 1.05,
        middle: lastPrice,
        lower: lastPrice * 0.95
      };
    }
  },

  /**
   * Calcula o histórico completo das Bandas de Bollinger
   * @param prices Preços históricos
   * @param period Período para cálculo (padrão: 20)
   * @param multiplier Multiplicador do desvio padrão (padrão: 2)
   * @returns Histórico completo das Bandas de Bollinger
   */
  calculateBollingerBandsHistory: (prices: number[], period: number = 20, multiplier: number = 2): {
    upper: number[],
    middle: number[],
    lower: number[]
  } => {
    const upper: number[] = [];
    const middle: number[] = [];
    const lower: number[] = [];
    
    // Preencher com zeros os primeiros pontos onde não temos dados suficientes
    for (let i = 0; i < period - 1; i++) {
      upper.push(0);
      middle.push(0);
      lower.push(0);
    }
    
    // Calcular as Bandas de Bollinger para cada ponto
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const sma = TechnicalAnalysisService.calculateSMA(slice, period);
      
      // Calcular o desvio padrão
      let sumSquaredDiff = 0;
      for (const price of slice) {
        sumSquaredDiff += Math.pow(price - sma, 2);
      }
      const standardDeviation = Math.sqrt(sumSquaredDiff / period);
      
      upper.push(sma + (standardDeviation * multiplier));
      middle.push(sma);
      lower.push(sma - (standardDeviation * multiplier));
    }
    
    return {
      upper,
      middle,
      lower
    };
  },

  /**
   * Calcula a Média Móvel Simples
   * @param prices Preços históricos
   * @param period Período para cálculo
   * @returns Valor da SMA
   */
  calculateSMA: (prices: number[], period: number): number => {
    if (prices.length < period) {
      return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }
    
    const sum = prices.slice(-period).reduce((total, price) => total + price, 0);
    return sum / period;
  },

  /**
   * Calcula a Média Móvel Exponencial
   * @param prices Preços históricos
   * @param period Período para cálculo
   * @returns Valor da EMA
   */
  calculateEMA: (prices: number[], period: number): number => {
    if (prices.length < period) {
      return TechnicalAnalysisService.calculateSMA(prices, prices.length);
    }
    
    const k = 2 / (period + 1);
    
    // Iniciar EMA com SMA para o primeiro período
    let ema = TechnicalAnalysisService.calculateSMA(prices.slice(0, period), period);
    
    // Calcular EMA para o restante dos preços
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    
    return ema;
  },

  /**
   * Gera um conjunto de indicadores técnicos para análise usando dados históricos
   * @param historicalData Dados históricos da criptomoeda
   * @param currentPrice Preço atual
   * @returns Lista de indicadores técnicos
   */
  generateIndicatorsFromHistorical: (historicalData: CryptoHistoricalData, currentPrice: number): IndicatorData[] => {
    try {
      // Extrair preços de fechamento
      const prices = historicalData.prices.map((price: any) => price[1]);
      
      return TechnicalAnalysisService.generateIndicators(prices, currentPrice);
    } catch (error) {
      console.error('Erro ao gerar indicadores:', error);
      return [];
    }
  },
  
  /**
   * Gera um conjunto de indicadores técnicos para análise
   * @param prices Array de preços históricos
   * @param currentPrice Preço atual
   * @returns Lista de indicadores técnicos
   */
  generateIndicators: (prices: number[], currentPrice: number): IndicatorData[] => {
    try {
      // Calcular RSI
      const rsi = TechnicalAnalysisService.calculateRSI(prices);
      const rsiHistory = TechnicalAnalysisService.calculateRSIHistory(prices);
      
      // Interpretar RSI
      let rsiStatus: 'positive' | 'negative' | 'neutral' = 'neutral';
      let rsiInterpretation = 'Mercado em equilíbrio';
      
      if (rsi > 70) {
        rsiStatus = 'negative';
        rsiInterpretation = 'Sobrecomprado - possível reversão de alta para baixa';
      } else if (rsi < 30) {
        rsiStatus = 'positive';
        rsiInterpretation = 'Sobrevendido - possível reversão de baixa para alta';
      }
      
      // Calcular MACD
      const macd = TechnicalAnalysisService.calculateMACD(prices);
      const macdHistory = TechnicalAnalysisService.calculateMACDHistory(prices);
      
      // Interpretar MACD
      let macdStatus: 'positive' | 'negative' | 'neutral' = 'neutral';
      let macdInterpretation = 'Sem tendência clara';
      
      if (macd.histogram > 0 && macd.macd > 0) {
        macdStatus = 'positive';
        macdInterpretation = 'Tendência de alta - MACD acima da linha de sinal';
      } else if (macd.histogram < 0 && macd.macd < 0) {
        macdStatus = 'negative';
        macdInterpretation = 'Tendência de baixa - MACD abaixo da linha de sinal';
      } else if (macd.histogram > 0 && macd.histogram > macd.histogram) {
        macdStatus = 'positive';
        macdInterpretation = 'Possível início de tendência de alta';
      } else if (macd.histogram < 0 && macd.histogram < macd.histogram) {
        macdStatus = 'negative';
        macdInterpretation = 'Possível início de tendência de baixa';
      }
      
      // Calcular Bandas de Bollinger
      const bollinger = TechnicalAnalysisService.calculateBollingerBands(prices);
      const bollingerHistory = TechnicalAnalysisService.calculateBollingerBandsHistory(prices);
      
      // Interpretar Bandas de Bollinger
      let bollingerStatus: 'positive' | 'negative' | 'neutral' = 'neutral';
      let bollingerInterpretation = 'Preço dentro das bandas - volatilidade normal';
      
      if (currentPrice > bollinger.upper) {
        bollingerStatus = 'negative';
        bollingerInterpretation = 'Preço acima da banda superior - possível sobrevalorização ou forte tendência de alta';
      } else if (currentPrice < bollinger.lower) {
        bollingerStatus = 'positive';
        bollingerInterpretation = 'Preço abaixo da banda inferior - possível subvalorização ou forte tendência de baixa';
      }
      
      // Formatar históricos para sincronização com o gráfico
      const formatHistoryValue = (value: number): string => 
        value.toFixed(2);
      
      const formattedRSIHistory = rsiHistory.map(formatHistoryValue);
      const formattedMACDHistory = macdHistory.macd.map(formatHistoryValue);
      const formattedBollingerMiddleHistory = bollingerHistory.middle.map(formatHistoryValue);
      
      // Gerar indicadores
      const indicators: IndicatorData[] = [
        {
          name: 'RSI',
          value: rsi.toFixed(2),
          interpretation: rsiInterpretation,
          status: rsiStatus,
          color: rsiStatus === 'positive' ? '#00c087' : rsiStatus === 'negative' ? '#f5475c' : '#3f51b5',
          details: [
            { label: 'Período', value: '14 dias' },
            { label: 'Sobrecomprado', value: '> 70', color: '#f5475c' },
            { label: 'Sobrevendido', value: '< 30', color: '#00c087' }
          ],
          history: formattedRSIHistory
        },
        {
          name: 'MACD',
          value: macd.macd.toFixed(2),
          interpretation: macdInterpretation,
          status: macdStatus,
          color: macdStatus === 'positive' ? '#00c087' : macdStatus === 'negative' ? '#f5475c' : '#3f51b5',
          details: [
            { label: 'Linha MACD', value: macd.macd.toFixed(2) },
            { label: 'Linha de Sinal', value: macd.signal.toFixed(2) },
            { label: 'Histograma', value: macd.histogram.toFixed(2), color: macd.histogram > 0 ? '#00c087' : '#f5475c' }
          ],
          history: formattedMACDHistory
        },
        {
          name: 'Bollinger',
          value: currentPrice.toFixed(2),
          interpretation: bollingerInterpretation,
          status: bollingerStatus,
          color: bollingerStatus === 'positive' ? '#00c087' : bollingerStatus === 'negative' ? '#f5475c' : '#3f51b5',
          details: [
            { label: 'Banda Superior', value: bollinger.upper.toFixed(2) },
            { label: 'Média (SMA 20)', value: bollinger.middle.toFixed(2) },
            { label: 'Banda Inferior', value: bollinger.lower.toFixed(2) }
          ],
          history: formattedBollingerMiddleHistory
        }
      ];
      
      return indicators;
    } catch (error) {
      console.error('Erro ao gerar indicadores:', error);
      return [];
    }
  },

  /**
   * Obtém análise técnica para um ativo específico
   * @param symbol Símbolo do ativo (ex: BTC)
   */
  async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis> {
    const cacheKey = `technical_analysis_${symbol}`;
    
    // Verificar cache
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
      return cache[cacheKey].data;
    }
    
    try {
      // Obter análise técnica do backend
      const response = await axios.get<TechnicalAnalysis>(`${API_BASE_URL}/technical/${symbol}`);
      const data = response.data;
      
      // Salvar no cache
      cache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (error) {
      console.error(`Erro ao obter análise técnica para ${symbol}:`, error);
      
      // Retornar dados simulados em caso de erro
      return this.generateMockTechnicalAnalysis(symbol);
    }
  },
  
  /**
   * Gera dados simulados de análise técnica quando a API falha
   * @param symbol Símbolo do ativo
   * @returns Análise técnica simulada
   */
  generateMockTechnicalAnalysis(symbol: string): TechnicalAnalysis {
    // Gerar valores aleatórios para indicadores
    const rsi = Math.random() * 100;
    const macd = -2 + Math.random() * 4; // Entre -2 e 2
    const ema50 = 1000 + Math.random() * 1000;
    const ema200 = 500 + Math.random() * 2000;
    
    // Determinar sinais com base nos valores
    const rsiSignal = rsi < 30 ? 'buy' : rsi > 70 ? 'sell' : 'neutral';
    const macdSignal = macd > 0 ? 'buy' : macd < 0 ? 'sell' : 'neutral';
    const emaSignal = ema50 > ema200 ? 'buy' : ema50 < ema200 ? 'sell' : 'neutral';
    
    // Contar sinais de cada tipo
    const signals = [rsiSignal, macdSignal, emaSignal];
    const buyCount = signals.filter(s => s === 'buy').length;
    const sellCount = signals.filter(s => s === 'sell').length;
    
    // Determinar sinal global
    let globalSignal: 'buy' | 'sell' | 'neutral' = 'neutral';
    let strength = 0.5;
    let description = 'Indicadores técnicos mistos';
    
    if (buyCount > sellCount) {
      globalSignal = 'buy';
      strength = buyCount / signals.length;
      description = `${buyCount}/${signals.length} indicadores sugerem compra`;
    } else if (sellCount > buyCount) {
      globalSignal = 'sell';
      strength = sellCount / signals.length;
      description = `${sellCount}/${signals.length} indicadores sugerem venda`;
    }
    
    return {
      symbol: symbol.toUpperCase(),
      indicators: [
        { name: 'RSI', value: rsi, signal: rsiSignal },
        { name: 'MACD', value: macd, signal: macdSignal },
        { name: 'EMA Cross', value: ema50 - ema200, signal: emaSignal }
      ],
      summary: {
        signal: globalSignal,
        strength,
        description
      },
      lastUpdated: new Date().toISOString()
    };
  }
};

export default TechnicalAnalysisService; 