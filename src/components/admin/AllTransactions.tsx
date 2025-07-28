import React, { useState, useEffect } from 'react';
import { Download, Filter, FileText } from 'lucide-react';
import { transactionApi } from '../../services/api';
import { Transaction, TransactionHistoryResponse } from '../../services/types';
import { MessageBar } from '../common/MessageBar';

export const AllTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc'
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
      const params: any = {
        size: filters.size,
        page: filters.page,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir
      };

      // Add non-empty filter values
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== 0 && !['size', 'page', 'sortBy', 'sortDir'].includes(key)) {
          params[key] = value;
        }
      });

      console.log('Fetching transactions with params:', params);
      const response = await transactionApi.getAllTransactions(params);
      console.log('Full transaction API response:', response);

      // Handle response as TransactionHistoryResponse
      const transactionResponse: TransactionHistoryResponse = response;
      const transactionList: Transaction[] = transactionResponse.transactionDetails || [];

      console.log('Processed transaction list:', transactionList);
      console.log('Pagination metadata:', {
        currentPage: transactionResponse.currentPage,
        totalPages: transactionResponse.totalPages,
        totalElements: transactionResponse.totalElements,
        hasNext: transactionResponse.hasNext,
        hasPrevious: transactionResponse.hasPrevious
      });

      setTransactions(transactionList);
      setTotalElements(transactionResponse.totalElements || 0);
      setTotalPages(transactionResponse.totalPages || 0);

      if (transactionList.length === 0) {
        showMessage('No transactions found. Try adjusting filters or verify backend data.', 'error');
      } else {
        showMessage(`Successfully loaded ${transactionList.length} of ${transactionResponse.totalElements} transactions.`, 'success');
      }
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      showMessage('Failed to fetch transactions: ' + (error.message || 'Unknown error'), 'error');
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
Reference: ${tx.referenceNumber || 'N/A'}
Date: ${tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() + ' ' + new Date(tx.createdAt).toLocaleTimeString() : 'N/A'}
Type: ${tx.transactionType || 'N/A'}
Direction: ${tx.transactionDirection || 'N/A'}
Amount: KES ${tx.amount?.toLocaleString() || '0'}
Account: ${tx.account?.accountNumber || 'N/A'} (${tx.account?.accountType || 'N/A'})
Status: ${tx.status || 'N/A'}
Description: ${tx.description || 'No description'}
Balance After: KES ${tx.balanceAfter?.toLocaleString() || 'N/A'}
${'-'.repeat(40)}
`).join('')}

${'='.repeat(60)}
SUMMARY
Total Transactions: ${transactions.length}
Total Volume: KES ${transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()}
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
              size: 20,
              sortBy: 'createdAt',
              sortDir: 'desc'
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
                      {tx.referenceNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.account?.accountNumber ? `****${tx.account.accountNumber.slice(-4)}` : 'N/A'}
                      <div className="text-xs text-gray-500">{tx.account?.accountType || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.transactionType === 'DEPOSIT' ? 'bg-green-100 text-green-800' :
                        tx.transactionType === 'WITHDRAWAL' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {tx.transactionType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.transactionDirection === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.transactionDirection || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KES {tx.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                      <div className="text-xs text-gray-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString() : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {tx.description || 'No description'}
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
            <p className="text-sm">Total transactions: {totalElements}. Try adjusting filters or verify backend data.</p>
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
          Page {filters.page + 1} of {totalPages} • Showing {transactions.length} of {totalElements} transactions
        </span>
        <button
          onClick={() => setFilters({...filters, page: filters.page + 1})}
          disabled={filters.page >= totalPages - 1}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Page
        </button>
      </div>
    </div>
  );
};