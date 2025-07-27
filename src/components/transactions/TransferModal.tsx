import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { PinInput } from '../common/PinInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { transactionApi, accountApi } from '../../services/api';
import { Account, TransferRequest } from '../../services/types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
  showMessage: (message: string, type: 'success' | 'error') => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ 
  isOpen, 
  onClose, 
  accounts, 
  onSuccess, 
  showMessage 
}) => {
  const [formData, setFormData] = useState({
    senderAccountNumber: '',
    recipientAccountNumber: '',
    amount: '',
    description: '',
    transactionPin: ['', '', '', '']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState({
    recipientExists: null as boolean | null,
    balanceValid: null as boolean | null,
    amountValid: null as boolean | null
  });

  useEffect(() => {
    if (formData.recipientAccountNumber && formData.recipientAccountNumber.length >= 10) {
      validateRecipient();
    }
  }, [formData.recipientAccountNumber]);

  useEffect(() => {
    if (formData.amount && formData.senderAccountNumber) {
      validateAmount();
    }
  }, [formData.amount, formData.senderAccountNumber]);

  const validateRecipient = async () => {
    console.log("Checking account:", formData.recipientAccountNumber);
    try {
      const res = await accountApi.getAccountByNumber(formData.recipientAccountNumber);
      console.log("Account found:", res.data);
      setValidation(prev => ({ ...prev, recipientExists: true }));
    } catch (error: any) {
      console.error("Account check failed:", error.response?.status);
      setValidation(prev => ({ ...prev, recipientExists: false }));
    }
  };
  ;

  const validateAmount = () => {
    const amount = parseFloat(formData.amount);
    const account = accounts.find(acc => acc.accountNumber === formData.senderAccountNumber);
    
    if (!account || !amount) {
      setValidation(prev => ({
        ...prev,
        balanceValid: null,
        amountValid: null
      }));
      return;
    }

    setValidation(prev => ({
      ...prev,
      amountValid: amount > 0 && amount <= 1000000,
      balanceValid: amount <= account.balance
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = formData.transactionPin.join('');
    
    if (pin.length !== 4) {
      showMessage('Please enter your 4-digit PIN', 'error');
      return;
    }

    if (!validation.recipientExists || !validation.balanceValid || !validation.amountValid) {
      showMessage('Please fix validation errors before proceeding', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const transferData: TransferRequest = {
        senderAccountNumber: formData.senderAccountNumber,
        recipientAccountNumber: formData.recipientAccountNumber,
        amount: parseFloat(formData.amount),
        description: formData.description,
        transactionPin: pin
      };

      await transactionApi.transfer(transferData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        senderAccountNumber: '',
        recipientAccountNumber: '',
        amount: '',
        description: '',
        transactionPin: ['', '', '', '']
      });
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Send size={24} className="mr-2" />
              <h2 className="text-2xl font-bold">Transfer Money</h2>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Sender Account */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Account</label>
              <select
                value={formData.senderAccountNumber}
                onChange={(e) => setFormData({...formData, senderAccountNumber: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
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

            {/* Recipient Account */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To Account</label>
              <input
                type="text"
                value={formData.recipientAccountNumber}
                onChange={(e) => setFormData({...formData, recipientAccountNumber: e.target.value})}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                  validation.recipientExists === null ? 'border-gray-200 focus:border-blue-500' :
                  validation.recipientExists ? 'border-green-500' : 'border-red-500'
                }`}
                placeholder="Enter recipient account number"
                required
              />
              {validation.recipientExists === true && (
                <p className="text-green-600 text-sm mt-1 flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  Valid recipient account
                </p>
              )}
              {validation.recipientExists === false && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  Account not found
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (KES)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                  validation.amountValid === null ? 'border-gray-200 focus:border-blue-500' :
                  validation.amountValid && validation.balanceValid ? 'border-green-500' : 'border-red-500'
                }`}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
              {validation.amountValid === false && (
                <p className="text-red-600 text-sm mt-1">Amount must be between KES 0.01 and KES 1,000,000</p>
              )}
              {validation.balanceValid === false && (
                <p className="text-red-600 text-sm mt-1">Insufficient balance</p>
              )}
              {validation.amountValid && validation.balanceValid && (
                <p className="text-green-600 text-sm mt-1">Valid amount</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Payment for..."
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
                disabled={isLoading || !validation.recipientExists || !validation.balanceValid || !validation.amountValid}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner /> : 'Transfer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};