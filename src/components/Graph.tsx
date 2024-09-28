import { ResponsiveLine } from '@nivo/line';
import {data} from '../data/graphsData';

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


interface GraphProps {
  xAxisName: string;
  yAxisName: string;
}


export default function Graph({ xAxisName, yAxisName }: GraphProps) {

  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Load and parse CSV file
    console.log("Test")
    const fetchData = async () => {
      const response = await fetch('../assets/data.csv');
      // const reader = response.body?.getReader();
      // const result = await reader?.read();
      // const decoder = new TextDecoder('utf-8');
      // const csv = decoder.decode(result?.value);
      
      
      
      const reader2 = new FileReader();
  
      reader2.onload = (e:any) => {
        
        const contents:string = e.target.result;
        const importedData = [];
        const rows = contents.split('\n');
    
        // Extract the column headers from the first row
        const headers = rows[0].split(',');
    
        // Find the indices of "Time" and "HR" columns
        // const timeIndex = headers.findIndex((header) => header.trim().toLowerCase() === 'time');
        // const hrIndex = headers.findIndex((header) => header.trim().toLowerCase() === 'hr');
    
        // Process the remaining rows
        for (let i = 1; i < rows.length; i+=2) {
          const row = rows[i].split(',');
          console.log("row",row)
    
          // Only consider rows with valid Time and HR values
          // if (row.length > timeIndex && row.length > hrIndex) {
          //   const time = parseFloat(row[timeIndex]) - unixTimestamp;
          //   const heartRate = parseFloat(row[hrIndex]);
          //   importedData.push({ time, heartRate });
          // }
        }
        
      };
      // reader2.readAsText("../assets/data.csv")
      
    };

    fetchData();
  }, []);

  // Process the parsed data for the chart
  const processChartData = (data: any[]) => {
    const labels = data.map((row) => row['time']);
    const wData = data.map((row) => row['w']);
    const xData = data.map((row) => row['x']);
    const yData = data.map((row) => row['y']);
    const zData = data.map((row) => row['z']);

    setChartData({
      labels,
      datasets: [
        {
          label: 'W',
          data: wData,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        },
        {
          label: 'X',
          data: xData,
          borderColor: 'rgba(153, 102, 255, 1)',
          fill: false,
        },
        {
          label: 'Y',
          data: yData,
          borderColor: 'rgba(255, 159, 64, 1)',
          fill: false,
        },
        {
          label: 'Z',
          data: zData,
          borderColor: 'rgba(54, 162, 235, 1)',
          fill: false,
        },
      ],
    });
  };

  return (

    <div style={{ height: '400px', width: '100%' }}>

      <Line data={chartData} />
   
    </div>
  
  )
}


{/* <ResponsiveLine
data={data}
margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
xScale={{ type: 'point' }}
yScale={{
  type: 'linear',
  min: 'auto',
  max: 'auto',
  stacked: true,
  reverse: false
}}
yFormat=" >-.2f"
axisTop={null}
axisRight={null}
axisBottom={{
  tickSize: 5,
  tickPadding: 5,
  tickRotation: 0,
  legend: xAxisName,
  legendOffset: 36,
  legendPosition: 'middle',
  truncateTickAt: 0
}}
axisLeft={{
  tickSize: 5,
  tickPadding: 5,
  tickRotation: 0,
  legend: yAxisName,
  legendOffset: -40,
  legendPosition: 'middle',
  truncateTickAt: 0
}}
pointSize={10}
pointColor={{ theme: 'background' }}
pointBorderWidth={2}
pointBorderColor={{ from: 'serieColor' }}
pointLabel="data.yFormatted"
pointLabelYOffset={-12}
enableTouchCrosshair={true}
useMesh={true}
legends={[
  {
    anchor: 'bottom-right',
    direction: 'column',
    justify: false,
    translateX: 100,
    translateY: 0,
    itemsSpacing: 0,
    itemDirection: 'left-to-right',
    itemWidth: 80,
    itemHeight: 20,
    itemOpacity: 0.75,
    symbolSize: 12,
    symbolShape: 'circle',
    symbolBorderColor: 'rgba(0, 0, 0, .5)',
    effects: [
      {
        on: 'hover',
        style: {
          itemBackground: 'rgba(0, 0, 0, .03)',
          itemOpacity: 1
        }
      }
    ]
  }
]}
/> */}