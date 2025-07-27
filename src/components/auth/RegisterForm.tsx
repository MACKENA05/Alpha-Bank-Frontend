import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, CreditCard, Eye, EyeOff } from 'lucide-react';
import { PinInput } from '../common/PinInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { authApi } from '../../services/api';

interface RegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showMessage: (msg: string, type: 'success' | 'error') => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const initialFormData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    accountType: 'SAVINGS' as 'SAVINGS' | 'CHECKING',
    initialDeposit: '',
    transactionPin: ['', '', '', ''],
    confirmPin: ['', '', '', '']
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const transactionPin = formData.transactionPin.join('');
      const confirmPin = formData.confirmPin.join('');
      
      if (transactionPin.length !== 4) {
        throw new Error('Transaction PIN must be 4 digits');
      }
      
      if (confirmPin.length !== 4) {
        throw new Error('PIN confirmation must be 4 digits');
      }
      
      if (transactionPin !== confirmPin) {
        throw new Error('PIN and confirmation PIN do not match');
      }

      const registrationData = {
        ...formData,
        initialDeposit: parseFloat(formData.initialDeposit),
        transactionPin,
        confirmPin, // Include confirmPin in the request
      };

      await authApi.register(registrationData);
      
      // Clear form after successful submission
      setFormData(initialFormData);
      setShowPassword(false);
      setError('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 shadow-xl">

        {/* Left Side - Emerald Panel */}
        <div className="bg-emerald-100 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-300 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-300 rounded-full opacity-30 translate-x-1/3 translate-y-1/3"></div>

          {/* Bank Icon */}
          <CreditCard size={48} className="text-emerald-600 mb-6" />

          <h2 className="text-3xl font-bold text-emerald-700 mb-4">Welcome to Alpha Bank</h2>
          <p className="text-emerald-600 text-lg max-w-xs mx-auto">
            Secure, smart, and seamless banking. Manage your accounts and transactions with confidence.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} className="inline mr-2 text-emerald-700" />
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2 text-emerald-700" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock size={16} className="inline mr-2 text-emerald-700" />
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-10 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2 text-emerald-700" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2 text-emerald-700" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CreditCard size={16} className="inline mr-2 text-emerald-700" />
                Account Type
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              >
                <option value="SAVINGS">Savings Account</option>
                <option value="CHECKING">Checking Account</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Deposit (Kes)</label>
              <input
                type="number"
                value={formData.initialDeposit}
                onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                min="100"
                max="1000000"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction PIN (4 digits)</label>
              <PinInput
                id="transaction-pin"
                pins={formData.transactionPin}
                setPins={(pins) => setFormData({ ...formData, transactionPin: pins })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm PIN (4 digits)</label>
              <PinInput
                id="confirm-pin"
                pins={formData.confirmPin}
                setPins={(pins) => setFormData({ ...formData, confirmPin: pins })}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setFormData(initialFormData);
                  setShowPassword(false);
                  setError('');
                  onClose();
                }}
                className="flex-1 bg-emerald-200 text-emerald-700 py-3 rounded-lg font-semibold hover:bg-emerald-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner /> : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};