import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import useCryptoData from '../hooks/useCryptoData';
import useAuth from '../hooks/useAuth';
import usePortfolio from '../hooks/usePortfolio';
import { Transaction } from '../services/portfolioService';

interface TradeForm {
  cryptoId: string;
  amount: string;
  operation: 'buy' | 'sell';
}

const TradePage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useAppContext();
  const { isAuthenticated } = useAuth();
  const { assets: cryptoData, isLoading: loading, error } = useCryptoData();
  const { assets: portfolioAssets, addTransaction } = usePortfolio();
  
  const [formData, setFormData] = useState<TradeForm>({
    cryptoId: 'bitcoin',
    amount: '',
    operation: 'buy'
  });
  
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [ownedAmount, setOwnedAmount] = useState<number>(0);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (cryptoData && cryptoData.length > 0) {
      const crypto = cryptoData.find((c: any) => c.id === formData.cryptoId);
      setSelectedCrypto(crypto);
      
      if (crypto && formData.amount) {
        const amount = parseFloat(formData.amount);
        if (!isNaN(amount)) {
          setEstimatedValue(amount * crypto.current_price);
        } else {
          setEstimatedValue(0);
        }
      } else {
        setEstimatedValue(0);
      }
    }
  }, [cryptoData, formData.cryptoId, formData.amount]);
  
  useEffect(() => {
    if (portfolioAssets && portfolioAssets.length > 0 && formData.cryptoId) {
      const asset = portfolioAssets.find(a => a.assetId === formData.cryptoId);
      setOwnedAmount(asset ? asset.amount : 0);
    } else {
      setOwnedAmount(0);
    }
  }, [portfolioAssets, formData.cryptoId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (processing) return;
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showNotification({
        type: 'error',
        message: 'Por favor, insira um valor válido.'
      });
      return;
    }
    
    const amount = parseFloat(formData.amount);
    
    if (formData.operation === 'sell' && amount > ownedAmount) {
      showNotification({
        type: 'error',
        message: `Não possui quantidade suficiente. Você possui apenas ${ownedAmount} ${selectedCrypto?.symbol.toUpperCase()}.`
      });
      return;
    }
    
    if (!selectedCrypto) {
      showNotification({
        type: 'error',
        message: 'Erro ao processar transação. Criptomoeda não encontrada.'
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: formData.operation,
        assetId: formData.cryptoId,
        amount: amount,
        price: selectedCrypto.current_price,
        date: new Date(),
        fee: estimatedValue * 0.005
      };
      
      addTransaction(transaction, selectedCrypto.name, selectedCrypto.symbol);
      
      showNotification({
        type: 'success',
        message: `${formData.operation === 'buy' ? 'Compra' : 'Venda'} de ${formData.amount} ${selectedCrypto.symbol.toUpperCase()} realizada com sucesso!`
      });
      
      setFormData({
        cryptoId: 'bitcoin',
        amount: '',
        operation: 'buy'
      });
      
      setTimeout(() => {
        navigate('/portfolio');
      }, 1500);
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      showNotification({
        type: 'error',
        message: 'Ocorreu um erro ao processar a transação. Tente novamente.'
      });
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <span className="block sm:inline">Erro ao carregar dados das criptomoedas. Tente novamente mais tarde.</span>
    </div>
  );
  
  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Comprar & Vender Criptomoedas</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="operation">
              Operação
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="operation"
                  value="buy"
                  checked={formData.operation === 'buy'}
                  onChange={handleInputChange}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Comprar</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="operation"
                  value="sell"
                  checked={formData.operation === 'sell'}
                  onChange={handleInputChange}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Vender</span>
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="cryptoId">
              Criptomoeda
            </label>
            <select
              id="cryptoId"
              name="cryptoId"
              value={formData.cryptoId}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {cryptoData && cryptoData.map((crypto: any) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          
          {selectedCrypto && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center mb-2">
                <img 
                  src={selectedCrypto.image} 
                  alt={selectedCrypto.name} 
                  className="w-8 h-8 mr-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/placeholder-news.jpg';
                  }}
                />
                <h3 className="text-lg font-semibold dark:text-white">{selectedCrypto.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Preço Atual</p>
                  <p className="font-medium dark:text-white">€{selectedCrypto.current_price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Variação 24h</p>
                  <p className={`font-medium ${selectedCrypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedCrypto.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              {formData.operation === 'sell' && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quantidade Disponível</p>
                  <p className="font-medium dark:text-white">
                    {ownedAmount.toFixed(5)} {selectedCrypto.symbol.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="amount">
              Quantidade ({selectedCrypto ? selectedCrypto.symbol.toUpperCase() : ''})
            </label>
            <input
              id="amount"
              type="number"
              name="amount"
              placeholder="0.00"
              min="0.00001"
              step="0.00001"
              value={formData.amount}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Valor Estimado</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">€{estimatedValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Taxa de transação: €{(estimatedValue * 0.005).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} (0.5%)
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={processing}
              className={`w-full py-3 rounded-lg text-white font-bold text-lg focus:outline-none ${
                processing ? 'opacity-75 cursor-not-allowed' : ''
              } ${
                formData.operation === 'buy' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {processing 
                ? 'A processar...' 
                : `${formData.operation === 'buy' ? 'Comprar' : 'Vender'} ${selectedCrypto?.symbol.toUpperCase() || ''}`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradePage; 