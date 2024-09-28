import React, { useEffect, useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import Papa from 'papaparse';


// Define the structure of a data row based on your CSV
interface DataRow {
    Time: string;  // This should match the 'time' field in your CSV header
    W: string;
    X: string;
    Y: string;
    Z: string;
    Sys: string;
    Gyro: string;
    Cal: string;
    Mag: string;
    Batt: string;
}
interface NivoData {
    id: string;
    data: { x: string; y: number }[];
  }

// LineChart component
export default function CvsParser ()  {
    const [chartData, setChartData] = useState<NivoData[]>([]);  // To hold the formatted Nivo data

    // Fetch and parse the CSV data
    useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('../assets/data.csv');  // Update the path to your CSV
      const csvText = await response.text();
      
      console.log("csv", response)

      Papa.parse<DataRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const formattedData = formatData(results.data);
          setChartData(formattedData);
          
        },
      });
    };

    fetchData();
  }, []);


  // Function to format the parsed CSV data for Nivo's line chart
  const formatData = (data: DataRow[]): NivoData[] => {
    const keys = ['w', 'x', 'y', 'z', 'sys', 'gyro', 'acc', 'mag', 'batt'];

    var test= keys.map((key) => ({
        id: key,
        data: data.map((row) => ({
          x: String(row.Time ),  // Fallback to 'unknown' if time is missing
          y: Number(row[key as keyof DataRow]) || 0,  // Fallback to 0 if y is invalid
        })).filter((row) => row.x && !isNaN(row.y)),  // Filter out invalid rows
      }));
      console.log("test", test)
    return test

  };

  return (
    <div style={{ height: 400 }}>
    {chartData.length > 0 ? (
      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Values',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Time',
          legendOffset: 36,
          legendPosition: 'middle',
        }}
        pointSize={10}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
      />
    ) : (
      <p>Loading...</p>
    )}
  </div>
  );
};


