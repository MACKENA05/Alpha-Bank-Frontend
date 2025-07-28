import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './components/auth/LogInPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { UserProfile } from './components/profile/UserProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AllTransactions } from './components/admin/AllTransactions';
import { AccountsPage }  from './components/accounts/AccountPage';
import { UserManagement } from './components/admin/UserManagement';
import { UserDetails } from './components/admin/UserDetails'; // Add this import
import { MessageBar } from './components/common/MessageBar';
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
              {/* User Routes */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="profile" element={<UserProfile />} />
              
              {/* Admin Routes */}
              <Route path="admin/dashboard" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/transactions" element={
                <ProtectedRoute adminOnly>
                  <AllTransactions />
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute adminOnly>
                  <UserManagement />
                </ProtectedRoute>
              } />
              {/* Add the user details route */}
              <Route path="users/:userId" element={
                <ProtectedRoute adminOnly>
                  <UserDetails />
                </ProtectedRoute>
              } />
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