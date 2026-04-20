import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    // Advanced architecture: Multiple providers!
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <div className="flex h-screen font-sans text-slate-50 selection:bg-indigo-500/30 overflow-hidden bg-[#050508]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
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
                  <Route path="/analytics" element={
                     <ProtectedRoute>
                       <AnalyticsPage />
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
