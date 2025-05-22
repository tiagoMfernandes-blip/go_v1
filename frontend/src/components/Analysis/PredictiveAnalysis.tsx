import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export interface PredictiveAnalysisProps {
  cryptoData: any;
  historicalData: any[];
  theme: 'light' | 'dark';
}

const PredictiveAnalysis: React.FC<PredictiveAnalysisProps> = ({ cryptoData, historicalData, theme }) => {
  const [prediction, setPrediction] = useState<any[]>([]);
  const [scenarioType, setScenarioType] = useState<string>('neutral');
  const [timeframe, setTimeframe] = useState<string>('7');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    generatePrediction();
  }, [cryptoData, scenarioType, timeframe, historicalData]);
  
  const generatePrediction = () => {
    setIsLoading(true);
    
    // Obter o último preço dos dados históricos
    const lastPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].close : 0;
    
    // Gerar previsão com base no cenário selecionado
    const days = parseInt(timeframe);
    const newPrediction = [];
    
    // Definir parâmetros de volatilidade e tendência com base no cenário
    let trend = 0;
    let volatility = 0;
    
    switch (scenarioType) {
      case 'bullish':
        trend = 0.01; // tendência de alta de 1% por dia
        volatility = 0.02;
        break;
      case 'bearish':
        trend = -0.01; // tendência de queda de 1% por dia
        volatility = 0.02;
        break;
      case 'highVolatility':
        trend = 0.003;
        volatility = 0.04; // volatilidade alta
        break;
      case 'lowVolatility':
        trend = 0.002;
        volatility = 0.005; // volatilidade baixa
        break;
      default: // neutro
        trend = 0.002;
        volatility = 0.015;
    }
    
    let currentPrice = lastPrice;
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
      const random = Math.random() - 0.5;
      const change = currentPrice * (trend + (random * volatility));
      currentPrice += change;
      
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      newPrediction.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice,
        priceLow: currentPrice * (1 - volatility / 2),
        priceHigh: currentPrice * (1 + volatility / 2)
      });
    }
    
    setPrediction(newPrediction);
    setIsLoading(false);
  };
  
  // Preparar dados para o gráfico
  const prepareChartData = () => {
    // Obter os últimos 15 dias de dados históricos
    const historicalDataPoints = historicalData.slice(-15).map(data => ({
      date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date,
      price: data.close,
      type: 'historical'
    }));
    
    const predictiveDataPoints = prediction.map(data => ({
      date: data.date,
      price: data.price,
      priceLow: data.priceLow,
      priceHigh: data.priceHigh,
      type: 'prediction'
    }));
    
    return [...historicalDataPoints, ...predictiveDataPoints];
  };
  
  const chartData = prepareChartData();
  
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Análise Preditiva - {cryptoData?.name || 'Criptomoeda'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Cenário
          </label>
          <select
            className={`w-full p-2.5 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
            }`}
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value)}
          >
            <option value="neutral">Mercado Neutro</option>
            <option value="bullish">Mercado em Alta</option>
            <option value="bearish">Mercado em Queda</option>
            <option value="highVolatility">Alta Volatilidade</option>
            <option value="lowVolatility">Baixa Volatilidade</option>
          </select>
        </div>
        
        <div>
          <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Período de Previsão
          </label>
          <select
            className={`w-full p-2.5 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
            }`}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="7">7 dias</option>
            <option value="14">14 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            className={`px-4 py-2.5 rounded-lg font-medium ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            onClick={generatePrediction}
          >
            {isLoading ? 'Gerando...' : 'Gerar Previsão'}
          </button>
        </div>
      </div>
      
      <div className={`p-4 mb-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
        <div className="mb-4">
          <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Previsão de Preço para {timeframe} dias - {scenarioType === 'bullish' ? 'Mercado em Alta' : 
                                                      scenarioType === 'bearish' ? 'Mercado em Queda' : 
                                                      scenarioType === 'highVolatility' ? 'Alta Volatilidade' : 
                                                      scenarioType === 'lowVolatility' ? 'Baixa Volatilidade' : 'Mercado Neutro'}
          </h3>
          {prediction.length > 0 && (
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Preço previsto ao final do período: <span className="font-bold">{prediction[prediction.length - 1].price.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}</span>
            </p>
          )}
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#555' : '#ccc'} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: theme === 'dark' ? '#ddd' : '#333' }} 
                stroke={theme === 'dark' ? '#777' : '#333'} 
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fill: theme === 'dark' ? '#ddd' : '#333' }} 
                stroke={theme === 'dark' ? '#777' : '#333'} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  borderColor: theme === 'dark' ? '#555' : '#ccc',
                  color: theme === 'dark' ? '#fff' : '#333'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                name="Histórico"
                stroke="#3b82f6"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="priceLow"
                name="Mínimo previsto"
                stroke="#fb923c"
                dot={false}
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="priceHigh"
                name="Máximo previsto"
                stroke="#34d399"
                dot={false}
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Sobre Esta Análise
          </h3>
          <p className="mb-3">
            Esta análise usa modelos de simulação estatística para projetar possíveis cenários futuros de preço com base em diferentes condições de mercado.
          </p>
          <p>
            Os resultados são baseados em probabilidades e não devem ser considerados como previsões exatas. Sempre considere outros fatores ao tomar decisões de investimento.
          </p>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Fatores Importantes
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tendência de mercado atual e momentum</li>
            <li>Volatilidade histórica</li>
            <li>Correlação com Bitcoin e outras criptomoedas principais</li>
            <li>Fatores macroeconômicos e regulatórios</li>
            <li>Sentimento do mercado e atividade on-chain</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis; 