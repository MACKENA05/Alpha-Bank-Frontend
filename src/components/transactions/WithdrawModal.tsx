import React, { useState } from 'react';
import { X, MinusCircle } from 'lucide-react';
import { PinInput } from '../common/PinInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { transactionApi } from '../../services/api';
import { Account, WithdrawalRequest } from '../../services/types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
  showMessage: (message: string, type: 'success' | 'error') => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ 
  isOpen, 
  onClose, 
  accounts, 
  onSuccess, 
  showMessage 
}) => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
    description: '',
    transactionPin: ['', '', '', '']
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = formData.transactionPin.join('');
    
    if (pin.length !== 4) {
      showMessage('Please enter your 4-digit PIN', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    const account = accounts.find(acc => 
      String(acc.accountNumber).trim() === String(formData.accountNumber).trim()
    );
    
    if (!account) {
      showMessage('Please select an account', 'error');
      return;
    }

    if (amount > account.balance) {
      showMessage('Insufficient balance', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const withdrawalData: WithdrawalRequest = {
        accountNumber: formData.accountNumber,
        amount: amount,
        description: formData.description,
        transactionPin: pin
      };

      await transactionApi.withdraw(withdrawalData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        accountNumber: '',
        amount: '',
        description: '',
        transactionPin: ['', '', '', '']
      });
    } catch (error: any) {
      showMessage(error.response?.data?.message || error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MinusCircle size={24} className="mr-2" />
              <h2 className="text-2xl font-bold">Withdraw Money</h2>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Account Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Account</label>
              <select
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                required
              >
                <option value="">Select account</option>
                {accounts.map(account => (
                  <option key={account.accountNumber} value={account.accountNumber}>
                    {account.accountType} - ****{account.accountNumber.slice(-4)} (KES {account.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (KES)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                placeholder="0.00"
                min="0.01"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                placeholder="ATM Withdrawal"
                required
              />
            </div>

            {/* Transaction PIN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction PIN</label>
              <PinInput 
                pins={formData.transactionPin} 
                setPins={(pins) => setFormData({...formData, transactionPin: pins})}
                disabled={isLoading}
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
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner /> : 'Withdraw'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};