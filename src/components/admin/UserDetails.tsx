import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  TrendingDown, 
  TrendingUp,
  Download,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { userApi, transactionApi } from '../../services/api';
import { MessageBar } from '../common/MessageBar';

interface UserSummary {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Account {
  id: number;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING';
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: UserSummary;
  totalTransactions?: number;
  lastTransactionAmount?: number;
  lastTransactionDate?: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
  isEnabled: boolean;
  accounts?: Account[];
  totalAccounts: number;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: number;
  referenceNumber: string;
  amount: number;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  transactionDirection: 'CREDIT' | 'DEBIT';
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  balanceAfter: number;
  createdAt: string;
  transferReference?: string;
  accountNumber: string;
  accountType: string;
  
}

interface TransactionHistoryResponse {
  transactionDetails: Transaction[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const UserDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);

  const LOW_BALANCE_THRESHOLD = 100;

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchUserTransactions();
    }
  }, [userId, currentPage]);

  const fetchUserDetails = async () => {
    if (!userId) {
      showMessage('Invalid user ID', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const userData: User = await userApi.getUserById(parseInt(userId));
      console.log('Raw API response:', JSON.stringify(userData, null, 2));
      if (!userData) {
        throw new Error('No user data returned from API');
      }
      // Clean accounts array
      const cleanedUserData = {
        ...userData,
        accounts: Array.isArray(userData.accounts)
          ? userData.accounts.filter(account => {
              if (!account || !account.accountNumber) {
                console.warn('Invalid account detected:', account);
                return false;
              }
              return true;
            })
          : [],
        totalAccounts: Array.isArray(userData.accounts)
          ? userData.accounts.filter(account => account && account.accountNumber).length
          : 0
      };
      console.log('Cleaned user data:', JSON.stringify(cleanedUserData, null, 2));
      setUser(cleanedUserData);
    } catch (error: any) {
      console.error('Failed to fetch user details:', error);
      showMessage('Failed to fetch user details: ' + error.message, 'error');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTransactions = async () => {
  if (!userId) return;
  
  setIsLoadingTransactions(true);
  try {
    const params = {
      page: currentPage.toString(),
      size: '10',
      sortBy: 'createdAt',
      sortDirection: 'DESC'  // Changed from sortDir to sortDirection to match backend
    };
    
    console.log('Fetching user transactions with params:', params);
    
    // Use the new user-specific endpoint
    const response: TransactionHistoryResponse = await transactionApi.getUserTransactions(
      parseInt(userId), 
      params
    );
    
    console.log('User transaction API response:', JSON.stringify(response, null, 2));
    
    setTransactions(response.transactionDetails || []);
    setTotalPages(response.totalPages || 1);
  } catch (error: any) {
    console.error('Failed to fetch user transactions:', error);
    showMessage('Failed to fetch transaction history: ' + error.message, 'error');
    setTransactions([]);
  } finally {
    setIsLoadingTransactions(false);
  }
};

  const getTotalBalance = (): number => {
    if (!user?.accounts || !Array.isArray(user.accounts)) return 0;
    return user.accounts
      .filter(account => account && typeof account.balance === 'number')
      .reduce((sum, acc) => sum + acc.balance, 0) || 0;
  };

  const exportUserReport = () => {
    if (!user) return;

    const totalBalance = getTotalBalance();
    const validAccounts = user.accounts?.filter(account => account?.accountNumber) || [];
    
    const content = `
SECUREBANK - USER DETAILED REPORT
User Profile & Transaction History
Generated: ${new Date().toLocaleString()}

${'='.repeat(60)}
USER PROFILE
${'='.repeat(60)}

User ID: ${user.id}
Full Name: ${user.fullName || `${user.firstName} ${user.lastName}`}
Email: ${user.email}
Phone Number: ${user.phoneNumber || 'Not provided'}
Address: ${user.address || 'Not provided'}
Role: ${user.role}
Account Status: ${user.isEnabled ? 'Active' : 'Inactive'}
Registration Date: ${new Date(user.createdAt).toLocaleString()}
Profile Updated: ${new Date(user.updatedAt).toLocaleString()}

${'='.repeat(60)}
ACCOUNT INFORMATION
${'='.repeat(60)}

Total Accounts: ${validAccounts.length}
Combined Balance: KES ${totalBalance.toLocaleString()}
${totalBalance < LOW_BALANCE_THRESHOLD ? '⚠ WARNING: Total balance below KES 100 threshold' : ''}

Account Details:
${validAccounts.map(account => `
- Account Number: ${account.accountNumber}
  Account Type: ${account.accountType}
  Balance: KES ${account.balance.toLocaleString()}
  Status: ${account.isActive ? 'Active' : 'Inactive'}
  ${account.balance < LOW_BALANCE_THRESHOLD ? '  ⚠ Low Balance Warning' : ''}
  Created: ${new Date(account.createdAt).toLocaleString()}
  ${account.updatedAt ? `Updated: ${new Date(account.updatedAt).toLocaleString()}` : ''}
`).join('') || 'No accounts found'}

${'='.repeat(60)}
RECENT TRANSACTION HISTORY
${'='.repeat(60)}

${transactions.map(tx => `
Transaction ID: ${tx.id}
Reference: ${tx.referenceNumber}
Date: ${new Date(tx.createdAt).toLocaleString()}
Type: ${tx.transactionType} (${tx.transactionDirection})
Amount: KES ${tx.amount.toLocaleString()}
Account: ${tx.accountNumber} (${tx.accountType})
Description: ${tx.description}
Status: ${tx.status}
Balance After: KES ${tx.balanceAfter.toLocaleString()}
${tx.transferReference ? `Transfer Reference: ${tx.transferReference}` : ''}
${'-'.repeat(40)}
`).join('') || 'No transactions found'}

${'='.repeat(60)}
SUMMARY STATISTICS
Total Transactions Shown: ${transactions.length}
Account Types: ${validAccounts.map(a => a.accountType).join(', ') || 'None'}
Risk Level: ${totalBalance < LOW_BALANCE_THRESHOLD ? 'HIGH (Low Balance)' : 'NORMAL'}

Report Generated: ${new Date().toLocaleString()}
SecureBank User Management System
${'='.repeat(60)}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_${user.id}_report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('User report exported successfully', 'success');
  };

  const formatAccountNumber = (accountNumber: string): string => {
    if (!showAccountNumbers) {
      return `****${accountNumber.slice(-4)}`;
    }
    return accountNumber;
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.transactionDirection === 'CREDIT') {
      return <TrendingUp className="text-green-500" size={20} />;
    }
    return <TrendingDown className="text-red-500" size={20} />;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !Array.isArray(user.accounts)) {
    console.error('Invalid user data:', user);
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">User Data Unavailable</h1>
        <p className="text-gray-600 mb-4">Unable to load user account information.</p>
        <button
          onClick={() => navigate('/users')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center mx-auto"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to User Management
        </button>
      </div>
    );
  }

  const totalBalance = getTotalBalance();
  const isLowBalance = totalBalance < LOW_BALANCE_THRESHOLD;

  return (
    <div className="p-6 space-y-6">
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <User size={32} className="mr-3 text-blue-600" />
            User Details
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAccountNumbers(!showAccountNumbers)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all flex items-center"
          >
            {showAccountNumbers ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
            {showAccountNumbers ? 'Hide' : 'Show'} Account Numbers
          </button>
          <button 
            onClick={exportUserReport}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${isLowBalance ? 'border-l-4 border-red-400' : ''}`}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center text-white">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold mr-4">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user.fullName || `${user.firstName} ${user.lastName}`}
                {isLowBalance && <AlertTriangle size={20} className="inline ml-2 text-yellow-300" />}
              </h2>
              <p className="text-blue-100">User ID: #{user.id}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-3 text-gray-400" />
                <span>{user.email}</span>
              </div>
              {user.phoneNumber ? (
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-3 text-gray-400" />
                  <span>{user.phoneNumber}</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <Phone size={16} className="mr-3" />
                  <span className="italic">No phone number provided</span>
                </div>
              )}
              {user.address ? (
                <div className="flex items-start text-gray-600">
                  <MapPin size={16} className="mr-3 text-gray-400 mt-0.5" />
                  <span>{user.address}</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <MapPin size={16} className="mr-3" />
                  <span className="italic">No address provided</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Status</h3>
              <div className="flex items-center">
                <Shield size={16} className="mr-3 text-gray-400" />
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'ADMIN' ? '👑 Administrator' : '👤 User'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${user.isEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  user.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-3 text-gray-400" />
                <div>
                  <div className="text-sm">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">Updated: {new Date(user.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Financial Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 flex items-center">
                  KES {totalBalance.toLocaleString()}
                  {isLowBalance && <AlertTriangle size={20} className="ml-2 text-red-500" />}
                </div>
                <div className="text-sm text-gray-600">Total Balance</div>
                {isLowBalance && (
                  <div className="text-xs text-red-600 mt-1">⚠ Below KES 100 threshold</div>
                )}
              </div>
              <div className="text-gray-600">
                <div className="flex justify-between">
                  <span>Total Accounts:</span>
                  <span className="font-semibold">{user.totalAccounts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user.accounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <CreditCard size={20} className="mr-2 text-blue-600" />
              Bank Accounts ({user.accounts.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.accounts.map((account, index) => (
                <div 
                  key={account.id || index} 
                  className={`border rounded-lg p-4 ${
                    account.balance < LOW_BALANCE_THRESHOLD ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {formatAccountNumber(account.accountNumber)}
                      </div>
                      <div className="text-sm text-gray-600">{account.accountType} Account</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${
                    account.balance < LOW_BALANCE_THRESHOLD ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    KES {account.balance.toLocaleString()}
                  </div>
                  {account.balance < LOW_BALANCE_THRESHOLD && (
                    <div className="text-xs text-red-600 mt-1">⚠ Low balance warning</div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Created: {new Date(account.createdAt).toLocaleDateString()}
                  </div>
                  {account.updatedAt && (
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(account.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Recent Transaction History</h3>
        </div>
        
        {isLoadingTransactions ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {transaction.referenceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction)}
                        <span className="ml-2 text-sm text-gray-900">
                          {transaction.transactionType}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.transactionDirection}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <span className={
                        transaction.transactionDirection === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }>
                        {transaction.transactionDirection === 'CREDIT' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatAccountNumber(transaction.accountNumber)}</div>
                      <div className="text-xs text-gray-500">{transaction.accountType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      KES {transaction.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No transaction history found</p>
            <p className="text-sm">Transactions will appear here once the user starts banking</p>
          </div>
        )}

        {transactions.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};