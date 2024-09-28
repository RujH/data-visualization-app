import { useRef, useState} from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Button, 
  Flex, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Container
} from '@chakra-ui/react'

import { 
  ChevronDownIcon,
  ChevronLeftIcon, 
  ChevronRightIcon, 
  AddIcon 
} from '@chakra-ui/icons'
import { useLocation, useNavigate } from 'react-router-dom';
import CreateObservationModal from '../components/CreateObservationModal';


interface dataToChartMap {
  fileName : string,
  graphName: string,
  id: number
}

export default function SettingPage() {

  const location = useLocation();
  const { files } = location.state as { files: FileList }; 
  const [dropdownMenu, setDropdownMenu] = useState<dataToChartMap[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = useRef(null)
  const finalRef = useRef(null)


  const navigate = useNavigate();

  const handleClick = (action:string) => {
    if (action=="Back"){
      navigate('/')
    }
    else if (action=="Submit"){
      navigate('/DataPlatformPage')
    }
    
  };
  const handleDropdownMenu = (fileName:string, graphName:string,  id: number) => {

    const exists = dropdownMenu.some(item => item.id === id);
    if (exists) {
      setDropdownMenu(dropdownMenu.map(item => 
        item.id === id ? { ...item, graphName:  graphName} : item
      ));

    } else {
      setDropdownMenu([...dropdownMenu, {fileName, graphName, id}]);
    }
    
  };
  
  


  return (

    <Container maxW="container.lg" >
      <Stack
        spacing={10}           // Space between each child
        align="left"       // Center items horizontally
        justify="center"     // Center items vertically within the container
        h="50vh"             // Full viewport height
      
      >
        {/* Select graph section */}
        <Box >
          <Text mr={4} mb={5} fontWeight="bold"> Select Graph:</Text>
          
          {files && files.length > 0 ? 
            (
              <ul>
                {Array.from(files).map((file, index) => (
                  
                  file.webkitRelativePath.includes('Sensor') && !file.name.startsWith('.')? (
                    
                    <Flex m={4} pr={4} alignItems={"center"} >
                      <Text>{file.name}</Text>
                      <Menu>
                        <MenuButton marginLeft={5} rightIcon={<ChevronDownIcon />} as={Button} >
                          {dropdownMenu.length>0 && dropdownMenu.find(item => item.id === index)? dropdownMenu.find(item => item.id === index)?.graphName : "Graph Type"}
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={()=>handleDropdownMenu(file.name, "Line Graph", index)}>Line Graph</MenuItem>
                          <MenuItem onClick={()=>handleDropdownMenu(file.name, "Bar Graph", index)}>Bar Graph</MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                  ):(
                    <div></div>
                  )

                ))}
              </ul>
            ) : (
              <p>No files passed.</p>
            )
          }
            

        </Box>
        {/* Select observation button section */}
        <Box>
          <Text mr={4} mb={5} fontWeight="bold"> Select Oservation Buttons: </Text>
          <Button leftIcon={<AddIcon />} onClick={onOpen}>Add Oservation</Button>
          <CreateObservationModal initialRef={initialRef} finalRef= {finalRef} isOpen={isOpen} onClose={onClose}/>
        </Box>

        {/* footer */}
        <Box
          position="fixed"
          bottom={4}
          left={4}
          width="100%"
          p={5} // Padding for spacing; adjust as needed
          // bg="gray.200" // Background color for visibility; adjust as needed
        
          // boxShadow="md" // Optional: Add shadow for visual separation
        >
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Button leftIcon={<ChevronLeftIcon />} colorScheme='gray' onClick={() => handleClick("Back")}>
              Back
            </Button>
            <Button rightIcon={<ChevronRightIcon />} mr={5} colorScheme='green' onClick={() => handleClick("Submit")}>
              Submit
            </Button>
          </Flex>
        </Box>

      </Stack>
    </Container>

  )
}
