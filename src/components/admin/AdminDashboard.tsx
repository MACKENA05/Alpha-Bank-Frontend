import React, { useState, useEffect } from 'react';
import { DollarSign, Users, AlertCircle, TrendingUp, CreditCard, PlusCircle, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { accountApi, transactionApi, userApi } from '../../services/api';
import { MessageBar } from '../common/MessageBar';
import { DepositModal } from '../transactions/DepositModal';

interface SystemStats {
  totalBalance: number;
  totalAccounts: number;
  lowBalanceAccounts: number;
  totalUsers: number;
}

interface LoadingState {
  dashboard: boolean;
  refresh: boolean;
}

interface ErrorState {
  totalBalance: boolean;
  lowBalance: boolean;
  transactions: boolean;
  users: boolean;
}

export const AdminDashboard: React.FC = () => {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [transactionStats, setTransactionStats] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ dashboard: true, refresh: false });
  const [errors, setErrors] = useState<ErrorState>({
    totalBalance: false,
    lowBalance: false,
    transactions: false,
    users: false
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const resetErrors = () => {
    setErrors({
      totalBalance: false,
      lowBalance: false,
      transactions: false,
      users: false
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setLoading(prev => ({ ...prev, refresh: true }));
    } else {
      setLoading({ dashboard: true, refresh: false });
    }
    
    resetErrors();
    
    console.log('🛡️ Admin Dashboard: Starting data fetch...');
    
    try {
      // Initialize with safe default values
      let totalBalanceData = { totalBalance: 0, totalAccounts: 0 };
      let lowBalanceData: any = { totalLowBalanceAccounts: 0 };
      let transactionsData: any = { transactions: [] };
      let usersData: any = { totalUsers: 0 };

      // Enhanced API calls with better error handling
      const apiCalls = await Promise.allSettled([
        // 1. Fetch total balance with enhanced error handling
        accountApi.getTotalSystemBalance().then(response => {
          console.log('✅ Total balance response:', response);
          // Handle different response structures
          if (response.data) {
            // Response wrapped in ApiResponse
            const data = response.data;
            return {
              totalBalance: data.totalBalance?.totalSystemBalance || data.totalSystemBalance || data.totalBalance || 0,
              totalAccounts: data.totalAccounts || data.totalActiveAccounts || 0
            };
          } else if (response.totalBalance !== undefined || response.totalSystemBalance !== undefined) {
            // Direct response
            return {
              totalBalance: response.totalSystemBalance || response.totalBalance || 0,
              totalAccounts: response.totalActiveAccounts || response.totalAccounts || 0
            };
          }
          return { totalBalance: 0, totalAccounts: 0 };
        }),

        // 2. Fetch low balance accounts
        accountApi.getLowBalanceAccounts(100).then(response => {
          console.log('✅ Low balance response:', response);
          if (response.data) {
            return {
              totalLowBalanceAccounts: response.data.count || response.data.totalLowBalanceAccounts || 0,
              accounts: response.data.accounts || []
            };
          }
          return {
            totalLowBalanceAccounts: response.totalLowBalanceAccounts || response.count || 0,
            accounts: response.accounts || []
          };
        }),

        // 3. Fetch recent transactions
        transactionApi.getAllTransactions({ size: 10 }).then(response => {
          console.log('✅ Transactions response:', response);
          // Handle different response structures
          if (response.transactionDetails) {
            return { transactions: response.transactionDetails };
          } else if (response.data?.transactions) {
            return { transactions: response.data.transactions };
          } else if (response.transactions) {
            return { transactions: response.transactions };
          }
          return { transactions: [] };
        }),

        // 4. Fetch users
        userApi.getAllUsers({ size: 10 }).then(response => {
          console.log('✅ Users response:', response);
          return {
            totalUsers: response.totalUsers || response.data?.totalUsers || 0,
            users: response.users || response.data?.users || []
          };
        })
      ]);

      // Process results
      if (apiCalls[0].status === 'fulfilled') {
        totalBalanceData = apiCalls[0].value;
      } else {
        console.error('❌ Total balance failed:', apiCalls[0].reason);
        setErrors(prev => ({ ...prev, totalBalance: true }));
      }

      if (apiCalls[1].status === 'fulfilled') {
        lowBalanceData = apiCalls[1].value;
      } else {
        console.error('❌ Low balance failed:', apiCalls[1].reason);
        setErrors(prev => ({ ...prev, lowBalance: true }));
      }

      if (apiCalls[2].status === 'fulfilled') {
        transactionsData = apiCalls[2].value;
      } else {
        console.error('❌ Transactions failed:', apiCalls[2].reason);
        setErrors(prev => ({ ...prev, transactions: true }));
      }

      if (apiCalls[3].status === 'fulfilled') {
        usersData = apiCalls[3].value;
      } else {
        console.error('❌ Users failed:', apiCalls[3].reason);
        setErrors(prev => ({ ...prev, users: true }));
      }

      // Set system stats with safe defaults
      setSystemStats({
        totalBalance: Number(totalBalanceData.totalBalance) || 0,
        totalAccounts: Number(totalBalanceData.totalAccounts) || 0,
        lowBalanceAccounts: Number(lowBalanceData.totalLowBalanceAccounts) || 0,
        totalUsers: Number(usersData.totalUsers) || 0
      });

      // Process transaction statistics
      const transactions = transactionsData.transactions || [];
      setRecentTransactions(transactions.slice(0, 5));

      if (transactions.length > 0) {
        const transactionTypeData = transactions.reduce((acc: any, tx: any) => {
          const type = tx.transactionType || 'UNKNOWN';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(transactionTypeData).map(([type, count]) => ({
          name: type,
          value: count as number,
          amount: transactions
            .filter((tx: any) => tx.transactionType === type)
            .reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0)
        }));

        setTransactionStats(chartData);
      } else {
        setTransactionStats([]);
      }

      // Update last fetch time
      setLastFetchTime(new Date());

      // Show appropriate message
      const errorCount = Object.values(errors).filter(Boolean).length;
      const successCount = 4 - errorCount;

      if (errorCount === 0) {
        if (isRefresh) {
          showMessage('Dashboard refreshed successfully! All data loaded.', 'success');
        }
      } else if (successCount > 0) {
        showMessage(`Partial data loaded (${successCount}/4 sections). Some services may be unavailable.`, 'error');
      } else {
        showMessage('Unable to load dashboard data. Please check your connection and try again.', 'error');
      }

    } catch (error: any) {
      console.error('❌ Dashboard fetch failed completely:', error);
      showMessage('Critical error loading dashboard: ' + (error.message || 'Unknown error'), 'error');
      // Set all errors to true
      setErrors({
        totalBalance: true,
        lowBalance: true,
        transactions: true,
        users: true
      });
    } finally {
      setLoading({ dashboard: false, refresh: false });
    }
  };

  const handleRetry = async () => {
    await fetchDashboardData(true);
  };

  const getConnectionStatus = () => {
    const errorCount = Object.values(errors).filter(Boolean).length;
    if (errorCount === 0) return { color: 'green', text: 'All systems operational', icon: CheckCircle };
    if (errorCount <= 2) return { color: 'yellow', text: 'Partial service disruption', icon: AlertTriangle };
    return { color: 'red', text: 'Multiple service issues', icon: AlertCircle };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading.dashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching system data...</p>
        </div>
      </div>
    );
  }

  const connectionStatus = getConnectionStatus();

  return (
    <div className="p-6 space-y-6">
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />

      {/* Header with status indicator */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-800">🛡️ Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <connectionStatus.icon 
              size={20} 
              className={`text-${connectionStatus.color}-500`} 
            />
            <span className={`text-sm text-${connectionStatus.color}-600 font-medium`}>
              {connectionStatus.text}
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {lastFetchTime && (
            <span className="text-xs text-gray-500">
              Last updated: {lastFetchTime.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRetry}
            disabled={loading.refresh}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all flex items-center disabled:opacity-50"
          >
            <RefreshCw size={16} className={`mr-2 ${loading.refresh ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowDepositModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center"
          >
            <PlusCircle size={16} className="mr-2" />
            Deposit Money
          </button>
        </div>
      </div>

      {/* Error Summary */}
      {Object.values(errors).some(error => error) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-yellow-600 mr-2" />
            <div>
              <h3 className="text-yellow-800 font-semibold">Service Status Alert</h3>
              <p className="text-yellow-700 text-sm">
                Some services are currently unavailable:
              </p>
              <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
                {errors.totalBalance && <li>Balance & account data service</li>}
                {errors.lowBalance && <li>Low balance monitoring service</li>}
                {errors.transactions && <li>Transaction history service</li>}
                {errors.users && <li>User management service</li>}
              </ul>
              <p className="text-yellow-700 text-sm mt-2">
                Data shown below may be incomplete. Try refreshing or contact system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Statistics Cards */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg transition-opacity ${errors.totalBalance ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm uppercase tracking-wide flex items-center">
                  Total System Balance
                  {errors.totalBalance && <AlertCircle size={12} className="ml-1" />}
                </p>
                <p className="text-3xl font-bold">
                  KES {systemStats.totalBalance.toLocaleString()}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  {errors.totalBalance ? 'Service unavailable' : 'Active system balance'}
                </p>
              </div>
              <DollarSign size={48} className="text-blue-200" />
            </div>
          </div>
          
          <div className={`bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg transition-opacity ${errors.totalBalance ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm uppercase tracking-wide flex items-center">
                  Total Accounts
                  {errors.totalBalance && <AlertCircle size={12} className="ml-1" />}
                </p>
                <p className="text-3xl font-bold">{systemStats.totalAccounts}</p>
                <p className="text-green-200 text-sm mt-1">
                  {errors.totalBalance ? 'Service unavailable' : 'Registered accounts'}
                </p>
              </div>
              <CreditCard size={48} className="text-green-200" />
            </div>
          </div>
          
          <div className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg transition-opacity ${errors.users ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm uppercase tracking-wide flex items-center">
                  Total Users
                  {errors.users && <AlertCircle size={12} className="ml-1" />}
                </p>
                <p className="text-3xl font-bold">{systemStats.totalUsers}</p>
                <p className="text-purple-200 text-sm mt-1">
                  {errors.users ? 'Service unavailable' : 'Active users'}
                </p>
              </div>
              <Users size={48} className="text-purple-200" />
            </div>
          </div>
          
          <div className={`bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg transition-opacity ${errors.lowBalance ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm uppercase tracking-wide flex items-center">
                  Low Balance Alerts
                  {errors.lowBalance && <AlertCircle size={12} className="ml-1" />}
                </p>
                <p className="text-3xl font-bold">{systemStats.lowBalanceAccounts}</p>
                <p className="text-red-200 text-sm mt-1">
                  {errors.lowBalance ? 'Service unavailable' : 'Below KES 100'}
                </p>
              </div>
              <AlertCircle size={48} className="text-red-200" />
            </div>
          </div>
        </div>
      )}

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`bg-white p-6 rounded-xl shadow-lg transition-opacity ${errors.transactions ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Transaction Distribution</h3>
            {errors.transactions && <AlertCircle size={20} className="text-red-500" />}
          </div>
          {transactionStats.length > 0 && !errors.transactions ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} transactions`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
              <p>{errors.transactions ? 'Transaction service unavailable' : 'No transaction data available'}</p>
              {errors.transactions && (
                <button 
                  onClick={handleRetry}
                  className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
                >
                  Try refreshing
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`bg-white p-6 rounded-xl shadow-lg transition-opacity ${errors.transactions ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent System Activity</h3>
            {errors.transactions && <AlertCircle size={20} className="text-red-500" />}
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentTransactions.length > 0 && !errors.transactions ? (
              recentTransactions.map((tx, index) => (
                <div key={tx.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{tx.description || 'Transaction'}</p>
                    <p className="text-sm text-gray-600">{tx.transactionType} - {tx.referenceNumber}</p>
                    <p className="text-xs text-gray-500">
                      Account: ****{tx.account?.accountNumber?.slice(-4)} | 
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.transactionDirection === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.transactionDirection === 'CREDIT' ? '+' : '-'}KES {Number(tx.amount || 0).toLocaleString()}
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
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                <p>{errors.transactions ? 'Transaction service unavailable' : 'No recent transactions'}</p>
                {errors.transactions && (
                  <button 
                    onClick={handleRetry}
                    className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
                  >
                    Try refreshing
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Volume Chart */}
      {transactionStats.length > 0 && !errors.transactions && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Volume by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'amount' ? `KES ${Number(value).toLocaleString()}` : value,
                  name === 'amount' ? 'Total Amount' : 'Count'
                ]}
              />
              <Bar dataKey="value" fill="#8884d8" name="count" />
              <Bar dataKey="amount" fill="#82ca9d" name="amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Deposit Modal */}
      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={() => {
          fetchDashboardData(true);
          showMessage('Deposit completed successfully!', 'success');
        }}
        showMessage={showMessage}
      />
    </div>
  );
};