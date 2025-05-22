import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Typography,
  Grid,
  Paper,
  IconButton,
  Divider,
  useTheme,
  Button,
  Stack,
  ButtonGroup
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import DeleteIcon from '@mui/icons-material/Delete';
import GestureIcon from '@mui/icons-material/Gesture';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import StraightenIcon from '@mui/icons-material/Straighten';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import BorderStyleIcon from '@mui/icons-material/BorderStyle';
import ShowGridIcon from '@mui/icons-material/Apps';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import ShowChartTwoToneIcon from '@mui/icons-material/ShowChartTwoTone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export type ChartType = 'line' | 'candlestick' | 'bar' | 'area';
export type DrawingTool = 'none' | 'line' | 'rectangle' | 'horizontalLine' | 'verticalLine' | 'trendLine' | 'fibonacciRetracement' | 'freeform' | 'text';

export interface ChartToolsProps {
  selectedTool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  onClearDrawings: () => void;
  selectedChartType: ChartType;
  onSelectChartType: (type: ChartType) => void;
  showVolume: boolean;
  onToggleVolume: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

const ChartTools: React.FC<ChartToolsProps> = ({
  selectedTool,
  onSelectTool,
  onClearDrawings,
  selectedChartType,
  onSelectChartType,
  showVolume,
  onToggleVolume,
  showGrid,
  onToggleGrid
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e2d' : '#f5f5f5' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid sx={{ gridColumn: 'span 4' }}>
          <ButtonGroup size="small" aria-label="drawing tools">
            <Tooltip title="Cursor">
              <IconButton 
                color={selectedTool === 'none' ? 'primary' : 'default'} 
                onClick={() => onSelectTool('none')}
              >
                <TimelapseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Linha">
              <IconButton 
                color={selectedTool === 'line' ? 'primary' : 'default'} 
                onClick={() => onSelectTool('line')}
              >
                <TimelineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Linha horizontal">
              <IconButton 
                color={selectedTool === 'horizontalLine' ? 'primary' : 'default'} 
                onClick={() => onSelectTool('horizontalLine')}
              >
                <ShowChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Texto">
              <IconButton 
                color={selectedTool === 'text' ? 'primary' : 'default'} 
                onClick={() => onSelectTool('text')}
              >
                <TextFieldsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fibonacci">
              <IconButton 
                color={selectedTool === 'fibonacciRetracement' ? 'primary' : 'default'} 
                onClick={() => onSelectTool('fibonacciRetracement')}
              >
                <ShowChartTwoToneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Desenho livre">
              <IconButton 
                color={selectedTool === 'freeform' ? 'primary' : 'default'} 
                onClick={() => onSelectTool('freeform')}
              >
                <GestureIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Limpar desenhos">
              <IconButton 
                onClick={onClearDrawings}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Grid>

        <Grid sx={{ gridColumn: 'span 4' }}>
          <ButtonGroup size="small" aria-label="chart type">
            <Tooltip title="Candles">
              <IconButton 
                color={selectedChartType === 'candlestick' ? 'primary' : 'default'} 
                onClick={() => onSelectChartType('candlestick')}
              >
                <CandlestickChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Barras">
              <IconButton 
                color={selectedChartType === 'bar' ? 'primary' : 'default'} 
                onClick={() => onSelectChartType('bar')}
              >
                <BarChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Linha">
              <IconButton 
                color={selectedChartType === 'line' ? 'primary' : 'default'} 
                onClick={() => onSelectChartType('line')}
              >
                <ShowChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Grid>

        <Grid sx={{ gridColumn: 'span 4' }}>
          <ButtonGroup size="small" aria-label="chart options">
            <Tooltip title={showVolume ? "Esconder volume" : "Mostrar volume"}>
              <IconButton 
                color={showVolume ? 'primary' : 'default'} 
                onClick={onToggleVolume}
              >
                {showVolume ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={showGrid ? "Esconder grelha" : "Mostrar grelha"}>
              <IconButton 
                color={showGrid ? 'primary' : 'default'} 
                onClick={onToggleGrid}
              >
                {showGrid ? <GridOnIcon fontSize="small" /> : <GridOffIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartTools; 