import React, { useState, useEffect } from 'react';
import { Download, Filter, FileText } from 'lucide-react';
import { transactionApi } from '../../services/api';
import { Transaction } from '../../services/types';
import { MessageBar } from '../common/MessageBar';

export const AllTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [filters, setFilters] = useState({
    transactionType: '',
    status: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    page: 0,
    size: 20
  });

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== 0) {
          params[key] = value;
        }
      });

      const response = await transactionApi.getAllTransactions(params);
      setTransactions(response.transactions || []);
    } catch (error: any) {
      showMessage('Failed to fetch transactions: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAllTransactions = () => {
    const content = `
SECUREBANK - ADMINISTRATIVE REPORT
All System Transactions Export
Generated: ${new Date().toLocaleString()}
Administrator: System Export

${'='.repeat(60)}
TRANSACTION RECORDS
${'='.repeat(60)}

${transactions.map(tx => `
Reference: ${tx.referenceNumber}
Date: ${new Date(tx.createdAt).toLocaleDateString()} ${new Date(tx.createdAt).toLocaleTimeString()}
Type: ${tx.transactionType}
Direction: ${tx.transactionDirection}
Amount: KES ${tx.amount.toLocaleString()}
Account: ${tx.account.accountNumber} (${tx.account.accountType})
Status: ${tx.status}
Description: ${tx.description}
Balance After: KES ${tx.balanceAfter.toLocaleString()}
${'-'.repeat(40)}
`).join('')}

${'='.repeat(60)}
SUMMARY
Total Transactions: ${transactions.length}
Total Volume: KES ${transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
Completed: ${transactions.filter(tx => tx.status === 'COMPLETED').length}
Pending: ${transactions.filter(tx => tx.status === 'PENDING').length}
Failed: ${transactions.filter(tx => tx.status === 'FAILED').length}

Report Generated: ${new Date().toLocaleString()}
SecureBank Administrative System
${'='.repeat(60)}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securebank_admin_transactions_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Administrative report exported successfully', 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📊 All System Transactions</h1>
        <div className="flex gap-2">
          <button
            onClick={exportAllTransactions}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Admin Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Filter size={20} className="mr-2" />
          Administrative Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select
            value={filters.transactionType}
            onChange={(e) => setFilters({...filters, transactionType: e.target.value, page: 0})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 0})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value, page: 0})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="From Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value, page: 0})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="To Date"
          />

          <button
            onClick={() => setFilters({
              transactionType: '',
              status: '',
              startDate: '',
              endDate: '',
              minAmount: '',
              maxAmount: '',
              page: 0,
              size: 20
            })}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="number"
            placeholder="Min Amount (KES)"
            value={filters.minAmount}
            onChange={(e) => setFilters({...filters, minAmount: e.target.value, page: 0})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max Amount (KES)"
            value={filters.maxAmount}
            onChange={(e) => setFilters({...filters, maxAmount: e.target.value, page: 0})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx, index) => (
                  <tr key={tx.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.referenceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ****{tx.account.accountNumber.slice(-4)}
                      <div className="text-xs text-gray-500">{tx.account.accountType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.transactionType === 'DEPOSIT' ? 'bg-green-100 text-green-800' :
                        tx.transactionType === 'WITHDRAWAL' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.transactionDirection === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.transactionDirection}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KES {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {tx.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {transactions.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No transactions found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setFilters({...filters, page: Math.max(0, filters.page - 1)})}
          disabled={filters.page === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous Page
        </button>
        <span className="text-gray-600 font-medium">
          Page {filters.page + 1} • Showing {transactions.length} transactions
        </span>
        <button
          onClick={() => setFilters({...filters, page: filters.page + 1})}
          disabled={transactions.length < filters.size}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Page
        </button>
      </div>
    </div>
  );
};