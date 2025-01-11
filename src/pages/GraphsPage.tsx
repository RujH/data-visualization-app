import Graph from "../components/Graph";
import { Box, VStack } from "@chakra-ui/react";

export default function GraphsPage() {
  return (
    <VStack spacing={4} p={4}>
      <Box width="100%">
        <Graph 
          xAxisName="Time" 
          yAxisName="Data 1" 
          csvPath="/data.csv"
        />
      </Box>
    </VStack>
  );
}