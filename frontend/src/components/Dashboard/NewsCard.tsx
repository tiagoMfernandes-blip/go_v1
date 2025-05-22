import React from 'react';
import { useAppContext } from '../../context/AppContext';

interface NewsCardProps {
  title: string;
  source: string;
  date: string;
  summary: string;
  imageUrl?: string;
  url: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  source,
  date,
  summary,
  imageUrl,
  url,
  sentiment = 'neutral'
}) => {
  const { theme } = useAppContext();
  
  const sentimentColor = () => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  const formattedDate = new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className={`card flex flex-col h-full overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {imageUrl && (
        <div className="h-40 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {source}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formattedDate}
          </span>
        </div>
        
        <h3 className="font-semibold mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {summary}
        </p>
        
        <div className="mt-auto flex justify-between items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${sentimentColor()}`}>
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </span>
          
          <a 
            href={url} 
            target="_blank"
            rel="noopener noreferrer" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Ler mais →
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard; 