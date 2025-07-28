// CreateAccountModal.tsx - Create this as a separate component file
import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { accountApi } from '../../services/api';
import {CreateAccountResponse, CreateAccountRequest} from '../../services/types'
import { useAuth } from '../../context/AuthContext';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
  existingAccountTypes: string[];
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated,
  existingAccountTypes
}) => {
  const [formData, setFormData] = useState<CreateAccountRequest>({
    accountType: 'SAVINGS',
    transactionPin: '',
    confirmPin: '',
    initialDeposit: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<CreateAccountResponse | null>(null);

  const accountTypes = [
    { value: 'SAVINGS', label: 'Savings Account', icon: '💰', description: 'Earn interest on your deposits' },
    { value: 'CHECKING', label: 'Checking Account', icon: '🏦', description: 'For everyday transactions' },
  ];

  const availableAccountTypes = accountTypes.filter(
    type => !existingAccountTypes.includes(type.value)
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountType) {
      newErrors.accountType = 'Please select an account type';
    }

    if (!formData.transactionPin) {
      newErrors.transactionPin = 'Transaction PIN is required';
    } else if (!/^\d{4}$/.test(formData.transactionPin)) {
      newErrors.transactionPin = 'PIN must be exactly 4 digits';
    }

    if (!formData.confirmPin) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (formData.transactionPin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    if (formData.initialDeposit && formData.initialDeposit < 0) {
      newErrors.initialDeposit = 'Initial deposit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await accountApi.createAccount(formData);
      setSuccess(response);
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(null);
        onAccountCreated();
        onClose();
        setFormData({
          accountType: 'SAVINGS',
          transactionPin: '',
          confirmPin: '',
          initialDeposit: 0
        });
      }, 2000);

    } catch (error: any) {
      console.error('Error creating account:', error);
      
      if (error?.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Failed to create account. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAccountRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created Successfully!</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-1">Account Number</p>
            <p className="text-lg font-mono font-bold text-gray-800">{success.accountNumber}</p>
            <p className="text-sm text-gray-600 mt-2">{success.accountType} Account</p>
            <p className="text-sm text-gray-600">Balance: KES {success.balance.toLocaleString()}</p>
          </div>
          <p className="text-gray-600 text-sm">Redirecting to accounts page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <CreditCard size={24} className="mr-2 text-emerald-600" />
            Create New Account
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Account Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type
            </label>
            {availableAccountTypes.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 text-sm">
                  You already have all available account types.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableAccountTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.accountType === type.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={type.value}
                      checked={formData.accountType === type.value}
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{type.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.accountType && (
              <p className="text-red-500 text-sm mt-1">{errors.accountType}</p>
            )}
          </div>

          {/* Initial Deposit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              Initial Deposit (Optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.initialDeposit || ''}
              onChange={(e) => handleInputChange('initialDeposit', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0.00"
            />
            {errors.initialDeposit && (
              <p className="text-red-500 text-sm mt-1">{errors.initialDeposit}</p>
            )}
          </div>

          {/* Transaction PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-1" />
              Transaction PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={formData.transactionPin}
              onChange={(e) => handleInputChange('transactionPin', e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter 4-digit PIN"
            />
            {errors.transactionPin && (
              <p className="text-red-500 text-sm mt-1">{errors.transactionPin}</p>
            )}
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-1" />
              Confirm PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={formData.confirmPin}
              onChange={(e) => handleInputChange('confirmPin', e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Confirm 4-digit PIN"
            />
            {errors.confirmPin && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPin}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || availableAccountTypes.length === 0}
              className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};