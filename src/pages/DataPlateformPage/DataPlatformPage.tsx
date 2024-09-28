import VideoColumn from './VideoColumn';
import ButtonsColumn from './ButtonsColumn';
import GraphsColumn from './GraphsColumn';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Box, Container, Flex } from '@chakra-ui/react';
import CvsParser from '../../components/CsvParser';

export default function DataPlatformPage() {
  
  const handleViewGraphsButton = () => {
    window.open('/GraphsPage')
  };

  return (
    <Container maxW='container.xlg'>
      <Flex mb={4}>
        <VideoColumn/>
        <ButtonsColumn/>
      </Flex>

      <Box m={2}>
        <Flex justifyContent="flex-end">
          <Button size={"md"} leftIcon={<ExternalLinkIcon/>} onClick={() => handleViewGraphsButton()}>View Graphs</Button>
        </Flex>
        <CvsParser/>
      </Box>
      
    </Container>
  )
}
