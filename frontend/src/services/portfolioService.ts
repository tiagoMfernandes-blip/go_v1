import { CryptoPrice } from './cryptoService';

// Interface para um ativo do portfólio
export interface PortfolioAsset {
  assetId: string;   // ID da criptomoeda (ex: 'bitcoin')
  symbol: string;    // Símbolo (ex: 'BTC')
  name: string;      // Nome (ex: 'Bitcoin')
  amount: number;    // Quantidade (ex: 0.5 BTC)
  avgBuyPrice: number; // Preço médio de compra (em EUR)
  transactions: Transaction[]; // Histórico de transações
}

// Interface para uma transação
export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  assetId: string;
  amount: number;
  price: number;
  date: Date;
  fee?: number;
  notes?: string;
}

// Interface para estatísticas do portfólio
export interface PortfolioStats {
  totalValue: number;
  totalInvestment: number;
  totalProfit: number;
  profitPercentage: number;
  performance: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
}

/**
 * Serviço para gestão do portfólio de investimentos
 */
const PortfolioService = {
  // Chave para armazenamento local do portfólio
  STORAGE_KEY: 'gofolio_portfolio',

  /**
   * Obtém todos os ativos do portfólio do utilizador
   * @returns Lista de ativos do portfólio
   */
  getPortfolio: (): PortfolioAsset[] => {
    const portfolioData = localStorage.getItem(PortfolioService.STORAGE_KEY);
    return portfolioData ? JSON.parse(portfolioData) : [];
  },

  /**
   * Salva a lista de ativos do portfólio
   * @param assets Lista de ativos a ser salva
   */
  savePortfolio: (assets: PortfolioAsset[]): void => {
    localStorage.setItem(PortfolioService.STORAGE_KEY, JSON.stringify(assets));
  },

  /**
   * Adiciona um novo ativo ao portfólio ou atualiza um existente
   * @param asset Ativo a ser adicionado/atualizado
   */
  addOrUpdateAsset: (asset: PortfolioAsset): PortfolioAsset[] => {
    const portfolio = PortfolioService.getPortfolio();
    const existingIndex = portfolio.findIndex(a => a.assetId === asset.assetId);

    if (existingIndex >= 0) {
      // Atualizar ativo existente
      portfolio[existingIndex] = {
        ...portfolio[existingIndex],
        amount: asset.amount,
        avgBuyPrice: asset.avgBuyPrice,
        transactions: [...portfolio[existingIndex].transactions, ...asset.transactions]
      };
    } else {
      // Adicionar novo ativo
      portfolio.push(asset);
    }

    PortfolioService.savePortfolio(portfolio);
    return portfolio;
  },

  /**
   * Remove um ativo do portfólio
   * @param assetId ID do ativo a ser removido
   */
  removeAsset: (assetId: string): PortfolioAsset[] => {
    const portfolio = PortfolioService.getPortfolio();
    const updatedPortfolio = portfolio.filter(asset => asset.assetId !== assetId);
    PortfolioService.savePortfolio(updatedPortfolio);
    return updatedPortfolio;
  },

  /**
   * Adiciona uma transação a um ativo do portfólio
   * @param transaction Transação a ser adicionada
   */
  addTransaction: (transaction: Transaction): PortfolioAsset[] => {
    const portfolio = PortfolioService.getPortfolio();
    const assetIndex = portfolio.findIndex(a => a.assetId === transaction.assetId);

    if (assetIndex >= 0) {
      // Atualizar ativo existente com a nova transação
      const asset = portfolio[assetIndex];
      const newTransactions = [...asset.transactions, transaction];
      
      // Recalcular quantidade e preço médio
      let totalAmount = 0;
      let totalInvested = 0;
      
      newTransactions.forEach(t => {
        if (t.type === 'buy') {
          totalAmount += t.amount;
          totalInvested += t.amount * t.price;
        } else { // sell
          totalAmount -= t.amount;
          // Não subtraímos do valor investido ao vender
        }
      });
      
      // Atualizar o ativo com os novos valores
      portfolio[assetIndex] = {
        ...asset,
        amount: totalAmount,
        avgBuyPrice: totalAmount > 0 ? totalInvested / totalAmount : 0,
        transactions: newTransactions
      };
    } else {
      // Criar novo ativo se não existir
      const newAsset: PortfolioAsset = {
        assetId: transaction.assetId,
        symbol: '', // Será preenchido pelo chamador
        name: '',   // Será preenchido pelo chamador
        amount: transaction.type === 'buy' ? transaction.amount : -transaction.amount,
        avgBuyPrice: transaction.type === 'buy' ? transaction.price : 0,
        transactions: [transaction]
      };
      
      portfolio.push(newAsset);
    }

    PortfolioService.savePortfolio(portfolio);
    return portfolio;
  },

  /**
   * Calcula estatísticas do portfólio com base nos preços atuais
   * @param portfolio Ativos do portfólio
   * @param currentPrices Preços atuais das criptomoedas
   */
  calculateStats: (portfolio: PortfolioAsset[], currentPrices: CryptoPrice[]): PortfolioStats => {
    // Valores iniciais
    let totalValue = 0;
    let totalInvestment = 0;

    // Calcular valor total e investimento
    portfolio.forEach(asset => {
      const currentPrice = currentPrices.find(p => p.id === asset.assetId);
      if (currentPrice) {
        // Valor atual = quantidade * preço atual
        const assetValue = asset.amount * currentPrice.current_price;
        totalValue += assetValue;
        
        // Investimento = quantidade * preço médio de compra
        const assetInvestment = asset.amount * asset.avgBuyPrice;
        totalInvestment += assetInvestment;
      }
    });

    // Calcular lucro/prejuízo
    const totalProfit = totalValue - totalInvestment;
    const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    // Simular desempenho em diferentes períodos
    // Numa implementação real, isso seria calculado com base nos dados históricos
    return {
      totalValue,
      totalInvestment,
      totalProfit,
      profitPercentage,
      performance: {
        day: Math.random() * 6 - 3,     // -3% a +3%
        week: Math.random() * 10 - 3,   // -3% a +7%
        month: Math.random() * 20 - 5,  // -5% a +15%
        year: Math.random() * 60 - 10   // -10% a +50%
      }
    };
  }
};

export default PortfolioService; 