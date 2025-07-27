import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './components/auth/LogInPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { MessageBar } from './components/common/MessageBar';
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { UserProfile } from './components/profile/UserProfile';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* User Routes - Add your dashboard route here */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="profile" element={<UserProfile />} />
            
        
             
              
              {/* Admin Routes */}
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;