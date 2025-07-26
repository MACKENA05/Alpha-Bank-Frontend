import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CreditCard, Send, History, Wallet, User, PlusCircle, MinusCircle, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { accountApi, transactionApi } from '../../services/api';
import { Account, Transaction } from '../../services/types';
// import { TransferModal } from '../transactions/TransferModal';
// import { WithdrawModal } from '../transactions/WithdrawModal';

interface DashboardProps {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ showMessage }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        accountApi.getUserAccounts(),
        transactionApi.getHistory({ size: 5 })
      ]);
      
      setAccounts(accountsRes.accounts || []);
      setTransactions(transactionsRes.transactions || []);
    } catch (error: any) {
      showMessage('Failed to fetch data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's your account overview</p>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
        >
          {showBalance ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
          {showBalance ? 'Hide' : 'Show'} Balance
        </button>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div key={account.accountNumber} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm">{account.accountType} Account</p>
                <p className="text-lg font-semibold">****{account.accountNumber.slice(-4)}</p>
              </div>
              <CreditCard size={32} className="text-blue-200" />
            </div>
            <div className="mt-4">
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">
                {showBalance ? `${account.balance.toLocaleString()}` : '****'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
          >
            <Send size={32} className="text-blue-500 mb-2" />
            <span className="text-sm font-semibold text-gray-700">Transfer Money</span>
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
          >
            <MinusCircle size={32} className="text-red-500 mb-2" />
            <span className="text-sm font-semibold text-gray-700">Withdraw</span>
          </button>
          <button
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
          >
            <History size={32} className="text-green-500 mb-2" />
            <span className="text-sm font-semibold text-gray-700">Transaction History</span>
          </button>
          <button
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
          >
            <Wallet size={32} className="text-purple-500 mb-2" />
            <span className="text-sm font-semibold text-gray-700">View Accounts</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
          <button className="text-blue-500 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={tx.id || index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-4 ${
                  tx.transactionType === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                  tx.transactionType === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {tx.transactionType === 'DEPOSIT' ? <PlusCircle size={20} /> :
                   tx.transactionType === 'WITHDRAWAL' ? <MinusCircle size={20} /> :
                   <ArrowUpDown size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{tx.description}</p>
                  <p className="text-sm text-gray-600">{tx.referenceNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  tx.transactionDirection === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.transactionDirection === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent transactions
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* <TransferModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        accounts={accounts}
        onSuccess={() => {
          fetchData();
          showMessage('Transfer completed successfully!', 'success');
        }}
        showMessage={showMessage}
      />
      
      <WithdrawModal 
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        accounts={accounts}
        onSuccess={() => {
          fetchData();
          showMessage('Withdrawal completed successfully!', 'success');
        }}
        showMessage={showMessage}
      /> */}
    </div>
  );
};