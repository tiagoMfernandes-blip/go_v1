import React, { useMemo } from 'react';
import { PriceAlert } from '../../models/PriceAlert';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface AlertsStatisticsProps {
  alerts: PriceAlert[];
}

const AlertsStatistics: React.FC<AlertsStatisticsProps> = ({ alerts }) => {
  // Calcular estatísticas dos alertas
  const statistics = useMemo(() => {
    // Não renderizar nada se não houver alertas
    if (!alerts || alerts.length === 0) {
      return {
        totalAlerts: 0,
        activeAlerts: 0,
        triggeredAlerts: 0,
        typeDistribution: [],
        assetDistribution: [],
        timeToTrigger: 0,
        successRate: 0,
        mostAlertedAssets: []
      };
    }

    // Contar alertas por status
    const activeAlerts = alerts.filter(alert => alert.active).length;
    const triggeredAlerts = alerts.filter(alert => alert.triggered).length;
    
    // Distribuição por tipo de condição
    const aboveAlerts = alerts.filter(alert => alert.condition === 'above').length;
    const belowAlerts = alerts.filter(alert => alert.condition === 'below').length;
    
    const typeDistribution = [
      { name: 'Acima de', value: aboveAlerts, color: '#10B981' }, // Verde
      { name: 'Abaixo de', value: belowAlerts, color: '#EF4444' }  // Vermelho
    ];
    
    // Distribuição por ativo
    const assetCounts: Record<string, number> = {};
    alerts.forEach(alert => {
      const assetId = alert.assetId;
      assetCounts[assetId] = (assetCounts[assetId] || 0) + 1;
    });
    
    const assetDistribution = Object.entries(assetCounts)
      .map(([assetId, count]) => {
        const asset = alerts.find(a => a.assetId === assetId);
        return {
          name: asset ? asset.name : assetId,
          symbol: asset ? asset.symbol.toUpperCase() : '',
          value: count,
          color: getRandomColor(assetId)
        };
      })
      .sort((a, b) => b.value - a.value);
    
    // Top 5 ativos mais alertados
    const mostAlertedAssets = [...assetDistribution].slice(0, 5);
    
    // Tempo médio até acionamento (para alertas acionados)
    const triggeredAlertsData = alerts.filter(alert => alert.triggered);
    let avgTimeToTrigger = 0;
    
    if (triggeredAlertsData.length > 0) {
      const totalTime = triggeredAlertsData.reduce((sum, alert) => {
        if (!alert.triggered) return sum;
        const triggerTime = new Date(alert.triggered).getTime();
        const createTime = new Date(alert.createdAt).getTime();
        return sum + (triggerTime - createTime);
      }, 0);
      
      avgTimeToTrigger = totalTime / triggeredAlertsData.length;
    }
    
    // Taxa de sucesso (percentual de alertas acionados entre os não ativos)
    const inactiveAlerts = alerts.filter(alert => !alert.active).length;
    const successRate = inactiveAlerts > 0 
      ? (triggeredAlerts / inactiveAlerts) * 100 
      : 0;
    
    return {
      totalAlerts: alerts.length,
      activeAlerts,
      triggeredAlerts,
      typeDistribution,
      assetDistribution,
      timeToTrigger: avgTimeToTrigger,
      successRate,
      mostAlertedAssets
    };
  }, [alerts]);
  
  // Função para gerar cor aleatória mas consistente para um ID
  function getRandomColor(id: string): string {
    // Gerar um hash simples para o ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Converter para cor HSL (garantir cores distintas e agradáveis)
    const h = hash % 360;
    return `hsl(${h}, 70%, 50%)`;
  }
  
  // Formatar tempo para exibição amigável
  const formatTime = (ms: number): string => {
    if (ms === 0) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Não mostrar nada se não houver alertas
  if (statistics.totalAlerts === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Não há alertas para analisar. Crie alguns alertas para ver estatísticas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visão Geral */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Visão Geral dos Alertas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
            <p className="text-sm text-blue-500 dark:text-blue-300">Total de Alertas</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-100">{statistics.totalAlerts}</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
            <p className="text-sm text-green-500 dark:text-green-300">Alertas Ativos</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-100">{statistics.activeAlerts}</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">
            <p className="text-sm text-purple-500 dark:text-purple-300">Alertas Acionados</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-100">{statistics.triggeredAlerts}</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-300">Tempo Médio até Acionamento</p>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-100">
              {formatTime(statistics.timeToTrigger)}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-300">Taxa de Sucesso</p>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-100">
              {statistics.successRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Tipo */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Distribuição por Tipo
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statistics.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} alertas`, 'Quantidade']}
                  labelFormatter={(value) => `Tipo: ${value}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top 5 Ativos */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Top 5 Ativos com Mais Alertas
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.mostAlertedAssets}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="symbol" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={50}
                />
                <Tooltip 
                  formatter={(value) => [`${value} alertas`, 'Quantidade']}
                  labelFormatter={(value) => {
                    const asset = statistics.mostAlertedAssets.find(a => a.symbol === value);
                    return asset ? asset.name : value;
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Alertas" radius={[0, 4, 4, 0]}>
                  {statistics.mostAlertedAssets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recomendações */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Insights e Recomendações
        </h3>
        
        <div className="space-y-4">
          {statistics.activeAlerts === 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-200">
                <strong>Sem alertas ativos:</strong> Considere criar novos alertas para acompanhar o mercado.
              </p>
            </div>
          )}
          
          {statistics.triggeredAlerts > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-blue-700 dark:text-blue-200">
                <strong>Taxa de sucesso:</strong> {statistics.successRate.toFixed(1)}% dos seus alertas inativos foram acionados.
                {statistics.successRate > 50 
                  ? ' Você tem uma boa taxa de acerto nas suas previsões!'
                  : ' Considere ajustar sua estratégia de alertas para melhorar a precisão.'}
              </p>
            </div>
          )}
          
          {statistics.mostAlertedAssets.length > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
              <p className="text-green-700 dark:text-green-200">
                <strong>Ativo mais monitorado:</strong> {statistics.mostAlertedAssets[0].name} ({statistics.mostAlertedAssets[0].symbol}) 
                com {statistics.mostAlertedAssets[0].value} alertas.
                {statistics.mostAlertedAssets[0].value > 3 
                  ? ' Você parece muito interessado neste ativo, considere aprofundar sua análise.' 
                  : ''}
              </p>
            </div>
          )}
          
          {statistics.timeToTrigger > 0 && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <p className="text-purple-700 dark:text-purple-200">
                <strong>Tempo médio:</strong> Seus alertas levam em média {formatTime(statistics.timeToTrigger)} para serem acionados.
                {statistics.timeToTrigger < 24 * 60 * 60 * 1000 
                  ? ' Seus alertas são acionados relativamente rápido, indicando metas realistas.'
                  : ' Seus alertas levam bastante tempo para acionar, considere ajustar para metas mais atingíveis.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsStatistics; 