import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, CreditCard, Eye, EyeOff } from 'lucide-react';
import { PinInput } from '../common/PinInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { MessageBar } from '../common/MessageBar';
import { authApi } from '../../services/api';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    accountType: 'SAVINGS' as 'SAVINGS' | 'CHECKING' | 'BUSINESS',
    initialDeposit: '',
    transactionPin: ['', '', '', ''],
    confirmPin: ['', '', '', '']
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      accountType: 'SAVINGS',
      initialDeposit: '',
      transactionPin: ['', '', '', ''],
      confirmPin: ['', '', '', '']
    });
    setShowPassword(false);
    // Clear any existing error messages
    setError('');
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!formData.firstName || formData.firstName.trim().length < 2 || formData.firstName.length > 100 || !nameRegex.test(formData.firstName)) {
      setError('First name is required, must be between 2-100 characters and contain only letters and spaces');
      return false;
    }
    
    if (!formData.lastName || formData.lastName.trim().length < 2 || formData.lastName.length > 100 || !nameRegex.test(formData.lastName)) {
      setError('Last name is required, must be between 2-100 characters and contain only letters and spaces');
      return false;
    }

    // Phone validation (Kenyan format) - REQUIRED
    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please provide a valid Kenyan phone number (e.g., +254712345678 or 0712345678)');
      return false;
    }

    // Address validation - OPTIONAL
    if (formData.address && (formData.address.trim().length < 10 || formData.address.length > 500)) {
      setError('Address must be between 10 and 500 characters if provided');
      return false;
    }

    // Initial deposit validation - match backend BigDecimal constraints
    const deposit = parseFloat(formData.initialDeposit);
    if (isNaN(deposit) || deposit < 100.0 || deposit > 1000000.0) {
      setError('Initial deposit must be between KES 100.00 and KES 1,000,000.00');
      return false;
    }

    // Check decimal places (max 2)
    if (formData.initialDeposit.includes('.')) {
      const decimalPart = formData.initialDeposit.split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        setError('Initial deposit can have at most 2 decimal places');
        return false;
      }
    }

    // PIN validation
    const pin = formData.transactionPin.join('');
    const confirmPin = formData.confirmPin.join('');
    
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('Transaction PIN must be exactly 4 digits');
      return false;
    }

    if (pin !== confirmPin) {
      setError('Transaction PINs do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        email: formData.email,
        password: formData.password, 
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber, 
        address: formData.address || null,
        accountType: formData.accountType,
        initialDeposit: formData.initialDeposit, 
        transactionPin: formData.transactionPin.join(''),
        confirmPin: formData.confirmPin.join('') 
      };

      await authApi.register(registrationData);
      
      // Clear the form immediately after successful registration
      clearForm();
      
      setSuccess('🎉 Registration successful! Welcome to AlphaBank. Redirecting to login...');
      
      // Navigate to login after showing success message
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      {/* Message Bar for notifications */}
      {(error || success) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <MessageBar
            message={error || success}
            type={error ? 'error' : 'success'}
            onClose={handleCloseMessage}
            autoClose={true}
            duration={error ? 6000 : 4000}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[95vh]">
        <div className="bg-gradient-to-r from-emerald-400 to-green-700 text-white p-8 rounded-t-2xl text-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={32} />
            </div>
            <h2 className="text-3xl font-bold">Create Your Account</h2>
            <p className="mt-2 opacity-90">Join Alpha Bank today and get Secure, Smart and Seamless Banking Services.</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="john@gmail.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="+254712345678 or 0712345678"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Security */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none pr-12"
                      placeholder="At least 8 characters with uppercase, lowercase, and number"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Address (Optional)
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    rows={3}
                    placeholder="Enter your address (optional)"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard size={16} className="inline mr-2" />
                    Account Type
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    disabled={isLoading}
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CHECKING">Checking Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Initial Deposit (KES)
                  </label>
                  <input
                    type="number"
                    value={formData.initialDeposit}
                    onChange={(e) => setFormData({...formData, initialDeposit: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    min="100"
                    max="1000000"
                    step="0.01"
                    placeholder="Minimum KES 100"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction PIN (4 digits)
                  </label>
                  <PinInput 
                    pins={formData.transactionPin} 
                    setPins={(pins) => setFormData({...formData, transactionPin: pins})}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Transaction PIN
                  </label>
                  <PinInput 
                    pins={formData.confirmPin} 
                    setPins={(pins) => setFormData({...formData, confirmPin: pins})}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                to="/login"
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all text-center"
              >
                Back to Login
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner /> : '🚀 Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};