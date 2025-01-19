import './App.css';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import GraphsPage from './pages/GraphsPage';
import SingleGraphPage from './pages/SingleGraphPage';
import SettingPage from './pages/SettingPage';
import VideoPage from './pages/VideoPage';
import { ChakraProvider } from '@chakra-ui/react';
import DataPlatformPage from './pages/DataPlateformPage/DataPlatformPage';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FileProvider } from './FileContext';
import { useEffect } from 'react';

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  
  // Check if we have state passed to this route
  if (!location.state) {
    return <Navigate to="/data-visualization-app" replace />;
  }

  return children;
};

// Refresh protection wrapper
const RefreshProtection = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();

  useEffect(() => {
    // Check if this is a page refresh
    const isPageRefresh = !sessionStorage.getItem('app_loaded');
    
    // If this is a refresh and not on homepage, redirect to home
    if (isPageRefresh && location.pathname !== '/') {
      window.location.href = '/data-visualization-app';
    }
    
    // Set the flag to indicate the app has been loaded
    sessionStorage.setItem('app_loaded', 'true');
  }, [location]);

  return children;
};

function App() {
  return (
    <ChakraProvider>
      <FileProvider>
        <Router basename="/data-visualization-app">
          <RefreshProtection>
            <>
              <Header/>
              <Routes>
                <Route path='/' element={<HomePage/>}/>
                <Route path='/SettingPage' element={<SettingPage/>}/>
                <Route 
                  path='/DataPlatformPage' 
                  element={
                    <ProtectedRoute>
                      <DataPlatformPage/>
                    </ProtectedRoute>  
                  }
                />
                <Route path='/GraphsPage' element={<GraphsPage/>}/>
                <Route path='/SingleGraphPage' element={<SingleGraphPage/>}/>
                <Route path='/VideoPage' element={<VideoPage/>}/>
              </Routes>
            </>
          </RefreshProtection>
        </Router>
      </FileProvider>
    </ChakraProvider>
  );
}

export default App;