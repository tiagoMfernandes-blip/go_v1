import { CryptoHistoricalData } from '../models/CryptoData';

// Função para gerar dados históricos simulados
export const generateMockHistoricalData = (
  startPrice: number, 
  volatility: number = 0.05, 
  days: number = 7
): CryptoHistoricalData => {
  const now = Date.now();
  const millisecondsPerDay = 86400000;
  const dataPoints = days * 24; // Um ponto por hora
  const prices: [number, number][] = [];
  const market_caps: [number, number][] = [];
  const total_volumes: [number, number][] = [];
  
  let currentPrice = startPrice;
  let marketCap = startPrice * 20000000; // Valor simulado para capitalização
  let volume = startPrice * 1000000; // Valor simulado para volume
  
  for (let i = 0; i < dataPoints; i++) {
    // Timestamp para i horas atrás
    const timestamp = now - (dataPoints - i) * (millisecondsPerDay / 24);
    
    // Simular variação de preço com base em volatilidade aleatória
    const change = currentPrice * (Math.random() * volatility * 2 - volatility);
    currentPrice += change;
    if (currentPrice < 0) currentPrice = 0.01; // Garantir preço mínimo
    
    // Adicionar ponto de dados
    prices.push([timestamp, currentPrice]);
    market_caps.push([timestamp, marketCap + (Math.random() - 0.5) * marketCap * 0.1]);
    total_volumes.push([timestamp, volume + (Math.random() - 0.5) * volume * 0.2]);
  }
  
  return {
    prices,
    market_caps,
    total_volumes
  };
};

// Dados históricos mockados por criptomoeda
export const mockHistoricalData: Record<string, CryptoHistoricalData> = {
  'bitcoin': generateMockHistoricalData(57850.42, 0.03),
  'ethereum': generateMockHistoricalData(3245.68, 0.04),
  'ripple': generateMockHistoricalData(0.56, 0.06),
  'cardano': generateMockHistoricalData(0.43, 0.05),
  'solana': generateMockHistoricalData(143.25, 0.07),
  'binance-coin': generateMockHistoricalData(576.34, 0.04)
};

// Alias para historicalData (mantido para compatibilidade)
export const historicalData = mockHistoricalData; 