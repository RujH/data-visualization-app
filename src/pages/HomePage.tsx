import { Box, Stack, Text, Flex, Button, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import React, {useState,  useEffect, useRef,  } from 'react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useFileContext } from '../FileContext';

export default function HomePage() {
  
  const { files, setFiles } = useFileContext(); 
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputError, setInputError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('webkitdirectory', 'true');
    }
  }, []);


  const handleFolderSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log("homepage",files)
      setFiles(files)
      setInputError(false);
    }
  };


  const handleNextButtonClick = () => {
 
    if (files) {
      navigate('/SettingPage', { state: { files } });
    } else {
      
      console.error("No files selected.");
      setInputError(true);
    }
  };


  return (
    <Stack
      spacing={4}           
      align="center"       
      justify="center"     
      h="100vh"             
      p={4}
    >
      <div className='backgroundShap'>
        <div className="rounded-box">

        <SimpleGrid minChildWidth="sm" gap="40px">  
          <Text fontWeight="bold"> Upload Folder</Text>
          <Flex align="center">
            <div className="form-group">
              <label htmlFor="sessionInput" className="form-label">Session Data: </label>
              <input
                id="file-picker"
                ref={inputRef}
                type="file"
                onChange={handleFolderSelection}
                required
                
                style={inputError ? {
                  borderColor: 'red',  
                  borderWidth: '2px',  
                  borderStyle: 'solid',  
                  borderRadius: '8px', 
                  padding: '8px',  
                  outline: 'none',  
                  marginBottom: '10px'  
                } : {}}
              />
            </div>
          </Flex>
        </SimpleGrid>
        </div>

        {/* footer */}
        <Box
          position="fixed"
          bottom={4}
          left={4}
          width="100%"
          p={5} 
        >
          <Flex justifyContent="flex-end" alignItems="center" align={"right"} pt={10}>
            <Button rightIcon={<ChevronRightIcon />} mr={5} colorScheme='green' onClick={() => handleNextButtonClick()}>Next</Button>
          </Flex>
        </Box>

        </div>

      
    </Stack> 
  )
}
