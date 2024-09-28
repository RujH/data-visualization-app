import { 
  Box, 
  Button, 
  Collapse, 
  Flex 
} from '@chakra-ui/react';
import { useState } from 'react';
import { MinusIcon, AddIcon } from '@chakra-ui/icons';


export default function VideoColumn() {
  // TODO: create unique id for each video so the buttons don't mix up
  const [show, setShow] = useState(true);
  const [mute, setMute] = useState(false);

  const handleToggle = () => setShow(!show);
  const handleMute = () => setMute(!mute);

  const handleExpandVideoButton = () => {
    window.open('VideoPage')
  };

  return (
   
    <Box 
      maxHeight="600px" // Set a maximum height for the container
      overflowY="auto"  // Enable vertical scrolling
      p={5}
      mx="auto" 
      borderWidth={1}
      borderRadius="md" 
      w='100%' 
      mr={5}
    >
      <Button mb = {"2"} size={"xs"} onClick={handleToggle} leftIcon={show? <MinusIcon/> : <AddIcon/>}> Video 1 Name </Button>
      <Collapse in={show}>

        <Flex direction="column"  mb={"5"}>
          <video controls width="100%">
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          </video>

          <Box
            mt={2} 
            display="flex"
            justifyContent="flex-end"  
          >
            
            {/* TODO: add logic to mute and unmute the video */}
            <Button size="xs" mr={2} onClick={handleMute}>
              {mute? 'Unmute' : 'Mute'}
              
            </Button>

            <Button size="xs" onClick={()=>handleExpandVideoButton()}>
              {/* {muteStatus[index] ? 'Unmute' : 'Mute'} */}
              Expand Video
            </Button>
           
          </Box>
        </Flex>

      </Collapse>

      <Button mb = {"2"} size={"xs"} onClick={handleToggle} leftIcon={show? <MinusIcon/> : <AddIcon/>}> Video 1 Name </Button>
      <Collapse in={show}>

        <Flex direction="column"  mb={"5"}>
          <video controls width="100%">
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <Box
            mt={2}             // Margin-top to separate the buttons from the video
            display="flex"
            justifyContent="flex-end"  // Align buttons to the right
          >
            {/* TODO: add logic to mute and unmute the video */}
            <Button size="xs" mr={2} onClick={handleMute}>
              {mute? 'Unmute' : 'Mute'}
              
            </Button>

            <Button size="xs" onClick={()=>handleExpandVideoButton()}>
              {/* {muteStatus[index] ? 'Unmute' : 'Mute'} */}
              Expand Video
            </Button>
            
          </Box>
        </Flex>

      </Collapse>

    </Box>
  )
}


