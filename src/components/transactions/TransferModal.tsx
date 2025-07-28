import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { PinInput } from '../common/PinInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TransactionConfirmationPopup } from '../common/TransactionConfirmationPopup'; // ADD THIS IMPORT
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // ADD THIS STATE
  const [validation, setValidation] = useState({
    recipientExists: null as boolean | null,
    balanceValid: null as boolean | null,
    amountValid: null as boolean | null
  });
  const [recipientValidating, setRecipientValidating] = useState(false);

  useEffect(() => {
    if (formData.amount && formData.senderAccountNumber) {
      validateAmount();
    } else {
      setValidation(prev => ({ 
        ...prev, 
        balanceValid: null, 
        amountValid: null 
      }));
    }
  }, [formData.amount, formData.senderAccountNumber]);

  // Validate account number format (15 characters, starts with ACC)
  const isValidAccountFormat = (accountNumber: string): boolean => {
    const trimmed = accountNumber.trim().toUpperCase();
    return trimmed.length === 15 && trimmed.startsWith('ACC');
  };

  const validateAmount = () => {
    const amount = parseFloat(formData.amount);
    
    // Find the sender account
    const account = accounts.find(acc => 
      String(acc.accountNumber).trim() === String(formData.senderAccountNumber).trim()
    );
    
    if (!account || !amount || isNaN(amount)) {
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

  // MODIFIED: This function now shows confirmation instead of directly calling API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = formData.transactionPin.join('');
    
    if (pin.length !== 4) {
      showMessage('Please enter your 4-digit PIN', 'error');
      return;
    }

    // Validate account format before submission
    if (!isValidAccountFormat(formData.recipientAccountNumber)) {
      showMessage('Account number must be 15 characters long and start with ACC', 'error');
      return;
    }

    if (!validation.balanceValid || !validation.amountValid) {
      showMessage('Please fix validation errors before proceeding', 'error');
      return;
    }

    // Double-check sender account exists
    const senderAccount = accounts.find(acc => 
      String(acc.accountNumber).trim() === String(formData.senderAccountNumber).trim()
    );
    
    if (!senderAccount) {
      showMessage('Please select a valid sender account', 'error');
      return;
    }

    // CHANGED: Show confirmation popup instead of directly calling API
    setIsConfirmOpen(true);
  };

  // NEW: Handle the actual transfer after confirmation
  const handleConfirmTransfer = async () => {
    const pin = formData.transactionPin.join('');
    const senderAccount = accounts.find(acc => 
      String(acc.accountNumber).trim() === String(formData.senderAccountNumber).trim()
    );

    const transferData: TransferRequest = {
      senderAccountNumber: formData.senderAccountNumber.trim(),
      receiverAccountNumber: formData.recipientAccountNumber.trim().toUpperCase(),
      amount: parseFloat(formData.amount),
      notes: formData.description.trim(),
      transactionPin: pin
    };

    setIsLoading(true);
    try {
      await transactionApi.transfer(transferData);
      onSuccess();
      onClose();
      setIsConfirmOpen(false); // Close confirmation popup
      
      // Reset form
      setFormData({
        senderAccountNumber: '',
        recipientAccountNumber: '',
        amount: '',
        description: '',
        transactionPin: ['', '', '', '']
      });
      
      // Reset validation
      setValidation({
        recipientExists: null,
        balanceValid: null,
        amountValid: null
      });
      
      showMessage('Transfer successful', 'success');
    } catch (error: any) {
      console.error('Transfer failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        transferData: transferData
      });
      
      // Handle different types of errors with specific messages for account not found
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Invalid request. Please check your input.';
        if (errorMsg.toLowerCase().includes('account not found') || 
            errorMsg.toLowerCase().includes('receiver account not found') ||
            errorMsg.toLowerCase().includes('account does not exist') ||
            errorMsg.toLowerCase().includes('invalid account')) {
          showMessage('Transaction not processed: Account does not exist. Please verify the account number.', 'error');
          // Reset recipient validation to force re-check
          setValidation(prev => ({ ...prev, recipientExists: null }));
        } else {
          showMessage(errorMsg, 'error');
        }
      } else if (error.response?.status === 404) {
        showMessage('Transaction not processed: Account does not exist. Please verify the account number.', 'error');
        setValidation(prev => ({ ...prev, recipientExists: null }));
      } else if (error.response?.status === 403) {
        showMessage('You do not have permission to transfer from this account.', 'error');
      } else if (error.response?.status === 500) {
        showMessage('Server error occurred. Please try again later.', 'error');
      } else {
        showMessage(error.response?.data?.message || error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      formData.senderAccountNumber &&
      formData.recipientAccountNumber &&
      formData.amount &&
      formData.description &&
      formData.transactionPin.every(pin => pin !== '')
    );
  };

  // NEW: Get sender account details for confirmation popup
  const getSenderAccount = () => {
    return accounts.find(acc => 
      String(acc.accountNumber).trim() === String(formData.senderAccountNumber).trim()
    );
  };

  if (!isOpen) return null;

  const senderAccount = getSenderAccount();

  return (
    <>
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
                  onChange={(e) => {
                    setFormData({...formData, senderAccountNumber: e.target.value});
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map(account => (
                    <option key={account.accountNumber} value={String(account.accountNumber)}>
                      {account.accountType} - ****{String(account.accountNumber).slice(-4)} (KES {account.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Account */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To Account</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.recipientAccountNumber}
                    onChange={(e) => {
                      // Allow letters and numbers, convert to uppercase, limit to 15 characters
                      const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
                      setFormData({...formData, recipientAccountNumber: value});
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Enter recipient account number (ACC...)"
                    required
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <LoadingSpinner /> : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ADD THIS: Transaction Confirmation Popup */}
      <TransactionConfirmationPopup
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmTransfer}
        transactionData={{
          type: 'Transfer',
          icon: Send,
          amount: parseFloat(formData.amount) || 0,
          fromAccount: senderAccount ? 
            `${senderAccount.accountType} - ****${String(senderAccount.accountNumber).slice(-4)}` : 
            'Unknown Account',
          toAccount: formData.recipientAccountNumber,
          description: formData.description,
          reference: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }}
        transactionType="transfer"
        isProcessing={isLoading}
      />
    </>
  );
};