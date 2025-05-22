import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

interface TechnicalChartProps {
  symbol: string;
}

interface Indicator {
  id: string;
  name: string;
  isActive: boolean;
}

const TechnicalChart: React.FC<TechnicalChartProps> = ({ symbol }) => {
  const { theme } = useAppContext();
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D' | '1W' | '1M'>('1D');
  const [indicators, setIndicators] = useState<Indicator[]>([
    { id: 'rsi', name: 'RSI', isActive: true },
    { id: 'macd', name: 'MACD', isActive: false },
    { id: 'bollinger', name: 'Bollinger Bands', isActive: false },
    { id: 'ma', name: 'Moving Average', isActive: true },
    { id: 'volume', name: 'Volume', isActive: true },
  ]);

  const toggleIndicator = (id: string) => {
    setIndicators(indicators.map(indicator => 
      indicator.id === id ? { ...indicator, isActive: !indicator.isActive } : indicator
    ));
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{symbol}</h3>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Gráfico de preço
            </span>
          </div>
          
          <div className="flex space-x-1">
            {(['1H', '4H', '1D', '1W', '1M'] as const).map(tf => (
              <button
                key={tf}
                className={`px-2 py-1 text-xs rounded ${
                  timeframe === tf 
                    ? 'bg-blue-600 text-white' 
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-1">
        <div className={`h-96 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative`}>
          {/* Aqui seria a integração real com o TradingView */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-lg mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Gráfico TradingView (Simulação)
              </div>
              <div className="text-2xl font-bold">
                {symbol} • {timeframe}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {indicators
                  .filter(indicator => indicator.isActive)
                  .map(indicator => (
                    <span 
                      key={indicator.id}
                      className={`px-2 py-1 rounded-full text-xs ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {indicator.name}
                    </span>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          <h4 className="text-sm font-medium mb-2">Indicadores</h4>
          <div className="flex flex-wrap gap-2">
            {indicators.map(indicator => (
              <button
                key={indicator.id}
                className={`px-2 py-1 text-xs rounded ${
                  indicator.isActive 
                    ? 'bg-blue-600 text-white' 
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => toggleIndicator(indicator.id)}
              >
                {indicator.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalChart; 