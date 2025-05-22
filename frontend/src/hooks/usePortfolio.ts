import { useState, useEffect, useCallback } from 'react';
import PortfolioService, { 
  PortfolioAsset, 
  Transaction, 
  PortfolioStats 
} from '../services/portfolioService';
import useCryptoData from './useCryptoData';
import { useAppContext } from '../context/AppContext';

interface UsePortfolioResult {
  assets: PortfolioAsset[];
  stats: PortfolioStats | null;
  isLoading: boolean;
  error: string | null;
  addAsset: (asset: PortfolioAsset) => void;
  removeAsset: (assetId: string) => void;
  addTransaction: (transaction: Transaction, assetName: string, assetSymbol: string) => void;
  refreshPortfolio: () => void;
}

const usePortfolio = (): UsePortfolioResult => {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { assets: cryptoAssets, isLoading: isCryptoLoading } = useCryptoData();
  const { showNotification } = useAppContext();

  // Função para carregar o portfólio
  const loadPortfolio = useCallback(() => {
    try {
      setIsLoading(true);
      const portfolio = PortfolioService.getPortfolio();
      setAssets(portfolio);
      
      // Calcular estatísticas apenas se tivermos os preços atuais
      if (!isCryptoLoading && cryptoAssets.length > 0) {
        const portfolioStats = PortfolioService.calculateStats(portfolio, cryptoAssets);
        setStats(portfolioStats);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar portfólio:', err);
      setError('Falha ao carregar portfólio. Tente novamente mais tarde.');
      showNotification({
        type: 'error',
        message: 'Não foi possível carregar seus investimentos.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [cryptoAssets, isCryptoLoading, showNotification]);

  // Adicionar um ativo ao portfólio
  const addAsset = useCallback((asset: PortfolioAsset) => {
    try {
      const updatedPortfolio = PortfolioService.addOrUpdateAsset(asset);
      setAssets(updatedPortfolio);
      
      // Atualizar estatísticas
      if (!isCryptoLoading && cryptoAssets.length > 0) {
        const portfolioStats = PortfolioService.calculateStats(updatedPortfolio, cryptoAssets);
        setStats(portfolioStats);
      }
      
      showNotification({
        type: 'success',
        message: `${asset.name} foi adicionado ao seu portfólio.`
      });
    } catch (err) {
      console.error('Erro ao adicionar ativo:', err);
      showNotification({
        type: 'error',
        message: 'Não foi possível adicionar o ativo ao portfólio.'
      });
    }
  }, [cryptoAssets, isCryptoLoading, showNotification]);

  // Remover um ativo do portfólio
  const removeAsset = useCallback((assetId: string) => {
    try {
      const assetToRemove = assets.find(a => a.assetId === assetId);
      const updatedPortfolio = PortfolioService.removeAsset(assetId);
      setAssets(updatedPortfolio);
      
      // Atualizar estatísticas
      if (!isCryptoLoading && cryptoAssets.length > 0) {
        const portfolioStats = PortfolioService.calculateStats(updatedPortfolio, cryptoAssets);
        setStats(portfolioStats);
      }
      
      if (assetToRemove) {
        showNotification({
          type: 'info',
          message: `${assetToRemove.name} foi removido do seu portfólio.`
        });
      }
    } catch (err) {
      console.error('Erro ao remover ativo:', err);
      showNotification({
        type: 'error',
        message: 'Não foi possível remover o ativo do portfólio.'
      });
    }
  }, [assets, cryptoAssets, isCryptoLoading, showNotification]);

  // Adicionar uma transação
  const addTransaction = useCallback((transaction: Transaction, assetName: string, assetSymbol: string) => {
    try {
      // Completar informações do ativo se for uma nova adição
      const needsAssetInfo = !assets.some(a => a.assetId === transaction.assetId);
      
      let updatedPortfolio: PortfolioAsset[];
      
      if (needsAssetInfo) {
        // Se estamos adicionando um ativo novo com esta transação
        const newAsset: PortfolioAsset = {
          assetId: transaction.assetId,
          symbol: assetSymbol,
          name: assetName,
          amount: transaction.type === 'buy' ? transaction.amount : -transaction.amount,
          avgBuyPrice: transaction.type === 'buy' ? transaction.price : 0,
          transactions: [transaction]
        };
        
        updatedPortfolio = PortfolioService.addOrUpdateAsset(newAsset);
      } else {
        // Apenas adicionar a transação ao ativo existente
        updatedPortfolio = PortfolioService.addTransaction(transaction);
      }
      
      setAssets(updatedPortfolio);
      
      // Atualizar estatísticas
      if (!isCryptoLoading && cryptoAssets.length > 0) {
        const portfolioStats = PortfolioService.calculateStats(updatedPortfolio, cryptoAssets);
        setStats(portfolioStats);
      }
      
      showNotification({
        type: 'success',
        message: `${transaction.type === 'buy' ? 'Compra' : 'Venda'} de ${assetName} registrada com sucesso.`
      });
    } catch (err) {
      console.error('Erro ao adicionar transação:', err);
      showNotification({
        type: 'error',
        message: 'Não foi possível registrar a transação.'
      });
    }
  }, [assets, cryptoAssets, isCryptoLoading, showNotification]);

  // Carregar portfólio na inicialização e quando os preços são atualizados
  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  return {
    assets,
    stats,
    isLoading,
    error,
    addAsset,
    removeAsset,
    addTransaction,
    refreshPortfolio: loadPortfolio
  };
};

export default usePortfolio; 