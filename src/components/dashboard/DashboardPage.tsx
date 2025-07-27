import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CreditCard, Send, History, Wallet, PlusCircle, MinusCircle, ArrowUpDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { accountApi, transactionApi } from '../../services/api';
import { Account, Transaction } from '../../services/types';
import { TransferModal } from '../transactions/TransferModal';
import { WithdrawModal } from '../transactions/WithdrawModal';
import { DepositModal } from '../transactions/DepositModal';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

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
      {/* Message Bar */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          messageType === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          <div className="flex justify-between items-center">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="ml-2 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}

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

      {/* Account Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 text-sm uppercase tracking-wide">Total Balance</p>
            <p className="text-4xl font-bold mt-2">
              {showBalance ? `KES ${totalBalance.toLocaleString()}` : 'KES ••••••'}
            </p>
            <p className="text-blue-200 mt-2">Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <TrendingUp size={48} className="text-blue-200 mb-2" />
            <p className="text-sm text-blue-200">+2.5% this month</p>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div key={account.accountNumber} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">{account.accountType} Account</p>
                <p className="text-lg font-semibold text-gray-800">****{account.accountNumber.slice(-4)}</p>
              </div>
              <div className={`p-2 rounded-full ${
                account.accountType === 'SAVINGS' ? 'bg-green-100 text-green-600' :
                account.accountType === 'CHECKING' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <CreditCard size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-600 text-sm">Available Balance</p>
              <p className="text-2xl font-bold text-gray-800">
                {showBalance ? `KES ${account.balance.toLocaleString()}` : 'KES ••••••'}
              </p>
            </div>
            <div className={`mt-3 text-sm ${account.isActive ? 'text-green-600' : 'text-red-600'}`}>
              ● {account.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group"
          >
            <div className="p-3 bg-blue-500 rounded-full text-white group-hover:scale-110 transition-transform">
              <Send size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700 mt-3">Transfer Money</span>
          </button>
          
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all group"
          >
            <div className="p-3 bg-red-500 rounded-full text-white group-hover:scale-110 transition-transform">
              <MinusCircle size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700 mt-3">Withdraw</span>
          </button>
          
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all group"
            >
              <div className="p-3 bg-green-500 rounded-full text-white group-hover:scale-110 transition-transform">
                <PlusCircle size={24} />
              </div>
              <span className="text-sm font-semibold text-gray-700 mt-3">Deposit</span>
            </button>
          )}
          
          <button
            onClick={() => navigate('/transactions')}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all group"
          >
            <div className="p-3 bg-purple-500 rounded-full text-white group-hover:scale-110 transition-transform">
              <History size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700 mt-3">Transaction History</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
          <button 
            onClick={() => navigate('/transactions')}
            className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
          >
            View All →
          </button>
        </div>
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={tx.id || index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${
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
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-lg ${
                  tx.transactionDirection === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.transactionDirection === 'CREDIT' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Bal: KES {tx.balanceAfter.toLocaleString()}
                </p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <History size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No recent transactions</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransferModal 
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
      />

      {user?.role === 'ADMIN' && (
        <DepositModal 
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            fetchData();
            showMessage('Deposit completed successfully!', 'success');
          }}
          showMessage={showMessage}
        />
      )}
    </div>
  );
};