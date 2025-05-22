import React from 'react';
import { useAppContext } from '../../context/AppContext';

interface SentimentCardProps {
  symbol: string;
  name: string;
  score: number;
  source: string;
  postsCount: number;
  trend: 'up' | 'down' | 'neutral';
}

const SentimentCard: React.FC<SentimentCardProps> = ({
  symbol,
  name,
  score,
  source,
  postsCount,
  trend,
}) => {
  const { theme } = useAppContext();
  
  // Determinar a cor baseada no score
  const getSentimentColor = () => {
    if (score >= 0.6) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Determinar o texto baseado no score
  const getSentimentText = () => {
    if (score >= 0.6) return 'Positivo';
    if (score >= 0.4) return 'Neutral';
    return 'Negativo';
  };
  
  // Determinar o ícone baseado na tendência
  const getTrendIcon = () => {
    if (trend === 'up') {
      return (
        <div className="p-1 bg-green-100 dark:bg-green-900 rounded-full text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      );
    }
    if (trend === 'down') {
      return (
        <div className="p-1 bg-red-100 dark:bg-red-900 rounded-full text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      );
    }
    return (
      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      </div>
    );
  };
  
  // Calcular largura da barra de progresso
  const progressWidth = `${Math.round(score * 100)}%`;
  
  return (
    <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium">{name} ({symbol})</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-lg font-semibold ${getSentimentColor()}`}>
              {score.toFixed(2)}
            </span>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              ({getSentimentText()})
            </span>
          </div>
        </div>
        
        {getTrendIcon()}
      </div>
      
      {/* Barra de progresso */}
      <div className={`h-2 w-full rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} mb-3`}>
        <div 
          className={`h-full rounded-full ${
            score >= 0.6 ? 'bg-green-500' : score >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: progressWidth }}
        />
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Baseado em {postsCount.toLocaleString()} posts no {source}
        </span>
        
        <button 
          className={`px-2 py-1 rounded ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Detalhes
        </button>
      </div>
    </div>
  );
};

export default SentimentCard; 