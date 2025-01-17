import Papa from 'papaparse';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Flex, Spinner, Text } from '@chakra-ui/react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraphProps {
  xAxisName: string;
  yAxisName: string;
  currentTime?: number;
  videoStartTime?: number;
  csvPath: string;
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  fill: boolean;
  tension: number;
  pointRadius: number;
  pointHoverRadius: number;
  spanGaps: boolean;
}

interface ChartDataType {
  labels: string[];
  datasets: Dataset[];
}

interface DataRow {
  [key: string]: string | number | null;
}

interface ParseResult {
  data: DataRow[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

const TIME_WINDOW = 10; // seconds to show before and after current time

export default function Graph({ xAxisName, yAxisName, currentTime, videoStartTime, csvPath }: GraphProps) {
  const [chartData, setChartData] = useState<ChartDataType | null>(null);
  const [columnCount, setColumnCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<DataRow[]>([]);

  // Memoized color generation
  const generateColors = useMemo(() => (count: number) => {
    const baseColors = [
      { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.1)' },
      { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' },
      { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' },
      { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.1)' },
      { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.1)' },
      { border: 'rgb(255, 205, 86)', background: 'rgba(255, 205, 86, 0.1)' }
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    const colors = [...baseColors];
    for (let i = baseColors.length; i < count; i++) {
      const hue = (i * 137.508) % 360;
      const color = `hsl(${hue}, 70%, 50%)`;
      colors.push({
        border: color,
        background: color.replace('hsl', 'hsla').replace(')', ', 0.1)')
      });
    }
    return colors;
  }, []);

  // Function to decimate data points
  const decimateData = useCallback((data: DataRow[], factor: number): DataRow[] => {
    if (factor <= 1) return data;
    return data.filter((_, index) => index % factor === 0);
  }, []);

  // Function to determine decimation factor based on data size
  const getDecimationFactor = useCallback((dataLength: number): number => {
    if (dataLength <= 1000) return 1;
    if (dataLength <= 5000) return 5;
    if (dataLength <= 10000) return 10;
    if (dataLength <= 50000) return 50;
    return Math.ceil(dataLength / 1000);
  }, []);

  // Update chart data
  const updateChartData = useCallback((data: DataRow[]) => {
    if (data.length === 0) return;

    const timeColumn = Object.keys(data[0]).find(key => 
      key.toLowerCase().includes('time') || 
      key.toLowerCase().includes('date') ||
      key.toLowerCase().includes('timestamp')
    ) || Object.keys(data[0])[0];

    const numericColumns = Object.entries(data[0])
      .filter(([key, value]) => 
        key !== timeColumn && 
        (typeof value === 'number' || !isNaN(Number(value)))
      )
      .map(([key]) => key);

    setColumnCount(numericColumns.length);
    const colors = generateColors(numericColumns.length);
    const timeLabels = data.map(row => String(row[timeColumn]));
    
    const datasets: Dataset[] = numericColumns.map((col, index) => ({
      label: col,
      data: data.map(row => Number(row[col] || 0)),
      borderColor: colors[index].border,
      backgroundColor: colors[index].background,
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4,
      spanGaps: true
    }));

    setChartData({ labels: timeLabels, datasets });
  }, [generateColors]);

  // Load CSV data
  useEffect(() => {
    let isMounted = true;
    const allData: DataRow[] = [];

    Papa.parse<DataRow>(csvPath, {
      download: true,
      header: true,
      dynamicTyping: true,
      chunk: (results: ParseResult) => {
        if (!isMounted) return;
  
        try {
          const validData = results.data.filter(row => 
            row && typeof row === 'object' && Object.keys(row).length > 0
          );
  
          if (validData.length > 0) {
            allData.push(...validData);
          }
        } catch (err) {
          if (isMounted) {
            setError('Error processing CSV data: ' + (err as Error).message);
          }
        }
      },
      complete: () => {
        if (isMounted) {
          setRawData(allData);
          console.log('CSV parsing completed');
        }
      },
      error: (error) => {
        if (isMounted) {
          setError('Error parsing CSV: ' + error.message);
        }
      },
    });
  
    return () => {
      isMounted = false;
    };
  }, [csvPath]);

  // Filter and update data based on current time
  useEffect(() => {
    if (!rawData.length) return;

    try {
      let dataToShow = rawData;
      const timeColumn = Object.keys(rawData[0]).find(key => 
        key.toLowerCase().includes('time') || 
        key.toLowerCase().includes('date') ||
        key.toLowerCase().includes('timestamp')
      );

      if (!timeColumn) {
        setError('No time column found in CSV data');
        return;
      }

      // Only filter by time window if both currentTime and videoStartTime are available
      if (typeof currentTime === 'number' && typeof videoStartTime === 'number') {
        const currentUnixTime = videoStartTime + Math.floor(currentTime);
        const timeWindow = {
          start: currentUnixTime - TIME_WINDOW,
          end: currentUnixTime + TIME_WINDOW
        };

        // Validate time values and filter data
        dataToShow = rawData.filter(row => {
          const rowTime = Number(row[timeColumn]);
          return !isNaN(rowTime) && rowTime >= timeWindow.start && rowTime <= timeWindow.end;
        });

        // Handle case where no data is available for the current time window
        if (dataToShow.length === 0) {
          console.warn(`No data available for time window ${timeWindow.start} to ${timeWindow.end}`);
          // Explicitly clear the chart data to show the no data message
          setChartData(null);
          return;
        }
      }

      const decimationFactor = getDecimationFactor(dataToShow.length);
      const decimatedData = decimateData(dataToShow, decimationFactor);
      updateChartData(decimatedData);
    } catch (err) {
      setError(`Error processing data: ${(err as Error).message}`);
    }
  }, [rawData, currentTime, videoStartTime, decimateData, getDecimationFactor, updateChartData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    plugins: {
      title: {
        display: true,
        text: `${yAxisName} vs ${xAxisName} (${columnCount} Columns)`,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: 20
      },
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(4)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAxisName,
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 20
        }
      },
      y: {
        title: {
          display: true,
          text: yAxisName,
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      line: {
        borderWidth: 1.5
      }
    }
  };

  return (
    <Box
      height="400px"
      width="95%"
      margin="20px auto"
      padding="20px"
      backgroundColor="white"
      borderRadius="8px"
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
    >
      {error ? (
        <Flex
          justifyContent="center"
          alignItems="center"
          height="100%"
          color="red.500"
          textAlign="center"
          padding="20px"
        >
          <Text>{error}</Text>
        </Flex>
      ) : chartData && chartData.datasets[0]?.data.length > 0 ? (
        <Line 
          data={chartData} 
          options={options}
        />
      ) : (
        <Flex
          justifyContent="center"
          alignItems="center"
          height="100%"
          flexDirection="column"
          gap={4}
        >
          {!rawData.length ? (
            <>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.600">Loading data...</Text>
            </>
          ) : currentTime !== undefined && videoStartTime !== undefined ? (
            <Text color="gray.600" fontSize="md" textAlign="center">
              No sensor data available at {Math.floor(currentTime)}s
            </Text>
          ) : (
            <Text color="gray.600" fontSize="md">
              Waiting for time synchronization...
            </Text>
          )}
        </Flex>
      )}
    </Box>
  );
}