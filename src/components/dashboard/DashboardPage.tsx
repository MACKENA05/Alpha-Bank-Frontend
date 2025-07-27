import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CreditCard, Send, History, Wallet, PlusCircle, MinusCircle, ArrowUpDown, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { accountApi, transactionApi } from '../../services/api';
import { Account, Transaction } from '../../services/types';
import { TransferModal } from '../transactions/TransferModal';
import { WithdrawModal } from '../transactions/WithdrawModal';
import { DepositModal } from '../transactions/DepositModal';
import { useNavigate } from 'react-router-dom';

// Extended interface for transaction data that might come from API
interface RawTransactionData {
  id?: number | string;
  referenceNumber?: string;
  reference?: string;
  amount?: number | string;
  transactionType?: string;
  type?: string;
  transactionDirection?: 'CREDIT' | 'DEBIT';
  direction?: 'CREDIT' | 'DEBIT';
  description?: string;
  status?: string;
  balanceAfter?: number | string;
  createdAt?: string;
  date?: string;
  transferReference?: string;
  accountNumber?: string;
  account?: {
    accountNumber?: string;
    accountType?: string;
  };
}

// Extended Account interface to include transaction count
interface EnhancedAccount extends Account {
  transactionCount?: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<EnhancedAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      
      // Fetch accounts first
      const accountsResponse = await accountApi.getUserAccounts();
      console.log('Dashboard: Raw accounts response:', accountsResponse);

      // Process accounts with multiple possible response formats
      let processedAccounts: Account[] = [];
      let calculatedTotal = 0;

      if (accountsResponse) {
        // Case 1: ApiResponse<AccountListResponse>
        if (accountsResponse.success !== undefined) {
          console.log('Dashboard: Detected ApiResponse wrapper');
          if (accountsResponse.success && accountsResponse.data) {
            if (accountsResponse.data.accounts) {
              processedAccounts = accountsResponse.data.accounts;
              calculatedTotal = Number(accountsResponse.data.totalBalance) || 0;
            }
          } else {
            throw new Error(accountsResponse.error || 'Failed to fetch accounts');
          }
        }
        // Case 2: Direct AccountListResponse
        else if (accountsResponse.accounts) {
          console.log('Dashboard: Detected direct AccountListResponse');
          processedAccounts = accountsResponse.accounts;
          calculatedTotal = Number(accountsResponse.totalBalance) || 0;
        }
        // Case 3: Direct array of accounts
        else if (Array.isArray(accountsResponse)) {
          console.log('Dashboard: Detected direct array of accounts');
          processedAccounts = accountsResponse;
        }
        // Case 4: Single account object
        else if (accountsResponse.accountNumber) {
          console.log('Dashboard: Detected single account object');
          processedAccounts = [accountsResponse];
        }
      }

      console.log('Dashboard: Processed accounts:', processedAccounts);

      // Enhanced account processing with transaction count fetching
      const enhancedAccounts = await Promise.all(
        processedAccounts.map(async (account, index) => {
          let transactionCount = 0;
          
          try {
            // Fetch transaction count for each account
            const accountTransactions = await transactionApi.getHistory({ 
              accountNumber: account.accountNumber,
              size: 1000 // Get all transactions to count them
            });
            
            let transactionList = [];
            if (accountTransactions?.success && accountTransactions.data) {
              transactionList = accountTransactions.data.transactionDetails || 
                               accountTransactions.data.transactions || [];
            } else if (accountTransactions?.transactionDetails) {
              transactionList = accountTransactions.transactionDetails;
            } else if (accountTransactions?.transactions) {
              transactionList = accountTransactions.transactions;
            } else if (Array.isArray(accountTransactions)) {
              transactionList = accountTransactions;
            }
            
            transactionCount = transactionList.length;
            console.log(`Account ${account.accountNumber} has ${transactionCount} transactions`);
            
          } catch (error) {
            console.error(`Error fetching transaction count for account ${account.accountNumber}:`, error);
            // Use fallback from account data if available
            transactionCount = Number(account.totalTransactions) || 0;
          }

          const processedAccount: EnhancedAccount = {
            id: account.id || index,
            accountNumber: account.accountNumber || `UNKNOWN-${index}`,
            accountType: account.accountType || 'CHECKING',
            balance: Number(account.balance) || 0,
            isActive: account.isActive !== false,
            createdAt: account.createdAt || new Date().toISOString(),
            updatedAt: account.updatedAt || new Date().toISOString(),
            user: account.user,
            totalTransactions: Number(account.totalTransactions) || 0,
            lastTransactionAmount: Number(account.lastTransactionAmount) || 0,
            lastTransactionDate: account.lastTransactionDate,
            transactionCount: transactionCount // Add the actual count
          };
          
          console.log(`Dashboard: Enhanced account ${index}:`, processedAccount);
          return processedAccount;
        })
      );

      setAccounts(enhancedAccounts);

      // Calculate total balance if not provided
      if (calculatedTotal === 0 && enhancedAccounts.length > 0) {
        calculatedTotal = enhancedAccounts.reduce((sum, account) => sum + account.balance, 0);
      }
      setTotalBalance(calculatedTotal);

      console.log('Dashboard: Final enhanced accounts set:', enhancedAccounts);
      console.log('Dashboard: Total balance:', calculatedTotal);

      // Fetch recent transactions with proper status handling
      try {
        console.log('Dashboard: Calling transactionApi.getHistory() for recent transactions...');
        const transactionsResponse = await transactionApi.getHistory({ 
          size: 5,
          // Try to force fresh data from database
          orderBy: 'createdAt',
          order: 'DESC',
          includeStatus: true
        });
        console.log('Dashboard: Raw transactions response:', transactionsResponse);

        let processedTransactions: RawTransactionData[] = [];

        if (transactionsResponse) {
          if (transactionsResponse.success !== undefined) {
            if (transactionsResponse.success && transactionsResponse.data) {
              processedTransactions = transactionsResponse.data.transactionDetails || 
                                   transactionsResponse.data.transactions || 
                                   [];
            }
          } else if (transactionsResponse.transactionDetails) {
            processedTransactions = transactionsResponse.transactionDetails;
          } else if (transactionsResponse.transactions) {
            processedTransactions = transactionsResponse.transactions;
          } else if (Array.isArray(transactionsResponse)) {
            processedTransactions = transactionsResponse;
          }
        }

        // Helper function to normalize transaction type
        const normalizeTransactionType = (type: string | undefined): 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' => {
          const normalizedType = (type || 'TRANSFER').toUpperCase();
          if (normalizedType === 'DEPOSIT' || normalizedType === 'WITHDRAWAL' || normalizedType === 'TRANSFER') {
            return normalizedType as 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
          }
          if (normalizedType.includes('DEPOSIT') || normalizedType === 'CREDIT') return 'DEPOSIT';
          if (normalizedType.includes('WITHDRAW') || normalizedType === 'DEBIT') return 'WITHDRAWAL';
          return 'TRANSFER';
        };

        // Enhanced status normalization - fetch actual status from DB
        const normalizeTransactionStatus = (status: string | undefined, rawTx: any): 'COMPLETED' | 'PENDING' | 'FAILED' => {
          console.log('Raw transaction status data:', { 
            status, 
            rawTx: rawTx, 
            actualStatus: rawTx?.actualStatus,
            createdAt: rawTx?.createdAt 
          });
          
          // If we have a raw status from DB, trust it first
          if (rawTx?.actualStatus) {
            const actualStatus = rawTx.actualStatus.toUpperCase();
            console.log('Using actualStatus:', actualStatus);
            if (actualStatus === 'COMPLETED' || actualStatus === 'SUCCESS' || actualStatus === 'SUCCESSFUL') return 'COMPLETED';
            if (actualStatus === 'PENDING' || actualStatus === 'PROCESSING' || actualStatus === 'IN_PROGRESS') return 'PENDING';
            if (actualStatus === 'FAILED' || actualStatus === 'ERROR' || actualStatus === 'CANCELLED') return 'FAILED';
          }
          
          // Check the main status field with more variations
          if (status) {
            const normalizedStatus = status.toUpperCase();
            console.log('Normalized status:', normalizedStatus);
            
            // Direct matches
            if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'PENDING' || normalizedStatus === 'FAILED') {
              return normalizedStatus as 'COMPLETED' | 'PENDING' | 'FAILED';
            }
            
            // Success variations
            if (normalizedStatus === 'SUCCESS' || normalizedStatus === 'SUCCESSFUL' || 
                normalizedStatus === 'COMPLETE' || normalizedStatus === 'DONE' ||
                normalizedStatus === 'CONFIRMED' || normalizedStatus === 'PROCESSED') {
              return 'COMPLETED';
            }
            
            // Pending variations
            if (normalizedStatus === 'PROCESSING' || normalizedStatus === 'IN_PROGRESS' || 
                normalizedStatus === 'WAITING' || normalizedStatus === 'SUBMITTED' ||
                normalizedStatus === 'QUEUED' || normalizedStatus === 'INITIATED') {
              return 'PENDING';
            }
            
            // Failed variations
            if (normalizedStatus === 'ERROR' || normalizedStatus === 'CANCELLED' || 
                normalizedStatus === 'REJECTED' || normalizedStatus === 'DECLINED' ||
                normalizedStatus === 'TIMEOUT' || normalizedStatus === 'ABORTED') {
              return 'FAILED';
            }
          }
          
          // For transactions that exist in the system, assume they're completed unless explicitly pending/failed
          // If a transaction has a balance after, it likely went through
          if (rawTx?.balanceAfter !== undefined && rawTx.balanceAfter !== null) {
            console.log('Transaction has balanceAfter, assuming COMPLETED');
            return 'COMPLETED';
          }
          
          // Check transaction age - if it's older than 1 hour and has no explicit status, assume completed
          const createdDate = new Date(rawTx?.createdAt || rawTx?.date || Date.now());
          const now = new Date();
          const diffMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60);
          
          console.log('Transaction age in minutes:', diffMinutes);
          
          if (diffMinutes > 60) { // Older than 1 hour
            console.log('Old transaction, assuming COMPLETED');
            return 'COMPLETED';
          }
          
          // Default to PENDING only for very recent transactions with no clear status
          console.log('Defaulting to PENDING for recent transaction with unclear status');
          return 'PENDING';
        };

        // Validate and process transactions with enhanced status handling
        const validTransactions: Transaction[] = processedTransactions.slice(0, 5).map((tx, index) => ({
          id: Number(tx.id) || index,
          referenceNumber: tx.referenceNumber || tx.reference || `REF-${Date.now()}-${index}`,
          amount: Number(tx.amount) || 0,
          transactionType: normalizeTransactionType(tx.transactionType || tx.type),
          transactionDirection: (tx.transactionDirection || tx.direction || 'DEBIT') as 'CREDIT' | 'DEBIT',
          description: tx.description || 'Transaction',
          status: normalizeTransactionStatus(tx.status, tx), // Enhanced status handling
          balanceAfter: Number(tx.balanceAfter) || 0,
          createdAt: tx.createdAt || tx.date || new Date().toISOString(),
          transferReference: tx.transferReference,
          account: {
            accountNumber: tx.accountNumber || tx.account?.accountNumber || 'N/A',
            accountType: tx.account?.accountType || 'CHECKING'
          }
        }));

        setTransactions(validTransactions);
        console.log('Dashboard: Final transactions with enhanced status:', validTransactions);

      } catch (transactionError) {
        console.error('Dashboard: Error fetching transactions:', transactionError);
        setTransactions([]);
      }

    } catch (error: any) {
      console.error('Dashboard: Error fetching data:', error);
      
      let errorMessage = 'Failed to fetch account data';
      
      if (error?.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      showMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log('Dashboard: Manual refresh triggered');
    fetchData(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Try Again
            </button>
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show Debug Info
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700">
                <p>User: {user?.email}</p>
                <p>Role: {user?.role}</p>
                <p>Error: {error}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Message Bar */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transition-all ${
          messageType === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          <div className="flex justify-between items-center">
            <span>{message}</span>
            <button 
              onClick={() => setMessage('')} 
              className="ml-2 text-white hover:text-gray-200 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's your account overview</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all"
          >
            {showBalance ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
            {showBalance ? 'Hide' : 'Show'} Balance
          </button>
        </div>
      </div>

      {/* Account Summary Card - Grey and Emerald Theme */}
      <div className="bg-gradient-to-r from-gray-700 to-emerald-600 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-200 text-sm uppercase tracking-wide">Total Balance</p>
            <p className="text-4xl font-bold mt-2">
              {showBalance ? `KES ${totalBalance.toLocaleString()}` : 'KES ••••••'}
            </p>
            <p className="text-gray-300 mt-2">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <TrendingUp size={48} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-300">Dashboard Overview</p>
          </div>
        </div>
      </div>

      {/* Account Cards - Grey and Emerald Theme */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                    {account.accountType} Account
                  </p>
                  <p className="text-lg font-semibold text-gray-800 font-mono">
                    ****{account.accountNumber.slice(-4)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  account.accountType === 'SAVINGS' ? 'bg-emerald-100 text-emerald-600' :
                  account.accountType === 'CHECKING' ? 'bg-gray-100 text-gray-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  <CreditCard size={24} />
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600 text-sm">Available Balance</p>
                <p className="text-2xl font-bold text-gray-800 font-mono">
                  {showBalance ? `KES ${account.balance.toLocaleString()}` : 'KES ••••••'}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className={`flex items-center ${account.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${account.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {/* Fixed transaction count display */}
                  <span className="text-gray-500">
                    {account.transactionCount || 0} transactions
                  </span>
                </div>
                
                {account.lastTransactionDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last activity: {new Date(account.lastTransactionDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <CreditCard size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Accounts Found</h3>
          <p className="text-gray-600 mb-4">
            {error ? 'There was an error loading your accounts.' : 'You don\'t have any accounts yet.'}
          </p>
          <button
            onClick={handleRefresh}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            {error ? 'Retry Loading' : 'Refresh Data'}
          </button>
        </div>
      )}

      {/* Quick Actions - Grey and Emerald Theme */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTransferModal(true)}
            disabled={accounts.length === 0}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-emerald-500 rounded-full text-white group-hover:scale-110 transition-transform">
              <Send size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700 mt-3">Transfer Money</span>
          </button>
          
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={accounts.length === 0}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-red-500 rounded-full text-white group-hover:scale-110 transition-transform">
              <MinusCircle size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700 mt-3">Withdraw</span>
          </button>
          
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all group"
            >
              <div className="p-3 bg-emerald-500 rounded-full text-white group-hover:scale-110 transition-transform">
                <PlusCircle size={24} />
              </div>
              <span className="text-sm font-semibold text-gray-700 mt-3">Deposit</span>
            </button>
          )}
          
          <button
            onClick={() => navigate('/transactions')}
            className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all group"
          >
            <div className="p-3 bg-gray-500 rounded-full text-white group-hover:scale-110 transition-transform">
              <History size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700 mt-3">Transaction History</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions - Enhanced Status Display */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
          <button 
            onClick={() => navigate('/transactions')}
            className="text-emerald-500 hover:text-emerald-700 font-medium transition-colors flex items-center"
          >
            View All 
            <ArrowUpDown size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${
                  tx.transactionType === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-600' :
                  tx.transactionType === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {tx.transactionType === 'DEPOSIT' ? <PlusCircle size={20} /> :
                   tx.transactionType === 'WITHDRAWAL' ? <MinusCircle size={20} /> :
                   <ArrowUpDown size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{tx.description}</p>
                  <p className="text-sm text-gray-600 font-mono">{tx.referenceNumber}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-lg font-mono ${
                  tx.transactionDirection === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {tx.transactionDirection === 'CREDIT' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-mono">
                  Balance: KES {tx.balanceAfter.toLocaleString()}
                </p>
                {/* Enhanced status display with better colors */}
                <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                  tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <History size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No recent transactions</p>
              <p className="text-sm">Your transaction history will appear here</p>
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