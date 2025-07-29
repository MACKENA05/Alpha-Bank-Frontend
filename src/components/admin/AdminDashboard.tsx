import React, { useState, useEffect } from 'react';
import { Shield, Users, TrendingUp, PlusCircle, UserCheck, Database } from 'lucide-react';
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

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [systemTransactions, setSystemTransactions] = useState<any[]>([]);
  const [adminActivity, setAdminActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showDepositModal, setShowDepositModal] = useState(false);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetchAdminDashboardData();
  }, []); 

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

  const fetchAdminDashboardData = async () => {
    setLoading(true);
    
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
        
        if (balanceResponse) {
          const responseData = balanceResponse.data || balanceResponse;
          adminStatsData.totalSystemBalance = responseData.totalBalance.totalSystemBalance || 0;
          adminStatsData.totalAdminAccounts = responseData.totalBalance.totalActiveAccounts || 0;
        }
      } catch (error) {
        console.error('Balance fetch error:', error);
        adminStatsData.totalSystemBalance = 0;
        adminStatsData.totalAdminAccounts = 0;
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
        }
        
      } catch (error) {
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
        console.error('Transaction fetch error:', error);
      }

      // Update state with final stats
      setAdminStats(adminStatsData);

    } catch (error: any) {
      console.error('Critical error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              <p className="text-gray-600">Welcome back, Admin {user?.firstName}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => setShowDepositModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all flex items-center shadow-sm"
          >
            <PlusCircle size={16} className="mr-2" />
            System Deposit
          </button>
        </div>
      </div>

      {/* Admin System Statistics Cards */}
      {adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm uppercase tracking-wide">
                  System Balance
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
          
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm uppercase tracking-wide">
                  System Users
                </p>
                <p className="text-3xl font-bold">{adminStats.totalSystemUsers}</p>
                <p className="text-emerald-300 text-sm mt-1">
                  Registered users
                </p>
              </div>
              <Users size={48} className="text-emerald-300" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm uppercase tracking-wide">
                  Administrators
                </p>
                <p className="text-3xl font-bold">{adminStats.totalAdminUsers}</p>
                <p className="text-gray-300 text-sm mt-1">
                  System administrators
                </p>
              </div>
              <Shield size={48} className="text-gray-300" />
            </div>
          </div>
        </div>
      )}

      {/* Admin Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent System Activity</h3>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {adminActivity.length > 0 ? (
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
                    'bg-green-100 text-green-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Value Transactions Monitoring */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">High-Value Transaction Monitoring</h3>
        </div>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {systemTransactions.length > 0 ? (
            systemTransactions.map((tx, index) => (
              <div key={tx.id || index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-gray-400">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{tx.description || 'System Transaction'}</p>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono">{tx.referenceNumber}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Account: ****{tx?.accountNumber?.slice(-4)} | 
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                    <p className={`font-bold text-lg font-mono ${
                      tx.transactionDirection === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {tx.transactionDirection === 'CREDIT' ? '+' : '-'}KES {Number(tx.amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No high-value transactions to monitor</p>
            </div>
          )}
        </div>
      </div>

      {/* System Analytics Chart */}
      {systemTransactions.length > 0 && (
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
          fetchAdminDashboardData();
          showMessage('System deposit completed successfully!', 'success');
        }}
        showMessage={showMessage}
      />
    </div>
  );
};