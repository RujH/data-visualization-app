import { Box, Stack, Text, Flex, Button } from '@chakra-ui/react'
import type { UploadFile, UploadProps } from 'antd';
import { Upload, Image} from 'antd';
import { useNavigate } from 'react-router-dom';
import React, {useState,  useEffect, useRef } from 'react';
import tempExamplePic from '../assets/tempExamplePic.png';

import { 
  ChevronRightIcon
} from '@chakra-ui/icons'


export default function HomePage() {
  
  const [files, setFiles] = useState<FileList>();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('webkitdirectory', 'true');
    }
  }, []);


  const handleFolderSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log('Files:', files);
      setFiles(files)
    }
  };


  const handleNextButtonClick = () => {
 
    if (files) {
      navigate('/SettingPage', { state: { files } });
    } else {
      console.error("No files selected.");
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
      <Box alignContent="center" p={4}>
        <Text mr={4} fontWeight="bold"> Upload Folder</Text>
        <Flex align="center">
          <div className="form-group">
            <label htmlFor="sessionInput" className="form-label">Session Data: </label>
            <input
              ref={inputRef}
              type="file"
              onChange={handleFolderSelection}
              required
            />
          </div>
        </Flex>

        <Flex align={"center"} pt={10}>
          <Image
            width={200}
            src={tempExamplePic}
            alt={`Folder Structure`}
          >
          </Image>

        </Flex>

         {/* footer */}
         <Box
          position="fixed"
          bottom={4}
          left={4}
          width="100%"
          p={5} // Padding for spacing; adjust as needed
          
        >
          <Flex  justifyContent="flex-end" alignItems="center" align={"right"} pt={10}>
            <Button rightIcon={<ChevronRightIcon />} mr={5} colorScheme='green' onClick={() => handleNextButtonClick()}>Next</Button>
          </Flex>
          
        </Box>

      </Box>
    </Stack> 
  )
}
