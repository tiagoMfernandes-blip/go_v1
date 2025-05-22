import React from 'react';
import { PriceAlert } from '../../models/PriceAlert';

interface AlertsListProps {
  alerts: PriceAlert[];
  onToggleActive: (alertId: string, active: boolean) => void;
  onDelete: (alertId: string) => void;
}

const AlertsList: React.FC<AlertsListProps> = ({ alerts = [], onToggleActive, onDelete }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
        <svg className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-gray-600 dark:text-gray-300 mb-2">Sem alertas encontrados</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Crie um novo alerta para monitorar os preços das criptomoedas.
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
                {alert.triggered && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Acionado em {new Date(alert.triggered).toLocaleDateString()}
                  </span>
                )}
                
                <button
                  onClick={() => onToggleActive(alert.id, !alert.active)}
                  className={`p-2 rounded-full ${
                    alert.active 
                      ? 'text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900' 
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  title={alert.active ? "Desativar alerta" : "Ativar alerta"}
                >
                  {alert.active ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.964 8.964 0 002.3-5.542m3.155 6.852a3 3 0 005.667 0m5.667 0a24.255 24.255 0 01-5.714 0m-2.757 5.714a2.994 2.994 0 01-2.757-5.714" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={() => onDelete(alert.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full dark:text-red-400 dark:hover:bg-red-900"
                  title="Remover alerta"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {alert.createdAt && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Criado em {new Date(alert.createdAt).toLocaleDateString()} às {new Date(alert.createdAt).toLocaleTimeString()}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertsList; 