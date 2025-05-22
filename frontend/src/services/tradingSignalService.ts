import technicalAnalysisService from './technicalAnalysisService';
import integratedAnalysisService from './integratedAnalysisService';

export interface TradingSignal {
  assetId: string;
  symbol: string;
  type: 'buy' | 'sell' | 'strong_buy' | 'strong_sell' | 'neutral';
  confidence: number; // 0-100
  basedOn: string[]; // indicadores que geraram o sinal
  timestamp: Date;
  price: number;
  timeframe: string; // '1h', '4h', '1d', etc.
  description: string;
  stopLoss?: number;
  takeProfit?: number;
}

const TradingSignalService = {
  // Obter todos os sinais de trading para diferentes ativos
  getSignals: async (): Promise<TradingSignal[]> => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BNBUSDT', 'SOLUSDT'];
    const timeframes = ['1h', '4h', '1d'];
    const allSignals: TradingSignal[] = [];
    
    // Obter sinais para cada símbolo e timeframe
    for (const symbol of symbols) {
      for (const timeframe of timeframes) {
        try {
          const signals = await TradingSignalService.generateSignals(symbol, timeframe);
          allSignals.push(...signals);
        } catch (error) {
          console.error(`Erro ao gerar sinais para ${symbol} em ${timeframe}:`, error);
        }
      }
    }
    
    // Adicionar algumas métricas para stop loss e take profit
    return allSignals.map(signal => {
      if (signal.type.includes('buy')) {
        return {
          ...signal,
          stopLoss: Math.round(3 + Math.random() * 5), // 3-8%
          takeProfit: Math.round(10 + Math.random() * 20) // 10-30%
        };
      }
      return signal;
    });
  },
  
  // Gerar sinais de trading baseados em múltiplos indicadores
  generateSignals: async (symbol: string, timeframe: string = '1d'): Promise<TradingSignal[]> => {
    // Obter dados integrados
    const data = await integratedAnalysisService.getIntegratedData(symbol, timeframe);
    const signals: TradingSignal[] = [];
    
    // Extrair dados relevantes
    const prices = data.ohlcv.map(candle => candle.close);
    const volumes = data.ohlcv.map(candle => candle.volume);
    const currentPrice = prices[prices.length - 1];
    
    // 1. Verificar sinais de RSI
    const rsi = technicalAnalysisService.calculateRSI(prices);
    if (rsi < 30) {
      signals.push({
        assetId: symbol.toLowerCase().replace('usdt', ''),
        symbol: symbol,
        type: 'buy',
        confidence: 70,
        basedOn: ['RSI'],
        timestamp: new Date(),
        price: currentPrice,
        timeframe: timeframe,
        description: `RSI em sobrevendido (${rsi.toFixed(2)})`
      });
    } else if (rsi > 70) {
      signals.push({
        assetId: symbol.toLowerCase().replace('usdt', ''),
        symbol: symbol,
        type: 'sell',
        confidence: 70,
        basedOn: ['RSI'],
        timestamp: new Date(),
        price: currentPrice,
        timeframe: timeframe,
        description: `RSI em sobrecomprado (${rsi.toFixed(2)})`
      });
    }
    
    // 2. Verificar sinais de MACD
    const macd = technicalAnalysisService.calculateMACD(prices);
    if (macd.histogram > 0 && macd.histogram > macd.signal) {
      signals.push({
        assetId: symbol.toLowerCase().replace('usdt', ''),
        symbol: symbol,
        type: 'buy',
        confidence: 65,
        basedOn: ['MACD'],
        timestamp: new Date(),
        price: currentPrice,
        timeframe: timeframe,
        description: 'Cruzamento positivo do MACD'
      });
    } else if (macd.histogram < 0 && macd.histogram < macd.signal) {
      signals.push({
        assetId: symbol.toLowerCase().replace('usdt', ''),
        symbol: symbol,
        type: 'sell',
        confidence: 65,
        basedOn: ['MACD'],
        timestamp: new Date(),
        price: currentPrice,
        timeframe: timeframe,
        description: 'Cruzamento negativo do MACD'
      });
    }
    
    // 3. Verificar padrões de candles
    const patterns = data.patterns;
    patterns.forEach(pattern => {
      if (pattern.position >= data.ohlcv.length - 3) { // Padrões recentes
        if (pattern.implication === 'bullish') {
          signals.push({
            assetId: symbol.toLowerCase().replace('usdt', ''),
            symbol: symbol,
            type: 'buy',
            confidence: pattern.significance === 'high' ? 80 : 60,
            basedOn: ['Padrão de Velas'],
            timestamp: new Date(),
            price: currentPrice,
            timeframe: timeframe,
            description: `Padrão ${pattern.type}: ${pattern.description}`
          });
        } else if (pattern.implication === 'bearish') {
          signals.push({
            assetId: symbol.toLowerCase().replace('usdt', ''),
            symbol: symbol,
            type: 'sell',
            confidence: pattern.significance === 'high' ? 80 : 60,
            basedOn: ['Padrão de Velas'],
            timestamp: new Date(),
            price: currentPrice,
            timeframe: timeframe,
            description: `Padrão ${pattern.type}: ${pattern.description}`
          });
        }
      }
    });
    
    // 4. Análise de suporte e resistência
    const lastCandles = data.ohlcv.slice(-30);
    const highs = lastCandles.map(c => c.high);
    const lows = lastCandles.map(c => c.low);
    
    // Identificar níveis de suporte e resistência (simplificado)
    const resistance = Math.max(...highs.slice(0, -1));
    const support = Math.min(...lows.slice(0, -1));
    
    // Verificar proximidade a níveis importantes
    const resistanceProximity = Math.abs((resistance - currentPrice) / currentPrice) * 100;
    const supportProximity = Math.abs((support - currentPrice) / currentPrice) * 100;
    
    if (resistanceProximity < 3 && currentPrice < resistance) {
      signals.push({
        assetId: symbol.toLowerCase().replace('usdt', ''),
        symbol: symbol,
        type: 'sell',
        confidence: 75,
        basedOn: ['Nível de Resistência'],
        timestamp: new Date(),
        price: currentPrice,
        timeframe: timeframe,
        description: `Preço próximo ao nível de resistência (${resistance.toFixed(2)})`
      });
    } else if (supportProximity < 3 && currentPrice > support) {
      signals.push({
        assetId: symbol.toLowerCase().replace('usdt', ''),
        symbol: symbol,
        type: 'buy',
        confidence: 75,
        basedOn: ['Nível de Suporte'],
        timestamp: new Date(),
        price: currentPrice,
        timeframe: timeframe,
        description: `Preço próximo ao nível de suporte (${support.toFixed(2)})`
      });
    }
    
    // 5. Combinação de sinais para aumentar confiança
    const combinedSignals = combineSignals(signals);
    
    return combinedSignals;
  },
  
  // Obter o melhor sinal para um ativo
  getBestSignal: async (symbol: string, timeframe: string = '1d'): Promise<TradingSignal | null> => {
    const signals = await TradingSignalService.generateSignals(symbol, timeframe);
    if (signals.length === 0) return null;
    
    // Ordenar por confiança e retornar o melhor sinal
    return signals.sort((a, b) => b.confidence - a.confidence)[0];
  },
  
  // Obter sinais para múltiplos ativos
  getMultipleSignals: async (symbols: string[], timeframe: string = '1d'): Promise<Record<string, TradingSignal | null>> => {
    const result: Record<string, TradingSignal | null> = {};
    
    await Promise.all(
      symbols.map(async (symbol) => {
        const signal = await TradingSignalService.getBestSignal(symbol, timeframe);
        result[symbol] = signal;
      })
    );
    
    return result;
  }
};

// Função para combinar sinais e aumentar confiança
function combineSignals(signals: TradingSignal[]): TradingSignal[] {
  if (signals.length <= 1) return signals;
  
  const combinedSignals: TradingSignal[] = [];
  const buySignals = signals.filter(s => s.type === 'buy' || s.type === 'strong_buy');
  const sellSignals = signals.filter(s => s.type === 'sell' || s.type === 'strong_sell');
  
  // Se tivermos múltiplos sinais de compra, combinar em um único sinal mais forte
  if (buySignals.length > 1) {
    // Obter fontes únicas de sinais
    const allSources = buySignals.flatMap(s => s.basedOn);
    const basedOnSources = Array.from(new Set(allSources));
    
    const avgConfidence = buySignals.reduce((sum, s) => sum + s.confidence, 0) / buySignals.length;
    // Bonus de confiança por ter múltiplos sinais
    const confidenceBonus = Math.min(20, 5 * buySignals.length);
    
    combinedSignals.push({
      ...buySignals[0],
      type: avgConfidence + confidenceBonus > 80 ? 'strong_buy' : 'buy',
      confidence: Math.min(100, avgConfidence + confidenceBonus),
      basedOn: basedOnSources,
      description: `Múltiplos indicadores sugerem compra (${basedOnSources.join(', ')})`
    });
  } else if (buySignals.length === 1) {
    combinedSignals.push(buySignals[0]);
  }
  
  // Se tivermos múltiplos sinais de venda, combinar em um único sinal mais forte
  if (sellSignals.length > 1) {
    // Obter fontes únicas de sinais
    const allSources = sellSignals.flatMap(s => s.basedOn);
    const basedOnSources = Array.from(new Set(allSources));
    
    const avgConfidence = sellSignals.reduce((sum, s) => sum + s.confidence, 0) / sellSignals.length;
    // Bonus de confiança por ter múltiplos sinais
    const confidenceBonus = Math.min(20, 5 * sellSignals.length);
    
    combinedSignals.push({
      ...sellSignals[0],
      type: avgConfidence + confidenceBonus > 80 ? 'strong_sell' : 'sell',
      confidence: Math.min(100, avgConfidence + confidenceBonus),
      basedOn: basedOnSources,
      description: `Múltiplos indicadores sugerem venda (${basedOnSources.join(', ')})`
    });
  } else if (sellSignals.length === 1) {
    combinedSignals.push(sellSignals[0]);
  }
  
  // Adicionar quaisquer outros sinais neutros que possam existir
  const neutralSignals = signals.filter(s => s.type === 'neutral');
  combinedSignals.push(...neutralSignals);
  
  return combinedSignals;
}

export default TradingSignalService; 