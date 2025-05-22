import React from 'react';
import { PortfolioAsset } from '../../services/portfolioService';
import { CryptoPrice } from '../../services/cryptoService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';

interface PortfolioStatsProps {
  portfolio: PortfolioAsset[];
  currentPrices: CryptoPrice[];
}

const PortfolioStats: React.FC<PortfolioStatsProps> = ({ portfolio, currentPrices }) => {
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

  // Calcular estatísticas gerais do portfólio
  const calculateStats = () => {
    let totalValue = 0;
    let totalInvestment = 0;
    let bestPerformer = { symbol: '', percentageChange: -Infinity, absoluteChange: 0 };
    let worstPerformer = { symbol: '', percentageChange: Infinity, absoluteChange: 0 };
    
    const assetStats = portfolio.map(asset => {
      const price = currentPrices.find(p => p.id === asset.assetId);
      
      if (!price || asset.amount <= 0) return null;
      
      const currentValue = asset.amount * price.current_price;
      const investmentValue = asset.amount * asset.avgBuyPrice;
      const absoluteChange = currentValue - investmentValue;
      const percentageChange = investmentValue > 0 ? (absoluteChange / investmentValue) * 100 : 0;
      
      totalValue += currentValue;
      totalInvestment += investmentValue;
      
      // Verificar se é o melhor ou pior performer
      if (percentageChange > bestPerformer.percentageChange) {
        bestPerformer = { 
          symbol: asset.symbol, 
          percentageChange, 
          absoluteChange
        };
      }
      
      if (percentageChange < worstPerformer.percentageChange) {
        worstPerformer = { 
          symbol: asset.symbol, 
          percentageChange, 
          absoluteChange
        };
      }
      
      return {
        assetId: asset.assetId,
        symbol: asset.symbol,
        name: asset.name,
        currentValue,
        investmentValue,
        absoluteChange,
        percentageChange,
        price24hChange: price.price_change_percentage_24h
      };
    }).filter(Boolean) as any[];
    
    const totalProfit = totalValue - totalInvestment;
    const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
    
    // Calcular volatilidade baseada nas mudanças de 24h
    const volatility = assetStats.reduce((sum, asset) => sum + Math.abs(asset.price24hChange), 0) / assetStats.length;
    
    return {
      totalValue,
      totalInvestment,
      totalProfit,
      profitPercentage,
      assetStats,
      bestPerformer,
      worstPerformer,
      volatility
    };
  };

  // Gerar dados para o gráfico de desempenho por ativo
  const getPerformanceData = () => {
    const stats = calculateStats();
    
    return stats.assetStats
      .sort((a, b) => b.percentageChange - a.percentageChange)
      .map(asset => ({
        name: asset.symbol,
        percentageChange: asset.percentageChange,
        absoluteChange: asset.absoluteChange
      }));
  };

  // Gerar dados para o gráfico de valor vs investimento
  const getValueVsInvestmentData = () => {
    const stats = calculateStats();
    
    return [
      { name: 'Investimento', valor: stats.totalInvestment },
      { name: 'Valor Atual', valor: stats.totalValue }
    ];
  };

  // Gerar dados simulados para o gráfico de evolução temporal (numa implementação real, usaria dados históricos)
  const getHistoricalData = () => {
    const stats = calculateStats();
    const now = new Date();
    const data = [];
    
    // Simulação básica - em um sistema real, usaria dados históricos reais
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      // Flutuação aleatória em torno do valor atual
      const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 a 1.2
      const baseValue = stats.totalValue * randomFactor;
      
      // Ajuste baseado no dia para criar uma tendência
      const dayFactor = 1 + ((30 - i) / 100);
      
      data.push({
        date: date.toLocaleDateString('pt-PT'),
        valor: baseValue / dayFactor
      });
    }
    
    return data;
  };

  const stats = calculateStats();
  
  if (portfolio.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p>Adicione ativos ao seu portfólio para ver estatísticas avançadas.</p>
      </div>
    );
  }

  // Cores para barras positivas e negativas
  const POSITIVE_COLOR = '#10B981'; // Verde
  const NEGATIVE_COLOR = '#EF4444'; // Vermelho

  const performanceData = getPerformanceData();

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-4">Estatísticas do Portfólio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">ROI</h3>
          <p className={`text-2xl font-bold mt-1 ${stats.profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercentage(stats.profitPercentage)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatCurrency(stats.totalProfit)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Melhor Desempenho</h3>
          <p className="text-2xl font-bold mt-1 text-green-500">
            {stats.bestPerformer.symbol} ({formatPercentage(stats.bestPerformer.percentageChange)})
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatCurrency(stats.bestPerformer.absoluteChange)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Pior Desempenho</h3>
          <p className="text-2xl font-bold mt-1 text-red-500">
            {stats.worstPerformer.symbol} ({formatPercentage(stats.worstPerformer.percentageChange)})
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatCurrency(stats.worstPerformer.absoluteChange)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de evolução do portfólio */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Evolução do Valor (30 dias)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getHistoricalData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
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
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  name="Valor do Portfólio"
                  stroke="#6366F1" 
                  fill="#6366F1" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de desempenho por ativo */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Desempenho por Ativo (%)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <ReferenceLine x={0} stroke="#000" />
                <Bar 
                  dataKey="percentageChange" 
                  name="Variação (%)" 
                  radius={[0, 4, 4, 0]}
                >
                  {performanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentageChange >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
        <h3 className="text-lg font-semibold mb-4">Valor vs Investimento</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getValueVsInvestmentData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
              <Bar 
                dataKey="valor" 
                name="Valor" 
                fill={stats.totalValue >= stats.totalInvestment ? POSITIVE_COLOR : NEGATIVE_COLOR}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioStats; 