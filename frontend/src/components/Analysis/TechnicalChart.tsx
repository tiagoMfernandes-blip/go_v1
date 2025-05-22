import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { IndicatorData } from './TechnicalIndicator';

export interface TechnicalChartProps {
  data: any[];
  indicators: IndicatorData[];
}

const TechnicalChart: React.FC<TechnicalChartProps> = ({ data, indicators }) => {
  const theme = useTheme();

  // Encontrar os indicadores de suporte e resistência
  const supportLevel = indicators.find(i => i.name === 'Suporte')?.value;
  const resistanceLevel = indicators.find(i => i.name === 'Resistência')?.value;
  
  // Remover o símbolo de Euro (€) se estiver presente
  const support = typeof supportLevel === 'string' ? 
    parseFloat(supportLevel.replace('€', '')) : 
    supportLevel as number;
    
  const resistance = typeof resistanceLevel === 'string' ? 
    parseFloat(resistanceLevel.replace('€', '')) : 
    resistanceLevel as number;

  return (
    <Box sx={{ 
      height: '100%', 
      backgroundColor: theme.palette.background.paper,
      borderRadius: 1,
      p: 2,
      boxShadow: 1
    }}>
      <Typography variant="h6" gutterBottom>
        Gráfico Técnico
      </Typography>
      
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: theme.palette.text.primary }} 
            stroke={theme.palette.text.primary}
            tickFormatter={(value) => {
              // Exibir apenas alguns ticks para evitar sobreposição
              const date = new Date(value);
              return date.getDate() + '/' + (date.getMonth() + 1);
            }}
          />
          <YAxis 
            tick={{ fill: theme.palette.text.primary }} 
            stroke={theme.palette.text.primary}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary
            }}
            formatter={(value: number) => [`${value.toLocaleString()}`, 'Preço']}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Legend />
          
          {/* Linha principal de preço */}
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke={theme.palette.primary.main} 
            dot={false}
            name="Preço"
          />
          
          {/* Média Móvel Simples de 50 dias */}
          <Line 
            type="monotone" 
            dataKey="sma50" 
            stroke={theme.palette.info.main} 
            dot={false}
            strokeDasharray="5 5"
            name="SMA 50"
          />
          
          {/* Níveis de suporte e resistência */}
          {support && (
            <ReferenceLine 
              y={support} 
              stroke={theme.palette.success.main}
              strokeDasharray="3 3"
              label={{ 
                value: 'Suporte', 
                position: 'insideBottomRight',
                fill: theme.palette.success.main
              }}
            />
          )}
          
          {resistance && (
            <ReferenceLine 
              y={resistance} 
              stroke={theme.palette.error.main}
              strokeDasharray="3 3"
              label={{ 
                value: 'Resistência', 
                position: 'insideTopRight',
                fill: theme.palette.error.main
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TechnicalChart; 