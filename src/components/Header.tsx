import { Box, Flex, Text} from '@chakra-ui/react';

export default function  Header (){

  return (
    <Box bg="black.500" color="black" py={10}>
      <Flex
        align="center"
        justify="center"
        maxW="1200px"
        mx="auto"
        px={4}
      >
        <Text fontWeight="bold">Data Visualization App</Text>
      
      </Flex>
    </Box>
  );
};