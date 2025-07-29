import jsPDF from 'jspdf';
import { Transaction } from '../services/types';

export class PDFExportService {
  private static instance: PDFExportService;

  private constructor() {
    // Simple constructor - no need for dynamic loading
  }

  public static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  public async exportTransactionReport(transactions: Transaction[]): Promise<void> {
    const doc = new jsPDF();
    
    // Header
    this.addReportHeader(doc);
    
    let yPosition = 55;
    
    // Summary section
    yPosition = this.addSummarySection(doc, transactions, yPosition);
    
    // Transaction details
    yPosition = this.addTransactionDetails(doc, transactions, yPosition);
    
    // Footer
    this.addReportFooter(doc, yPosition);
    
    // Save the PDF
    const fileName = `alphabank_transactions_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  private addReportHeader(doc: jsPDF): void {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('ALPHABANK', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Transaction Report', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 40, { align: 'center' });
    
    // Add a line separator
    doc.line(20, 45, 190, 45);
  }

  private addSummarySection(doc: jsPDF, transactions: Transaction[], yPosition: number): number {
    // Summary section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', 20, yPosition);
    yPosition += 10;
  
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Transactions: ${transactions.length}`, 20, yPosition);
    yPosition += 10;
  
    const netAmount = transactions.reduce((sum, tx) =>
      tx.transactionDirection === 'CREDIT' ? sum + tx.amount : sum - tx.amount, 0
    );
    doc.text(`Net Amount: KES ${netAmount.toLocaleString()}`, 20, yPosition);
  
    return yPosition + 15;
  }

  private addTransactionDetails(doc: jsPDF, transactions: Transaction[], yPosition: number): number {
    // Transaction details header
    doc.setFont(undefined, 'bold');
    doc.text('Transaction Details', 20, yPosition);
    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;
    
    // Table headers
    this.addTableHeaders(doc, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'normal');
    
    transactions.forEach((tx, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        this.addTableHeaders(doc, yPosition);
        yPosition += 10;
      }
      
      yPosition = this.addTransactionRow(doc, tx, yPosition, index);
    });
    
    return yPosition;
  }

  private addTableHeaders(doc: jsPDF, yPosition: number): void {
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('Date/Time', 20, yPosition);
    doc.text('Reference', 55, yPosition);
    doc.text('Type', 90, yPosition);
    doc.text('Amount', 115, yPosition);
    doc.text('Balance', 145, yPosition);
    doc.text('Status', 175, yPosition);
    yPosition += 5;
    doc.line(20, yPosition, 190, yPosition);
  }

  private addTransactionRow(doc: jsPDF, tx: Transaction, yPosition: number, index: number): number {
    const date = new Date(tx.createdAt).toLocaleDateString();
    const time = new Date(tx.createdAt).toLocaleTimeString();
    const amount = `${tx.transactionDirection === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString()}`;
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    
    doc.text(`${date}`, 20, yPosition);
    doc.text(`${time}`, 20, yPosition + 3);
    doc.text(tx.referenceNumber.substring(0, 12), 55, yPosition);
    doc.text(tx.transactionType, 90, yPosition);
    doc.text(amount, 115, yPosition);
    doc.text(tx.balanceAfter.toLocaleString(), 145, yPosition);
    doc.text(tx.status, 175, yPosition);
    
    // Description on next line
    doc.setFontSize(7);
    doc.text(tx.description.substring(0, 50), 20, yPosition + 6);
    doc.text(`Acc: ****${tx.account.accountNumber.slice(-4)}`, 120, yPosition + 6);
    
    yPosition += 12;
    
    // Add separator line every 5 transactions
    if ((index + 1) % 5 === 0) {
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 3;
    }
    
    return yPosition;
  }

  private addReportFooter(doc: jsPDF, yPosition: number): void {
    // Footer
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.line(20, yPosition + 10, 190, yPosition + 10);
    doc.setFontSize(8);
    doc.text('Thank you for banking with AlphaBank', 105, yPosition + 20, { align: 'center' });
    doc.text('Customer Service: +254-700-000-000', 105, yPosition + 25, { align: 'center' });
    doc.text(`Report generated on ${new Date().toLocaleString()}`, 105, yPosition + 30, { align: 'center' });
  }

  public async generateTransactionReceipt(tx: Transaction): Promise<void> {
    const doc = new jsPDF();
    
    // Header
    this.addReceiptHeader(doc);
    
    // Receipt content
    this.addReceiptContent(doc, tx);
    
    // Footer
    this.addReceiptFooter(doc);
    
    // Save the PDF
    const fileName = `receipt_${tx.referenceNumber}.pdf`;
    doc.save(fileName);
  }

  private addReceiptHeader(doc: jsPDF): void {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('ALPHABANK', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Official Transaction Receipt', 105, 30, { align: 'center' });
    
    // Receipt border
    doc.rect(15, 10, 180, 200);
  }

  private addReceiptContent(doc: jsPDF, tx: Transaction): void {
    let yPosition = 50;
    
    // Transaction details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TRANSACTION DETAILS', 105, yPosition, { align: 'center' });
    
    doc.line(20, yPosition + 5, 190, yPosition + 5);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Details in two columns
    const leftColumn = 25;
    const rightColumn = 110;
    
    yPosition = this.addReceiptField(doc, 'Reference Number:', tx.referenceNumber, leftColumn, rightColumn, yPosition);
    yPosition = this.addReceiptField(doc, 'Date & Time:', new Date(tx.createdAt).toLocaleString(), leftColumn, rightColumn, yPosition);
    yPosition = this.addReceiptField(doc, 'Transaction Type:', tx.transactionType, leftColumn, rightColumn, yPosition);
    yPosition = this.addReceiptField(doc, 'Direction:', tx.transactionDirection, leftColumn, rightColumn, yPosition);
    yPosition = this.addReceiptField(doc, 'Amount:', `KES ${tx.amount.toLocaleString()}`, leftColumn, rightColumn, yPosition);
    yPosition = this.addReceiptField(doc, 'Status:', tx.status, leftColumn, rightColumn, yPosition);
    yPosition = this.addReceiptField(doc, 'Description:', tx.description, leftColumn, rightColumn, yPosition);
    
    yPosition += 10;
    
    // Account details section
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ACCOUNT DETAILS', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(10);
    yPosition = this.addReceiptField(doc, 'Account Number:', `****${tx.account.accountNumber.slice(-4)}`, leftColumn, rightColumn, yPosition);
    yPosition = this.addReceiptField(doc, 'Account Type:', tx.account.accountType, leftColumn, rightColumn, yPosition);
    yPosition = this.addReceiptField(doc, 'Balance After Transaction:', `KES ${tx.balanceAfter.toLocaleString()}`, leftColumn, rightColumn, yPosition);
  }

  private addReceiptField(doc: jsPDF, label: string, value: string, leftColumn: number, rightColumn: number, yPosition: number): number {
    doc.setFont(undefined, 'bold');
    doc.text(label, leftColumn, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(value, rightColumn, yPosition);
    return yPosition + 8;
  }

  private addReceiptFooter(doc: jsPDF): void {
    let yPosition = 170;
    
    // Footer
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Thank you for banking with AlphaBank', 105, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    doc.text('Customer Service: +254-700-000-000', 105, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.text('Visit us: www.alphabank.co.ke', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, yPosition, { align: 'center' });
  }
}