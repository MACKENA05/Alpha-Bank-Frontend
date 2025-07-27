import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Transaction, Account, User } from './types';

export class ReceiptService {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private static formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  static async generateTransactionReceipt(
    transaction: Transaction,
    user: User,
    fromAccount?: Account,
    toAccount?: Account
  ): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🏦 SecureBank', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text('Transaction Receipt', pageWidth / 2, 35, { align: 'center' });
    
    // Divider line
    pdf.setLineWidth(0.5);
    pdf.line(15, 45, pageWidth - 15, 45);
    
    // Transaction Details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    let yPos = 60;
    
    const details = [
      ['Reference Number:', transaction.referenceNumber],
      ['Transaction Type:', transaction.transactionType],
      ['Amount:', this.formatCurrency(transaction.amount)],
      ['Description:', transaction.description],
      ['Status:', transaction.status],
      ['Date & Time:', this.formatDate(transaction.createdAt)],
      ['Balance After:', this.formatCurrency(transaction.balanceAfter)]
    ];
    
    if (fromAccount && transaction.transactionType === 'TRANSFER') {
      details.push(['From Account:', `****${fromAccount.accountNumber.slice(-4)} (${fromAccount.accountType})`]);
    }
    
    if (toAccount && transaction.transactionType === 'TRANSFER') {
      details.push(['To Account:', `****${toAccount.accountNumber.slice(-4)} (${toAccount.accountType})`]);
    }
    
    details.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, 80, yPos);
      yPos += 10;
    });
    
    // Customer Information
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Customer Information:', 20, yPos);
    yPos += 10;
    
    const customerDetails = [
      ['Name:', `${user.firstName} ${user.lastName}`],
      ['Email:', user.email],
      ['Customer ID:', user.id.toString()]
    ];
    
    customerDetails.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, 80, yPos);
      yPos += 10;
    });
    
    // Footer
    yPos += 20;
    pdf.setLineWidth(0.5);
    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This is a computer-generated receipt and does not require a signature.', 
             pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 
             pageWidth / 2, yPos, { align: 'center' });
    
    // Save the PDF
    const fileName = `Receipt_${transaction.referenceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  static async generateReceiptFromElement(elementId: string, fileName: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Receipt element not found');
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw new Error('Failed to generate receipt');
    }
  }

  static printReceipt(): void {
    window.print();
  }
}