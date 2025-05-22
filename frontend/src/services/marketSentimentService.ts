import axios from 'axios';
import { TradingSignal } from './tradingSignalService';

// Caminho base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Cache para melhorar desempenho
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// Tipos de dados de sentimento
export interface SentimentData {
  symbol: string;
  score: number;  // 0-1, onde 1 é muito positivo
  source: string;
  timestamp: string;
  details?: {
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
  };
}

// Interpretação de sentimento
export type SentimentType = 'bullish' | 'bearish' | 'neutral';

export interface MarketSentiment {
  assetId: string;
  symbol: string;
  overallScore: number;
  sources: {
    twitter: number;
    reddit: number;
    news: number;
    // outras fontes
  };
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: Date;
}

// Cache para evitar múltiplas requisições à API
const sentimentCache: Record<string, {data: MarketSentiment, timestamp: number}> = {};

/**
 * Serviço para análise de sentimento de mercado
 */
export const marketSentimentService = {
  /**
   * Obtém dados de sentimento para um ativo específico
   * @param symbol Símbolo do ativo (ex: BTC)
   */
  async getSentiment(symbol: string): Promise<SentimentData> {
    const cacheKey = `sentiment_${symbol}`;
    
    // Verificar cache
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
      return cache[cacheKey].data;
    }
    
    try {
      // Obter sentimento do backend
      const response = await axios.get<SentimentData>(`${API_BASE_URL}/sentiment/${symbol}`);
      const data = response.data;
      
      // Salvar no cache
      cache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (error) {
      console.error(`Erro ao obter sentimento para ${symbol}:`, error);
      
      // Retornar dados simulados em caso de erro
      return this.generateMockSentimentData(symbol);
    }
  },
  
  /**
   * Interpreta um score de sentimento
   * @param score Score de sentimento (0-1)
   * @returns Tipo de sentimento (bullish, bearish, neutral)
   */
  interpretSentiment(score: number): SentimentType {
    if (score >= 0.6) return 'bullish';
    if (score <= 0.4) return 'bearish';
    return 'neutral';
  },
  
  /**
   * Gera descrição textual do sentimento
   * @param score Score de sentimento (0-1)
   * @returns Descrição do sentimento
   */
  getSentimentDescription(score: number): string {
    if (score >= 0.8) return 'Extremamente positivo';
    if (score >= 0.6) return 'Positivo';
    if (score >= 0.45) return 'Levemente positivo';
    if (score > 0.35) return 'Neutro';
    if (score > 0.2) return 'Levemente negativo';
    if (score > 0.1) return 'Negativo';
    return 'Extremamente negativo';
  },
  
  /**
   * Gera dados simulados de sentimento quando a API falha
   * @param symbol Símbolo do ativo
   * @returns Dados de sentimento simulados
   */
  generateMockSentimentData(symbol: string): SentimentData {
    // Gerar um score aleatório entre 0 e 1
    const score = Math.random();
    
    // Gerar contagens simuladas com base no score
    const total = 1000;
    const positiveCount = Math.round(score * total);
    const negativeCount = Math.round((1 - score) * total * 0.7);
    const neutralCount = total - positiveCount - negativeCount;
    
    return {
      symbol: symbol.toUpperCase(),
      score,
      source: 'social',
      timestamp: new Date().toISOString(),
      details: {
        positiveCount,
        negativeCount,
        neutralCount
      }
    };
  },
  
  // Obter sentimento de mercado global
  getMarketSentiment: async () => {
    try {
      // Em uma implementação real, você faria chamadas a APIs de sentimento de mercado
      // const response = await axios.get('https://api.alternative.me/fng/');
      // const data = response.data;
      
      // Por enquanto, usamos dados simulados
      const fearGreedIndex = Math.floor(Math.random() * 100); // 0-100
      const btcDominance = 40 + Math.random() * 20; // 40-60%
      
      let overallSentiment = 'Neutro';
      if (fearGreedIndex < 30) overallSentiment = 'Medo Extremo';
      else if (fearGreedIndex < 40) overallSentiment = 'Medo';
      else if (fearGreedIndex > 70) overallSentiment = 'Ganância';
      else if (fearGreedIndex > 90) overallSentiment = 'Ganância Extrema';
      
      // Gerar análise textual
      let analysis = '';
      if (fearGreedIndex < 30) {
        analysis = 'O mercado está em fase de medo extremo, o que historicamente pode representar oportunidades de compra para investidores de longo prazo. A pressão vendedora parece excessiva neste momento.';
      } else if (fearGreedIndex < 40) {
        analysis = 'O sentimento de mercado está negativo, com predominância de medo entre os investidores. Pode haver oportunidades seletivas em ativos de qualidade que sofreram correções excessivas.';
      } else if (fearGreedIndex < 60) {
        analysis = 'O mercado está em uma fase de equilíbrio, sem extremos de sentimento. É um bom momento para revisar sua estratégia e se posicionar de acordo com seus objetivos de longo prazo.';
      } else if (fearGreedIndex < 80) {
        analysis = 'Há um otimismo predominante no mercado, com investidores demonstrando ganância. É importante ter cautela e não se deixar levar pelo FOMO (Fear Of Missing Out).';
      } else {
        analysis = 'O mercado está em euforia com níveis extremos de ganância. Historicamente, estes são momentos de alto risco, onde correções podem acontecer. Considere reduzir exposição em posições com lucros substanciais.';
      }
      
      // Adicionar comentário sobre dominância de BTC
      if (btcDominance > 50) {
        analysis += ' A alta dominância do Bitcoin indica que o capital está se concentrando no ativo mais estabelecido, possivelmente sinalizando um mercado mais conservador.';
      } else {
        analysis += ' A baixa dominância do Bitcoin sugere que o capital está fluindo para altcoins, o que pode indicar um ciclo de altcoins ou um apetite maior por risco no mercado.';
      }
      
      return {
        overallSentiment,
        fearGreedIndex,
        btcDominance,
        analysis,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao obter sentimento de mercado:', error);
      return {
        overallSentiment: 'Neutro',
        fearGreedIndex: 50,
        btcDominance: 50,
        analysis: 'Não foi possível obter dados atualizados de sentimento de mercado.',
        timestamp: new Date().toISOString(),
      };
    }
  },
  
  // Obter sentimento do mercado para um ativo específico
  getAssetSentiment: async (assetId: string): Promise<MarketSentiment> => {
    // Verificar cache
    const cacheKey = `sentiment_${assetId}`;
    if (sentimentCache[cacheKey] && Date.now() - sentimentCache[cacheKey].timestamp < CACHE_TTL) {
      return sentimentCache[cacheKey].data;
    }
    
    try {
      // Em uma implementação real, aqui você faria chamadas a APIs de sentimento como:
      // - Santiment
      // - LunarCrush
      // - Alternative.me Fear & Greed Index
      // - CryptoCompare
      
      // Simular chamada a API (exemplo)
      // const response = await axios.get(`https://api.example.com/sentiment/${assetId}`);
      // const data = response.data;
      
      // Por enquanto, usamos dados simulados
      const sentiment = generateMockSentiment(assetId);
      
      // Guardar em cache
      sentimentCache[cacheKey] = {
        data: sentiment,
        timestamp: Date.now()
      };
      
      return sentiment;
    } catch (error) {
      console.error('Erro ao obter dados de sentimento:', error);
      // Em caso de erro, retornar dados simulados
      return generateMockSentiment(assetId);
    }
  },
  
  // Obter sentimentos para múltiplos ativos
  getMultipleAssetsSentiment: async (assetIds: string[]): Promise<Record<string, MarketSentiment>> => {
    const result: Record<string, MarketSentiment> = {};
    
    await Promise.all(
      assetIds.map(async (assetId) => {
        const sentiment = await marketSentimentService.getAssetSentiment(assetId);
        result[assetId] = sentiment;
      })
    );
    
    return result;
  },
  
  // Combinar sentimento com análise técnica
  getCombinedSignal: async (assetId: string, tradingSignal: TradingSignal | null): Promise<{
    tradingSignal: TradingSignal | null,
    sentiment: MarketSentiment
  }> => {
    const sentiment = await marketSentimentService.getAssetSentiment(assetId);
    
    // Se não há sinal técnico, apenas retornar o sentimento
    if (!tradingSignal) {
      return { tradingSignal, sentiment };
    }
    
    // Clonar o sinal para não alterar o original
    const enhancedSignal: TradingSignal = {...tradingSignal};
    
    // Ajustar confiança com base no sentimento
    if ((enhancedSignal.type === 'buy' || enhancedSignal.type === 'strong_buy') && sentiment.overallScore > 30) {
      enhancedSignal.confidence = Math.min(100, enhancedSignal.confidence + 10);
      enhancedSignal.basedOn = [...enhancedSignal.basedOn, 'Sentimento de Mercado Positivo'];
      enhancedSignal.description += `. Reforçado pelo sentimento positivo do mercado (${sentiment.overallScore.toFixed(0)}/100).`;
    } else if ((enhancedSignal.type === 'sell' || enhancedSignal.type === 'strong_sell') && sentiment.overallScore < -30) {
      enhancedSignal.confidence = Math.min(100, enhancedSignal.confidence + 10);
      enhancedSignal.basedOn = [...enhancedSignal.basedOn, 'Sentimento de Mercado Negativo'];
      enhancedSignal.description += `. Reforçado pelo sentimento negativo do mercado (${sentiment.overallScore.toFixed(0)}/100).`;
    } else if (Math.abs(sentiment.overallScore) > 50 && 
              ((enhancedSignal.type.includes('buy') && sentiment.overallScore < 0) || 
               (enhancedSignal.type.includes('sell') && sentiment.overallScore > 0))) {
      // Se o sentimento contradiz fortemente o sinal técnico, reduzir confiança
      enhancedSignal.confidence = Math.max(0, enhancedSignal.confidence - 20);
      enhancedSignal.basedOn = [...enhancedSignal.basedOn, 'Contradição no Sentimento de Mercado'];
      enhancedSignal.description += `. Atenção: O sentimento do mercado (${sentiment.overallScore.toFixed(0)}/100) contradiz este sinal.`;
    }
    
    return {
      tradingSignal: enhancedSignal,
      sentiment
    };
  },
  
  // Obter indicador de medo e ganância do mercado global
  getFearAndGreedIndex: async (): Promise<{value: number, classification: string, timestamp: Date}> => {
    try {
      // Em uma implementação real, chamar a API do Fear & Greed Index
      // const response = await axios.get('https://api.alternative.me/fng/');
      // const data = response.data;
      
      // Dados simulados
      return {
        value: Math.floor(Math.random() * 100),
        classification: 'Neutral',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Erro ao obter índice de medo e ganância:', error);
      return {
        value: 50,
        classification: 'Neutral',
        timestamp: new Date()
      };
    }
  }
};

// Função auxiliar para gerar dados de sentimento simulados
function generateMockSentiment(assetId: string): MarketSentiment {
  // Para simular alguma consistência, usamos o código do ativo como seed
  const seed = assetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const now = Date.now();
  const seedWithTime = seed + Math.floor(now / (1000 * 60 * 60 * 24)); // Muda diariamente
  
  // Função para gerar número pseudoaleatório com seed
  const random = () => {
    const x = Math.sin(seedWithTime + Math.random()) * 10000;
    return x - Math.floor(x);
  };
  
  // Determinar scores com alguma consistência
  const twitterScore = (random() * 200 - 100);
  const redditScore = (random() * 200 - 100);
  const newsScore = (random() * 200 - 100);
  
  // Média ponderada
  const overallScore = (twitterScore * 0.3 + redditScore * 0.3 + newsScore * 0.4);
  
  // Determinar tendência
  const trends = ['improving', 'declining', 'stable'] as const;
  const trendIndex = Math.floor(random() * 3);
  
  return {
    assetId,
    symbol: assetId.toUpperCase(),
    overallScore,
    sources: {
      twitter: twitterScore,
      reddit: redditScore,
      news: newsScore
    },
    trend: trends[trendIndex],
    lastUpdated: new Date()
  };
}

export default marketSentimentService; 