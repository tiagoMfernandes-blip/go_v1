import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  ComposedChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';

export interface PatternRecognitionProps {
  cryptoData: any;
  historicalData: any[];
  theme: 'light' | 'dark';
}

interface CandlestickPattern {
  name: string;
  description: string;
  implication: 'bullish' | 'bearish' | 'neutral';
  startIndex: number;
  endIndex: number;
  reliability: number; // 1-10
}

const PatternRecognition: React.FC<PatternRecognitionProps> = ({ cryptoData, historicalData, theme }) => {
  const { theme: appTheme } = useAppContext();
  const [patterns, setPatterns] = useState<CandlestickPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<CandlestickPattern | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (!historicalData || historicalData.length === 0) return;
    
    // Formatar dados para o gráfico
    const formattedData = historicalData.map((item, index) => {
      const date = new Date(item.date);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
      
      return {
        date: formattedDate,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume / 1000000, // Converter para milhões
        index: index
      };
    });
    
    setChartData(formattedData);
    
    // Detectar padrões (simulado)
    detectPatterns(formattedData);
  }, [historicalData]);
  
  const detectPatterns = (chartData: any[]) => {
    setIsLoading(true);
    
    // Esta é uma simulação de detecção de padrões
    // Em uma implementação real, você usaria algoritmos mais complexos
    
    const detectedPatterns: CandlestickPattern[] = [];
    
    // Simular alguns padrões encontrados
    // Doji
    for (let i = 3; i < chartData.length; i++) {
      const candle = chartData[i];
      if (Math.abs(candle.open - candle.close) < (candle.high - candle.low) * 0.1) {
        if (Math.random() > 0.8) { // Adicionar aleatoriedade para não detectar todos
          detectedPatterns.push({
            name: 'Doji',
            description: 'Uma vela onde o preço de abertura e fechamento são quase iguais, indicando indecisão no mercado.',
            implication: Math.random() > 0.5 ? 'bearish' : 'bullish',
            startIndex: i,
            endIndex: i,
            reliability: Math.floor(Math.random() * 3) + 6 // 6-8
          });
        }
      }
    }
    
    // Martelo (Hammer)
    for (let i = 3; i < chartData.length; i++) {
      const candle = chartData[i];
      const body = Math.abs(candle.open - candle.close);
      const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
      const upperShadow = candle.high - Math.max(candle.open, candle.close);
      
      if (lowerShadow > body * 2 && upperShadow < body * 0.5 && candle.close > candle.open) {
        if (Math.random() > 0.7) {
          detectedPatterns.push({
            name: 'Martelo (Hammer)',
            description: 'Padrão de reversão de baixa com corpo pequeno e sombra inferior longa, indicando rejeição de preços mais baixos.',
            implication: 'bullish',
            startIndex: i,
            endIndex: i,
            reliability: Math.floor(Math.random() * 3) + 7 // 7-9
          });
        }
      }
    }
    
    // Estrela Cadente (Shooting Star)
    for (let i = 3; i < chartData.length; i++) {
      const candle = chartData[i];
      const body = Math.abs(candle.open - candle.close);
      const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
      const upperShadow = candle.high - Math.max(candle.open, candle.close);
      
      if (upperShadow > body * 2 && lowerShadow < body * 0.5 && candle.close < candle.open) {
        if (Math.random() > 0.7) {
          detectedPatterns.push({
            name: 'Estrela Cadente (Shooting Star)',
            description: 'Padrão de reversão de alta com corpo pequeno e sombra superior longa, indicando rejeição de preços mais altos.',
            implication: 'bearish',
            startIndex: i,
            endIndex: i,
            reliability: Math.floor(Math.random() * 3) + 6 // 6-8
          });
        }
      }
    }
    
    // Engolfo de Alta (Bullish Engulfing)
    for (let i = 1; i < chartData.length; i++) {
      const prevCandle = chartData[i-1];
      const candle = chartData[i];
      
      if (prevCandle.close < prevCandle.open && // Vela anterior é de baixa
          candle.close > candle.open && // Vela atual é de alta
          candle.open < prevCandle.close && // Abre abaixo do fechamento anterior
          candle.close > prevCandle.open) { // Fecha acima da abertura anterior
        if (Math.random() > 0.6) {
          detectedPatterns.push({
            name: 'Engolfo de Alta (Bullish Engulfing)',
            description: 'Padrão de reversão onde uma vela de alta engole completamente a vela de baixa anterior, indicando força compradora.',
            implication: 'bullish',
            startIndex: i-1,
            endIndex: i,
            reliability: Math.floor(Math.random() * 3) + 7 // 7-9
          });
        }
      }
    }
    
    // Engolfo de Baixa (Bearish Engulfing)
    for (let i = 1; i < chartData.length; i++) {
      const prevCandle = chartData[i-1];
      const candle = chartData[i];
      
      if (prevCandle.close > prevCandle.open && // Vela anterior é de alta
          candle.close < candle.open && // Vela atual é de baixa
          candle.open > prevCandle.close && // Abre acima do fechamento anterior
          candle.close < prevCandle.open) { // Fecha abaixo da abertura anterior
        if (Math.random() > 0.6) {
          detectedPatterns.push({
            name: 'Engolfo de Baixa (Bearish Engulfing)',
            description: 'Padrão de reversão onde uma vela de baixa engole completamente a vela de alta anterior, indicando força vendedora.',
            implication: 'bearish',
            startIndex: i-1,
            endIndex: i,
            reliability: Math.floor(Math.random() * 3) + 7 // 7-9
          });
        }
      }
    }
    
    // Três Soldados Brancos (Three White Soldiers)
    for (let i = 2; i < chartData.length; i++) {
      const candle1 = chartData[i-2];
      const candle2 = chartData[i-1];
      const candle3 = chartData[i];
      
      if (candle1.close > candle1.open && // Todas são velas de alta
          candle2.close > candle2.open &&
          candle3.close > candle3.open &&
          candle2.close > candle1.close && // Cada uma fecha mais alto que a anterior
          candle3.close > candle2.close &&
          candle2.open > candle1.open && // Cada uma abre mais alto que a abertura anterior
          candle3.open > candle2.open) {
        if (Math.random() > 0.8) { // Padrão menos comum
          detectedPatterns.push({
            name: 'Três Soldados Brancos (Three White Soldiers)',
            description: 'Padrão de reversão de baixa formado por três velas de alta consecutivas, cada uma fechando mais alto que a anterior.',
            implication: 'bullish',
            startIndex: i-2,
            endIndex: i,
            reliability: Math.floor(Math.random() * 2) + 8 // 8-9
          });
        }
      }
    }
    
    // Três Corvos Negros (Three Black Crows)
    for (let i = 2; i < chartData.length; i++) {
      const candle1 = chartData[i-2];
      const candle2 = chartData[i-1];
      const candle3 = chartData[i];
      
      if (candle1.close < candle1.open && // Todas são velas de baixa
          candle2.close < candle2.open &&
          candle3.close < candle3.open &&
          candle2.close < candle1.close && // Cada uma fecha mais baixo que a anterior
          candle3.close < candle2.close &&
          candle2.open < candle1.open && // Cada uma abre mais baixo que a abertura anterior
          candle3.open < candle2.open) {
        if (Math.random() > 0.8) { // Padrão menos comum
          detectedPatterns.push({
            name: 'Três Corvos Negros (Three Black Crows)',
            description: 'Padrão de reversão de alta formado por três velas de baixa consecutivas, cada uma fechando mais baixo que a anterior.',
            implication: 'bearish',
            startIndex: i-2,
            endIndex: i,
            reliability: Math.floor(Math.random() * 2) + 8 // 8-9
          });
        }
      }
    }
    
    // Ordenar por posição no gráfico (mais recentes primeiro)
    detectedPatterns.sort((a, b) => b.startIndex - a.startIndex);
    
    setPatterns(detectedPatterns);
    setIsLoading(false);
  };
  
  const handlePatternClick = (pattern: CandlestickPattern) => {
    setSelectedPattern(pattern);
  };
  
  // Patterns simulados
  const simulatedPatterns = [
    { id: 'doubletop', name: 'Duplo Topo', probability: 78, signal: 'bearish' },
    { id: 'doublebottom', name: 'Duplo Fundo', probability: 45, signal: 'bullish' },
    { id: 'headshoulders', name: 'Cabeça e Ombros', probability: 67, signal: 'bearish' },
    { id: 'invheadshoulders', name: 'Cabeça e Ombros Invertido', probability: 32, signal: 'bullish' },
    { id: 'triangle', name: 'Triângulo Ascendente', probability: 82, signal: 'bullish' },
    { id: 'wedge', name: 'Cunha Descendente', probability: 55, signal: 'bearish' },
  ];
  
  // Filtrar patterns conforme seleção
  const filteredSimulatedPatterns = simulatedPatterns.filter(p => p.signal === 'bullish');
  
  // Função para gerar thumbnails representativos dos padrões
  const generatePatternThumbnail = (patternId: string, signal: string) => {
    let data = [];
    
    switch (patternId) {
      case 'doubletop':
        data = [10, 40, 70, 60, 70, 30, 20].map((y, i) => ({ x: i, y }));
        break;
      case 'doublebottom':
        data = [70, 40, 10, 20, 10, 50, 60].map((y, i) => ({ x: i, y }));
        break;
      case 'headshoulders':
        data = [30, 60, 50, 80, 50, 60, 30].map((y, i) => ({ x: i, y }));
        break;
      case 'invheadshoulders':
        data = [70, 40, 50, 20, 50, 40, 70].map((y, i) => ({ x: i, y }));
        break;
      case 'triangle':
        data = [30, 35, 30, 40, 35, 45, 50].map((y, i) => ({ x: i, y }));
        break;
      case 'wedge':
        data = [70, 65, 60, 55, 45, 40, 30].map((y, i) => ({ x: i, y }));
        break;
      default:
        data = [40, 50, 40, 60, 50, 60, 50].map((y, i) => ({ x: i, y }));
    }
    
    return (
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`colorPattern${patternId}`} x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={signal === 'bullish' ? '#10b981' : '#ef4444'} 
                stopOpacity={0.8}
              />
              <stop 
                offset="95%" 
                stopColor={signal === 'bullish' ? '#10b981' : '#ef4444'} 
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="y" 
            stroke={signal === 'bullish' ? '#10b981' : '#ef4444'} 
            fillOpacity={1} 
            fill={`url(#colorPattern${patternId})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
      <h2 className="text-xl font-bold mb-4">Reconhecimento de Padrões: {cryptoData?.name || 'Criptomoeda'}</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lado esquerdo: Lista de padrões detectados */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-3">Padrões Detectados</h3>
            
            {patterns.length === 0 ? (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p>Nenhum padrão detectado no período atual.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {patterns.map((pattern, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPattern === pattern
                        ? pattern.implication === 'bullish'
                          ? 'bg-green-500 dark:bg-green-600 text-white'
                          : pattern.implication === 'bearish'
                            ? 'bg-red-500 dark:bg-red-600 text-white'
                            : 'bg-yellow-500 dark:bg-yellow-600 text-white'
                        : `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
                    } ${
                      selectedPattern !== pattern && pattern.implication === 'bullish' 
                        ? 'border-l-4 border-green-500' 
                        : selectedPattern !== pattern && pattern.implication === 'bearish'
                          ? 'border-l-4 border-red-500'
                          : selectedPattern !== pattern && 'border-l-4 border-yellow-500'
                    }`}
                    onClick={() => handlePatternClick(pattern)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium">{pattern.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pattern.implication === 'bullish' 
                          ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : pattern.implication === 'bearish'
                            ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {pattern.implication === 'bullish' ? 'Alta' : pattern.implication === 'bearish' ? 'Baixa' : 'Neutro'}
                      </span>
                    </div>
                    <p className="text-xs mb-2">Confiabilidade: {pattern.reliability}/10</p>
                    <p className="text-xs">
                      {chartData[pattern.startIndex].date} 
                      {pattern.startIndex !== pattern.endIndex && ` a ${chartData[pattern.endIndex].date}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Lado direito: Gráfico e detalhes */}
          <div className="lg:col-span-2">
            {selectedPattern ? (
              <>
                <h3 className="text-lg font-semibold mb-3">{selectedPattern.name}</h3>
                
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData.slice(
                        Math.max(0, selectedPattern.startIndex - 3),
                        Math.min(chartData.length, selectedPattern.endIndex + 4)
                      )}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="date" 
                        stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                        tick={{ fontSize: 12 }}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                          color: theme === 'dark' ? '#f3f4f6' : '#111827'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'open') return [`${value.toFixed(2)}`, 'Abertura'];
                          if (name === 'high') return [`${value.toFixed(2)}`, 'Máxima'];
                          if (name === 'low') return [`${value.toFixed(2)}`, 'Mínima'];
                          if (name === 'close') return [`${value.toFixed(2)}`, 'Fechamento'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Data: ${label}`}
                      />
                      
                      {/* Highlight pattern area */}
                      {selectedPattern.startIndex !== selectedPattern.endIndex && (
                        <ReferenceLine 
                          x={chartData[selectedPattern.startIndex].date} 
                          stroke={selectedPattern.implication === 'bullish' ? '#10b981' : '#ef4444'} 
                          strokeDasharray="3 3" 
                        />
                      )}
                      
                      <ReferenceLine 
                        x={chartData[selectedPattern.endIndex].date} 
                        stroke={selectedPattern.implication === 'bullish' ? '#10b981' : '#ef4444'} 
                        strokeDasharray="3 3" 
                      />
                      
                      {/* Candle high-low */}
                      <Line 
                        type="monotone" 
                        dataKey="high" 
                        stroke="transparent" 
                        dot={false} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="low" 
                        stroke="transparent" 
                        dot={false} 
                      />
                      
                      {/* Candle body */}
                      {chartData.map((entry, index) => {
                        const isInPattern = index >= selectedPattern.startIndex && index <= selectedPattern.endIndex;
                        const isBullish = entry.close > entry.open;
                        
                        return (
                          <React.Fragment key={index}>
                            {/* Candle wick */}
                            <Line 
                              type="monotone" 
                              dataKey={`dataPoints[${index}].high`} 
                              stroke={isInPattern ? (selectedPattern.implication === 'bullish' ? '#10b981' : '#ef4444') : '#9ca3af'} 
                              dot={false} 
                            />
                            
                            {/* Custom rendered candles */}
                            {index >= Math.max(0, selectedPattern.startIndex - 3) && 
                             index <= Math.min(chartData.length - 1, selectedPattern.endIndex + 3) && (
                              <>
                                {/* Custom candle bodies */}
                                <Bar
                                  dataKey="close"
                                  fill={isInPattern 
                                    ? (selectedPattern.implication === 'bullish' ? '#10b981' : '#ef4444')
                                    : (isBullish ? '#10b981' : '#ef4444')
                                  }
                                  stroke={isInPattern 
                                    ? (selectedPattern.implication === 'bullish' ? '#10b981' : '#ef4444')
                                    : (isBullish ? '#10b981' : '#ef4444')
                                  }
                                  fillOpacity={isInPattern ? 0.8 : 0.5}
                                  strokeWidth={isInPattern ? 2 : 1}
                                />
                              </>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-sm">{selectedPattern.description}</p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  selectedPattern.implication === 'bullish' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : selectedPattern.implication === 'bearish'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                }`}>
                  <h4 className="font-medium mb-2">Implicação</h4>
                  <p className="text-sm">
                    {selectedPattern.implication === 'bullish' 
                      ? 'Indica potencial movimento de alta. Considere oportunidades de compra ou manutenção de posições existentes.' 
                      : selectedPattern.implication === 'bearish'
                        ? 'Indica potencial movimento de baixa. Considere proteger posições existentes ou oportunidades de venda.'
                        : 'Indica indecisão no mercado. Monitore outros indicadores antes de tomar decisões.'
                    }
                  </p>
                  <div className="mt-3 flex items-center">
                    <span className="text-sm font-medium mr-2">Confiabilidade:</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedPattern.implication === 'bullish' 
                            ? 'bg-green-500 dark:bg-green-400' 
                            : selectedPattern.implication === 'bearish'
                              ? 'bg-red-500 dark:bg-red-400'
                              : 'bg-yellow-500 dark:bg-yellow-400'
                        }`}
                        style={{ width: `${selectedPattern.reliability * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm ml-2">{selectedPattern.reliability}/10</span>
                  </div>
                </div>
              </>
            ) : (
              <div className={`flex justify-center items-center h-96 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-gray-500 dark:text-gray-400">
                  Selecione um padrão da lista para ver detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Padrões Simulados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredSimulatedPatterns.map((pattern) => (
            <div 
              key={pattern.id}
              className={`p-4 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {pattern.name}
                </h4>
                <span 
                  className={`px-2 py-1 text-xs rounded-full ${
                    pattern.signal === 'bullish' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {pattern.signal === 'bullish' ? 'Bullish' : 'Bearish'}
                </span>
              </div>
              
              <div className="mb-3">
                {generatePatternThumbnail(pattern.id, pattern.signal)}
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Probabilidade:
                </span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${pattern.signal === 'bullish' ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${pattern.probability}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {pattern.probability}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
        <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Como Interpretar Padrões Gráficos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Padrões de Reversão
            </h4>
            <ul className={`list-disc pl-5 text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Duplo Topo/Fundo - Indicam possível reversão de tendência</li>
              <li>Cabeça e Ombros - Geralmente marca o fim de tendências de alta</li>
              <li>Cabeça e Ombros Invertido - Sinaliza possível fim de tendência de baixa</li>
            </ul>
          </div>
          
          <div>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Padrões de Continuação
            </h4>
            <ul className={`list-disc pl-5 text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Triângulos - Podem indicar continuação da tendência atual</li>
              <li>Bandeiras - Pausas temporárias em tendências fortes</li>
              <li>Cunhas - Mostram compressão antes de movimento direcional</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>
          <strong>Nota:</strong> O reconhecimento de padrões é baseado em algoritmos e não deve ser a única ferramenta usada para tomar decisões de investimento.
          Sempre confirme com outras formas de análise e considere o contexto de mercado mais amplo.
        </p>
      </div>
    </div>
  );
};

export default PatternRecognition; 