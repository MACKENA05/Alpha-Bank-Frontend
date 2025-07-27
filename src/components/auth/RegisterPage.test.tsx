// src/tests/RegisterPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { AuthContext } from '../../context/AuthContext';

describe('RegisterPage', () => {
  const mockRegister = jest.fn();

  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('registers successfully and clears the form', async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    render(
      <AuthContext.Provider value={{ register: mockRegister }}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '0712345678' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: '123 Street' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Pass@1234' } });
    fireEvent.change(screen.getByLabelText(/deposit/i), { target: { value: '1000' } });

    // Simulate pin and confirm pin entry
    fireEvent.change(screen.getByLabelText(/pin/i), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText(/confirm pin/i), { target: { value: '1234' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0712345678',
        address: '123 Street',
        password: 'Pass@1234',
        deposit: '1000',
        pin: '1234',
        confirmPin: '1234'
      });

      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();

      // Optional: Check inputs are cleared
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
    });
  });
});
