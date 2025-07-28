import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Shield, Download, Eye, AlertTriangle } from 'lucide-react';
import { userApi } from '../../services/api';
import { MessageBar } from '../common/MessageBar';

// Define interfaces to match backend DTOs
interface Account {
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING';
  balance: number;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
  isEnabled: boolean;
  accounts?: Account[];
  totalAccounts: number;
  createdAt: string;
  updatedAt: string;
}

// Updated interface to match API response
interface UserListResponse {
  content: User[]; // Changed from 'users' to 'content'
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const navigate = useNavigate();

  const LOW_BALANCE_THRESHOLD = 100; // KES 100 threshold for highlighting

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy: 'createdAt',
        sortDir: 'desc'
      };

      const response: UserListResponse = await userApi.getAllUsers(params);
      console.log('Full user API response:', response);
      const userList: User[] = response.content || []; // Changed from response.users to response.content
      console.log('Processed user list:', userList);

      setUsers(userList);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      showMessage('Failed to fetch users: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportUserList = () => {
    // Filter out any accounts that might be null/undefined
    const content = `
SECUREBANK - USER MANAGEMENT REPORT
System Users Export
Generated: ${new Date().toLocaleString()}
Administrator: System Export

${'='.repeat(60)}
USER RECORDS
${'='.repeat(60)}

${filteredUsers.map(user => {
  const validAccounts = user.accounts?.filter(a => a && a.accountNumber) || [];
  return `
User ID: ${user.id}
Name: ${user.fullName || `${user.firstName} ${user.lastName}`}
Email: ${user.email}
Phone: ${user.phoneNumber || 'Not provided'}
Address: ${user.address || 'Not provided'}
Role: ${user.role}
Status: ${user.isEnabled ? 'Active' : 'Inactive'}
Accounts: ${validAccounts.length ? validAccounts.map(a => `${a.accountNumber} (${a.accountType}, Balance: KES ${a.balance.toLocaleString()})`).join(', ') : 'None'}
Total Balance: KES ${getTotalBalance(user).toLocaleString()}
${getTotalBalance(user) < LOW_BALANCE_THRESHOLD ? '⚠ Low Balance Warning: Below KES 100' : ''}
Total Accounts: ${user.totalAccounts}
Created: ${new Date(user.createdAt).toLocaleString()}
Last Updated: ${new Date(user.updatedAt).toLocaleString()}
${'-'.repeat(40)}
`;
}).join('')}

${'='.repeat(60)}
SUMMARY
Total Users: ${filteredUsers.length}
Active Users: ${filteredUsers.filter(u => u.isEnabled).length}
Inactive Users: ${filteredUsers.filter(u => !u.isEnabled).length}
Administrators: ${filteredUsers.filter(u => u.role === 'ADMIN').length}
Regular Users: ${filteredUsers.filter(u => u.role === 'USER').length}
Total Accounts: ${filteredUsers.reduce((sum, u) => sum + u.totalAccounts, 0)}
Low Balance Users: ${filteredUsers.filter(u => getTotalBalance(u) < LOW_BALANCE_THRESHOLD).length}

Report Generated: ${new Date().toLocaleString()}
SecureBank User Management System
${'='.repeat(60)}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securebank_users_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('User list exported successfully', 'success');
  };

  const getTotalBalance = (user: User): number => {
    // Filter out any undefined/null accounts before calculating balance
    const validAccounts = user.accounts?.filter(acc => acc && typeof acc.balance === 'number') || [];
    return validAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && user.isEnabled) ||
      (statusFilter === 'INACTIVE' && !user.isEnabled);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Users size={32} className="mr-3 text-blue-600" />
          👥 User Management
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={exportUserList}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export Users
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Users</option>
            <option value="ADMIN">Administrators</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const totalBalance = getTotalBalance(user);
                  const isLowBalance = totalBalance < LOW_BALANCE_THRESHOLD;
                  const validAccounts = user.accounts?.filter(a => a && a.accountNumber) || [];
                  
                  return (
                    <tr 
                      key={user.id} 
                      className={`transition-colors cursor-pointer ${
                        isLowBalance ? 'bg-red-50 border-l-4 border-red-400' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserClick(user.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {user.fullName || `${user.firstName} ${user.lastName}`}
                              {isLowBalance && (
                                <div title="Low Balance Warning">
                                  <AlertTriangle size={16} className="ml-2 text-red-500" />
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: #{user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {user.phoneNumber && (
                          <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.totalAccounts} account{user.totalAccounts !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {validAccounts.length ? validAccounts.map(a => a.accountType).join(', ') : 'None'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          isLowBalance ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          KES {totalBalance.toLocaleString()}
                        </div>
                        {isLowBalance && (
                          <div className="text-xs text-red-500">Below KES 100</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          ● {user.isEnabled ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div title="View Details">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(user.id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">
              {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? 'No users found matching your filters' : 'No users found'}
            </p>
            <p className="text-sm">
              {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? 'Try adjusting your search terms or filters' : 'Users will appear here when they register'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous Page
        </button>
        <span className="text-gray-600 font-medium">
          Page {currentPage + 1} of {totalPages} • Showing {filteredUsers.length} of {users.length} users
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Page
        </button>
      </div>

      {/* User Statistics */}
      {filteredUsers.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.isEnabled).length}
              </p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {filteredUsers.filter(u => u.role === 'ADMIN').length}
              </p>
              <p className="text-sm text-gray-600">Administrators</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {filteredUsers.filter(u => getTotalBalance(u) < LOW_BALANCE_THRESHOLD).length}
              </p>
              <p className="text-sm text-gray-600">Low Balance Users</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                KES {filteredUsers.reduce((sum, u) => sum + getTotalBalance(u), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Balance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};