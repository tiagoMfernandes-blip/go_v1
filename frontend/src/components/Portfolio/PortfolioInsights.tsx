import React from 'react';
import { PortfolioAsset } from '../../services/portfolioService';
import { CryptoPrice } from '../../services/cryptoService';

interface PortfolioInsightsProps {
  portfolio: PortfolioAsset[];
  currentPrices: CryptoPrice[];
}

const PortfolioInsights: React.FC<PortfolioInsightsProps> = ({ portfolio, currentPrices }) => {
  // Calcular diversificação: número de ativos diferentes
  const calculateDiversification = () => {
    const activeAssets = portfolio.filter(asset => asset.amount > 0);
    return {
      totalAssets: activeAssets.length,
      isWellDiversified: activeAssets.length >= 5
    };
  };

  // Verificar concentração: porcentagem do maior ativo
  const calculateConcentration = () => {
    if (portfolio.length === 0) return { largestAsset: '', percentage: 0 };
    
    const assetValues = portfolio.map(asset => {
      const price = currentPrices.find(p => p.id === asset.assetId);
      const value = price ? asset.amount * price.current_price : 0;
      return { 
        symbol: asset.symbol, 
        value 
      };
    });
    
    const totalValue = assetValues.reduce((sum, asset) => sum + asset.value, 0);
    
    if (totalValue === 0) return { largestAsset: '', percentage: 0 };
    
    const largestAsset = assetValues.reduce((max, asset) => 
      asset.value > max.value ? asset : max, assetValues[0]);
    
    return {
      largestAsset: largestAsset.symbol,
      percentage: (largestAsset.value / totalValue) * 100
    };
  };

  // Verificar performance recente
  const calculateRecentPerformance = () => {
    const priceChanges = portfolio
      .filter(asset => asset.amount > 0)
      .map(asset => {
        const price = currentPrices.find(p => p.id === asset.assetId);
        return price ? {
          symbol: asset.symbol,
          change24h: price.price_change_percentage_24h,
          value: asset.amount * price.current_price
        } : null;
      })
      .filter(Boolean) as any[];
    
    const totalValue = priceChanges.reduce((sum, asset) => sum + asset.value, 0);
    
    // Calcular mudança de 24h ponderada pelo valor
    const weightedChange = priceChanges.reduce((sum, asset) => {
      const weight = asset.value / totalValue;
      return sum + (asset.change24h * weight);
    }, 0);
    
    return {
      performance24h: weightedChange,
      isPositive: weightedChange > 0
    };
  };

  // Gerar insights baseados em análises
  const generateInsights = () => {
    const insights = [];
    const diversification = calculateDiversification();
    const concentration = calculateConcentration();
    const performance = calculateRecentPerformance();
    
    // Insights sobre diversificação
    if (diversification.totalAssets === 0) {
      insights.push({
        type: 'info',
        message: 'O seu portfólio ainda não tem ativos. Adicione transações para começar.'
      });
    } else if (diversification.totalAssets < 3) {
      insights.push({
        type: 'warning',
        message: `O seu portfólio contém apenas ${diversification.totalAssets} ${diversification.totalAssets === 1 ? 'ativo' : 'ativos'}. Considere diversificar mais para reduzir riscos.`
      });
    } else if (diversification.totalAssets >= 8) {
      insights.push({
        type: 'success',
        message: `Excelente diversificação! O seu portfólio contém ${diversification.totalAssets} ativos.`
      });
    } else {
      insights.push({
        type: 'success',
        message: `O seu portfólio tem uma boa diversificação com ${diversification.totalAssets} ativos.`
      });
    }
    
    // Insights sobre concentração
    if (concentration.percentage > 50) {
      insights.push({
        type: 'warning',
        message: `Alta concentração em ${concentration.largestAsset} (${concentration.percentage.toFixed(1)}%). Considere diversificar.`
      });
    }
    
    // Insights sobre performance
    if (performance.performance24h > 5) {
      insights.push({
        type: 'success',
        message: `Excelente desempenho nas últimas 24h: +${performance.performance24h.toFixed(2)}%!`
      });
    } else if (performance.performance24h < -5) {
      insights.push({
        type: 'warning',
        message: `O seu portfólio teve uma queda significativa nas últimas 24h: ${performance.performance24h.toFixed(2)}%.`
      });
    }
    
    // Recomendações gerais
    if (portfolio.length > 0) {
      // Verificar se há algum ativo com baixo rendimento
      const underperformingAssets = portfolio
        .filter(asset => asset.amount > 0)
        .map(asset => {
          const price = currentPrices.find(p => p.id === asset.assetId);
          if (!price) return null;
          
          const currentValue = asset.amount * price.current_price;
          const investmentValue = asset.amount * asset.avgBuyPrice;
          const percentageChange = investmentValue > 0 ? ((currentValue - investmentValue) / investmentValue) * 100 : 0;
          
          return {
            symbol: asset.symbol,
            percentageChange
          };
        })
        .filter(Boolean) as any[];
      
      const worstPerformer = underperformingAssets.reduce(
        (worst, asset) => asset.percentageChange < worst.percentageChange ? asset : worst, 
        { symbol: '', percentageChange: Infinity }
      );
      
      if (worstPerformer.symbol && worstPerformer.percentageChange < -15) {
        insights.push({
          type: 'warning',
          message: `O ativo ${worstPerformer.symbol} está com baixo rendimento (${worstPerformer.percentageChange.toFixed(2)}%). Considere reavaliar esta posição.`
        });
      }
    }
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Insights e Recomendações</h2>
      
      {insights.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <p>Adicione ativos ao seu portfólio para receber insights personalizados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-md ${
                insight.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' 
                  : insight.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {insight.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : insight.type === 'warning' ? (
                    <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    insight.type === 'success' 
                      ? 'text-green-700 dark:text-green-300' 
                      : insight.type === 'warning'
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Recomendações gerais - sempre visíveis */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <h3 className="text-md font-semibold mb-2">Dicas para o seu Portfólio</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>
            <strong>Diversifique os seus investimentos</strong> entre diferentes criptomoedas para reduzir o risco.
          </li>
          <li>
            <strong>Invista regularmente</strong> para aproveitar o custo médio em dólar (DCA).
          </li>
          <li>
            <strong>Mantenha uma reserva de emergência</strong> antes de investir em ativos voláteis.
          </li>
          <li>
            <strong>Reavalie o seu portfólio periodicamente</strong> e ajuste conforme necessário.
          </li>
          <li>
            <strong>Considere o horizonte temporal</strong> dos seus investimentos ao tomar decisões.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PortfolioInsights; 