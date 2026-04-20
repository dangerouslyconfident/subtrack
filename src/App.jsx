import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    // Advanced architecture: Multiple providers!
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <div className="min-h-screen font-sans text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
            <Navbar />
            <main>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes - only accessible if logged in */}
                  <Route path="/" element={
                     <ProtectedRoute>
                       <DashboardPage />
                     </ProtectedRoute>
                  } />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
