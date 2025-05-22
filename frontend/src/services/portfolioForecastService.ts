import { PortfolioAsset, PortfolioStats } from './portfolioService';
import { CryptoPrice } from './cryptoService';

// Interface para cenários de previsão
export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  priceChanges: Record<string, number>; // Alterações percentuais por assetId
}

// Interface para resultado da previsão
export interface PortfolioForecast {
  initialValue: number;
  forecastValue: number;
  absoluteChange: number;
  percentageChange: number;
  assetForecasts: AssetForecast[];
}

// Interface para previsão de um ativo individual
export interface AssetForecast {
  assetId: string;
  symbol: string;
  name: string;
  initialPrice: number;
  forecastPrice: number;
  initialValue: number;
  forecastValue: number;
  absoluteChange: number;
  percentageChange: number;
}

// Cenários predefinidos
const predefinedScenarios: ForecastScenario[] = [
  {
    id: 'bull',
    name: 'Mercado em Alta',
    description: 'Cenário otimista com crescimento significativo em todas as criptomoedas.',
    priceChanges: {
      default: 25, // Aumento padrão de 25%
      bitcoin: 30,
      ethereum: 40,
      cardano: 35,
      solana: 45,
      polkadot: 38
    }
  },
  {
    id: 'bear',
    name: 'Mercado em Baixa',
    description: 'Cenário pessimista com queda nos preços da maioria das criptomoedas.',
    priceChanges: {
      default: -15, // Queda padrão de 15%
      bitcoin: -10,
      ethereum: -18,
      cardano: -25,
      solana: -30,
      polkadot: -20
    }
  },
  {
    id: 'neutral',
    name: 'Mercado Neutro',
    description: 'Cenário com ligeira valorização, mas sem grandes mudanças.',
    priceChanges: {
      default: 5, // Aumento padrão de 5%
      bitcoin: 8,
      ethereum: 7,
      cardano: 3,
      solana: 4,
      polkadot: 6
    }
  },
  {
    id: 'mixed',
    name: 'Mercado Misto',
    description: 'Algumas criptomoedas valorizam enquanto outras desvalorizam.',
    priceChanges: {
      default: 0, // Neutro por padrão
      bitcoin: 12,
      ethereum: 8,
      cardano: -5,
      solana: 15,
      polkadot: -8
    }
  }
];

/**
 * Serviço para previsão e simulação de portfólio
 */
const PortfolioForecastService = {
  /**
   * Obter todos os cenários predefinidos
   */
  getPredefinedScenarios: (): ForecastScenario[] => {
    return predefinedScenarios;
  },

  /**
   * Realizar previsão do portfólio com base num cenário
   * @param portfolio Ativos do portfólio
   * @param currentPrices Preços atuais das criptomoedas
   * @param scenario Cenário de previsão a aplicar
   * @param customTimeframe Período de tempo personalizado em meses (opcional)
   */
  forecastPortfolio: (
    portfolio: PortfolioAsset[],
    currentPrices: CryptoPrice[],
    scenario: ForecastScenario,
    customTimeframe: number = 3 // Padrão de 3 meses
  ): PortfolioForecast => {
    // Inicializar resultados
    let initialValue = 0;
    let forecastValue = 0;
    const assetForecasts: AssetForecast[] = [];

    // Aplicar previsão a cada ativo
    portfolio.forEach(asset => {
      const currentPrice = currentPrices.find(p => p.id === asset.assetId);
      
      if (currentPrice && asset.amount > 0) {
        // Obter a alteração percentual do cenário para este ativo
        const percentChange = scenario.priceChanges[asset.assetId] !== undefined 
          ? scenario.priceChanges[asset.assetId] 
          : scenario.priceChanges.default;
        
        // Ajustar o percentual com base no timeframe personalizado (base é 3 meses)
        const adjustedPercentChange = (percentChange / 3) * customTimeframe;
        
        // Calcular preço previsto
        const forecastPrice = currentPrice.current_price * (1 + adjustedPercentChange / 100);
        
        // Calcular valores
        const initialAssetValue = asset.amount * currentPrice.current_price;
        const forecastAssetValue = asset.amount * forecastPrice;
        
        // Adicionar aos totais
        initialValue += initialAssetValue;
        forecastValue += forecastAssetValue;
        
        // Adicionar à lista de previsões por ativo
        assetForecasts.push({
          assetId: asset.assetId,
          symbol: asset.symbol,
          name: asset.name,
          initialPrice: currentPrice.current_price,
          forecastPrice: forecastPrice,
          initialValue: initialAssetValue,
          forecastValue: forecastAssetValue,
          absoluteChange: forecastAssetValue - initialAssetValue,
          percentageChange: initialAssetValue > 0 
            ? ((forecastAssetValue - initialAssetValue) / initialAssetValue) * 100 
            : 0
        });
      }
    });

    // Calcular alterações totais
    const absoluteChange = forecastValue - initialValue;
    const percentageChange = initialValue > 0 
      ? (absoluteChange / initialValue) * 100 
      : 0;

    return {
      initialValue,
      forecastValue,
      absoluteChange,
      percentageChange,
      assetForecasts
    };
  },

  /**
   * Simular impacto de uma nova transação no portfólio
   * @param portfolio Portfólio atual
   * @param currentPrices Preços atuais
   * @param assetId ID do ativo a simular
   * @param amount Quantidade a comprar/vender
   * @param isBuy Se verdadeiro, simula compra; se falso, simula venda
   */
  simulateTransaction: (
    portfolio: PortfolioAsset[],
    currentPrices: CryptoPrice[],
    assetId: string,
    amount: number,
    isBuy: boolean
  ): { 
    newStats: PortfolioStats, 
    currentStats: PortfolioStats 
  } => {
    // Implementação simplificada
    // Numa implementação real, seria necessário calcular corretamente
    // o novo preço médio e outros detalhes
    
    // Criar cópia do portfólio para não alterar o original
    const simulatedPortfolio = JSON.parse(JSON.stringify(portfolio));
    
    // Encontrar o ativo no portfólio
    const assetIndex = simulatedPortfolio.findIndex((a: PortfolioAsset) => a.assetId === assetId);
    const currentPrice = currentPrices.find(p => p.id === assetId);
    
    if (!currentPrice) {
      throw new Error("Preço atual não encontrado para o ativo");
    }
    
    // Valores iniciais para os cálculos de estatísticas
    let totalValue = 0;
    let totalInvestment = 0;
    let simulatedTotalValue = 0;
    let simulatedTotalInvestment = 0;
    
    // Calcular estatísticas atuais
    portfolio.forEach(asset => {
      const price = currentPrices.find(p => p.id === asset.assetId);
      if (price) {
        totalValue += asset.amount * price.current_price;
        totalInvestment += asset.amount * asset.avgBuyPrice;
      }
    });
    
    // Aplicar a simulação
    if (assetIndex >= 0) {
      // Ativo já existe no portfólio
      const asset = simulatedPortfolio[assetIndex];
      
      if (isBuy) {
        // Simular compra
        const newTotalAmount = asset.amount + amount;
        const newTotalInvestment = (asset.amount * asset.avgBuyPrice) + (amount * currentPrice.current_price);
        asset.amount = newTotalAmount;
        asset.avgBuyPrice = newTotalAmount > 0 ? newTotalInvestment / newTotalAmount : 0;
      } else {
        // Simular venda (sem alterar o preço médio)
        asset.amount = Math.max(0, asset.amount - amount);
      }
    } else if (isBuy) {
      // Novo ativo, apenas adicionar se for compra
      simulatedPortfolio.push({
        assetId: assetId,
        symbol: currentPrice.symbol.toUpperCase(),
        name: currentPrice.name,
        amount: amount,
        avgBuyPrice: currentPrice.current_price,
        transactions: []
      });
    }
    
    // Calcular estatísticas simuladas
    simulatedPortfolio.forEach((asset: PortfolioAsset) => {
      const price = currentPrices.find(p => p.id === asset.assetId);
      if (price) {
        simulatedTotalValue += asset.amount * price.current_price;
        simulatedTotalInvestment += asset.amount * asset.avgBuyPrice;
      }
    });
    
    // Calcular estatísticas finais
    const currentStats: PortfolioStats = {
      totalValue,
      totalInvestment,
      totalProfit: totalValue - totalInvestment,
      profitPercentage: totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0,
      performance: {
        day: 0,
        week: 0,
        month: 0,
        year: 0
      }
    };
    
    const newStats: PortfolioStats = {
      totalValue: simulatedTotalValue,
      totalInvestment: simulatedTotalInvestment,
      totalProfit: simulatedTotalValue - simulatedTotalInvestment,
      profitPercentage: simulatedTotalInvestment > 0 
        ? ((simulatedTotalValue - simulatedTotalInvestment) / simulatedTotalInvestment) * 100 
        : 0,
      performance: {
        day: 0,
        week: 0,
        month: 0,
        year: 0
      }
    };
    
    return { currentStats, newStats };
  }
};

export default PortfolioForecastService; 