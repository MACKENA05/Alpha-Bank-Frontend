import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit3, Trash2, Search, Shield, Download } from 'lucide-react';
import { userApi } from '../../services/api';
import { User } from '../../services/types';
import { MessageBar } from '../common/MessageBar';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

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

      const response = await userApi.getAllUsers(params);
      setUsers(response.users || []);
    } catch (error: any) {
      showMessage('Failed to fetch users: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will affect all associated accounts and transactions.')) {
      return;
    }

    try {
      await userApi.deleteUser(userId);
      showMessage('User deleted successfully', 'success');
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      showMessage('Failed to delete user: ' + error.message, 'error');
    }
  };

  const exportUserList = () => {
    const content = `
SECUREBANK - USER MANAGEMENT REPORT
System Users Export
Generated: ${new Date().toLocaleString()}
Administrator: System Export

${'='.repeat(60)}
USER RECORDS
${'='.repeat(60)}

${filteredUsers.map(user => `
User ID: ${user.id}
Name: ${user.firstName} ${user.lastName}
Email: ${user.email}
Phone: ${user.phoneNumber || 'Not provided'}
Role: ${user.role}
Status: ${user.isEnabled ? 'Active' : 'Inactive'}
Created: ${new Date(user.createdAt).toLocaleString()}
Last Updated: ${new Date(user.updatedAt).toLocaleString()}
Address: ${user.address || 'Not provided'}
${'-'.repeat(40)}
`).join('')}

${'='.repeat(60)}
SUMMARY
Total Users: ${filteredUsers.length}
Active Users: ${filteredUsers.filter(u => u.isEnabled).length}
Inactive Users: ${filteredUsers.filter(u => !u.isEnabled).length}
Administrators: ${filteredUsers.filter(u => u.role === 'ADMIN').length}
Regular Users: ${filteredUsers.filter(u => u.role === 'USER').length}

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

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            Clear
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
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
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'ADMIN' && <Shield size={12} className="mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isEnabled ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit User"
                        >
                          <Edit3 size={16} />
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">
              {searchTerm ? 'No users found matching your search' : 'No users found'}
            </p>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here when they register'}
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
          Page {currentPage + 1} • Showing {filteredUsers.length} users
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={users.length < pageSize}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Page
        </button>
      </div>

      {/* User Statistics */}
      {filteredUsers.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">
                {Math.round((filteredUsers.filter(u => u.isEnabled).length / filteredUsers.length) * 100)}%
              </p>
              <p className="text-sm text-gray-600">Active Rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
