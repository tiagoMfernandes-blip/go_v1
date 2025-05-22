import axios from 'axios';
import { CryptoData, CoinDetails, HistoricalData, GlobalMarketData, CryptoPrice, CryptoHistoricalData, CryptoNews, MarketGlobalData } from '../models/CryptoData';
import { marketData as mockMarketData } from '../mocks/cryptoMockData';
import { coinDetails as mockCoinDetails } from '../mocks/coinDetailsMock';
import { historicalData as mockHistoricalData } from '../mocks/historicalDataMock';
import { globalMarketData as mockGlobalMarketData } from '../mocks/globalMarketMockData';

// Reexportar tipos para compatibilidade com código existente
export type { CryptoData, CoinDetails, HistoricalData, GlobalMarketData, CryptoPrice, CryptoHistoricalData, CryptoNews, MarketGlobalData };

// Caminho base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Cache para melhorar desempenho
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Verifica se um item no cache ainda é válido
 */
function isCacheValid(key: string): boolean {
  if (!cache[key]) return false;
  return (Date.now() - cache[key].timestamp) < CACHE_TTL;
}

/**
 * Salva um item no cache
 */
function setCache(key: string, data: any): void {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
}

/**
 * Serviço para acessar dados de criptomoedas
 */
export const cryptoService = {
  /**
   * Obtém dados de mercado para criptomoedas
   */
  async getMarketData(currency: string | number = 'eur', assetIds?: string[] | number, page?: number): Promise<CryptoPrice[] | CryptoData[]> {
    // Se o segundo parâmetro for um número, é o limite (compatibilidade com versões anteriores)
    const limit = typeof assetIds === 'number' ? assetIds : 100;
    const pageNumber = page || 1;
    
    const cacheKey = `market_data_${currency}_${limit}_${pageNumber}`;
    
    if (isCacheValid(cacheKey)) {
      return cache[cacheKey].data;
    }
    
    try {
      // Tentar obter dados do backend
      const response = await axios.get(`${API_BASE_URL}/market`, {
        params: { 
          vs_currency: currency, 
          limit: limit,
          page: pageNumber,
          ids: Array.isArray(assetIds) ? assetIds.join(',') : undefined
        }
      });
      const data = response.data;
      
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erro ao obter dados de mercado da API:', error);
      
      // Fallback para dados mock em caso de erro
      setCache(cacheKey, mockMarketData);
      return mockMarketData;
    }
  },
  
  /**
   * Obtém detalhes de uma criptomoeda específica
   */
  async getCoinDetails(coinId: string): Promise<CoinDetails> {
    const cacheKey = `coin_details_${coinId}`;
    
    if (isCacheValid(cacheKey)) {
      return cache[cacheKey].data;
    }
    
    try {
      // Obter detalhes do backend
      const response = await axios.get(`${API_BASE_URL}/market/${coinId}`);
      const data = response.data;
      
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Erro ao obter detalhes para ${coinId}:`, error);
      
      // Fallback para dados mock
      const mockCoin = mockCoinDetails;
      setCache(cacheKey, mockCoin);
      return mockCoin;
    }
  },
  
  /**
   * Obtém dados históricos para uma criptomoeda
   */
  async getHistoricalData(coinId: string, currency: string | number = 'eur', days = 30, interval = 'daily'): Promise<HistoricalData> {
    const cacheKey = `historical_data_${coinId}_${currency}_${days}_${interval}`;
    
    if (isCacheValid(cacheKey)) {
      return cache[cacheKey].data;
    }
    
    try {
      // Obter dados históricos do backend
      const response = await axios.get(`${API_BASE_URL}/historical/${coinId}`, {
        params: { vs_currency: currency, days, interval }
      });
      const data = response.data;
      
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Erro ao obter dados históricos para ${coinId}:`, error);
      
      // Fallback para dados mock
      const mockData = mockHistoricalData[coinId] || mockHistoricalData['bitcoin'];
      setCache(cacheKey, mockData);
      return mockData;
    }
  },
  
  /**
   * Obtém dados globais do mercado de criptomoedas
   */
  async getGlobalMarketData(): Promise<GlobalMarketData> {
    const cacheKey = 'global_market_data';
    
    if (isCacheValid(cacheKey)) {
      return cache[cacheKey].data;
    }
    
    try {
      // Obter dados globais do backend
      const response = await axios.get(`${API_BASE_URL}/market/global`);
      const data = response.data;
      
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erro ao obter dados globais de mercado:', error);
      
      // Fallback para dados mock
      setCache(cacheKey, mockGlobalMarketData);
      return mockGlobalMarketData;
    }
  },
  
  /**
   * Obtém o índice de medo e ganância do mercado
   */
  async getFearAndGreedIndex(): Promise<{ value: number; classification: string; timestamp: string }> {
    const cacheKey = 'fear_greed_index';
    
    if (isCacheValid(cacheKey)) {
      return cache[cacheKey].data;
    }
    
    try {
      // Obter índice de medo e ganância do backend
      const response = await axios.get(`${API_BASE_URL}/market/fear-greed`);
      const data = response.data;
      
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erro ao obter índice de medo e ganância:', error);
      
      // Fallback para dados simulados
      const mockData = {
        value: 45,
        classification: 'Fear',
        timestamp: new Date().toISOString()
      };
      
      setCache(cacheKey, mockData);
      return mockData;
    }
  },
  
  /**
   * Obtém notícias relacionadas a criptomoedas
   */
  async getNews(limit = 20, categories?: string[]): Promise<CryptoNews[]> {
    const cacheKey = `news_${limit}_${categories?.join(',') || 'all'}`;
    
    if (isCacheValid(cacheKey)) {
      return cache[cacheKey].data;
    }
    
    try {
      // Obter notícias do backend
      const response = await axios.get(`${API_BASE_URL}/news`, {
        params: { limit, categories: categories?.join(',') }
      });
      const data = response.data;
      
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erro ao obter notícias:', error);
      
      // Fallback para dados simulados
      const mockNews: CryptoNews[] = [
        {
          id: '1',
          title: 'Bitcoin atinge novo recorde histórico',
          description: 'A principal criptomoeda do mundo atingiu um novo patamar de preço, impulsionada por forte demanda institucional.',
          url: 'https://example.com/news/1',
          image: 'https://example.com/images/bitcoin-ath.jpg',
          source: 'CryptoNews',
          published_at: new Date().toISOString(),
          categories: ['bitcoin', 'mercado']
        },
        {
          id: '2',
          title: 'Ethereum completa migração para Proof-of-Stake',
          description: 'A rede Ethereum finalizou com sucesso a transição para o mecanismo de consenso Proof-of-Stake, reduzindo o consumo de energia em 99%.',
          url: 'https://example.com/news/2',
          image: 'https://example.com/images/eth-pos.jpg',
          source: 'DeFi Daily',
          published_at: new Date(Date.now() - 86400000).toISOString(), // Ontem
          categories: ['ethereum', 'tecnologia']
        },
        {
          id: '3',
          title: 'Reguladores discutem novas regras para criptomoedas',
          description: 'Autoridades financeiras de vários países se reuniram para discutir um framework regulatório comum para ativos digitais.',
          url: 'https://example.com/news/3',
          image: 'https://example.com/images/crypto-regulation.jpg',
          source: 'Financial Times',
          published_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
          categories: ['regulação', 'mercado']
        }
      ];
      
      setCache(cacheKey, mockNews);
      return mockNews;
    }
  }
};

// Exportar como default para compatibilidade com imports existentes
export default cryptoService; 