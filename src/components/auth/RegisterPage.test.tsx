// src/tests/RegisterPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { AuthContext } from '../../context/AuthContext';
import { RegistrationRequest } from '../../services/types'; 

describe('RegisterPage', () => {
  const mockRegister = jest.fn();

  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('registers successfully and clears the form', async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    render(
      <AuthContext.Provider
        value={{
          register: mockRegister,
          login: jest.fn(),
          logout: jest.fn(),
          isAuthenticated: false,
          user: null,
          loading: false,
        }}
      >
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '0712345678' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: '123 Street' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Pass@1234' } });
    fireEvent.change(screen.getByLabelText(/initial deposit/i), { target: { value: '1000' } });

    fireEvent.change(screen.getByLabelText(/set 4-digit pin/i), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText(/confirm pin/i), { target: { value: '1234' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'Pass@1234',
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '0712345678',
        address: '123 Street',
        accountType: 'SAVINGS', // depends on your form default
        initialDeposit: 1000,
        transactionPin: '1234',
        confirmPin: '1234',
      });

      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    });
  });
});
