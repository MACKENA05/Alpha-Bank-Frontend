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

    // Name validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
      setError('Names should only contain letters and spaces');
      return false;
    }

    // Phone validation (Kenyan format)
    if (formData.phoneNumber) {
      const phoneRegex = /^(\+254|0)[17]\d{8}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        setError('Please enter a valid Kenyan phone number (+254 or 0 format)');
        return false;
      }
    }

    // Address validation
    if (formData.address && (formData.address.length < 10 || formData.address.length > 500)) {
      setError('Address must be between 10 and 500 characters');
      return false;
    }

    // Initial deposit validation
    const deposit = parseFloat(formData.initialDeposit);
    if (isNaN(deposit) || deposit < 100 || deposit > 1000000) {
      setError('Initial deposit must be between KES 100 and KES 1,000,000');
      return false;
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
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
        accountType: formData.accountType,
        initialDeposit: parseFloat(formData.initialDeposit),
        transactionPin: formData.transactionPin.join('')
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
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
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="+254712345678 or 0712345678"
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
                    placeholder="Enter your address"
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