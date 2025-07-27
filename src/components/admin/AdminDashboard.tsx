import React, { useState, useEffect } from 'react';
import { DollarSign, Users, AlertCircle, TrendingUp, CreditCard, PlusCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { accountApi, transactionApi, userApi } from '../../services/api';
import { MessageBar } from '../common/MessageBar';
import { DepositModal } from '../transactions/DepositModal';

export const AdminDashboard: React.FC = () => {
  const [systemStats, setSystemStats] = useState<any>(null);
  const [transactionStats, setTransactionStats] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showDepositModal, setShowDepositModal] = useState(false);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [totalBalanceRes, lowBalanceRes, transactionsRes, usersRes] = await Promise.all([
        accountApi.getTotalSystemBalance(),
        accountApi.getLowBalanceAccounts(100),
        transactionApi.getAllTransactions({ size: 10 }),
        userApi.getAllUsers({ size: 10 })
      ]);

      setSystemStats({
        totalBalance: totalBalanceRes.totalBalance || 0,
        totalAccounts: totalBalanceRes.totalAccounts || 0,
        lowBalanceAccounts: lowBalanceRes.totalLowBalanceAccounts || 0,
        totalUsers: usersRes.totalUsers || 0
      });

      // Process transaction statistics
      const transactions = transactionsRes.transactions || [];
      setRecentTransactions(transactions.slice(0, 5));

      const transactionTypeData = transactions.reduce((acc: any, tx: any) => {
        acc[tx.transactionType] = (acc[tx.transactionType] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(transactionTypeData).map(([type, count]) => ({
        name: type,
        value: count as number,
        amount: transactions
          .filter((tx: any) => tx.transactionType === type)
          .reduce((sum: number, tx: any) => sum + tx.amount, 0)
      }));

      setTransactionStats(chartData);
    } catch (error: any) {
      showMessage('Failed to fetch dashboard data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">🛡️ Admin Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDepositModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center"
          >
            <PlusCircle size={16} className="mr-2" />
            Deposit Money
          </button>
        </div>
      </div>

      {/* System Statistics Cards */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm uppercase tracking-wide">Total System Balance</p>
                <p className="text-3xl font-bold">KES {systemStats.totalBalance.toLocaleString()}</p>
                <p className="text-blue-200 text-sm mt-1">+5.2% from last month</p>
              </div>
              <DollarSign size={48} className="text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm uppercase tracking-wide">Total Accounts</p>
                <p className="text-3xl font-bold">{systemStats.totalAccounts}</p>
                <p className="text-green-200 text-sm mt-1">Active accounts</p>
              </div>
              <CreditCard size={48} className="text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold">{systemStats.totalUsers}</p>
                <p className="text-purple-200 text-sm mt-1">Registered users</p>
              </div>
              <Users size={48} className="text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm uppercase tracking-wide">Low Balance Alerts</p>
                <p className="text-3xl font-bold">{systemStats.lowBalanceAccounts}</p>
                <p className="text-red-200 text-sm mt-1">Below KES 100</p>
              </div>
              <AlertCircle size={48} className="text-red-200" />
            </div>
          </div>
        </div>
      )}

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Distribution</h3>
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
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent System Activity</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentTransactions.map((tx, index) => (
              <div key={tx.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{tx.description}</p>
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
                    {tx.transactionDirection === 'CREDIT' ? '+' : '-'}KES {tx.amount.toLocaleString()}
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
            {recentTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Volume Chart */}
      {transactionStats.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Volume by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'amount' ? `KES ${value.toLocaleString()}` : value,
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
          fetchDashboardData();
          showMessage('Deposit completed successfully!', 'success');
        }}
        showMessage={showMessage}
      />
    </div>
  );
};