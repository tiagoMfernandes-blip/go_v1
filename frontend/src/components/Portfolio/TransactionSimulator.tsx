import React, { useState } from 'react';
import PortfolioForecastService from '../../services/portfolioForecastService';
import { PortfolioAsset, PortfolioStats } from '../../services/portfolioService';
import { CryptoPrice } from '../../services/cryptoService';

interface TransactionSimulatorProps {
  portfolio: PortfolioAsset[];
  currentPrices: CryptoPrice[];
}

const TransactionSimulator: React.FC<TransactionSimulatorProps> = ({ portfolio, currentPrices }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [simulationResult, setSimulationResult] = useState<{
    currentStats: PortfolioStats;
    newStats: PortfolioStats;
  } | null>(null);

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

  // Realizar simulação
  const handleSimulate = () => {
    if (!selectedAsset || !amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      const result = PortfolioForecastService.simulateTransaction(
        portfolio,
        currentPrices,
        selectedAsset,
        parseFloat(amount),
        transactionType === 'buy'
      );
      
      setSimulationResult(result);
    } catch (error) {
      console.error('Erro ao simular transação:', error);
    }
  };

  // Resetar simulação
  const handleReset = () => {
    setSelectedAsset('');
    setAmount('');
    setTransactionType('buy');
    setSimulationResult(null);
  };

  // Ordenar criptomoedas por capitalização de mercado
  const sortedCryptos = [...currentPrices].sort((a, b) => {
    const rankA = a.market_cap_rank || Number.MAX_SAFE_INTEGER;
    const rankB = b.market_cap_rank || Number.MAX_SAFE_INTEGER;
    return rankA - rankB;
  });

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-4">Simulador de Transações</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block mb-2 text-sm font-medium">Tipo de Transação</label>
          <div className="flex">
            <button
              type="button"
              className={`flex-1 py-2 border-2 ${
                transactionType === 'buy' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-l-md`}
              onClick={() => {
                setTransactionType('buy');
                setSimulationResult(null);
              }}
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
              onClick={() => {
                setTransactionType('sell');
                setSimulationResult(null);
              }}
            >
              Venda
            </button>
          </div>
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-medium">Criptomoeda</label>
          <select
            value={selectedAsset}
            onChange={(e) => {
              setSelectedAsset(e.target.value);
              setSimulationResult(null);
            }}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Selecionar...</option>
            {sortedCryptos.map(crypto => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-medium">Quantidade</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setSimulationResult(null);
            }}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Ex: 0.5"
            step="any"
            min="0"
          />
        </div>
      </div>
      
      <div className="flex justify-end mb-6">
        <button
          onClick={handleReset}
          className="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
        >
          Limpar
        </button>
        <button
          onClick={handleSimulate}
          disabled={!selectedAsset || !amount || parseFloat(amount) <= 0}
          className={`px-6 py-2 text-white rounded-md ${
            !selectedAsset || !amount || parseFloat(amount) <= 0
              ? 'bg-gray-400 cursor-not-allowed'
              : transactionType === 'buy' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Simular
        </button>
      </div>
      
      {simulationResult && (
        <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Resultado da Simulação
            {transactionType === 'buy' 
              ? ` - Compra de ${amount} ${selectedAsset}`
              : ` - Venda de ${amount} ${selectedAsset}`
            }
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium mb-3">Portfólio Atual</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                  <span className="font-semibold">{formatCurrency(simulationResult.currentStats.totalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Investimento Total:</span>
                  <span className="font-semibold">{formatCurrency(simulationResult.currentStats.totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lucro/Prejuízo:</span>
                  <span className={`font-semibold ${simulationResult.currentStats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(simulationResult.currentStats.totalProfit)} ({formatPercentage(simulationResult.currentStats.profitPercentage)})
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-3">Portfólio Após Transação</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                  <span className="font-semibold">{formatCurrency(simulationResult.newStats.totalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Investimento Total:</span>
                  <span className="font-semibold">{formatCurrency(simulationResult.newStats.totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lucro/Prejuízo:</span>
                  <span className={`font-semibold ${simulationResult.newStats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(simulationResult.newStats.totalProfit)} ({formatPercentage(simulationResult.newStats.profitPercentage)})
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium mb-3">Impacto da Transação</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alteração no Valor</div>
                <div className={`text-xl font-bold ${simulationResult.newStats.totalValue - simulationResult.currentStats.totalValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(simulationResult.newStats.totalValue - simulationResult.currentStats.totalValue)}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alteração no Investimento</div>
                <div className="text-xl font-bold">
                  {formatCurrency(simulationResult.newStats.totalInvestment - simulationResult.currentStats.totalInvestment)}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alteração na % de Lucro</div>
                <div className={`text-xl font-bold ${simulationResult.newStats.profitPercentage - simulationResult.currentStats.profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(simulationResult.newStats.profitPercentage - simulationResult.currentStats.profitPercentage)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSimulator; 