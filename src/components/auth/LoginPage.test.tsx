import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LogInPage';
import { AuthContext } from '../../context/AuthContext';

const mockLogin = jest.fn();

const renderWithAuth = (contextOverrides = {}) => {
  const authContext = {
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    loading: false,
    ...contextOverrides,
  };

  return render(
    <AuthContext.Provider value={authContext}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};
