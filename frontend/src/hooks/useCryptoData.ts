import { useState, useEffect, useCallback } from 'react';
import CryptoService, { CryptoPrice } from '../services/cryptoService';

interface UseCryptoDataResult {
  assets: CryptoPrice[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useCryptoData = (currencies: string[] = ['bitcoin', 'ethereum', 'ripple', 'cardano', 'solana', 'binance-coin']): UseCryptoDataResult => {
  const [assets, setAssets] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Reduzir a frequência de atualização para a cada 15 minutos para evitar rate limiting
  const UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutos em milissegundos

  const fetchCryptoData = useCallback(async (forceUpdate = false) => {
    // Verificar se passou tempo suficiente desde a última atualização
    const now = Date.now();
    const shouldFetch = forceUpdate || assets.length === 0 || (now - lastFetchTime) > UPDATE_INTERVAL;
    
    if (!shouldFetch) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await CryptoService.getMarketData('eur', currencies);
      setAssets(data);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Erro ao buscar dados de criptomoedas:', err);
      setError('Falha ao carregar dados de criptomoedas. Por favor, tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [currencies, assets.length, lastFetchTime]);

  useEffect(() => {
    fetchCryptoData();
    
    // Atualizar a cada 15 minutos em vez de 60 segundos
    const interval = setInterval(() => fetchCryptoData(), UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  return { 
    assets, 
    isLoading, 
    error, 
    refetch: () => fetchCryptoData(true) 
  };
};

export default useCryptoData; 