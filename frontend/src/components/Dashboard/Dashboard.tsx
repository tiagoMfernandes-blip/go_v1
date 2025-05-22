import React, { useState } from 'react';
import useCryptoData from '../../hooks/useCryptoData';
import usePortfolio from '../../hooks/usePortfolio';
import { useAppContext } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import TechnicalChart from './TechnicalChart';
import SentimentCard from './SentimentCard';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

// Componente principal
const Dashboard: React.FC = () => {
  const { theme } = useAppContext();
  const { assets, isLoading: isCryptoLoading, error, refetch } = useCryptoData();
  const { assets: portfolioAssets, stats, isLoading: isPortfolioLoading } = usePortfolio();
  const { addNotification } = useNotifications();
  const [selectedAsset, setSelectedAsset] = useState<string>('bitcoin');
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y'>('1M');
  
  const isLoading = isCryptoLoading || isPortfolioLoading;

  // Função para criar dados simulados do portfólio ao longo do tempo
  const generatePortfolioData = () => {
    const data = [];
    const now = new Date();
    let currentValue = stats?.totalValue || 25000;
    let currentProfit = stats?.totalProfit || 3500;
    
    // Gerar dados baseados no timeframe selecionado
    let days = timeframe === '1W' ? 7 : 
               timeframe === '1M' ? 30 : 
               timeframe === '3M' ? 90 : 
               timeframe === '6M' ? 180 : 
               timeframe === 'YTD' ? Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) : 
               365;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Gerar uma variação aleatória para cada dia
      const random = Math.random() * 0.04 - 0.02; // -2% a +2%
      currentValue = currentValue * (1 + random);
      currentProfit = currentProfit * (1 + random * 1.5);
      
      data.push({
        date: date.toLocaleDateString('pt-PT'),
        value: currentValue,
        profit: currentProfit
      });
    }
    
    return data;
  };
  
  // Gerar dados para gráfico de distribuição do portfólio
  const generateAssetAllocationData = () => {
    if (!portfolioAssets || portfolioAssets.length === 0) {
      // Dados de exemplo se não houver portfólio
      return [
        { name: 'Bitcoin', value: 45 },
        { name: 'Ethereum', value: 30 },
        { name: 'Cardano', value: 15 },
        { name: 'Solana', value: 10 }
      ];
    }
    
    // Usar dados reais do portfólio
    return portfolioAssets.map(asset => {
      const cryptoAsset = assets.find(a => a.id === asset.assetId);
      const currentValue = asset.amount * (cryptoAsset?.current_price || 0);
      
      return {
        name: asset.name,
        value: currentValue
      };
    });
  };
  
  // Simular dados de volume de negociação por dia da semana
  const generateVolumeByDayData = () => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    return days.map(day => ({
      name: day,
      volume: Math.floor(Math.random() * 5000) + 1000
    }));
  };
  
  // Formatar valor para moeda euro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  // Dados simulados
  const portfolioData = generatePortfolioData();
  const assetAllocationData = generateAssetAllocationData();
  const volumeByDayData = generateVolumeByDayData();
  
  // Cores para gráficos de rosca
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-md shadow-md ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <p className="text-sm font-medium">{label || payload[0].payload.name}</p>
          <p className="text-sm">
            <span className="font-medium">Valor: </span>
            <span className="text-blue-500 dark:text-blue-400">
              {formatCurrency(payload[0].value)}
            </span>
          </p>
          {payload[1] && (
            <p className="text-sm">
              <span className="font-medium">Lucro/Prejuízo: </span>
              <span className={payload[1].value >= 0 ? "text-green-500" : "text-red-500"}>
                {formatCurrency(payload[1].value)}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleRefreshData = () => {
    refetch();
    addNotification({
      type: 'info',
      title: 'Atualização',
      message: 'Os dados do mercado foram atualizados.',
      duration: 3000
    });
  };

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // Dados de resumo do dashboard
  const dashboardSummary = [
    {
      title: 'Saldo Total',
      value: stats ? formatCurrency(stats.totalValue) : '€24,560.45',
      change: stats ? (stats.profitPercentage > 0 ? '+' : '') + stats.profitPercentage.toFixed(2) + '%' : '+5.3%',
      isPositive: stats ? stats.profitPercentage > 0 : true
    },
    {
      title: 'Desempenho 24h',
      value: '+2.3%',
      change: '€560.45',
      isPositive: true
    },
    {
      title: 'Total de Ativos',
      value: portfolioAssets ? portfolioAssets.length.toString() : '5',
      change: '+1',
      isPositive: true
    },
    {
      title: 'Valor Bitcoin',
      value: isLoading ? '...' : `€${assets.find(a => a.id === 'bitcoin')?.current_price?.toLocaleString() || '0'}`,
      change: isLoading ? '...' : `${assets.find(a => a.id === 'bitcoin')?.price_change_percentage_24h?.toFixed(2) || '0'}%`,
      isPositive: !isLoading && (assets.find(a => a.id === 'bitcoin')?.price_change_percentage_24h || 0) > 0
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          onClick={handleRefreshData}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {dashboardSummary.map((item, index) => (
              <div 
                key={index} 
                className={`card p-4 border-l-4 ${
                  item.isPositive ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.title}</div>
                <div className="text-2xl font-bold mt-2">{item.value}</div>
                <div className={`text-sm mt-1 ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change}
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico principal do portfólio */}
          <div className="card p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Evolução do Portfólio</h2>
              <div className="flex space-x-2">
                {(['1W', '1M', '3M', '6M', 'YTD', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={portfolioData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme === 'dark' ? '#4B5563' : '#9CA3AF'}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    stroke={theme === 'dark' ? '#4B5563' : '#9CA3AF'}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    name="Valor do Portfólio"
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                  <Area
                    name="Lucro/Prejuízo"
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    fillOpacity={0.5}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grade de 2 colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de distribuição de ativos */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Distribuição do Portfólio</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico de volume por dia da semana */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Volume de Transações por Dia</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={volumeByDayData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
                    <YAxis tickFormatter={formatCurrency} stroke={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="volume" name="Volume" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 - Lista de ativos */}
            <div className="col-span-1 card">
              <h2 className="text-lg font-semibold mb-4">Seus Ativos</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Ativo</th>
                      <th className="text-left py-2">Preço</th>
                      <th className="text-left py-2">24h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.slice(0, 5).map(asset => (
                      <tr key={asset.id} 
                        className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                          selectedAsset === asset.id ? 'bg-blue-50 dark:bg-gray-700' : ''
                        }`}
                        onClick={() => setSelectedAsset(asset.id)}
                      >
                        <td className="py-3 flex items-center">
                          <img 
                            src={asset.image} 
                            alt={asset.name} 
                            className="w-6 h-6 mr-2"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/assets/placeholder-news.jpg';
                            }}
                          />
                          <span>{asset.symbol.toUpperCase()}</span>
                        </td>
                        <td className="py-3">€{asset.current_price.toLocaleString()}</td>
                        <td className={`py-3 ${(asset.price_change_percentage_24h || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(asset.price_change_percentage_24h || 0).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coluna 2-3 - Gráfico */}
            <div className="col-span-1 lg:col-span-2 card">
              <h2 className="text-lg font-semibold mb-4">
                Análise Técnica: {assets.find(a => a.id === selectedAsset)?.name}
              </h2>
              <TechnicalChart 
                symbol={assets.find(a => a.id === selectedAsset)?.symbol.toUpperCase() || 'BTC'} 
              />
            </div>
          </div>

          {/* Linha inferior - Análise sentimental */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Análise Sentimental</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.slice(0, 3).map((asset, index) => (
                <SentimentCard
                  key={asset.id}
                  symbol={asset.symbol.toUpperCase()}
                  name={asset.name}
                  score={[0.72, 0.58, 0.35][index]}
                  source={index % 2 === 0 ? 'X' : 'Reddit'}
                  postsCount={Math.floor(Math.random() * 1000) + 200}
                  trend={['up', 'neutral', 'down'][index] as any}
                />
              ))}
            </div>
          </div>

          {/* Botões de demonstração de notificações - versão simplificada */}
          <div className="card mt-6 p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Demonstração de Notificações</h3>
            <div className="flex flex-wrap gap-2">
              {['success', 'error', 'warning'].map((type) => (
                <button 
                  key={type}
                  onClick={() => {
                    addNotification({
                      type: type as any,
                      title: type.charAt(0).toUpperCase() + type.slice(1),
                      message: `Esta é uma notificação de ${type}`,
                    });
                  }}
                  className={`px-3 py-1 text-xs rounded text-white ${
                    type === 'success' ? 'bg-green-500 hover:bg-green-600' :
                    type === 'error' ? 'bg-red-500 hover:bg-red-600' :
                    'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 