import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import useCryptoData from '../hooks/useCryptoData';
import usePortfolio from '../hooks/usePortfolio';
import useAuth from '../hooks/useAuth';
import { Transaction } from '../services/portfolioService';
import TransactionHistory from '../components/Portfolio/TransactionHistory';
import PortfolioForecast from '../components/Portfolio/PortfolioForecast';
import TransactionSimulator from '../components/Portfolio/TransactionSimulator';
import AssetAllocation from '../components/Portfolio/AssetAllocation';
import PortfolioStats from '../components/Portfolio/PortfolioStats';
import PortfolioInsights from '../components/Portfolio/PortfolioInsights';

const PortfolioPage: React.FC = () => {
  const { showNotification } = useAppContext();
  const { assets: cryptoAssets, isLoading: isCryptoLoading } = useCryptoData();
  const { 
    assets: portfolioAssets, 
    stats, 
    isLoading: isPortfolioLoading,
    error,
    addTransaction,
    removeAsset,
    refreshPortfolio
  } = usePortfolio();

  // Estado para o formulário de adição de ativo
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  
  // Estado para as tabs
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');

  // Adicionar um novo estado para controlar as tabs de análise
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'stats' | 'allocation' | 'forecast' | 'simulator'>('stats');

  // Função para adicionar um ativo ao portfolio
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAsset || !amount || !price) {
      showNotification({
        type: 'error',
        message: 'Por favor, preencha todos os campos'
      });
      return;
    }
    
    // Encontrar detalhes do ativo selecionado
    const cryptoAsset = cryptoAssets.find(a => a.id === selectedAsset);
    if (!cryptoAsset) {
      showNotification({
        type: 'error',
        message: 'Ativo não encontrado'
      });
      return;
    }
    
    // Criar nova transação
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      assetId: selectedAsset,
      amount: parseFloat(amount),
      price: parseFloat(price),
      date: new Date(),
    };
    
    // Adicionar transação
    addTransaction(newTransaction, cryptoAsset.name, cryptoAsset.symbol.toUpperCase());
    
    // Limpar formulário
    setSelectedAsset('');
    setAmount('');
    setPrice('');
    setShowAddForm(false);
  };

  const isLoading = isCryptoLoading || isPortfolioLoading;

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

  // Formatar valor para moeda euro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  // Formatar percentagem
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portfólio</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Adicionar Transação
          </button>
          <button
            onClick={refreshPortfolio}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Modal de adição de ativo */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Adicionar Transação</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddAsset}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Tipo de Transação</label>
                <div className="flex">
                  <button
                    type="button"
                    className={`flex-1 py-2 border-2 ${
                      transactionType === 'buy' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'border-gray-300 dark:border-gray-700'
                    } rounded-l-md`}
                    onClick={() => setTransactionType('buy')}
                  >
                    Compra
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 border-2 ${
                      transactionType === 'sell' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                        : 'border-gray-300 dark:border-gray-700'
                    } rounded-r-md`}
                    onClick={() => setTransactionType('sell')}
                  >
                    Venda
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Criptomoeda</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Selecionar...</option>
                  {cryptoAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Quantidade</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: 0.5"
                  step="any"
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Preço por unidade (€)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: 50000"
                  step="any"
                  min="0"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md ${
                    transactionType === 'buy' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {transactionType === 'buy' ? 'Comprar' : 'Vender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards de resumo do portfólio */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Valor Total</h3>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalValue)}</p>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Investimento Total</h3>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalInvestment)}</p>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Lucro/Prejuízo</h3>
            <p className={`text-2xl font-bold mt-2 ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(stats.totalProfit)} ({formatPercentage(stats.profitPercentage)})
            </p>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Desempenho</h3>
            <div className="flex flex-col mt-2">
              <div className="flex justify-between">
                <span>Dia:</span>
                <span className={stats.performance.day >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(stats.performance.day)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Semana:</span>
                <span className={stats.performance.week >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(stats.performance.week)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mês:</span>
                <span className={stats.performance.month >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(stats.performance.month)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adicionar seção de insights após os cards de resumo e antes das tabs */}
      {portfolioAssets.length > 0 && (
        <div className="mb-8">
          <PortfolioInsights 
            portfolio={portfolioAssets} 
            currentPrices={cryptoAssets} 
          />
        </div>
      )}

      {/* Tabs de navegação */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('assets')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'assets'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Histórico de Transações
            </button>
          </nav>
        </div>
      </div>

      {/* Conteúdo da tab ativa */}
      {activeTab === 'assets' ? (
        /* Tabela de ativos no portfólio */
        <div className="card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Seus Ativos</h2>
          </div>
          
          {portfolioAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Você ainda não possui ativos no seu portfólio.</p>
              <p className="mt-2">Clique em "Adicionar Transação" para começar a investir.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Ativo</th>
                    <th className="text-left py-3 px-4">Quantidade</th>
                    <th className="text-left py-3 px-4">Preço Médio</th>
                    <th className="text-left py-3 px-4">Preço Atual</th>
                    <th className="text-left py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4">Lucro/Prejuízo</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioAssets.map(asset => {
                    // Encontrar dados atuais do mercado para este ativo
                    const cryptoAsset = cryptoAssets.find(a => a.id === asset.assetId);
                    
                    if (!cryptoAsset) return null;
                    
                    const currentPrice = cryptoAsset.current_price;
                    const currentValue = asset.amount * currentPrice;
                    const investmentValue = asset.amount * asset.avgBuyPrice;
                    const profit = currentValue - investmentValue;
                    const profitPercentage = investmentValue > 0 ? (profit / investmentValue) * 100 : 0;
                    
                    return (
                      <tr key={asset.assetId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img 
                              src={cryptoAsset.image} 
                              alt={asset.name} 
                              className="w-6 h-6 mr-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/placeholder-news.jpg';
                              }}
                            />
                            <div>
                              <div>{asset.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{asset.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{asset.amount.toLocaleString('pt-PT', { maximumFractionDigits: 8 })}</td>
                        <td className="py-3 px-4">{formatCurrency(asset.avgBuyPrice)}</td>
                        <td className="py-3 px-4">
                          <div>{formatCurrency(currentPrice)}</div>
                          <div className={`text-xs ${(cryptoAsset.price_change_percentage_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatPercentage(cryptoAsset.price_change_percentage_24h || 0)} (24h)
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatCurrency(currentValue)}</td>
                        <td className={`py-3 px-4 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(profit)}
                          <div className="text-xs">
                            {formatPercentage(profitPercentage)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              className="p-1 text-blue-500 hover:text-blue-600 rounded"
                              onClick={() => {
                                setSelectedAsset(asset.assetId);
                                setTransactionType('buy');
                                setShowAddForm(true);
                              }}
                              title="Adicionar transação"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                            <button
                              className="p-1 text-red-500 hover:text-red-600 rounded"
                              onClick={() => removeAsset(asset.assetId)}
                              title="Remover ativo"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Histórico de transações */
        <TransactionHistory assets={portfolioAssets} />
      )}

      {/* Nova seção de análise do portfólio - Atualizada com novas tabs */}
      {portfolioAssets.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Análise do Portfólio</h2>
          
          {/* Tabs de análise - Atualizadas com novas opções */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex flex-wrap -mb-px">
                <button
                  onClick={() => setActiveAnalysisTab('stats')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeAnalysisTab === 'stats'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Estatísticas
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('allocation')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeAnalysisTab === 'allocation'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Alocação de Ativos
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('forecast')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeAnalysisTab === 'forecast'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Previsão
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('simulator')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeAnalysisTab === 'simulator'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Simulador
                </button>
              </nav>
            </div>
          </div>
          
          {/* Conteúdo da tab de análise ativa - Atualizado com novos componentes */}
          {activeAnalysisTab === 'stats' ? (
            <PortfolioStats 
              portfolio={portfolioAssets} 
              currentPrices={cryptoAssets} 
            />
          ) : activeAnalysisTab === 'allocation' ? (
            <AssetAllocation 
              portfolio={portfolioAssets} 
              currentPrices={cryptoAssets} 
            />
          ) : activeAnalysisTab === 'forecast' ? (
            <PortfolioForecast 
              portfolio={portfolioAssets} 
              currentPrices={cryptoAssets} 
            />
          ) : (
            <TransactionSimulator 
              portfolio={portfolioAssets} 
              currentPrices={cryptoAssets} 
            />
          )}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>As informações são atualizadas a cada 60 segundos.</p>
        <p>Os cálculos de rentabilidade são baseados nos preços de mercado atual.</p>
      </div>
    </div>
  );
};

export default PortfolioPage; 