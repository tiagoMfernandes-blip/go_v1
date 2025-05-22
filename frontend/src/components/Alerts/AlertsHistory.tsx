import React from 'react';
import { PriceAlert } from '../../models/PriceAlert';

interface AlertsHistoryProps {
  alerts: PriceAlert[];
}

const AlertsHistory: React.FC<AlertsHistoryProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
        <svg className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-600 dark:text-gray-300 mb-2">Histórico vazio</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Não há alertas no histórico. Os alertas desativados aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {alerts.map((alert) => (
          <li key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  alert.condition === 'above' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                }`}>
                  {alert.condition === 'above' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  )}
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {alert.name} ({alert.symbol.toUpperCase()})
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Alerta {alert.condition === 'above' ? 'acima de' : 'abaixo de'} €{alert.targetPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  {alert.triggered ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Acionado em {new Date(alert.triggered).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Desativado manualmente
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <p>
                Criado em {new Date(alert.createdAt).toLocaleDateString()} às {new Date(alert.createdAt).toLocaleTimeString()}
              </p>
              {alert.triggered && (
                <p>
                  Tempo até acionamento: {formatTimeDifference(new Date(alert.createdAt), new Date(alert.triggered))}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Função auxiliar para formatar a diferença de tempo
function formatTimeDifference(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
}

export default AlertsHistory; 