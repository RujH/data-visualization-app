import './App.css';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import GraphsPage from './pages/GraphsPage';
import SettingPage from './pages/SettingPage';
import VideoPage from './pages/VideoPage';
import { ChakraProvider } from '@chakra-ui/react';
import DataPlatformPage from './pages/DataPlateformPage/DataPlatformPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FileProvider } from './FileContext';


function App() {
  return (
    <ChakraProvider>
      <FileProvider>
        <Router>
          <Header/>
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/SettingPage' element={<SettingPage/>}/>
            <Route path='/DataPlatformPage' element={<DataPlatformPage/>}/>
            <Route path='/GraphsPage' element={<GraphsPage/>}/>
            <Route path='/VideoPage' element={<VideoPage/>}/>
          </Routes>
        </Router>

      </FileProvider>
     

    </ChakraProvider>

      
  );
}

export default App;

