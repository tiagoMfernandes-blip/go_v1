import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import useCryptoData from '../hooks/useCryptoData';

// Definir um tipo com propriedades seguras para ordenação
type SortableKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';

const MarketPage: React.FC = () => {
  const { showNotification } = useAppContext();
  const { assets, isLoading, error, refetch } = useCryptoData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'asc' | 'desc' }>({
    key: 'market_cap_rank',
    direction: 'asc'
  });

  // Função para atualizar os dados
  const handleRefresh = () => {
    refetch();
    showNotification({
      type: 'info',
      message: 'Dados do mercado foram atualizados.'
    });
  };

  // Função para ordenar os dados
  const sortData = (key: SortableKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Dados ordenados e filtrados
  const sortedAssets = [...assets].sort((a, b) => {
    // Método de ordenação seguro para TypeScript
    const aValue = a[sortConfig.key] as number;
    const bValue = b[sortConfig.key] as number;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredAssets = sortedAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas globais (simuladas)
  const globalStats = {
    totalMarketCap: assets.reduce((acc, asset) => acc + (asset.market_cap || 0), 0),
    total24hVolume: assets.reduce((acc, asset) => acc + (asset.total_volume || 0), 0),
    btcDominance: assets.find(a => a.id === 'bitcoin')?.market_cap_percentage || 42.5,
    ethDominance: assets.find(a => a.id === 'ethereum')?.market_cap_percentage || 18.2,
    activeCoins: assets.length
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mercado de Criptomoedas</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar Dados
        </button>
      </div>

      {/* Estatísticas globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Market Cap Total</h3>
          <p className="text-xl font-bold mt-2">€{globalStats.totalMarketCap.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Volume 24h</h3>
          <p className="text-xl font-bold mt-2">€{globalStats.total24hVolume.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Dominância BTC</h3>
          <p className="text-xl font-bold mt-2">{globalStats.btcDominance.toFixed(1)}%</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Dominância ETH</h3>
          <p className="text-xl font-bold mt-2">{globalStats.ethDominance.toFixed(1)}%</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Moedas Ativas</h3>
          <p className="text-xl font-bold mt-2">{globalStats.activeCoins}</p>
        </div>
      </div>

      {/* Tabela de criptomoedas */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Listagem de Criptomoedas</h3>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar..."
              className="px-4 py-2 pl-10 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 cursor-pointer" onClick={() => sortData('market_cap_rank')}>
                  # {sortConfig.key === 'market_cap_rank' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-2">Nome</th>
                <th className="text-left py-2 cursor-pointer" onClick={() => sortData('current_price')}>
                  Preço {sortConfig.key === 'current_price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-2 cursor-pointer" onClick={() => sortData('price_change_percentage_24h')}>
                  24h% {sortConfig.key === 'price_change_percentage_24h' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-2 cursor-pointer" onClick={() => sortData('market_cap')}>
                  Market Cap {sortConfig.key === 'market_cap' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-2 cursor-pointer" onClick={() => sortData('total_volume')}>
                  Volume (24h) {sortConfig.key === 'total_volume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-2">Oferta Circulante</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3">{asset.market_cap_rank}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <img src={asset.image} alt={asset.name} className="w-6 h-6 mr-2" />
                      <div>
                        <Link 
                          to={`/moeda/${asset.id}`} 
                          className="hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        >
                          {asset.name}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{asset.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">€{asset.current_price.toLocaleString('pt-PT')}</td>
                  <td className={`py-3 ${(asset.price_change_percentage_24h || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(asset.price_change_percentage_24h || 0) > 0 ? '+' : ''}
                    {(asset.price_change_percentage_24h || 0).toFixed(2)}%
                  </td>
                  <td className="py-3">€{(asset.market_cap || 0).toLocaleString('pt-PT')}</td>
                  <td className="py-3">€{(asset.total_volume || 0).toLocaleString('pt-PT')}</td>
                  <td className="py-3">{asset.circulating_supply?.toLocaleString('pt-PT')} {asset.symbol.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Nenhum resultado encontrado para "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>Dados fornecidos por CoinGecko API. Preços atualizados a cada minuto.</p>
        <p>Os preços apresentados podem não refletir exatamente os preços em tempo real.</p>
      </div>
    </div>
  );
};

export default MarketPage; 