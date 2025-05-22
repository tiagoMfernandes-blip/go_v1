import React from 'react';
import { Transaction, PortfolioAsset } from '../../services/portfolioService';

interface TransactionHistoryProps {
  assets: PortfolioAsset[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ assets }) => {
  // Extrair todas as transações de todos os ativos
  const allTransactions = assets.flatMap(asset => 
    asset.transactions.map(transaction => ({
      ...transaction,
      assetName: asset.name,
      assetSymbol: asset.symbol
    }))
  );
  
  // Ordenar por data (mais recente primeiro)
  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Formatar valor para moeda euro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  // Formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (allTransactions.length === 0) {
    return (
      <div className="card p-6 text-center text-gray-500 dark:text-gray-400">
        <p>Não há transações registadas.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Histórico de Transações</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Data</th>
              <th className="text-left py-3 px-4">Tipo</th>
              <th className="text-left py-3 px-4">Ativo</th>
              <th className="text-left py-3 px-4">Quantidade</th>
              <th className="text-left py-3 px-4">Preço</th>
              <th className="text-left py-3 px-4">Valor Total</th>
              <th className="text-left py-3 px-4">Taxa</th>
            </tr>
          </thead>
          <tbody>
            {allTransactions.map(transaction => {
              const totalValue = transaction.amount * transaction.price;
              
              return (
                <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-4">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'buy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {transaction.type === 'buy' ? 'Compra' : 'Venda'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div>
                        <div>{transaction.assetName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.assetSymbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {transaction.amount.toLocaleString('pt-PT', { maximumFractionDigits: 8 })}
                  </td>
                  <td className="py-3 px-4">
                    {formatCurrency(transaction.price)}
                  </td>
                  <td className="py-3 px-4">
                    {formatCurrency(totalValue)}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.fee ? formatCurrency(transaction.fee) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory; 