import './App.css';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import GraphsPage from './pages/GraphsPage';
import SingleGraphPage from './pages/SingleGraphPage';
import SettingPage from './pages/SettingPage';
import VideoPage from './pages/VideoPage';
import { ChakraProvider } from '@chakra-ui/react';
import DataPlatformPage from './pages/DataPlateformPage/DataPlatformPage';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FileProvider } from './FileContext';
import { useEffect } from 'react';

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  
  // Check if we have state passed to this route
  if (!location.state) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Refresh protection wrapper
const RefreshProtection = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();

  useEffect(() => {
    try {
      // Try to access sessionStorage
      const hasLoaded = sessionStorage.getItem('app_loaded');
      
      // Only redirect if we can confirm this is a fresh page load
      if (!hasLoaded) {
        try {
          sessionStorage.setItem('app_loaded', 'true');
          // Only redirect if we're not already at the home page
          if (location.pathname !== '/') {
            window.location.hash = '#/';
          }
        } catch (err) {
          // If we can't set the flag, just continue without redirect
          console.warn('Storage access denied, continuing without refresh protection');
        }
      }
    } catch (err) {
      // If we can't access storage at all, just render the children
      console.warn('Storage access denied, continuing without refresh protection');
    }
  }, [location]);

  return children;
};

function App() {
  return (
    <ChakraProvider>
      <FileProvider>
        <Router>
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