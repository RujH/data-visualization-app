import './App.css';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import GraphsPage from './pages/GraphsPage';
import SettingPage from './pages/SettingPage';
import { ChakraProvider } from '@chakra-ui/react';
import DataPlatformPage from './pages/DataPlateformPage/DataPlatformPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';



function App() {
  return (
    <ChakraProvider>
      <Router>
      <Header/>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/SettingPage' element={<SettingPage/>}/>
        <Route path='/DataPlatformPage' element={<DataPlatformPage/>}/>
        <Route path='/GraphsPage' element={<GraphsPage/>}/>
      </Routes>

    </Router>

    </ChakraProvider>

      
  );
}

export default App;