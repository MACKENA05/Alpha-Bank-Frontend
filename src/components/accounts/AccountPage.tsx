// Debug Version - Accounts Component with detailed logging
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle, 
  DollarSign,
  Activity,
  Lock,
  Unlock,
  MoreVertical
} from 'lucide-react';

// Import your existing API service
import { accountApi } from '../../services/api'; // Adjust the import path to match your project structure

// Interfaces matching your backend structure
interface User {
  id: number;
  email: string;
  role?: string;
}

interface Account {
  id: number | string;
  accountNumber: string;
  accountType: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');


  useEffect(() => {
    fetchAccounts();
  }, []);

  // Helper function to normalize isActive field
  const normalizeIsActive = (value: any): boolean => {
    // Handle different data types that might represent active status
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    
    // Default to false if unclear
    return false;
  };

  const fetchAccounts = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      console.log('Fetching accounts...');
      
      // Use your existing accountApi.getUserAccounts method
      const accountsResponse = await accountApi.getUserAccounts();

      let processedAccounts: any[] = [];

      // Handle different response structures from your backend
      if (accountsResponse) {
        if (Array.isArray(accountsResponse)) {
          processedAccounts = accountsResponse;
        } else if (accountsResponse.accounts && Array.isArray(accountsResponse.accounts)) {
          processedAccounts = accountsResponse.accounts;
        } else if (accountsResponse.data && Array.isArray(accountsResponse.data)) {
          processedAccounts = accountsResponse.data;
        } else if (accountsResponse.data && accountsResponse.data.accounts) {
          processedAccounts = accountsResponse.data.accounts;
        } else {
          console.warn('Unexpected response structure:', accountsResponse);
          processedAccounts = [];
        }
      } else {
        throw new Error('No response received from server');
      }

      // Normalize the accounts data
      const normalizedAccounts: Account[] = processedAccounts.map((account: any) => {
        // Check multiple possible field names for the active status
        let isActive = false;
        
        if (account.hasOwnProperty('isActive')) {
          isActive = normalizeIsActive(account.isActive);
        } else if (account.hasOwnProperty('active')) {
          isActive = normalizeIsActive(account.active);
        } else if (account.hasOwnProperty('is_active')) {
          isActive = normalizeIsActive(account.is_active);
        } else if (account.hasOwnProperty('status')) {
          // Handle status field (might be 'active'/'inactive' strings)
          if (typeof account.status === 'string') {
            isActive = account.status.toLowerCase() === 'active';
          } else {
            isActive = normalizeIsActive(account.status);
          }
        }

        return {
          id: account.id,
          accountNumber: account.accountNumber || account.account_number || '',
          accountType: account.accountType || account.account_type || 'UNKNOWN',
          balance: parseFloat(account.balance || '0'),
          isActive: isActive,
          createdAt: account.createdAt || account.created_at || new Date().toISOString(),
          updatedAt: account.updatedAt || account.updated_at || new Date().toISOString(),
          user: account.user
        };
      });

      setAccounts(normalizedAccounts);

    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      
      let errorMessage = 'Failed to fetch accounts';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAccounts(true);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SAVINGS':
        return 'from-emerald-500 to-emerald-600';
      case 'CHECKING':
        return 'from-blue-500 to-blue-600';
      case 'BUSINESS':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SAVINGS':
        return '💰';
      case 'CHECKING':
        return '🏦';
      case 'BUSINESS':
        return '🏢';
      default:
        return '💳';
    }
  };

  const filteredAccounts = accounts.filter(account => {
    if (filterType === 'all') return true;
    if (filterType === 'active') return account.isActive;
    if (filterType === 'inactive') return !account.isActive;
    return account.accountType.toLowerCase() === filterType.toLowerCase();
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Accounts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            💳 My Accounts
          </h1>
          <p className="text-gray-600 mt-1">View and monitor your bank accounts</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="savings">Savings</option>
            <option value="checking">Checking</option>
            <option value="business">Business</option>
          </select>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? '📋' : '⊞'}
          </button>
          
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all"
          >
            {showBalance ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
            {showBalance ? 'Hide' : 'Show'} Balance
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-full mr-4">
              <CreditCard size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{filteredAccounts.length}</p>
              <p className="text-sm text-gray-600">Total Accounts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <DollarSign size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {showBalance 
                  ? `KES ${filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}`
                  : 'KES ••••••'
                }
              </p>
              <p className="text-sm text-gray-600">Total Balance</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Activity size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {filteredAccounts.filter(acc => acc.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Active Accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Display */}
      {filteredAccounts.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredAccounts.map((account) => (
            <div 
              key={account.id} 
              className={`bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${
                viewMode === 'grid' ? 'p-6 hover:-translate-y-1' : 'p-4'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-8 bg-gradient-to-r ${getAccountTypeColor(account.accountType)} rounded text-white flex items-center justify-center text-sm font-bold mr-3`}>
                        {getAccountTypeIcon(account.accountType)}
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                          {account.accountType} Account
                        </p>
                        <p className="text-lg font-semibold text-gray-800 font-mono">
                          ****{account.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">Available Balance</p>
                    <p className="text-3xl font-bold text-gray-800 font-mono">
                      {showBalance ? `KES ${account.balance.toLocaleString()}` : 'KES ••••••'}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      account.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {account.isActive ? <Unlock size={12} className="mr-1" /> : <Lock size={12} className="mr-1" />}
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-500 text-xs">
                      Created: {new Date(account.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t">
                    Account Number: {account.accountNumber}
                  </div>
                </>
              ) : (
                // List View
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-6 bg-gradient-to-r ${getAccountTypeColor(account.accountType)} rounded text-white flex items-center justify-center text-xs mr-4`}>
                      {getAccountTypeIcon(account.accountType)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">****{account.accountNumber.slice(-4)}</p>
                      <p className="text-sm text-gray-600">{account.accountType} Account</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {showBalance ? `KES ${account.balance.toLocaleString()}` : 'KES ••••••'}
                    </p>
                    <p className={`text-sm ${account.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <CreditCard size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Accounts Found</h3>
          <p className="text-gray-600 mb-4">
            {filterType === 'all' 
              ? "You don't have any accounts yet."
              : `No ${filterType} accounts found.`
            }
          </p>
          <button
            onClick={() => setFilterType('all')}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            View All Accounts
          </button>
        </div>
      )}
    </div>
  );
};