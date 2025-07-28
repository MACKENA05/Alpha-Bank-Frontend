import React from 'react';
import { X, Send, MinusCircle, CheckCircle, Receipt, LucideIcon } from 'lucide-react';

type TransactionType = 'transfer' | 'withdrawal';

interface TransactionData {
  type: string;
  icon: LucideIcon;
  amount: number;
  fromAccount: string;
  toAccount?: string;
  description: string;
  reference: string;
}

interface TransactionConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionData: TransactionData;
  transactionType: TransactionType;
  isProcessing?: boolean;
}

export const TransactionConfirmationPopup: React.FC<TransactionConfirmationPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transactionData,
  transactionType,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  const IconComponent = transactionData.icon;
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className={`bg-gradient-to-r ${
          transactionType === 'transfer' ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600'
        } text-white p-6 rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <IconComponent size={24} className="mr-3" />
              <h2 className="text-xl font-bold">Confirm {transactionData.type}</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:text-gray-200 transition-colors"
              disabled={isProcessing}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Receipt size={20} className="mr-2 text-gray-600" />
              Transaction Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">KES {transactionData.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium text-right">{transactionData.fromAccount}</span>
              </div>
              
              {transactionData.toAccount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{transactionData.toAccount}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium text-right">{transactionData.description}</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span>{currentDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time:</span>
                  <span>{currentTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference:</span>
                  <span className="font-mono">{transactionData.reference}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Please verify all transaction details before confirming. 
              This action cannot be undone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={`flex-1 bg-gradient-to-r ${
                transactionType === 'transfer' ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600'
              } text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Confirm {transactionData.type}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo component to show how to use the popup
const TransactionConfirmationDemo = () => {
  const [isTransferConfirmOpen, setIsTransferConfirmOpen] = React.useState(false);
  const [isWithdrawConfirmOpen, setIsWithdrawConfirmOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const sampleTransferData = {
    type: 'Transfer',
    icon: Send,
    amount: 50000,
    fromAccount: 'Savings Account - ****1234',
    toAccount: 'ACC123456789012',
    description: 'Payment for services',
    reference: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
  };

  const sampleWithdrawData = {
    type: 'Withdrawal',
    icon: MinusCircle,
    amount: 25000,
    fromAccount: 'Current Account - ****5678',
    description: 'ATM Withdrawal',
    reference: 'WTH' + Math.random().toString(36).substr(2, 9).toUpperCase()
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsTransferConfirmOpen(false);
      setIsWithdrawConfirmOpen(false);
      alert('Transaction completed successfully!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Transaction Confirmation System
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => setIsTransferConfirmOpen(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            <Send size={20} className="mr-2" />
            Show Transfer Confirmation
          </button>
          
          <button
            onClick={() => setIsWithdrawConfirmOpen(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            <MinusCircle size={20} className="mr-2" />
            Show Withdrawal Confirmation
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">How to integrate:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. Import the TransactionConfirmationPopup component</p>
            <p>2. Add state for isConfirmOpen in your transfer/withdraw modals</p>
            <p>3. Show confirmation popup before calling the API</p>
            <p>4. Handle confirm/cancel actions appropriately</p>
          </div>
        </div>
      </div>

      {/* Transfer Confirmation Popup */}
      <TransactionConfirmationPopup
        isOpen={isTransferConfirmOpen}
        onClose={() => setIsTransferConfirmOpen(false)}
        onConfirm={handleConfirm}
        transactionData={sampleTransferData}
        transactionType="transfer"
        isProcessing={isProcessing}
      />

      {/* Withdrawal Confirmation Popup */}
      <TransactionConfirmationPopup
        isOpen={isWithdrawConfirmOpen}
        onClose={() => setIsWithdrawConfirmOpen(false)}
        onConfirm={handleConfirm}
        transactionData={sampleWithdrawData}
        transactionType="withdrawal"
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default TransactionConfirmationDemo;