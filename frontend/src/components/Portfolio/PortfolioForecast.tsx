import React, { useState, useEffect } from 'react';
import PortfolioForecastService, { 
  ForecastScenario, 
  PortfolioForecast as IPortfolioForecast
} from '../../services/portfolioForecastService';
import { PortfolioAsset } from '../../services/portfolioService';
import { CryptoPrice } from '../../services/cryptoService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface PortfolioForecastProps {
  portfolio: PortfolioAsset[];
  currentPrices: CryptoPrice[];
}

const PortfolioForecast: React.FC<PortfolioForecastProps> = ({ portfolio, currentPrices }) => {
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('bull');
  const [timeframe, setTimeframe] = useState<number>(3);
  const [forecast, setForecast] = useState<IPortfolioForecast | null>(null);
  const [showAssetDetails, setShowAssetDetails] = useState<boolean>(false);

  // Inicializar cenários
  useEffect(() => {
    const availableScenarios = PortfolioForecastService.getPredefinedScenarios();
    setScenarios(availableScenarios);
  }, []);

  // Gerar previsão quando o cenário, portfólio ou timeframe mudar
  useEffect(() => {
    if (portfolio.length === 0 || currentPrices.length === 0 || !selectedScenario) {
      return;
    }

    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;

    const result = PortfolioForecastService.forecastPortfolio(
      portfolio,
      currentPrices,
      scenario,
      timeframe
    );

    setForecast(result);
  }, [portfolio, currentPrices, selectedScenario, scenarios, timeframe]);

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

  // Dados para o gráfico de comparação
  const getComparisonChartData = () => {
    if (!forecast) return [];
    
    return [
      {
        name: 'Valor Atual',
        value: forecast.initialValue,
        fill: '#6366F1'
      },
      {
        name: `Previsão (${timeframe} meses)`,
        value: forecast.forecastValue,
        fill: forecast.forecastValue >= forecast.initialValue ? '#10B981' : '#EF4444'
      }
    ];
  };

  // Dados para o gráfico de ativos
  const getAssetForecastData = () => {
    if (!forecast) return [];
    
    return forecast.assetForecasts
      .sort((a, b) => b.forecastValue - a.forecastValue)
      .map(asset => ({
        name: asset.symbol,
        atual: asset.initialValue,
        previsão: asset.forecastValue,
        percentageChange: asset.percentageChange
      }));
  };

  // Gerar dados para gráfico de linha de evolução
  const getEvolutionData = () => {
    if (!forecast || !selectedScenario) return [];
    
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return [];
    
    const data = [];
    let currentValue = forecast.initialValue;
    
    // Gerar pontos para cada mês
    for (let month = 0; month <= timeframe; month++) {
      if (month === 0) {
        data.push({
          month: 'Hoje',
          value: currentValue
        });
      } else {
        // Calcular valor para este mês
        const monthlyChange = forecast.percentageChange / timeframe;
        currentValue = currentValue * (1 + (monthlyChange / 100));
        
        data.push({
          month: `Mês ${month}`,
          value: currentValue
        });
      }
    }
    
    return data;
  };

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p>Adicione ativos ao seu portfólio para ver previsões.</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-4">Simulação de Portfólio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 text-sm font-medium">Cenário</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {scenarios.map(scenario => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {scenarios.find(s => s.id === selectedScenario)?.description}
          </p>
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-medium">Período (meses)</label>
          <input
            type="range"
            min="1"
            max="24"
            value={timeframe}
            onChange={(e) => setTimeframe(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>1 mês</span>
            <span>{timeframe} {timeframe === 1 ? 'mês' : 'meses'}</span>
            <span>24 meses</span>
          </div>
        </div>
      </div>
      
      {forecast && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Valor Atual</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(forecast.initialValue)}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Valor Previsto</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(forecast.forecastValue)}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Alteração</h3>
              <p className={`text-2xl font-bold mt-2 ${forecast.absoluteChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(forecast.absoluteChange)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Percentagem</h3>
              <p className={`text-2xl font-bold mt-2 ${forecast.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(forecast.percentageChange)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-lg font-semibold mb-4">Comparação Atual vs. Previsto</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getComparisonChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => new Intl.NumberFormat('pt-PT', {
                        style: 'currency',
                        currency: 'EUR',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(value)}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Valor" radius={[4, 4, 0, 0]}>
                      {getComparisonChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-lg font-semibold mb-4">Evolução Prevista</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getEvolutionData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => new Intl.NumberFormat('pt-PT', {
                        style: 'currency',
                        currency: 'EUR',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(value)}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Valor do Portfólio" 
                      stroke="#6366F1" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Previsão por Ativo</h3>
            <button
              onClick={() => setShowAssetDetails(!showAssetDetails)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showAssetDetails ? 'Mostrar Gráfico' : 'Mostrar Detalhes'}
            </button>
          </div>
          
          {showAssetDetails ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-md shadow">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4">Ativo</th>
                    <th className="text-left py-3 px-4">Valor Atual</th>
                    <th className="text-left py-3 px-4">Valor Previsto</th>
                    <th className="text-left py-3 px-4">Alteração</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.assetForecasts.map(asset => (
                    <tr key={asset.assetId} className="border-b dark:border-gray-700">
                      <td className="py-3 px-4 font-medium">{asset.name} ({asset.symbol})</td>
                      <td className="py-3 px-4">{formatCurrency(asset.initialValue)}</td>
                      <td className="py-3 px-4">{formatCurrency(asset.forecastValue)}</td>
                      <td className={`py-3 px-4 ${asset.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(asset.absoluteChange)} ({formatPercentage(asset.percentageChange)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getAssetForecastData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barSize={20}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number"
                      tickFormatter={(value) => new Intl.NumberFormat('pt-PT', {
                        style: 'currency',
                        currency: 'EUR',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(value)}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }}
                    />
                    <Legend />
                    <Bar dataKey="atual" name="Valor Atual" fill="#6366F1" />
                    <Bar dataKey="previsão" name="Valor Previsto" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PortfolioForecast; 