import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Search } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { transactionApi, accountApi } from '../../services/api';
import { DepositRequest } from '../../services/types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showMessage: (message: string, type: 'success' | 'error') => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  showMessage 
}) => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [accountValid, setAccountValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (formData.accountNumber && formData.accountNumber.length >= 10) {
      validateAccount();
    } else {
      setAccountValid(null);
    }
  }, [formData.accountNumber]);

  const validateAccount = async () => {
    try {
      await accountApi.getAccountByNumber(formData.accountNumber);
      setAccountValid(true);
    } catch (error) {
      setAccountValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountValid) {
      showMessage('Please enter a valid account number', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || amount > 1000000) {
      showMessage('Amount must be between KES 0.01 and KES 1,000,000', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const depositData: DepositRequest = {
        accountNumber: formData.accountNumber,
        amount: amount,
        description: formData.description
      };

      await transactionApi.deposit(depositData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        accountNumber: '',
        amount: '',
        description: ''
      });
      setAccountValid(null);
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <PlusCircle size={24} className="mr-2" />
              <h2 className="text-2xl font-bold">Deposit Money</h2>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
          <p className="text-green-100 text-sm mt-2">Admin only - Deposit funds into any account</p>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                  accountValid === null ? 'border-gray-200 focus:border-green-500' :
                  accountValid ? 'border-green-500' : 'border-red-500'
                }`}
                placeholder="Enter account number"
                required
              />
              {accountValid === true && (
                <p className="text-green-600 text-sm mt-1">✓ Valid account found</p>
              )}
              {accountValid === false && (
                <p className="text-red-600 text-sm mt-1">✗ Account not found</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (KES)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="0.00"
                min="0.01"
                max="1000000"
                step="0.01"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="Cash deposit, cheque clearance, etc."
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !accountValid}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner /> : 'Deposit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};