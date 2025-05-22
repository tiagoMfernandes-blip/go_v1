import React from 'react';
import { IndicatorData } from './TechnicalIndicator';

export interface IndicatorDetailsProps {
  indicator: IndicatorData;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const IndicatorDetails: React.FC<IndicatorDetailsProps> = ({ indicator, onClose, theme }) => {
  // Exemplos de informações adicionais para cada tipo de indicador
  const getAdditionalInfo = (name: string): React.ReactNode => {
    switch (name.toLowerCase()) {
      case 'rsi':
        return (
          <div className="space-y-3">
            <p>O RSI (Índice de Força Relativa) é um indicador de momentum que mede a velocidade e a mudança dos movimentos de preço.</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Valores acima de 70 geralmente indicam que um ativo está <span className="text-red-600 font-medium">sobrecomprado</span>.</li>
              <li>Valores abaixo de 30 geralmente indicam que um ativo está <span className="text-green-600 font-medium">sobrevendido</span>.</li>
              <li>Divergências entre o preço e o RSI podem sinalizar possíveis reversões.</li>
            </ul>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Fórmula:</strong> RSI = 100 - (100 / (1 + RS))
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Onde:</strong> RS = Média de ganhos / Média de perdas
              </p>
            </div>
          </div>
        );
      case 'macd':
        return (
          <div className="space-y-3">
            <p>O MACD (Moving Average Convergence Divergence) é um indicador de tendência que mostra a relação entre duas médias móveis exponenciais.</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>MACD positivo indica momentum de alta.</li>
              <li>MACD negativo indica momentum de baixa.</li>
              <li>Cruzamentos da linha MACD com a linha de sinal podem indicar mudanças de tendência.</li>
              <li>Divergências entre o preço e o MACD são sinais potenciais de reversão.</li>
            </ul>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Cálculo:</strong> MACD = EMA(12) - EMA(26)
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Linha de Sinal:</strong> EMA(9) do MACD
              </p>
            </div>
          </div>
        );
      case 'bollinger bands':
        return (
          <div className="space-y-3">
            <p>As Bandas de Bollinger são um indicador de volatilidade que consiste em três linhas: uma média móvel simples (linha média) e dois desvios padrão acima e abaixo da média.</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Bandas estreitas indicam baixa volatilidade.</li>
              <li>Bandas largas indicam alta volatilidade.</li>
              <li>Preços tendem a retornar à média após tocarem ou excederem as bandas.</li>
              <li>"Squeeze" (compressão das bandas) frequentemente precede movimentos significativos de preço.</li>
            </ul>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Banda Superior:</strong> SMA(20) + 2 * Desvio Padrão
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Linha Média:</strong> SMA(20)
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Banda Inferior:</strong> SMA(20) - 2 * Desvio Padrão
              </p>
            </div>
          </div>
        );
      case 'média móvel (50d)':
        return (
          <div className="space-y-3">
            <p>A Média Móvel de 50 dias é um indicador de tendência que suaviza as flutuações de preço mostrando o preço médio durante os últimos 50 dias.</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Preço acima da MM50 sugere tendência de alta.</li>
              <li>Preço abaixo da MM50 sugere tendência de baixa.</li>
              <li>Cruzamentos da MM50 com o preço podem indicar mudanças de tendência.</li>
              <li>A MM50 frequentemente atua como suporte ou resistência.</li>
            </ul>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Cálculo:</strong> Soma dos preços de fechamento dos últimos 50 dias / 50
              </p>
            </div>
          </div>
        );
      default:
        return (
          <p>Não há informações detalhadas disponíveis para este indicador.</p>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className={`relative w-full max-w-2xl p-6 mx-4 rounded-lg shadow-xl ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <h2 className={`text-2xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {indicator.name}
        </h2>
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Valor:
            </span>
            <span className={`text-lg font-semibold ${
              indicator.status === 'positive' ? 'text-green-500' :
              indicator.status === 'negative' ? 'text-red-500' :
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {indicator.value}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className={`text-md font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Interpretação
          </h3>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {indicator.interpretation}
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className={`text-md font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Como usar
          </h3>
          <p className={`mt-4 text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {indicator.description || `O ${indicator.name} é um indicador técnico que ajuda os traders a identificar possíveis pontos de entrada e saída. É geralmente utilizado em conjunto com outros indicadores para confirmar tendências.`}
          </p>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark' ? 
              'bg-blue-600 hover:bg-blue-700 text-white' : 
              'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetails; 