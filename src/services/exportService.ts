import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Transaction, Account, User } from './types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class ExportService {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US');
  }

  // Export transactions to CSV
  static exportTransactionsToCSV(transactions: Transaction[], fileName?: string): void {
    const csvData = transactions.map(transaction => ({
      'Reference Number': transaction.referenceNumber,
      'Date': this.formatDate(transaction.createdAt),
      'Type': transaction.transactionType,
      'Direction': transaction.transactionDirection,
      'Amount': transaction.amount,
      'Description': transaction.description,
      'Status': transaction.status,
      'Balance After': transaction.balanceAfter,
      'Account Number': transaction.account.accountNumber,
      'Account Type': transaction.account.accountType
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const defaultFileName = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName || defaultFileName);
  }

  // Export transactions to PDF
  static exportTransactionsToPDF(transactions: Transaction[], fileName?: string): void {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🏦 SecureBank', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text('Transaction History Report', pdf.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
    
    // Date range
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdf.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
    
    // Table data
    const tableData = transactions.map(transaction => [
      transaction.referenceNumber,
      this.formatDate(transaction.createdAt),
      transaction.transactionType,
      transaction.transactionDirection,
      this.formatCurrency(transaction.amount),
      transaction.description,
      transaction.status,
      this.formatCurrency(transaction.balanceAfter)
    ]);

    const headers = [
      'Reference',
      'Date',
      'Type',
      'Direction',
      'Amount',
      'Description',
      'Status',
      'Balance After'
    ];

    pdf.autoTable({
      head: [headers],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    const defaultFileName = `transaction_report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName || defaultFileName);
  }

  // Export accounts to CSV
  static exportAccountsToCSV(accounts: Account[], fileName?: string): void {
    const csvData = accounts.map(account => ({
      'Account Number': account.accountNumber,
      'Account Type': account.accountType,
      'Balance': account.balance,
      'Status': account.isActive ? 'Active' : 'Inactive',
      'Created Date': this.formatDate(account.createdAt),
      'Customer Name': account.user ? `${account.user.firstName} ${account.user.lastName}` : 'N/A',
      'Customer Email': account.user?.email || 'N/A'
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const defaultFileName = `accounts_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName || defaultFileName);
  }

  // Export users to CSV
  static exportUsersToCSV(users: User[], fileName?: string): void {
    const csvData = users.map(user => ({
      'ID': user.id,
      'First Name': user.firstName,
      'Last Name': user.lastName,
      'Email': user.email,
      'Phone': user.phoneNumber || 'N/A',
      'Address': user.address || 'N/A',
      'Role': user.role,
      'Status': user.isEnabled ? 'Enabled' : 'Disabled',
      'Created Date': this.formatDate(user.createdAt)
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const defaultFileName = `users_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName || defaultFileName);
  }

  // Export filtered data based on date range
  static exportTransactionsByDateRange(
    transactions: Transaction[],
    startDate: string,
    endDate: string,
    format: 'csv' | 'pdf' = 'csv'
  ): void {
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      
      return transactionDate >= start && transactionDate <= end;
    });

    const fileName = `transactions_${startDate}_to_${endDate}.${format}`;
    
    if (format === 'csv') {
      this.exportTransactionsToCSV(filteredTransactions, fileName);
    } else {
      this.exportTransactionsToPDF(filteredTransactions, fileName);
    }
  }
}