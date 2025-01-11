import { useLocation } from 'react-router-dom';
import { 
  Box, 
  Flex 
} from '@chakra-ui/react';


export default function VideoPage() {
  const location = useLocation();
  const { file, index } = location.state || {}; // Extract `file` and `index`

  if (!file || index === undefined) {
    return <div>Error: Missing parameters</div>;
  }

  return (
    
    <div key={index}> 
      <Flex direction="column" m={"5"}>
        <Box borderRadius="12px" overflow="hidden" width="100%">
          <video controls width="100%">
            <source src={URL.createObjectURL(file)} type="video/mp4" /> {/* Use URL.createObjectURL for local files */}
            Your browser does not support the video tag.
          </video>
        </Box>
      </Flex>
    </div>
    
  );
};

