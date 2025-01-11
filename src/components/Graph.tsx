
import Papa from 'papaparse';
import { Chart, registerables } from 'chart.js';

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

// Register chart.js components
Chart.register(...registerables);


interface DataRow {
  Time: string;
  W: number;
  X: number;
  Y: number;
  Z: number;
  'Sys Cal': number;
  'Gyro Cal': number;
  'Acc Cal': number;
  'Mag Cal': number;
  Batt: number;
}


interface GraphProps {
  xAxisName: string;
  yAxisName: string;
}


export default function Graph({ xAxisName, yAxisName }: GraphProps) {
  const [chartData, setChartData] = useState<any>(null);
  useEffect(() => {
    Papa.parse("/data.csv", {
      download: true,
      header: true,
      dynamicTyping: true,

      complete: (result) => {
        // const parsedData = result.data as DataRow[];  // Ensure the type matches
        const parsedData = result.data.filter((_, index) => index % 2 === 0) as DataRow[];
        console.log('Parsed Data:', parsedData);  // Log the parsed data to verify structure
        processData(parsedData);  // Pass parsed data to process it for the chart
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);  // Catch and log errors in parsing
      },
    });
  }, []);

  const processData = (data: DataRow[]) => {
    const timeLabels = data.map((row) => row.Time);
    const wValues = data.map((row) => row.W);
    const xValues = data.map((row) => row.X);
    const yValues = data.map((row) => row.Y);
    const zValues = data.map((row) => row.Z);

    setChartData({
      labels: timeLabels,
      datasets: [
        {
          label: 'W',
          data: wValues,
          borderColor: 'red',
          fill: true,
          borderWidth: 1
        },
        {
          label: 'X',
          data: xValues,
          borderColor: 'green',
          fill: false,
        },
        {
          label: 'Y',
          data: yValues,
          borderColor: 'blue',
          fill: false,
        },
        {
          label: 'Z',
          data: zValues,
          borderColor: 'orange',
          fill: false,
        },
      ],
    });
  };



  return (

    <div style={{ height: '100%', width: '95%' }}>

      {chartData ? <Line data={chartData} /> : <div style={{  display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading Data</div>}
    </div>
  
  )
}

