import { MarketGlobalData } from '../models/CryptoData';

export const mockGlobalMarketData: MarketGlobalData = {
  active_cryptocurrencies: 10000,
  upcoming_icos: 50,
  ongoing_icos: 30,
  ended_icos: 3500,
  markets: 800,
  total_market_cap: {
    eur: 2150000000000,
    usd: 2350000000000,
    btc: 44000000,
    eth: 680000000
  },
  total_volume: {
    eur: 115000000000,
    usd: 125000000000,
    btc: 2500000,
    eth: 38000000
  },
  market_cap_percentage: {
    btc: 42.5,
    eth: 18.3,
    bnb: 3.4,
    usdt: 3.2,
    sol: 2.8,
    xrp: 1.5,
    ada: 0.9,
  },
  market_cap_change_percentage_24h_usd: 1.25,
  updated_at: Date.now()
};

// Alias para globalMarketData (mantido para compatibilidade)
export const globalMarketData = mockGlobalMarketData; 