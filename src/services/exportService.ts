// src/services/exportService.ts

import { Transaction } from '../services/types';
import { PDFExportService } from './pdfExportService';

export type ExportFormat = 'pdf';
export type ExportType = 'report' | 'receipt';

export class ExportService {
  private static instance: ExportService;
  private pdfService: PDFExportService;

  private constructor() {
    this.pdfService = PDFExportService.getInstance();
  }

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  public async exportTransactionReport(
    transactions: Transaction[],
    format: ExportFormat = 'pdf'
  ): Promise<void> {
    try {
      if (format === 'pdf') {
        await this.pdfService.exportTransactionReport(transactions);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to export transaction report as ${format.toUpperCase()}: ${error.message}`);
    }
  }

  public async generateTransactionReceipt(
    transaction: Transaction,
    format: ExportFormat = 'pdf'
  ): Promise<void> {
    try {
      if (format === 'pdf') {
        await this.pdfService.generateTransactionReceipt(transaction);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to generate receipt as ${format.toUpperCase()}: ${error.message}`);
    }
  }

  public async exportDocument(
    data: Transaction | Transaction[],
    type: ExportType,
    format: ExportFormat
  ): Promise<void> {
    if (type === 'report' && Array.isArray(data)) {
      return this.exportTransactionReport(data, format);
    } else if (type === 'receipt' && !Array.isArray(data)) {
      return this.generateTransactionReceipt(data, format);
    } else {
      throw new Error('Invalid export parameters: data type does not match export type');
    }
  }
}