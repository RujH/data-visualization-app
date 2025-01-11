import Graph from "../../components/Graph";
import { Box, VStack } from "@chakra-ui/react";
import { useFileContext } from '../../FileContext';
import { useEffect, useState } from 'react';

interface GraphsColumnProps {
  currentTime?: number;
  videoStartTime?: number;
}

interface CsvFile {
  name: string;
  path: string;
}

export default function GraphsColumn({ currentTime, videoStartTime }: GraphsColumnProps) {
  const { files } = useFileContext();
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);

  // Find all CSV files
  useEffect(() => {
    if (files) {
      const fileArray = Array.from(files);
      const csvs = fileArray
        .filter(file => file.name.endsWith('.csv'))
        .map(file => ({
          name: file.name,
          path: URL.createObjectURL(file)
        }));
      setCsvFiles(csvs);
    }
  }, [files]);

  return (
    <VStack spacing={4} align="stretch" width="100%">
      {csvFiles.map((csv) => (
        <Box key={csv.name} width="100%">
          <Graph 
            xAxisName="Time" 
            yAxisName={csv.name.replace('.csv', '')}
            currentTime={currentTime}
            videoStartTime={videoStartTime}
            csvPath={csv.path}
          />
        </Box>
      ))}
    </VStack>
  );
}