import React, { useState } from 'react';
import { PortfolioAsset } from '../../services/portfolioService';
import { CryptoPrice } from '../../services/cryptoService';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  Sector
} from 'recharts';

interface AssetAllocationProps {
  portfolio: PortfolioAsset[];
  currentPrices: CryptoPrice[];
}

// Cores para o gráfico
const COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#0EA5E9'
];

const AssetAllocation: React.FC<AssetAllocationProps> = ({ portfolio, currentPrices }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Formatar valor para moeda euro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  // Formatar percentagem
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Calcular dados para o gráfico de alocação
  const getAllocationData = () => {
    if (portfolio.length === 0) return [];

    // Calcular valor total de cada ativo
    const assetValues = portfolio.map(asset => {
      const price = currentPrices.find(p => p.id === asset.assetId);
      const currentValue = price ? asset.amount * price.current_price : 0;
      
      return {
        name: asset.symbol,
        fullName: asset.name,
        value: currentValue,
        amount: asset.amount
      };
    });

    // Filtrar ativos com valor > 0 e ordenar por valor
    return assetValues
      .filter(asset => asset.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  // Calcular o valor total do portfólio
  const getTotalValue = () => {
    return getAllocationData().reduce((sum, asset) => sum + asset.value, 0);
  };

  // Renderizar label ativo no gráfico
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="#888888"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs"
      >
        {name} ({(percent * 100).toFixed(1)}%)
      </text>
    ) : null;
  };

  // Renderizar setor ativo (quando hover)
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { 
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value 
    } = props;
    
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">{payload.fullName}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {formatCurrency(value)} ({(percent * 100).toFixed(2)}%)
        </text>
      </g>
    );
  };

  const allocationData = getAllocationData();
  const totalValue = getTotalValue();

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p>Adicione ativos ao seu portfólio para ver a alocação.</p>
      </div>
    );
  }

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-4">Alocação de Ativos</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de pizza */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4 text-center">Distribuição do Portfólio</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={handlePieEnter}
                  onMouseLeave={handlePieLeave}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  itemStyle={{ color: '#333' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Tabela de alocação */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Detalhes da Alocação</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-4">Ativo</th>
                  <th className="text-right py-2 px-4">Valor</th>
                  <th className="text-right py-2 px-4">Alocação</th>
                </tr>
              </thead>
              <tbody>
                {allocationData.map((asset, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{asset.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="font-medium">{formatCurrency(asset.value)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {asset.amount.toLocaleString('pt-PT', { maximumFractionDigits: 8 })} unidades
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right">
                      {formatPercentage((asset.value / totalValue) * 100)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-900 font-semibold">
                  <td className="py-2 px-4">Total</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(totalValue)}</td>
                  <td className="py-2 px-4 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation; 