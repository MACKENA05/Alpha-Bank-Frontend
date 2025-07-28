import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertCircle, TrendingUp, CreditCard, PlusCircle, RefreshCw, AlertTriangle, UserCheck, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { accountApi, transactionApi, userApi } from '../../services/api';
import { MessageBar } from '../common/MessageBar';
import { DepositModal } from '../transactions/DepositModal';
import { useAuth } from '../../context/AuthContext';

interface AdminStats {
  totalSystemBalance: number;
  totalAdminAccounts: number;
  totalSystemUsers: number;
  totalAdminUsers: number;
  pendingVerifications: number;
}

interface LoadingState {
  dashboard: boolean;
  refresh: boolean;
}

interface ErrorState {
  stats: boolean;
  transactions: boolean;
  users: boolean;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [systemTransactions, setSystemTransactions] = useState<any[]>([]);
  const [adminActivity, setAdminActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ dashboard: true, refresh: false });
  const [errors, setErrors] = useState<ErrorState>({
    stats: false,
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
      stats: false,
      transactions: false,
      users: false
    });
  };

  useEffect(() => {
    fetchAdminDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processUserData = (response: any) => {
    let users = [];
    let totalUsers = 0;
    let pendingVerifications = 0;
    let adminUsers = 0;
    
    // Comprehensive response structure detection
    if (response?.data?.users && Array.isArray(response.data.users)) {
      users = response.data.users;
      totalUsers = response.data.totalUsers || response.data.total || users.length;
      pendingVerifications = response.data.pendingVerifications || 0;
    } else if (response?.users && Array.isArray(response.users)) {
      users = response.users;
      totalUsers = response.totalUsers || response.total || users.length;
      pendingVerifications = response.pendingVerifications || 0;
    } else if (response?.content && Array.isArray(response.content)) {
      // Spring Boot pagination format
      users = response.content;
      totalUsers = response.totalElements || users.length;
      pendingVerifications = 0;
    } else if (response?.data?.content && Array.isArray(response.data.content)) {
      users = response.data.content;
      totalUsers = response.data.totalElements || users.length;
      pendingVerifications = 0;
    } else if (Array.isArray(response)) {
      users = response;
      totalUsers = users.length;
    } else if (response?.data && Array.isArray(response.data)) {
      users = response.data;
      totalUsers = users.length;
    } else {
      // Extract counts directly from response
      totalUsers = response?.totalUsers || 
                  response?.data?.totalUsers || 
                  response?.total || 
                  response?.data?.total ||
                  response?.totalElements ||
                  response?.data?.totalElements || 0;
      pendingVerifications = response?.pendingVerifications || 
                           response?.data?.pendingVerifications || 0;
      adminUsers = response?.totalAdminUsers || 
                  response?.data?.totalAdminUsers || 0;
    }

    // Process users array if available
    if (users.length > 0) {
      // Count admin users
      adminUsers = users.filter((u: any) => {
        const possibleRoles = [
          u.role,
          u.userRole, 
          u.type,
          u.accountType,
          u.userType
        ].filter(Boolean);
        
        return possibleRoles.some(role => 
          String(role).toUpperCase() === 'ADMIN' || 
          String(role).toUpperCase() === 'ADMINISTRATOR'
        );
      }).length;

      // Count pending verifications if not already provided
      if (!pendingVerifications) {
        pendingVerifications = users.filter((u: any) => {
          const possibleStatuses = [
            u.status,
            u.verificationStatus,
            u.accountStatus,
            u.userStatus
          ].filter(Boolean);
          
          return possibleStatuses.some(status =>
            String(status).toUpperCase() === 'PENDING' || 
            String(status).toUpperCase() === 'UNVERIFIED' ||
            String(status).toUpperCase() === 'AWAITING_VERIFICATION'
          ) || u.isVerified === false;
        }).length;
      }

      // Update total count if needed
      if (!totalUsers || totalUsers < users.length) {
        totalUsers = users.length;
      }
    }

    return {
      totalSystemUsers: totalUsers,
      totalAdminUsers: adminUsers,
      pendingVerifications: pendingVerifications
    };
  };

  const fetchAdminDashboardData = async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setLoading(prev => ({ ...prev, refresh: true }));
    } else {
      setLoading({ dashboard: true, refresh: false });
    }
    
    resetErrors();
    
    try {
      let adminStatsData: AdminStats = {
        totalSystemBalance: 0,
        totalAdminAccounts: 0,
        totalSystemUsers: 0,
        totalAdminUsers: 0,
        pendingVerifications: 0
      };

      // Fetch system balance
      try {
        const balanceResponse = await accountApi.getTotalSystemBalance();
        
        if (balanceResponse?.data) {
          adminStatsData.totalSystemBalance = balanceResponse.data.totalBalance?.totalSystemBalance || 
                                            balanceResponse.data.totalSystemBalance || 0;
          adminStatsData.totalAdminAccounts = balanceResponse.data.adminAccounts || 0;
        } else {
          adminStatsData.totalSystemBalance = balanceResponse?.totalSystemBalance || 
                                            balanceResponse?.totalBalance || 0;
          adminStatsData.totalAdminAccounts = balanceResponse?.adminAccounts || 0;
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, stats: true }));
      }

      // Fetch user statistics
      try {
        let userResponse;
        let attemptCount = 0;
        
        const apiAttempts = [
          () => userApi.getAllUsers({ role: 'ALL' }),
          () => userApi.getAllUsers({}),
          () => userApi.getAllUsers(),
          () => userApi.getAllUsers({ page: 0, size: 1000 }),
          () => (userApi as any).getUserStats ? (userApi as any).getUserStats() : Promise.reject(new Error('getUserStats not available'))
        ];

        // Try each API call until one succeeds
        for (const attempt of apiAttempts) {
          try {
            attemptCount++;
            userResponse = await attempt();
            break;
          } catch (error: any) {
            if (attemptCount === apiAttempts.length) {
              throw error;
            }
          }
        }

        if (userResponse) {
          const userData = processUserData(userResponse);
          adminStatsData.totalSystemUsers = userData.totalSystemUsers;
          adminStatsData.totalAdminUsers = userData.totalAdminUsers;
          adminStatsData.pendingVerifications = userData.pendingVerifications;
        } else {
          throw new Error('No user response received from any API attempt');
        }
        
      } catch (error) {
        setErrors(prev => ({ ...prev, users: true }));
        adminStatsData.totalSystemUsers = 0;
        adminStatsData.totalAdminUsers = 0;
        adminStatsData.pendingVerifications = 0;
      }

      // Fetch transaction data
      try {
        const transactionResponse = await transactionApi.getAllTransactions({ 
          size: 20,
          adminView: true,
          includeSystemTransactions: true 
        });
        
        let transactions = [];
        if (transactionResponse?.transactionDetails) {
          transactions = transactionResponse.transactionDetails;
        } else if (transactionResponse?.data?.transactions) {
          transactions = transactionResponse.data.transactions;
        } else if (transactionResponse?.transactions) {
          transactions = transactionResponse.transactions;
        }

        // Filter for admin-relevant transactions
        const adminRelevantTransactions = transactions.filter((tx: any) => 
          tx.amount >= 10000 || 
          tx.transactionType === 'DEPOSIT' || 
          tx.status === 'FAILED' || 
          tx.flagged === true
        ).slice(0, 10);

        setSystemTransactions(adminRelevantTransactions);

        // Create admin activity log
        const recentActivity = transactions.slice(0, 5).map((tx: any) => ({
          id: tx.id,
          action: `${tx.transactionType} transaction`,
          details: `${tx.transactionDirection === 'CREDIT' ? 'Received' : 'Sent'} KES ${Number(tx.amount || 0).toLocaleString()}`,
          timestamp: tx.createdAt,
          status: tx.status,
          severity: tx.status === 'FAILED' ? 'high' : (tx.amount >= 50000 ? 'medium' : 'low')
        }));

        setAdminActivity(recentActivity);
        
      } catch (error) {
        setErrors(prev => ({ ...prev, transactions: true }));
      }

      // Update state with final stats
      setAdminStats(adminStatsData);
      setLastFetchTime(new Date());

      // Show appropriate message
      const errorCount = Object.values(errors).filter(Boolean).length;
      if (errorCount === 0) {
        if (isRefresh) {
          showMessage('Admin dashboard refreshed successfully!', 'success');
        }
      } else {
        showMessage(`Partial admin data loaded. ${errorCount} service(s) may be experiencing issues.`, 'error');
      }

    } catch (error: any) {
      showMessage('Critical error loading admin dashboard: ' + (error.message || 'Unknown error'), 'error');
      setErrors({
        stats: true,
        transactions: true,
        users: true
      });
    } finally {
      setLoading({ dashboard: false, refresh: false });
    }
  };

  const handleRetry = async () => {
    await fetchAdminDashboardData(true);
  };

  if (loading.dashboard) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Admin Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching system administration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />

      {/* Admin Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Shield size={40} className="text-gray-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">System Administration</h1>
              <p className="text-gray-600">Welcome back, Administrator {user?.firstName}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {lastFetchTime && (
            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
              Updated: {lastFetchTime.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRetry}
            disabled={loading.refresh}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={16} className={`mr-2 ${loading.refresh ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowDepositModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all flex items-center shadow-sm"
          >
            <PlusCircle size={16} className="mr-2" />
            System Deposit
          </button>
        </div>
      </div>

      {/* Error Summary for Admin */}
      {Object.values(errors).some(error => error) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-red-600 mr-2" />
            <div>
              <h3 className="text-red-800 font-semibold">System Service Alert</h3>
              <p className="text-red-700 text-sm">
                Administrator attention required - some services are experiencing issues:
              </p>
              <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                {errors.stats && <li>System statistics service unavailable</li>}
                {errors.users && <li>User management service unavailable</li>}
                {errors.transactions && <li>Transaction monitoring service unavailable</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Admin System Statistics Cards */}
      {adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 rounded-xl shadow-lg transition-opacity ${errors.stats ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm uppercase tracking-wide flex items-center">
                  System Balance
                  {errors.stats && <AlertCircle size={12} className="ml-1" />}
                </p>
                <p className="text-3xl font-bold">
                  KES {adminStats.totalSystemBalance.toLocaleString()}
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  Total system liquidity
                </p>
              </div>
              <Database size={48} className="text-gray-300" />
            </div>
          </div>
          
          <div className={`bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg transition-opacity ${errors.users ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm uppercase tracking-wide flex items-center">
                  System Users
                  {errors.users && <AlertCircle size={12} className="ml-1" />}
                </p>
                <p className="text-3xl font-bold">{adminStats.totalSystemUsers}</p>
                <p className="text-emerald-300 text-sm mt-1">
                  Registered users
                </p>
              </div>
              <Users size={48} className="text-emerald-300" />
            </div>
          </div>
          
          <div className={`bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6 rounded-xl shadow-lg transition-opacity ${errors.users ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm uppercase tracking-wide flex items-center">
                  Administrators
                  {errors.users && <AlertCircle size={12} className="ml-1" />}
                </p>
                <p className="text-3xl font-bold">{adminStats.totalAdminUsers}</p>
                <p className="text-gray-300 text-sm mt-1">
                  System administrators
                </p>
              </div>
              <Shield size={48} className="text-gray-300" />
            </div>
          </div>
          
          <div className={`bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 rounded-xl shadow-lg transition-opacity ${errors.users ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm uppercase tracking-wide flex items-center">
                  Pending Actions
                  {errors.users && <AlertCircle size={12} className="ml-1" />}
                </p>
                <p className="text-3xl font-bold">{adminStats.pendingVerifications}</p>
                <p className="text-amber-300 text-sm mt-1">
                  Require admin review
                </p>
              </div>
              <UserCheck size={48} className="text-amber-300" />
            </div>
          </div>
        </div>
      )}

      {/* Admin Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`bg-white p-6 rounded-xl shadow-lg transition-opacity ${errors.transactions ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent System Activity</h3>
            {errors.transactions && <AlertCircle size={20} className="text-red-500" />}
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {adminActivity.length > 0 && !errors.transactions ? (
              adminActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center flex-1">
                    <div className={`w-2 h-8 rounded-full mr-3 ${
                      activity.severity === 'high' ? 'bg-red-500' :
                      activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}></div>
                    <div>
                      <p className="font-semibold text-gray-800">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    activity.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    activity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                <p>{errors.transactions ? 'Activity monitoring unavailable' : 'No recent activity'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Value Transactions Monitoring */}
      <div className={`bg-white p-6 rounded-xl shadow-lg transition-opacity ${errors.transactions ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">High-Value Transaction Monitoring</h3>
          {errors.transactions && <AlertCircle size={20} className="text-red-500" />}
        </div>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {systemTransactions.length > 0 && !errors.transactions ? (
            systemTransactions.map((tx, index) => (
              <div key={tx.id || index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-gray-400">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{tx.description || 'System Transaction'}</p>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono">{tx.referenceNumber}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Account: ****{tx.account?.accountNumber?.slice(-4)} | 
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                    <p className={`font-bold text-lg font-mono ${
                      tx.transactionDirection === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {tx.transactionDirection === 'CREDIT' ? '+' : '-'}KES {Number(tx.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  {tx.flagged && (
                    <div className="mt-2 flex items-center text-red-600">
                      <AlertTriangle size={16} className="mr-1" />
                      <span className="text-xs font-medium">Flagged for Review</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield size={48} className="mx-auto mb-4 text-gray-300" />
              <p>{errors.transactions ? 'Transaction monitoring unavailable' : 'No high-value transactions to monitor'}</p>
            </div>
          )}
        </div>
      </div>

      {/* System Analytics Chart */}
      {systemTransactions.length > 0 && !errors.transactions && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">System Transaction Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={systemTransactions.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="referenceNumber" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `KES ${Number(value).toLocaleString()}`,
                  'Amount'
                ]}
                labelFormatter={(label) => `Reference: ${label}`}
              />
              <Bar dataKey="amount" fill="#374151" name="Transaction Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Admin Deposit Modal */}
      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={() => {
          fetchAdminDashboardData(true);
          showMessage('System deposit completed successfully!', 'success');
        }}
        showMessage={showMessage}
      />
    </div>
  );
};