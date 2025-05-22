import { PriceAlert, CreatePriceAlertRequest, UpdatePriceAlertRequest } from '../models/PriceAlert';
import CryptoService from './cryptoService';
import TradingSignalService from './tradingSignalService';
import MarketSentimentService from './marketSentimentService';

// Chave para armazenamento local dos alertas
const ALERTS_STORAGE_KEY = 'price_alerts';
const SMART_ALERTS_STORAGE_KEY = 'smart_price_alerts';

// Interface para alertas inteligentes estendendo os alertas básicos
export interface SmartAlert extends PriceAlert {
  factors: string[];
  severity: 'low' | 'medium' | 'high';
  signalType?: 'buy' | 'sell' | 'neutral';
  recommendedAction?: string;
  sentiment?: number;
}

/**
 * Serviço para gerenciar alertas de preço
 */
const AlertService = {
  /**
   * Obtém todos os alertas de preço do utilizador
   * @returns Lista de alertas de preço
   */
  getAlerts: (): PriceAlert[] => {
    try {
      const alertsJson = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (!alertsJson) return [];
      
      const alerts = JSON.parse(alertsJson) as PriceAlert[];
      
      // Converter strings de data para objetos Date
      return alerts.map(alert => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
        triggered: alert.triggered ? new Date(alert.triggered) : null
      }));
    } catch (error) {
      console.error('Erro ao obter alertas:', error);
      return [];
    }
  },

  /**
   * Cria um novo alerta de preço
   * @param alertData Dados do alerta a ser criado
   * @returns Alerta criado
   */
  createAlert: (alertData: CreatePriceAlertRequest): PriceAlert => {
    try {
      const alerts = AlertService.getAlerts();
      
      const newAlert: PriceAlert = {
        ...alertData,
        id: Date.now().toString(),
        userId: 'user1', // Temporário até implementar autenticação
        active: true,
        createdAt: new Date(),
        notified: false
      };
      
      const updatedAlerts = [...alerts, newAlert];
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
      
      return newAlert;
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      throw new Error('Não foi possível criar o alerta. Por favor, tente novamente.');
    }
  },

  /**
   * Atualiza um alerta existente
   * @param updateData Dados para atualização do alerta
   * @returns Alerta atualizado ou null se não encontrado
   */
  updateAlert: (updateData: UpdatePriceAlertRequest): PriceAlert | null => {
    try {
      const alerts = AlertService.getAlerts();
      const alertIndex = alerts.findIndex(a => a.id === updateData.id);
      
      if (alertIndex === -1) {
        console.error('Alerta não encontrado:', updateData.id);
        return null;
      }
      
      const updatedAlert: PriceAlert = {
        ...alerts[alertIndex],
        ...updateData
      };
      
      alerts[alertIndex] = updatedAlert;
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
      
      return updatedAlert;
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error);
      throw new Error('Não foi possível atualizar o alerta. Por favor, tente novamente.');
    }
  },

  /**
   * Remove um alerta pelo ID
   * @param alertId ID do alerta a ser removido
   * @returns true se removido com sucesso, false caso contrário
   */
  deleteAlert: (alertId: string): boolean => {
    try {
      const alerts = AlertService.getAlerts();
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      
      if (updatedAlerts.length === alerts.length) {
        // Nenhum alerta foi removido
        return false;
      }
      
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
      return true;
    } catch (error) {
      console.error('Erro ao remover alerta:', error);
      throw new Error('Não foi possível remover o alerta. Por favor, tente novamente.');
    }
  },

  /**
   * Verifica se algum alerta foi acionado com base nos preços atuais
   * @returns Lista de alertas acionados
   */
  checkAlerts: async (): Promise<PriceAlert[]> => {
    try {
      const alerts = AlertService.getAlerts().filter(alert => alert.active && !alert.notified);
      
      if (alerts.length === 0) return [];
      
      // Agrupar alertas por moeda
      const alertsByAsset: Record<string, PriceAlert[]> = {};
      alerts.forEach(alert => {
        if (!alertsByAsset[alert.assetId]) {
          alertsByAsset[alert.assetId] = [];
        }
        alertsByAsset[alert.assetId].push(alert);
      });
      
      const assetIds = Object.keys(alertsByAsset);
      
      // Obter preços atuais
      const cryptoData = await CryptoService.getMarketData('eur', assetIds);
      
      const triggeredAlerts: PriceAlert[] = [];
      
      // Verificar cada alerta
      for (const crypto of cryptoData) {
        const assetAlerts = alertsByAsset[crypto.id] || [];
        
        for (const alert of assetAlerts) {
          let isTriggered = false;
          
          if (alert.condition === 'above' && crypto.current_price >= alert.targetPrice) {
            isTriggered = true;
          } else if (alert.condition === 'below' && crypto.current_price <= alert.targetPrice) {
            isTriggered = true;
          }
          
          if (isTriggered) {
            // Atualizar o alerta
            const updatedAlert = AlertService.updateAlert({
              id: alert.id,
              triggered: new Date(),
              notified: true
            });
            
            if (updatedAlert) {
              triggeredAlerts.push(updatedAlert);
            }
          }
        }
      }
      
      return triggeredAlerts;
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
      return [];
    }
  }
};

/**
 * Serviço para alertas inteligentes baseados em múltiplos fatores
 */
export const SmartAlertService = {
  /**
   * Obtém todos os alertas inteligentes
   * @returns Lista de alertas inteligentes
   */
  getSmartAlerts: (): SmartAlert[] => {
    try {
      const alertsJson = localStorage.getItem(SMART_ALERTS_STORAGE_KEY);
      if (!alertsJson) return [];
      
      const alerts = JSON.parse(alertsJson) as SmartAlert[];
      
      // Converter strings de data para objetos Date
      return alerts.map(alert => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
        triggered: alert.triggered ? new Date(alert.triggered) : null
      }));
    } catch (error) {
      console.error('Erro ao obter alertas inteligentes:', error);
      return [];
    }
  },
  
  /**
   * Criar alerta inteligente baseado em múltiplos fatores
   */
  createSmartAlert: async (assetId: string): Promise<SmartAlert> => {
    try {
      // Obter dados técnicos e de sentimento
      const symbol = `${assetId.toUpperCase()}USDT`;
      const tradingSignal = await TradingSignalService.getBestSignal(symbol);
      const sentiment = await MarketSentimentService.getAssetSentiment(assetId);
      
      if (!tradingSignal) {
        throw new Error('Nenhum sinal significativo encontrado');
      }
      
      // Determinar tipo de alerta e nível
      const signalType = tradingSignal.type.includes('buy') ? 'buy' : 'sell';
      const severity = tradingSignal.confidence > 80 ? 'high' : 
                      tradingSignal.confidence > 60 ? 'medium' : 'low';
      
      // Criar alerta inteligente
      const cryptoData = await CryptoService.getMarketData('eur', [assetId]);
      if (!cryptoData || cryptoData.length === 0) {
        throw new Error('Não foi possível obter dados de mercado');
      }
      
      const currentPrice = cryptoData[0].current_price;
      
      // Calcular preço alvo com base no tipo de sinal
      const targetPrice = signalType === 'buy' 
        ? currentPrice * 0.95 // 5% abaixo para sinais de compra (para ativar quando cair ao preço alvo)
        : currentPrice * 1.05; // 5% acima para sinais de venda (para ativar quando subir ao preço alvo)
      
      // Criar ações recomendadas baseadas no sinal
      let recommendedAction = '';
      if (signalType === 'buy') {
        recommendedAction = `Considere comprar ${assetId.toUpperCase()} próximo do preço atual (${currentPrice.toFixed(2)}€). `;
        
        if (tradingSignal.stopLoss) {
          recommendedAction += `Coloque um stop loss em ${(currentPrice * (1 - tradingSignal.stopLoss/100)).toFixed(2)}€. `;
        }
        
        if (tradingSignal.takeProfit) {
          recommendedAction += `Considere realizar lucro em ${(currentPrice * (1 + tradingSignal.takeProfit/100)).toFixed(2)}€.`;
        }
      } else {
        recommendedAction = `Considere vender ou abrir posição de venda em ${assetId.toUpperCase()} próximo do preço atual (${currentPrice.toFixed(2)}€).`;
      }
      
      // Criar o alerta
      const smartAlert: SmartAlert = {
        id: Date.now().toString(),
        userId: 'user1', // Temporário até implementar autenticação
        assetId,
        name: cryptoData[0].name,
        symbol: cryptoData[0].symbol,
        assetSymbol: cryptoData[0].symbol.toUpperCase(),
        condition: signalType === 'buy' ? 'below' : 'above',
        targetPrice,
        currency: 'eur',
        notes: `Alerta baseado em: ${tradingSignal.basedOn.join(', ')}. ${tradingSignal.description}`,
        active: true,
        createdAt: new Date(),
        notified: false,
        factors: tradingSignal.basedOn,
        severity,
        signalType,
        recommendedAction,
        sentiment: sentiment.overallScore
      };
      
      // Salvar o alerta
      const existingAlerts = SmartAlertService.getSmartAlerts();
      const updatedAlerts = [...existingAlerts, smartAlert];
      localStorage.setItem(SMART_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
      
      return smartAlert;
    } catch (error) {
      console.error('Erro ao criar alerta inteligente:', error);
      throw new Error(`Não foi possível criar o alerta inteligente: ${error}`);
    }
  },
  
  /**
   * Gerar alertas automáticos para os principais ativos
   */
  generateAutomaticAlerts: async (): Promise<SmartAlert[]> => {
    // Lista de principais criptomoedas para monitorar
    const topAssets = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot'];
    const alerts: SmartAlert[] = [];
    
    // Gerar alertas para cada ativo
    for (const asset of topAssets) {
      try {
        const alert = await SmartAlertService.createSmartAlert(asset);
        alerts.push(alert);
      } catch (error) {
        console.error(`Erro ao gerar alerta para ${asset}:`, error);
      }
    }
    
    return alerts;
  },
  
  /**
   * Verificar alertas inteligentes
   */
  checkSmartAlerts: async (): Promise<SmartAlert[]> => {
    try {
      const alerts = SmartAlertService.getSmartAlerts().filter(alert => alert.active && !alert.notified);
      
      if (alerts.length === 0) return [];
      
      // Agrupar alertas por moeda
      const alertsByAsset: Record<string, SmartAlert[]> = {};
      alerts.forEach(alert => {
        if (!alertsByAsset[alert.assetId]) {
          alertsByAsset[alert.assetId] = [];
        }
        alertsByAsset[alert.assetId].push(alert);
      });
      
      const assetIds = Object.keys(alertsByAsset);
      
      // Obter preços atuais
      const cryptoData = await CryptoService.getMarketData('eur', assetIds);
      
      const triggeredAlerts: SmartAlert[] = [];
      
      // Verificar cada alerta
      for (const crypto of cryptoData) {
        const assetAlerts = alertsByAsset[crypto.id] || [];
        
        for (const alert of assetAlerts) {
          let isTriggered = false;
          
          if (alert.condition === 'above' && crypto.current_price >= alert.targetPrice) {
            isTriggered = true;
          } else if (alert.condition === 'below' && crypto.current_price <= alert.targetPrice) {
            isTriggered = true;
          }
          
          if (isTriggered) {
            // Atualizar o alerta
            alert.triggered = new Date();
            alert.notified = true;
            
            triggeredAlerts.push(alert);
          }
        }
      }
      
      // Salvar alertas atualizados
      if (triggeredAlerts.length > 0) {
        const allAlerts = SmartAlertService.getSmartAlerts();
        const updatedAlerts = allAlerts.map(alert => {
          const triggered = triggeredAlerts.find(t => t.id === alert.id);
          return triggered || alert;
        });
        
        localStorage.setItem(SMART_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
      }
      
      return triggeredAlerts;
    } catch (error) {
      console.error('Erro ao verificar alertas inteligentes:', error);
      return [];
    }
  },
  
  /**
   * Atualizar um alerta inteligente
   */
  updateSmartAlert: (alertId: string, updates: Partial<SmartAlert>): SmartAlert | null => {
    try {
      const alerts = SmartAlertService.getSmartAlerts();
      const alertIndex = alerts.findIndex(a => a.id === alertId);
      
      if (alertIndex === -1) {
        console.error('Alerta inteligente não encontrado:', alertId);
        return null;
      }
      
      const updatedAlert: SmartAlert = {
        ...alerts[alertIndex],
        ...updates
      };
      
      alerts[alertIndex] = updatedAlert;
      localStorage.setItem(SMART_ALERTS_STORAGE_KEY, JSON.stringify(alerts));
      
      return updatedAlert;
    } catch (error) {
      console.error('Erro ao atualizar alerta inteligente:', error);
      return null;
    }
  },
  
  /**
   * Remover um alerta inteligente
   */
  deleteSmartAlert: (alertId: string): boolean => {
    try {
      const alerts = SmartAlertService.getSmartAlerts();
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      
      if (updatedAlerts.length === alerts.length) {
        // Nenhum alerta foi removido
        return false;
      }
      
      localStorage.setItem(SMART_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
      return true;
    } catch (error) {
      console.error('Erro ao remover alerta inteligente:', error);
      return false;
    }
  }
};

export default AlertService; 