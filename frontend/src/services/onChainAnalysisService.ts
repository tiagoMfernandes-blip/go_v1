import axios from 'axios';
import { TradingSignal } from './tradingSignalService';

export interface OnChainMetric {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  interpretation: string;
  bullishSignal: boolean;
}

// Cache para evitar chamadas de API repetidas
const cache: Record<string, {data: OnChainMetric[], timestamp: number}> = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

const OnChainAnalysisService = {
  // Obter métricas on-chain para Bitcoin
  getBitcoinMetrics: async (): Promise<OnChainMetric[]> => {
    // Verificar cache
    const cacheKey = 'bitcoin_metrics';
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
      return cache[cacheKey].data;
    }
    
    try {
      // Em uma implementação real, aqui você faria chamadas a APIs como:
      // - Glassnode: https://api.glassnode.com/
      // - CryptoQuant: https://cryptoquant.com/api/
      // - CoinMetrics: https://docs.coinmetrics.io/api/v4/
      
      // Exemplo de chamada à API (comentado pois necessita de chave de API)
      // const response = await axios.get('https://api.glassnode.com/v1/metrics/indicators/sopr', {
      //   params: { 
      //     a: 'BTC',
      //     api_key: 'YOUR_API_KEY'
      //   }
      // });
      
      // Dados simulados para desenvolvimento
      const metrics = generateMockBitcoinMetrics();
      
      // Salvar no cache
      cache[cacheKey] = {
        data: metrics,
        timestamp: Date.now()
      };
      
      return metrics;
    } catch (error) {
      console.error('Erro ao obter métricas on-chain para Bitcoin:', error);
      return generateMockBitcoinMetrics();
    }
  },
  
  // Obter métricas on-chain para Ethereum
  getEthereumMetrics: async (): Promise<OnChainMetric[]> => {
    // Verificar cache
    const cacheKey = 'ethereum_metrics';
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
      return cache[cacheKey].data;
    }
    
    try {
      // Chamadas de API similares para Ethereum
      
      // Dados simulados para desenvolvimento
      const metrics = generateMockEthereumMetrics();
      
      // Salvar no cache
      cache[cacheKey] = {
        data: metrics,
        timestamp: Date.now()
      };
      
      return metrics;
    } catch (error) {
      console.error('Erro ao obter métricas on-chain para Ethereum:', error);
      return generateMockEthereumMetrics();
    }
  },
  
  // Incorporar métricas on-chain em sinais de trading
  enhanceTradingSignals: async (assetId: string, signals: TradingSignal[]): Promise<TradingSignal[]> => {
    if (assetId !== 'bitcoin' && assetId !== 'ethereum') {
      return signals; // Sem suporte para outros ativos
    }
    
    const metrics = assetId === 'bitcoin' 
      ? await OnChainAnalysisService.getBitcoinMetrics()
      : await OnChainAnalysisService.getEthereumMetrics();
    
    // Calcular sentimento on-chain geral
    const bullishMetrics = metrics.filter(m => m.bullishSignal).length;
    const bearishMetrics = metrics.length - bullishMetrics;
    const onChainSentiment = bullishMetrics > bearishMetrics ? 'bullish' : 'bearish';
    
    // Ajustar sinais de trading com dados on-chain
    return signals.map(signal => {
      const signalIsBullish = signal.type.includes('buy');
      
      // Se o sentimento on-chain concorda com o sinal técnico, aumentar confiança
      if ((signalIsBullish && onChainSentiment === 'bullish') || 
          (!signalIsBullish && onChainSentiment === 'bearish')) {
        return {
          ...signal,
          confidence: Math.min(100, signal.confidence + 15),
          basedOn: [...signal.basedOn, 'Análise On-Chain'],
          description: `${signal.description}. Confirmado por dados on-chain.`
        };
      } 
      // Se contradiz, reduzir confiança
      else {
        return {
          ...signal,
          confidence: Math.max(0, signal.confidence - 10),
          basedOn: [...signal.basedOn, 'Análise On-Chain (contradição)'],
          description: `${signal.description}. Contradito por dados on-chain.`
        };
      }
    });
  },
  
  // Obter resumo on-chain com recomendação em formato simplificado para a UI
  getOnChainSummary: (assetId: string): {
    sentiment: 'bullish' | 'bearish' | 'neutral',
    summary: string
  } => {
    // Se não for BTC ou ETH, retornar neutro
    if (assetId !== 'BTC' && assetId !== 'ETH') {
      return {
        sentiment: 'neutral',
        summary: 'Análise on-chain disponível apenas para Bitcoin e Ethereum'
      };
    }
    
    // Como é para UI, usamos um resumo simplificado para não ter que esperar por chamada assíncrona
    // Isso gera um resumo consistente mas simulado para demonstração
    const assetName = assetId === 'BTC' ? 'Bitcoin' : 'Ethereum';
    
    // Usar um seed baseado no dia para manter consistência nas simulações
    const now = new Date();
    const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const rand = (daySeed % 10) / 10; // 0-0.9 baseado no dia
    
    let sentiment: 'bullish' | 'bearish' | 'neutral';
    let summary = '';
    
    if (rand < 0.33) {
      sentiment = 'bearish';
      summary = `Os indicadores on-chain para ${assetName} mostram sinais de alerta. A atividade de carteiras está em declínio, com aumento nos fluxos para exchanges, o que pode indicar pressão de venda. Recomenda-se cautela nas posições atuais e evitar alavancagem.`;
    } else if (rand < 0.66) {
      sentiment = 'neutral';
      summary = `Os indicadores on-chain para ${assetName} estão mistos neste momento. Algumas métricas de acumulação são positivas, mas o fluxo para exchanges e a atividade de grandes carteiras não mostram tendência clara. Recomenda-se manter estratégia atual e monitorar mudanças.`;
    } else {
      sentiment = 'bullish';
      summary = `Os indicadores on-chain para ${assetName} são predominantemente positivos. Há acumulação por parte de carteiras de longo prazo, redução de suprimento em exchanges e aumento em métricas de retenção. Estes são sinais historicamente positivos para a tendência de preço.`;
    }
    
    return {
      sentiment,
      summary
    };
  }
};

// Funções auxiliares para gerar dados simulados
function generateMockBitcoinMetrics(): OnChainMetric[] {
  const baseTime = Date.now();
  // Usar um seed para ter consistência nos valores gerados
  const seed = Math.floor(baseTime / (24 * 60 * 60 * 1000));
  
  // Função para gerar número pseudoaleatório com seed
  const random = (base: number) => {
    const x = Math.sin(seed + base) * 10000;
    return x - Math.floor(x);
  };
  
  return [
    {
      name: 'SOPR (Spent Output Profit Ratio)',
      value: 1.02 + random(1) * 0.1,
      previousValue: 0.98 + random(2) * 0.1,
      change: 0,
      changePercent: 0,
      interpretation: 'Valor acima de 1 indica que em média os vendedores estão em lucro',
      bullishSignal: true
    },
    {
      name: 'Exchange Inflow',
      value: 12500 - random(3) * 2000,
      previousValue: 15000 - random(4) * 1000,
      change: 0,
      changePercent: 0,
      interpretation: 'Redução nas entradas em exchanges pode indicar menos pressão de venda',
      bullishSignal: true
    },
    {
      name: 'MVRV Z-Score',
      value: 2.3 + random(5) * 0.5,
      previousValue: 2.1 + random(6) * 0.5,
      change: 0,
      changePercent: 0,
      interpretation: 'Acima de 2 indica possível sobrevalorização',
      bullishSignal: false
    },
    {
      name: 'Puell Multiple',
      value: 1.2 + random(7) * 0.3,
      previousValue: 1.1 + random(8) * 0.3,
      change: 0,
      changePercent: 0,
      interpretation: 'Valores entre 0.5 e 1.5 são considerados neutros',
      bullishSignal: true
    },
    {
      name: 'Hash Rate',
      value: (280 + random(9) * 20) * 1e18,
      previousValue: (275 + random(10) * 20) * 1e18,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento da hash rate indica maior segurança da rede e confiança dos mineradores',
      bullishSignal: true
    },
    {
      name: 'Percent Supply in Profit',
      value: 75 + random(11) * 10,
      previousValue: 72 + random(12) * 10,
      change: 0,
      changePercent: 0,
      interpretation: 'Valores acima de 75% indicam possível área de topo',
      bullishSignal: false
    },
    {
      name: 'Active Addresses',
      value: 950000 + random(13) * 100000,
      previousValue: 930000 + random(14) * 100000,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento no número de endereços ativos indica crescimento da utilização da rede',
      bullishSignal: true
    },
    {
      name: 'Stablecoin Supply Ratio',
      value: 3.5 + random(15) * 0.5,
      previousValue: 3.3 + random(16) * 0.5,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento na razão indica menos poder de compra relativo às stablecoins',
      bullishSignal: false
    },
    {
      name: 'Dormancy Flow',
      value: 250000 + random(17) * 30000,
      previousValue: 270000 + random(18) * 30000,
      change: 0,
      changePercent: 0,
      interpretation: 'Queda na dormência indica menos venda de coins por holders de longo prazo',
      bullishSignal: true
    }
  ].map(metric => {
    // Calcular mudanças
    const change = metric.value - metric.previousValue;
    const changePercent = (change / metric.previousValue) * 100;
    
    return {
      ...metric,
      change,
      changePercent
    };
  });
}

function generateMockEthereumMetrics(): OnChainMetric[] {
  const baseTime = Date.now();
  // Usar um seed para ter consistência nos valores gerados
  const seed = Math.floor(baseTime / (24 * 60 * 60 * 1000));
  
  // Função para gerar número pseudoaleatório com seed
  const random = (base: number) => {
    const x = Math.sin(seed + base + 100) * 10000; // diferente do Bitcoin
    return x - Math.floor(x);
  };
  
  return [
    {
      name: 'Gas Used',
      value: (80 + random(1) * 20) * 1e9,
      previousValue: (75 + random(2) * 20) * 1e9,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento no uso de gas indica maior atividade na rede',
      bullishSignal: true
    },
    {
      name: 'ETH Staked',
      value: (25 + random(3) * 5) * 1e6,
      previousValue: (24 + random(4) * 5) * 1e6,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento no ETH em staking reduz a oferta circulante',
      bullishSignal: true
    },
    {
      name: 'ETH Burned (EIP-1559)',
      value: (3 + random(5)) * 1e6,
      previousValue: (2.8 + random(6)) * 1e6,
      change: 0,
      changePercent: 0,
      interpretation: 'Maior quantidade de ETH queimado reduz a oferta total',
      bullishSignal: true
    },
    {
      name: 'ETH Exchange Balance',
      value: (12 - random(7) * 2) * 1e6,
      previousValue: (12.5 - random(8) * 2) * 1e6,
      change: 0,
      changePercent: 0,
      interpretation: 'Redução no saldo em exchanges indica menos pressão de venda',
      bullishSignal: true
    },
    {
      name: 'DeFi TVL em ETH',
      value: (25 + random(9) * 5) * 1e6,
      previousValue: (24 + random(10) * 5) * 1e6,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento no valor total bloqueado em DeFi indica maior adoção',
      bullishSignal: true
    },
    {
      name: 'Active Addresses',
      value: 650000 + random(11) * 100000,
      previousValue: 630000 + random(12) * 100000,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento no número de endereços ativos indica crescimento da utilização da rede',
      bullishSignal: true
    },
    {
      name: 'Average Transaction Fee',
      value: 15 + random(13) * 10,
      previousValue: 12 + random(14) * 10,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento significativo nas taxas pode indicar congestionamento da rede',
      bullishSignal: false
    },
    {
      name: 'ETH/BTC Ratio',
      value: 0.06 + random(15) * 0.01,
      previousValue: 0.058 + random(16) * 0.01,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento na razão ETH/BTC indica força relativa do Ethereum',
      bullishSignal: true
    },
    {
      name: 'New Contract Deployments',
      value: 1500 + random(17) * 300,
      previousValue: 1400 + random(18) * 300,
      change: 0,
      changePercent: 0,
      interpretation: 'Aumento em novos contratos indica crescimento do ecossistema',
      bullishSignal: true
    }
  ].map(metric => {
    // Calcular mudanças
    const change = metric.value - metric.previousValue;
    const changePercent = (change / metric.previousValue) * 100;
    
    return {
      ...metric,
      change,
      changePercent
    };
  });
}

export default OnChainAnalysisService; 