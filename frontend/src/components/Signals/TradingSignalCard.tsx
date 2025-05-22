import React from 'react';
import { TradingSignal } from '../../services/tradingSignalService';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  LinearProgress, 
  Divider,
  useTheme
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface TradingSignalCardProps {
  signal: TradingSignal;
  showDetails?: boolean;
}

const TradingSignalCard: React.FC<TradingSignalCardProps> = ({ signal, showDetails = true }) => {
  const theme = useTheme();
  
  // Determinar cor e ícone baseado no tipo de sinal
  let signalColor = theme.palette.info.main;
  let signalIcon = <TrendingFlatIcon />;
  let signalText = 'Neutro';
  
  if (signal.type === 'buy' || signal.type === 'strong_buy') {
    signalColor = theme.palette.success.main;
    signalIcon = signal.type === 'strong_buy' ? 
      <ArrowUpwardIcon fontSize="large" /> : 
      <TrendingUpIcon fontSize="large" />;
    signalText = signal.type === 'strong_buy' ? 'Compra Forte' : 'Compra';
  } else if (signal.type === 'sell' || signal.type === 'strong_sell') {
    signalColor = theme.palette.error.main;
    signalIcon = signal.type === 'strong_sell' ? 
      <ArrowDownwardIcon fontSize="large" /> : 
      <TrendingDownIcon fontSize="large" />;
    signalText = signal.type === 'strong_sell' ? 'Venda Forte' : 'Venda';
  }
  
  // Formatar data
  const formattedDate = new Date(signal.timestamp).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: 5, 
        borderColor: signalColor,
        boxShadow: 3
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center">
            <Box 
              sx={{ 
                mr: 2,
                color: signalColor
              }}
            >
              {signalIcon}
            </Box>
            <Box>
              <Typography variant="h6" component="div">
                {signal.symbol} - {signalText}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formattedDate}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip 
              label={`${signal.confidence}% Confiança`} 
              color={
                signal.confidence > 80 ? 'success' : 
                signal.confidence > 60 ? 'primary' : 
                signal.confidence > 40 ? 'warning' : 'error'
              }
              size="small"
            />
          </Box>
        </Box>
        
        {/* Barra de confiança */}
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={signal.confidence} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: signalColor
              }
            }}
          />
        </Box>
        
        <Typography variant="body1" gutterBottom>
          {signal.description}
        </Typography>
        
        {showDetails && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Preço atual: {signal.price.toFixed(2)} USD
            </Typography>
            
            {signal.type.includes('buy') && signal.stopLoss && (
              <Typography variant="body2" color="text.secondary">
                Stop Loss sugerido: {(signal.price * (1 - signal.stopLoss/100)).toFixed(2)} USD
              </Typography>
            )}
            
            {signal.type.includes('buy') && signal.takeProfit && (
              <Typography variant="body2" color="text.secondary">
                Take Profit sugerido: {(signal.price * (1 + signal.takeProfit/100)).toFixed(2)} USD
              </Typography>
            )}
            
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                Baseado em: {signal.basedOn.join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Timeframe: {signal.timeframe}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingSignalCard; 