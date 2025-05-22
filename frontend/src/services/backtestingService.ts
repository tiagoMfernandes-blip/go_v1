import integratedAnalysisService from './integratedAnalysisService';
import technicalAnalysisService from './technicalAnalysisService';

export interface TradeResult {
  entryDate: Date;
  entryPrice: number;
  exitDate: Date;
  exitPrice: number;
  profit: number;
  profitPercentage: number;
  stopLossHit: boolean;
  takeProfitHit: boolean;
  duration: number; // Em dias
}

export interface BacktestResult {
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  trades: TradeResult[];
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  totalProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  averageHoldingPeriod: number; // Em dias
}

export interface BacktestStrategy {
  name: string;
  description: string;
  entryCondition: (data: any, index: number) => boolean;
  exitCondition: (data: any, index: number, entryPrice: number) => boolean;
  stopLoss?: number; // percentagem
  takeProfit?: number; // percentagem
}

const BacktestingService = {
  // Testar uma estratégia com dados históricos
  runBacktest: async (
    symbol: string, 
    timeframe: string, 
    strategy: BacktestStrategy, 
    days: number = 90
  ): Promise<BacktestResult> => {
    // Obter dados históricos
    const data = await integratedAnalysisService.getIntegratedData(symbol, timeframe, days);
    
    const trades: TradeResult[] = [];
    let inPosition = false;
    let entryPrice = 0;
    let entryDate = new Date();
    let entryIndex = 0;
    
    // Simular trades baseados na estratégia
    for (let i = 30; i < data.ohlcv.length; i++) { // Começar após alguns dados para cálculos
      const candle = data.ohlcv[i];
      
      if (!inPosition) {
        // Verificar condição de entrada
        if (strategy.entryCondition(data, i)) {
          inPosition = true;
          entryPrice = candle.close;
          entryDate = new Date(candle.timestamp);
          entryIndex = i;
        }
      } else {
        // Verificar condição de saída
        let exitReason = '';
        let stopLossHit = false;
        let takeProfitHit = false;
        
        // Verificar stop loss
        if (strategy.stopLoss && candle.low <= entryPrice * (1 - strategy.stopLoss / 100)) {
          inPosition = false;
          exitReason = 'Stop Loss';
          stopLossHit = true;
        }
        // Verificar take profit
        else if (strategy.takeProfit && candle.high >= entryPrice * (1 + strategy.takeProfit / 100)) {
          inPosition = false;
          exitReason = 'Take Profit';
          takeProfitHit = true;
        }
        // Verificar condição de saída da estratégia
        else if (strategy.exitCondition(data, i, entryPrice)) {
          inPosition = false;
          exitReason = 'Estratégia';
        }
        
        // Se saiu da posição, registrar trade
        if (!inPosition) {
          const exitPrice = candle.close;
          const profit = exitPrice - entryPrice;
          const profitPercentage = (profit / entryPrice) * 100;
          const exitDate = new Date(candle.timestamp);
          const duration = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)); // Em dias
          
          trades.push({
            entryDate,
            entryPrice,
            exitDate,
            exitPrice,
            profit,
            profitPercentage,
            stopLossHit,
            takeProfitHit,
            duration
          });
        }
      }
    }
    
    // Se ainda estiver em posição no final, fechar com o último preço
    if (inPosition) {
      const lastCandle = data.ohlcv[data.ohlcv.length - 1];
      const exitPrice = lastCandle.close;
      const profit = exitPrice - entryPrice;
      const profitPercentage = (profit / entryPrice) * 100;
      const exitDate = new Date(lastCandle.timestamp);
      const duration = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)); // Em dias
      
      trades.push({
        entryDate,
        entryPrice,
        exitDate,
        exitPrice,
        profit,
        profitPercentage,
        stopLossHit: false,
        takeProfitHit: false,
        duration
      });
    }
    
    // Calcular estatísticas
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
    const averageProfit = trades.filter(t => t.profit > 0).length > 0 ? 
      trades.filter(t => t.profit > 0).reduce((sum, trade) => sum + trade.profit, 0) / winningTrades : 0;
    const averageLoss = (totalTrades - winningTrades) > 0 ? 
      trades.filter(t => t.profit < 0).reduce((sum, trade) => sum + Math.abs(trade.profit), 0) / (totalTrades - winningTrades) : 0;
    const averageHoldingPeriod = totalTrades > 0 ? 
      trades.reduce((sum, trade) => sum + trade.duration, 0) / totalTrades : 0;
    
    return {
      symbol,
      timeframe,
      startDate: data.ohlcv[0].date ? new Date(data.ohlcv[0].date) : new Date(data.ohlcv[0].timestamp),
      endDate: data.ohlcv[data.ohlcv.length - 1].date ? 
        new Date(data.ohlcv[data.ohlcv.length - 1].date) : 
        new Date(data.ohlcv[data.ohlcv.length - 1].timestamp),
      trades,
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      winRate,
      averageProfit,
      averageLoss,
      totalProfit,
      maxDrawdown: calculateMaxDrawdown(trades),
      sharpeRatio: calculateSharpeRatio(trades),
      averageHoldingPeriod
    };
  },
  
  // Testar múltiplas estratégias para comparação
  compareStrategies: async (
    symbol: string, 
    timeframe: string, 
    strategies: BacktestStrategy[], 
    days: number = 90
  ): Promise<Record<string, BacktestResult>> => {
    const results: Record<string, BacktestResult> = {};
    
    // Executar backtests em paralelo
    await Promise.all(
      strategies.map(async (strategy) => {
        const result = await BacktestingService.runBacktest(symbol, timeframe, strategy, days);
        results[strategy.name] = result;
      })
    );
    
    return results;
  },
  
  // Estratégias predefinidas para teste
  predefinedStrategies: {
    rsiStrategy: {
      name: 'Estratégia RSI',
      description: 'Compra quando RSI abaixo de 30, vende quando acima de 70',
      entryCondition: (data: any, index: number) => {
        const prices = data.ohlcv.slice(0, index + 1).map((c: any) => c.close);
        const rsi = technicalAnalysisService.calculateRSI(prices);
        return rsi < 30;
      },
      exitCondition: (data: any, index: number) => {
        const prices = data.ohlcv.slice(0, index + 1).map((c: any) => c.close);
        const rsi = technicalAnalysisService.calculateRSI(prices);
        return rsi > 70;
      },
      stopLoss: 5,
      takeProfit: 15
    },
    
    macdStrategy: {
      name: 'Estratégia MACD',
      description: 'Compra no cruzamento positivo do MACD, vende no cruzamento negativo',
      entryCondition: (data: any, index: number) => {
        if (index < 2) return false;
        
        const prices = data.ohlcv.slice(0, index + 1).map((c: any) => c.close);
        const currentMACD = technicalAnalysisService.calculateMACD(prices);
        
        const prevPrices = data.ohlcv.slice(0, index).map((c: any) => c.close);
        const prevMACD = technicalAnalysisService.calculateMACD(prevPrices);
        
        return currentMACD.histogram > 0 && prevMACD.histogram <= 0;
      },
      exitCondition: (data: any, index: number) => {
        if (index < 2) return false;
        
        const prices = data.ohlcv.slice(0, index + 1).map((c: any) => c.close);
        const currentMACD = technicalAnalysisService.calculateMACD(prices);
        
        const prevPrices = data.ohlcv.slice(0, index).map((c: any) => c.close);
        const prevMACD = technicalAnalysisService.calculateMACD(prevPrices);
        
        return currentMACD.histogram < 0 && prevMACD.histogram >= 0;
      },
      stopLoss: 7,
      takeProfit: 20
    },
    
    bollingerBandsStrategy: {
      name: 'Estratégia Bandas de Bollinger',
      description: 'Compra quando preço atinge a banda inferior, vende quando atinge a banda superior',
      entryCondition: (data: any, index: number) => {
        const prices = data.ohlcv.slice(0, index + 1).map((c: any) => c.close);
        const bollinger = technicalAnalysisService.calculateBollingerBands(prices);
        return data.ohlcv[index].close <= bollinger.lower;
      },
      exitCondition: (data: any, index: number) => {
        const prices = data.ohlcv.slice(0, index + 1).map((c: any) => c.close);
        const bollinger = technicalAnalysisService.calculateBollingerBands(prices);
        return data.ohlcv[index].close >= bollinger.upper;
      },
      stopLoss: 5,
      takeProfit: 10
    },
    
    supportResistanceStrategy: {
      name: 'Estratégia Suporte e Resistência',
      description: 'Compra em níveis de suporte, vende em níveis de resistência',
      entryCondition: (data: any, index: number) => {
        if (index < 20) return false;
        
        const candles = data.ohlcv.slice(index - 20, index);
        const lows = candles.map((c: any) => c.low);
        const support = Math.min(...lows);
        const currentPrice = data.ohlcv[index].close;
        
        // Comprar se o preço estiver próximo ao suporte (até 2%)
        const supportProximity = Math.abs((support - currentPrice) / currentPrice) * 100;
        return supportProximity < 2 && currentPrice > support;
      },
      exitCondition: (data: any, index: number) => {
        if (index < 20) return false;
        
        const candles = data.ohlcv.slice(index - 20, index);
        const highs = candles.map((c: any) => c.high);
        const resistance = Math.max(...highs);
        const currentPrice = data.ohlcv[index].close;
        
        // Vender se o preço estiver próximo à resistência (até 2%)
        const resistanceProximity = Math.abs((resistance - currentPrice) / currentPrice) * 100;
        return resistanceProximity < 2 && currentPrice < resistance;
      },
      stopLoss: 3,
      takeProfit: 8
    }
  }
};

// Funções auxiliares para cálculos
function calculateMaxDrawdown(trades: TradeResult[]): number {
  if (trades.length === 0) return 0;
  
  // Calcular equity curve
  let equity = 1000; // Capital inicial
  const equityCurve: number[] = [equity];
  
  trades.forEach(trade => {
    equity += trade.profit;
    equityCurve.push(equity);
  });
  
  // Calcular drawdown máximo
  let maxDrawdown = 0;
  let peak = equityCurve[0];
  
  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
    } else {
      const drawdown = (peak - equityCurve[i]) / peak * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }
  
  return maxDrawdown;
}

function calculateSharpeRatio(trades: TradeResult[]): number {
  if (trades.length < 2) return 0;
  
  // Calcular retornos diários
  const returns = trades.map(trade => trade.profitPercentage);
  
  // Média dos retornos
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  // Desvio padrão dos retornos
  let sumSquaredDiff = 0;
  for (const ret of returns) {
    sumSquaredDiff += Math.pow(ret - meanReturn, 2);
  }
  const stdDev = Math.sqrt(sumSquaredDiff / (returns.length - 1));
  
  // Taxa livre de risco (simplificado)
  const riskFreeRate = 2; // 2% anual
  const riskFreeDaily = Math.pow(1 + riskFreeRate / 100, 1/365) - 1;
  
  // Sharpe Ratio
  if (stdDev === 0) return 0;
  return (meanReturn - riskFreeDaily) / stdDev * Math.sqrt(252); // Anualizado
}

export default BacktestingService; 