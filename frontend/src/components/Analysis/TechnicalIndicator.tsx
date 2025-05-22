import React from 'react';
import { Box, Typography, Paper, Divider, useTheme } from '@mui/material';

export interface IndicatorDetail {
  label: string;
  value: string | number;
  color?: string;
}

export interface IndicatorData {
  name: string;
  value: string | number;
  interpretation: string;
  description?: string;
  status?: 'positive' | 'negative' | 'neutral';
  details?: IndicatorDetail[];
  color?: string;
  history?: Array<number | string>;
}

export interface TechnicalIndicatorProps {
  indicators: IndicatorData[];
  highlightedIndex?: number | null;
}

const TechnicalIndicator: React.FC<TechnicalIndicatorProps> = ({ 
  indicators,
  highlightedIndex
}) => {
  const theme = useTheme();

  const getStatusColor = (status?: string) => {
    if (!status) return theme.palette.primary.main;
    switch (status) {
      case 'positive':
        return theme.palette.success.main;
      case 'negative':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      {indicators.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          Nenhum indicador selecionado para exibição
        </Typography>
      ) : (
        indicators.map((indicator, index) => {
          const hIndex = typeof highlightedIndex === 'number' ? highlightedIndex : null;
          const isHighlighted = hIndex !== null && 
                               indicator.history && 
                               indicator.history.length > hIndex &&
                               indicator.history[hIndex] !== undefined;
          
          return (
            <Paper 
              key={`${indicator.name}-${index}`} 
              elevation={1} 
              sx={{ 
                padding: 2, 
                marginBottom: 2,
                backgroundColor: isHighlighted 
                  ? `${theme.palette.background.default}80` 
                  : theme.palette.background.paper,
                borderLeft: `4px solid ${indicator.color || getStatusColor(indicator.status)}`,
                transition: 'background-color 0.3s ease',
                boxShadow: isHighlighted ? 3 : 1
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {indicator.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Valor: 
                <Box component="span" fontWeight="medium" ml={1}>
                  {isHighlighted && indicator.history && typeof hIndex === 'number'
                    ? indicator.history[hIndex] 
                    : indicator.value}
                </Box>
                {isHighlighted && (
                  <Box 
                    component="span" 
                    sx={{ 
                      ml: 1, 
                      fontSize: '0.8rem',
                      color: theme.palette.info.main
                    }}
                  >
                    (no ponto selecionado)
                  </Box>
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {indicator.interpretation || indicator.description}
              </Typography>
              
              {indicator.details && indicator.details.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    {indicator.details.map((detail, detailIndex) => (
                      <Box 
                        key={`${detail.label}-${detailIndex}`} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="body2">{detail.label}</Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          sx={{ 
                            color: detail.color || 'inherit',
                          }}
                        >
                          {detail.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          );
        })
      )}
    </Box>
  );
};

export default TechnicalIndicator; 