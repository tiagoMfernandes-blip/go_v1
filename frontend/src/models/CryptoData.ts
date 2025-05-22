/**
 * Interfaces para dados de criptomoedas
 */

// Dados básicos de uma criptomoeda
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h?: number;
  low_24h?: number;
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  ath?: number;
  ath_change_percentage?: number;
  ath_date?: string;
  atl?: number;
  atl_change_percentage?: number;
  atl_date?: string;
  last_updated?: string;
}

// Dados simplificados de preço para criptomoedas
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  market_cap_percentage?: number;
  circulating_supply?: number;
  total_supply?: number;
  image?: string;
}

// Detalhes completos de uma criptomoeda
export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  description: {
    en: string;
    [key: string]: string;
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    current_price: {
      [key: string]: number;
    };
    market_cap: {
      [key: string]: number;
    };
    total_volume: {
      [key: string]: number;
    };
    high_24h: {
      [key: string]: number;
    };
    low_24h: {
      [key: string]: number;
    };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
  };
  community_data?: {
    twitter_followers: number;
    reddit_subscribers: number;
  };
  developer_data?: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
  };
  links?: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  categories?: string[];
  last_updated: string;
}

// Dados históricos de preço
export interface HistoricalData {
  prices: [number, number][];       // [timestamp, price]
  market_caps: [number, number][];  // [timestamp, market_cap]
  total_volumes: [number, number][]; // [timestamp, volume]
}

// Alias para compatibilidade com código existente
export type CryptoHistoricalData = HistoricalData;

// Dados globais de mercado
export interface GlobalMarketData {
  active_cryptocurrencies: number;
  upcoming_icos: number;
  ongoing_icos: number;
  ended_icos: number;
  markets: number;
  total_market_cap: {
    [key: string]: number;
  };
  total_volume: {
    [key: string]: number;
  };
  market_cap_percentage: {
    [key: string]: number;
  };
  market_cap_change_percentage_24h_usd: number;
  updated_at: number;
}

// Alias para compatibilidade com código existente
export type MarketGlobalData = GlobalMarketData;

// Notícias de criptomoedas
export interface CryptoNews {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  published_at: string;
  categories: string[];
  relevance_score?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
} 