import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import CryptoService, { CryptoHistoricalData } from '../services/cryptoService';

const CryptoDetailPage: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { theme, showNotification } = useAppContext();
  
  const [coinDetails, setCoinDetails] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<CryptoHistoricalData | null>(null);
  const [timeframe, setTimeframe] = useState<number>(7); // Dias
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados detalhados da criptomoeda
  useEffect(() => {
    const fetchData = async () => {
      if (!coinId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Buscar detalhes da criptomoeda
        const details = await CryptoService.getCoinDetails(coinId);
        setCoinDetails(details);
        
        // Buscar dados históricos de preço
        const historical = await CryptoService.getHistoricalData(coinId, 'eur', timeframe);
        setHistoricalData(historical);
      } catch (err) {
        console.error('Erro ao buscar dados da criptomoeda:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente mais tarde.');
        showNotification({
          type: 'error',
          message: 'Não foi possível carregar os detalhes da criptomoeda.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [coinId, timeframe, showNotification]);

  // Alterar o período dos dados históricos
  const handleTimeframeChange = (days: number) => {
    setTimeframe(days);
  };

  // Função para formatação de valores monetários
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  // Função para formatar percentuais
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Função para formatar números grandes
  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-PT').format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !coinDetails) {
    return (
      <div>
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error || 'Criptomoeda não encontrada'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Voltar
        </button>
      </div>
    );
  }

  // Extrair dados relevantes do objeto de detalhes
  const {
    name,
    symbol,
    image,
    market_data: marketData,
    description,
    links,
    market_cap_rank: marketCapRank,
  } = coinDetails;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>
      
      <div className="mb-6">
        <div className="flex items-center">
          <img src={image?.large} alt={name} className="w-12 h-12 mr-4" />
          <div>
            <h1 className="text-2xl font-bold">
              {name} ({symbol?.toUpperCase()})
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Classificação: #{marketCapRank} por capitalização de mercado
            </p>
          </div>
        </div>
      </div>

      {/* Preço e estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Preço Atual</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(marketData?.current_price?.eur)}</p>
          <p className={`${marketData?.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'} text-sm mt-1`}>
            {formatPercentage(marketData?.price_change_percentage_24h)} (24h)
          </p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Cap. de Mercado</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(marketData?.market_cap?.eur)}</p>
          <p className={`${marketData?.market_cap_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'} text-sm mt-1`}>
            {formatPercentage(marketData?.market_cap_change_percentage_24h)} (24h)
          </p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Volume 24h</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(marketData?.total_volume?.eur)}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Circulante / Máximo</h3>
          <p className="text-2xl font-bold mt-2">{formatNumber(marketData?.circulating_supply)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {marketData?.max_supply 
              ? `Máximo: ${formatNumber(marketData.max_supply)}`
              : 'Sem máximo definido'}
          </p>
        </div>
      </div>

      {/* Gráfico e Botões de Período */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Histórico de Preços</h2>
          <div className="flex space-x-2">
            {[1, 7, 30, 90, 365].map(days => (
              <button
                key={days}
                onClick={() => handleTimeframeChange(days)}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeframe === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {days === 1 ? '1d' : days === 7 ? '1s' : days === 30 ? '1m' : days === 90 ? '3m' : '1a'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-md p-4 flex items-center justify-center">
          {historicalData ? (
            <p className="text-gray-500 dark:text-gray-400">
              Gráfico seria implementado aqui com os dados históricos usando biblioteca como Chart.js ou Recharts
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Não há dados históricos disponíveis</p>
          )}
        </div>
      </div>

      {/* Descrição */}
      <div className="card p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Sobre {name}</h2>
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: description?.pt || description?.en || 'Sem descrição disponível.' }}
        />
      </div>

      {/* Links */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Links e Recursos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Site Oficial</h3>
            {links?.homepage && links.homepage.filter(Boolean).length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {links.homepage.filter(Boolean).map((url: string, index: number) => (
                  <li key={index}>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum site oficial disponível</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Exploradores de Blockchain</h3>
            {links?.blockchain_site && links.blockchain_site.filter(Boolean).length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {links.blockchain_site.filter(Boolean).slice(0, 3).map((url: string, index: number) => (
                  <li key={index}>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {new URL(url).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum explorador de blockchain disponível</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Comunidade</h3>
            <div className="flex flex-wrap gap-2">
              {links?.twitter_screen_name && (
                <a 
                  href={`https://twitter.com/${links.twitter_screen_name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40"
                >
                  Twitter
                </a>
              )}
              {links?.facebook_username && (
                <a 
                  href={`https://facebook.com/${links.facebook_username}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40"
                >
                  Facebook
                </a>
              )}
              {links?.subreddit_url && (
                <a 
                  href={links.subreddit_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40"
                >
                  Reddit
                </a>
              )}
              {links?.telegram_channel_identifier && (
                <a 
                  href={`https://t.me/${links.telegram_channel_identifier}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40"
                >
                  Telegram
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Desenvolvimento</h3>
            {links?.repos_url?.github && links.repos_url.github.filter(Boolean).length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {links.repos_url.github.filter(Boolean).slice(0, 3).map((url: string, index: number) => (
                  <li key={index}>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      GitHub
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum repositório disponível</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoDetailPage; 