import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import integratedAnalysisService from '../../services/integratedAnalysisService';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol: string;
  theme: string;
  container?: string;
  onSymbolChange?: (symbol: string) => void;
  onIntervalChange?: (interval: string) => void;
  onChartReady?: () => void;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ 
  symbol = 'BTCUSDT', 
  theme = 'dark',
  container = 'tradingview_widget',
  onSymbolChange,
  onIntervalChange,
  onChartReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = `tradingview_${Math.random().toString(36).substring(2, 15)}`;
  const containerId = container || uniqueId;
  const [widgetInstance, setWidgetInstance] = useState<any>(null);
  
  // Efeito para carregar dados integrados quando o símbolo mudar
  useEffect(() => {
    const loadIntegratedData = async () => {
      try {
        // Carregar dados para compartilhar com outros componentes
        await integratedAnalysisService.getIntegratedData(symbol);
        console.log(`Dados integrados carregados para ${symbol}`);
      } catch (error) {
        console.error('Erro ao carregar dados integrados:', error);
      }
    };
    
    loadIntegratedData();
  }, [symbol]);

  useEffect(() => {
    const widgetOptions = {
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval: 'D',
      timezone: 'Europe/Lisbon',
      theme: theme === 'dark' ? 'dark' : 'light',
      style: '1',
      locale: 'pt_PT',
      toolbar_bg: theme === 'dark' ? '#2B2B43' : '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: containerId,
      studies: [
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
        'BB@tv-basicstudies'
      ],
      save_image: true,
      hide_side_toolbar: false,
      withdateranges: true,
      details: true,
      // Eventos para comunicação com outros componentes
      customCSS: '.apply-common-tooltip{display:none}',
      // Callbacks
      saved_data: null,
      // Eventos
      datafeed: {
        onReady: (callback: any) => {
          setTimeout(() => callback({
            supported_resolutions: ["1", "5", "15", "30", "60", "D", "W", "M"]
          }), 0);
        }
      },
      // Eventos quando o gráfico estiver pronto
      onChartReady: function() {
        if (onChartReady) onChartReady();
        console.log('TradingView chart ready');
      },
      // Evento quando o símbolo mudar
      onSymbolChange: (symbolData: any) => {
        const newSymbol = symbolData.name || symbol;
        if (onSymbolChange) onSymbolChange(newSymbol);
        console.log('Symbol changed to:', newSymbol);
        
        // Carregar novos dados integrados quando o símbolo mudar
        integratedAnalysisService.getIntegratedData(newSymbol);
      },
      // Evento quando o intervalo de tempo mudar
      onIntervalChange: (interval: string) => {
        if (onIntervalChange) onIntervalChange(interval);
        console.log('Interval changed to:', interval);
        
        // Carregar novos dados integrados com o novo intervalo
        integratedAnalysisService.getIntegratedData(symbol, interval);
      }
    };

    let tvScriptLoadingPromise;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;
        
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => {
      if (document.getElementById(containerId) && 'TradingView' in window) {
        const widget = new window.TradingView.widget(widgetOptions);
        
        // Guardar referência ao widget para limpeza e interação
        if (containerRef.current) {
          (containerRef.current as any).tvWidget = widget;
          setWidgetInstance(widget);
        }
      }
    });

    return () => {
      // Limpeza ao desmontar o componente
      if (containerRef.current && (containerRef.current as any).tvWidget) {
        (containerRef.current as any).tvWidget.remove();
        setWidgetInstance(null);
      }
    };
  }, [symbol, theme, containerId, onSymbolChange, onIntervalChange, onChartReady]);

  return (
    <Box 
      ref={containerRef}
      id={containerId}
      sx={{ 
        width: '100%', 
        height: '100%',
        minHeight: '500px',
        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: 1
      }}
    />
  );
};

export default TradingViewWidget; 