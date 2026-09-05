import React from 'react';
import './App.css';
import './styles/ares.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AresProvider } from './context/AresContext';
import { AuthProvider } from './context/AuthContext';
import AresApp from './pages/AresApp';
import AuthCallback from './pages/AuthCallback';
import { Toaster } from './components/ui/toaster';

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<AresApp />} />
      <Route path="*" element={<AresApp />} />
    </Routes>
  );
}

function App() {
  return (
    <AresProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </AresProvider>
  );
}

export default App;
