import React, { useState, useRef, useEffect } from 'react';
import { Box, useTheme, IconButton, Tooltip, TextField, Button } from '@mui/material';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, Area, Brush, ReferenceArea, BarProps, ReferenceLine, Rectangle
} from 'recharts';
import ChartTools from './ChartTools';
import html2canvas from 'html2canvas';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

interface DrawingPoint {
  x: number;
  y: number;
  date?: string;
  price?: number;
}

interface LineDrawing {
  type: 'line';
  points: DrawingPoint[];
}

interface HorizontalLineDrawing {
  type: 'horizontalLine';
  points: DrawingPoint[];
}

interface FreeformDrawing {
  type: 'freeform';
  points: DrawingPoint[];
}

interface TextAnnotation {
  type: 'text';
  points: DrawingPoint[];
  text: string;
}

interface FibonacciRetracement {
  type: 'fibonacciRetracement';
  points: DrawingPoint[];
}

type Drawing = LineDrawing | HorizontalLineDrawing | FreeformDrawing | TextAnnotation | FibonacciRetracement;

interface CustomShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: any;
  index?: number;
}

// Adicionando o tipo para o componente de forma (shape) do Bar do Recharts
type BarShape = (props: any) => React.ReactElement;

interface CandlestickChartProps {
  data: any[];
  activeTool: string;
  drawingMode: boolean;
  showVolume: boolean;
  chartType: string;
  showGrid: boolean;
  onDataPointHover?: (index: number | null) => void;
  onTimeRangeSelect?: (start: number, end: number) => void;
  hoveredPointIndex?: number | null;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  activeTool,
  drawingMode,
  showVolume,
  chartType,
  showGrid,
  onDataPointHover,
  onTimeRangeSelect,
  hoveredPointIndex
}) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<DrawingPoint | null>(null);
  const [currentPoint, setCurrentPoint] = useState<DrawingPoint | null>(null);
  const [freeformPoints, setFreeformPoints] = useState<DrawingPoint[]>([]);
  const [textInputVisible, setTextInputVisible] = useState<boolean>(false);
  const [textInputValue, setTextInputValue] = useState<string>('');
  const [textPosition, setTextPosition] = useState<DrawingPoint | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  
  // Estados para seleção de área de tempo
  const [brushActive, setBrushActive] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      // Adicionar índice aos dados para referência
      const indexedData = data.map((item, index) => ({
        ...item,
        dataIndex: index
      }));
      setChartData(indexedData);
    }
  }, [data]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingMode || !activeTool) return;

    const chartContainer = chartRef.current;
    if (!chartContainer) return;

    const rect = chartContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Iniciar uma nova anotação de texto
    if (activeTool === 'text') {
      setTextPosition({ x, y });
      return;
    }

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
    
    if (activeTool === 'freeform') {
      setFreeformPoints([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawingMode || !activeTool) return;

    const chartContainer = chartRef.current;
    if (!chartContainer) return;

    const rect = chartContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Atualizar os pontos de desenho
    if (activeTool === 'line' || activeTool === 'arrow' || activeTool === 'fibonacciRetracement') {
      setCurrentPoint({ x, y });
    } else if (activeTool === 'rectangle') {
      setCurrentPoint({ x, y });
    }

    if (activeTool === 'freeform' && startPoint) {
      setFreeformPoints(prev => [...prev, { x, y }]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !drawingMode || !activeTool) return;

    const chartContainer = chartRef.current;
    if (!chartContainer) return;

    const rect = chartContainer.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Finalizar o desenho
    const newDrawing = createDrawing();
    
    if (newDrawing) {
      setDrawings([...drawings, newDrawing]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setFreeformPoints([]);
  };

  const handleTextSubmit = () => {
    if (!textPosition || !textInputValue) return;

    const textAnnotation: TextAnnotation = {
      type: 'text',
      points: [textPosition],
      text: textInputValue
    };

    // Adicionar a anotação à lista de desenhos
    setDrawings([...drawings, textAnnotation]);

    setTextInputValue('');
    setTextInputVisible(false);
    setTextPosition(null);
  };

  const exportChart = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${'BTC'}_chart_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
      });
    }
  };

  // Função para lidar com o mouse sobre pontos de dados
  const handleMouseOverDataPoint = (data: any) => {
    if (onDataPointHover && data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload;
      onDataPointHover(payload.dataIndex);
    }
  };

  // Função para lidar com o mouse saindo do gráfico
  const handleMouseLeave = () => {
    if (onDataPointHover) {
      onDataPointHover(null);
    }
  };

  // Função para lidar com a seleção de intervalo de tempo
  const handleBrushChange = (data: any) => {
    if (data && data.startIndex !== undefined && data.endIndex !== undefined) {
      setBrushActive(true);
      setSelectionStart(data.startIndex);
      setSelectionEnd(data.endIndex);
      
      if (onTimeRangeSelect) {
        onTimeRangeSelect(data.startIndex, data.endIndex);
      }
    }
  };

  const createDrawing = (): Drawing => {
    if (!startPoint || !currentPoint) {
      return {
        type: 'line',
        points: []
      };
    }

    switch (activeTool) {
      case 'line':
        return {
          type: 'line',
          points: [startPoint, currentPoint]
        };
      case 'horizontalLine':
        return {
          type: 'horizontalLine',
          points: [startPoint, currentPoint]
        };
      case 'freeform':
        return {
          type: 'freeform',
          points: freeformPoints
        };
      case 'fibonacciRetracement':
        return {
          type: 'fibonacciRetracement',
          points: [startPoint, currentPoint]
        };
      default:
        return {
          type: 'line',
          points: []
        };
    }
  };

  const renderDrawings = () => {
    const allDrawings = [...drawings];
    if (currentPoint && startPoint) {
      allDrawings.push({ ...createDrawing() });
    }

    return allDrawings.map((drawing, index) => {
      if (drawing.type === 'line') {
        if (drawing.points.length < 2) return null;
        return (
          <line
            key={`line-${index}`}
            x1={drawing.points[0].x}
            y1={drawing.points[0].y}
            x2={drawing.points[1].x}
            y2={drawing.points[1].y}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
          />
        );
      } else if (drawing.type === 'horizontalLine') {
        if (drawing.points.length < 2) return null;
        return (
          <line
            key={`hline-${index}`}
            x1={drawing.points[0].x}
            y1={drawing.points[0].y}
            x2={drawing.points[1].x}
            y2={drawing.points[0].y}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            strokeDasharray="4"
          />
        );
      } else if (drawing.type === 'freeform') {
        if (drawing.points.length < 2) return null;
        
        let path = `M ${drawing.points[0].x} ${drawing.points[0].y}`;
        drawing.points.slice(1).forEach(point => {
          path += ` L ${point.x} ${point.y}`;
        });
        
        return (
          <path
            key={`freeform-${index}`}
            d={path}
            fill="none"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
          />
        );
      } else if (drawing.type === 'text') {
        const textAnnotation = drawing as TextAnnotation;
        return (
          <text
            key={`text-${index}`}
            x={textAnnotation.points[0].x}
            y={textAnnotation.points[0].y}
            fill={theme.palette.primary.main}
            fontFamily="Arial"
            fontSize="14px"
          >
            {textAnnotation.text}
          </text>
        );
      } else if (drawing.type === 'fibonacciRetracement') {
        if (drawing.points.length < 2) return null;
        
        const startY = drawing.points[0].y;
        const endY = drawing.points[1].y;
        const height = endY - startY;
        const startX = drawing.points[0].x;
        const endX = drawing.points[1].x;
        const width = endX - startX;
        
        // Fibonacci levels
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
        ];
        
        return (
          <g key={`fib-${index}`}>
            {levels.map((level, i) => {
              const y = startY + height * level;
              return (
                <g key={`fib-level-${i}`}>
                  <line
                    x1={startX}
                    y1={y}
                    x2={endX}
                    y2={y}
                    stroke={colors[i % colors.length]}
                    strokeWidth={1}
                    strokeDasharray={i === 0 || i === levels.length - 1 ? '0' : '3,3'}
                  />
                  <text
                    x={endX + 5}
                    y={y + 4}
                    fill={colors[i % colors.length]}
                    fontSize="12px"
                  >
                    {level * 100}%
                  </text>
                </g>
              );
            })}
          </g>
        );
      }
      
      return null;
    });
  };

  // Renderiza uma linha de referência para o ponto hovereado
  const renderHoveredPointReference = () => {
    if (hoveredPointIndex === null || hoveredPointIndex === undefined) return null;
    
    const hoveredItem = chartData.find(item => item.dataIndex === hoveredPointIndex);
    if (!hoveredItem) return null;
    
    return (
      <ReferenceArea
        x1={hoveredItem.dataIndex}
        x2={hoveredItem.dataIndex}
        strokeOpacity={0.3}
        stroke={theme.palette.primary.main}
      />
    );
  };

  return (
    <Box
      ref={chartRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
        }}
      >
        <Tooltip title="Exportar gráfico">
          <IconButton onClick={exportChart} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <SaveAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          onMouseMove={handleMouseOverDataPoint}
          onMouseLeave={handleMouseLeave}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey="date" 
            scale="auto" 
            padding={{ left: 10, right: 10 }} 
          />
          <YAxis 
            domain={['auto', 'auto']} 
            padding={{ top: 10, bottom: 10 }} 
          />
          <RechartsTooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
            labelStyle={{ color: theme.palette.text.primary }}
            itemStyle={{ color: theme.palette.text.primary }}
          />

          {chartType === 'line' && (
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={theme.palette.primary.main} 
              dot={false} 
              strokeWidth={2} 
            />
          )}

          {chartType === 'candlestick' && (
            <>
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke={theme.palette.success.main} 
                dot={false} 
                strokeWidth={1} 
                strokeOpacity={0.3} 
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke={theme.palette.error.main} 
                dot={false} 
                strokeWidth={1} 
                strokeOpacity={0.3} 
              />
              {/* Renderizar as velas como barras personalizadas */}
              {chartData.map((entry, index) => {
                const isUp = entry.close >= entry.open;
                const barColor = isUp ? theme.palette.success.main : theme.palette.error.main;
                const y = Math.min(entry.open, entry.close);
                const height = Math.abs(entry.close - entry.open);
                
                return (
                  <Bar 
                    key={`candle-${index}`} 
                    dataKey="volume" 
                    fill="transparent" 
                    stroke="transparent" 
                    shape={((props) => {
                      const { x, width } = props;
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={barColor}
                          stroke={barColor}
                        />
                      );
                    }) as BarShape}
                  />
                );
              })}
            </>
          )}

          {chartType === 'bar' && (
            <Bar 
              dataKey="volume" 
              fill="transparent"
              stroke="transparent"
              shape={((props) => {
                const { x, y, width, height } = props;
                const value = props.payload?.price;
                const prevValue = props.payload?.index > 0 ? chartData[props.payload?.index - 1]?.price : value;
                const isUp = value >= prevValue;
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={isUp ? theme.palette.success.main : theme.palette.error.main}
                    stroke={isUp ? theme.palette.success.main : theme.palette.error.main}
                  />
                );
              }) as BarShape}
            />
          )}

          {chartType === 'area' && (
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={theme.palette.primary.main} 
              fill={theme.palette.primary.main} 
              fillOpacity={0.2} 
            />
          )}

          {showVolume && (
            <Bar 
              dataKey="volume" 
              fill={theme.palette.grey[600]} 
              opacity={0.3} 
              yAxisId={1}
              height={50}
              name="Volume"
            />
          )}

          {/* Renderizar a linha de referência para o ponto hovereado */}
          {renderHoveredPointReference()}

          {/* Adicionar um componente Brush para selecionar intervalo de tempo */}
          <Brush 
            dataKey="date" 
            height={30} 
            stroke={theme.palette.primary.main}
            onChange={handleBrushChange}
            startIndex={selectionStart || 0}
            endIndex={selectionEnd || (chartData.length > 30 ? 30 : chartData.length - 1)}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Renderizar SVG para os desenhos */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {renderDrawings()}
      </svg>

      {/* Campo de entrada para anotações de texto */}
      {textPosition && (
        <Box
          sx={{
            position: 'absolute',
            top: textPosition.y,
            left: textPosition.x,
            zIndex: 1000,
            padding: 1,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <TextField
            autoFocus
            size="small"
            placeholder="Digite sua anotação"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit();
              }
            }}
            sx={{ width: 200 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleTextSubmit}
            sx={{ ml: 1 }}
          >
            Adicionar
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CandlestickChart; 