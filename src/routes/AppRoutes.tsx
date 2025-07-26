import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthPage } from '../pages/AuthPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AccountsPage } from '../pages/AccountsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminTransactionsPage } from '../pages/admin/AdminTransactionsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminRoute } from '../components/auth/AdminRoute';
import { PageLoader } from '../components/common/LoadingSpinner';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/auth" 
        element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        
        {/* Admin Routes */}
        <Route path="admin" element={<AdminRoute />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
    </Routes>
  );
};