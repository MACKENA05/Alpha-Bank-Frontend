// src/components/TransactionHistory.tsx

import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, ArrowUpDown, PlusCircle, MinusCircle, Receipt, FileText } from 'lucide-react';
import { transactionApi } from '../../services/api';
import { Transaction } from '../../services/types';
import { MessageBar } from '../common/MessageBar';
import { ExportService } from '../../services/exportService';

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [filters, setFilters] = useState({
    transactionType: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });

  const exportService = ExportService.getInstance();

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
      if (filters.transactionType) params.transactionType = filters.transactionType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;

      console.log('Fetching transactions with params:', params);
      const response = await transactionApi.getHistory(params);
      console.log('Full API Response:', response);

      // ✅ FIX: Use the correct property name from backend
      let filteredTransactions = response.transactionDetails || [];
      console.log('Transaction details from backend:', filteredTransactions);

      // Client-side search filter
      if (filters.search) {
        filteredTransactions = filteredTransactions.filter((tx: any) =>
          tx.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
          tx.referenceNumber?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // ✅ FIX: Map backend response to frontend Transaction interface
      const mappedTransactions = filteredTransactions.map((tx: any) => ({
        id: tx.id,
        referenceNumber: tx.referenceNumber,
        amount: tx.amount,
        transactionType: tx.transactionType.toUpperCase(), // Convert to uppercase
        transactionDirection: tx.transactionDirection, // Should already be uppercase
        description: tx.description,
        status: tx.status.toUpperCase(), // Convert to uppercase
        balanceAfter: tx.balanceAfter,
        createdAt: tx.createdAt,
        transferReference: tx.transferReference,
        account: {
          accountNumber: tx.accountNumber, // Backend sends accountNumber directly
          accountType: 'CHECKING' // Default since backend doesn't send this
        }
      }));

      console.log('Mapped transactions:', mappedTransactions);
      setTransactions(mappedTransactions);
    } catch (error: any) {
      console.error('Full error object:', error);
      showMessage('Failed to fetch transactions: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      await exportService.exportTransactionReport(transactions, 'pdf');
      showMessage('Transaction report exported successfully as PDF', 'success');
    } catch (error: any) {
      showMessage(error.message, 'error');
    }
  };

  const handleGenerateReceipt = async (transaction: Transaction) => {
    try {
      await exportService.generateTransactionReceipt(transaction, 'pdf');
      showMessage('Receipt generated successfully as PDF', 'success');
    } catch (error: any) {
      showMessage(error.message, 'error');
    }
  };

  const clearFilters = () => {
    setFilters({
      transactionType: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      search: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📊 Transaction History</h1>
        <button
          onClick={handleExportReport}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center"
          title="Export as PDF"
        >
          <Download size={16} className="mr-2" />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Filter size={20} className="mr-2" />
          Filter Transactions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filters.transactionType}
            onChange={(e) => setFilters({...filters, transactionType: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="TRANSFER">Transfer</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="From Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="To Date"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <input
            type="number"
            placeholder="Min Amount (KES)"
            value={filters.minAmount}
            onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max Amount (KES)"
            value={filters.maxAmount}
            onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={clearFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {transactions.map((tx, index) => (
              <div key={tx.id || index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center flex-1">
                  <div className={`p-3 rounded-full mr-4 ${
                    tx.transactionType === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                    tx.transactionType === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {tx.transactionType === 'DEPOSIT' ? <PlusCircle size={20} /> :
                     tx.transactionType === 'WITHDRAWAL' ? <MinusCircle size={20} /> :
                     <ArrowUpDown size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{tx.description}</p>
                    <p className="text-sm text-gray-600">{tx.referenceNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Account: ****{tx.account.accountNumber.slice(-4)} ({tx.account.accountType})</p>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-600">Bal: KES {tx.balanceAfter.toLocaleString()}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tx.status}
                  </span>
                </div>
                <div className="flex flex-col gap-2 min-w-[40px]">
                  <button
                    onClick={() => handleGenerateReceipt(tx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                    title="Generate PDF Receipt"
                  >
                    <Receipt size={16} />
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No transactions found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Summary */}
      {transactions.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">📈 Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Transactions */}
          <div className="flex items-center p-6 bg-blue-100 rounded-xl shadow-inner">
            <div className="bg-blue-500 text-white p-3 rounded-full mr-4">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700">{transactions.length}</p>
              <p className="text-sm text-gray-700">Total Transactions</p>
            </div>
          </div>
      
          {/* Net Amount */}
          <div className="flex items-center p-6 bg-purple-100 rounded-xl shadow-inner">
            <div className="bg-purple-500 text-white p-3 rounded-full mr-4">
              <ArrowUpDown size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-700">
                KES {transactions.reduce((sum, tx) =>
                  tx.transactionDirection === 'CREDIT' ? sum + tx.amount : sum - tx.amount, 0
                ).toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">Net Amount</p>
            </div>
          </div>
        </div>
      </div>
      
      )}
    </div>
  );
};