
export interface User {
    id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
    id: number;
    accountNumber: string;
    accountType: 'SAVINGS' | 'CHECKING';
    balance: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    totalTransactions?: number;
    lastTransactionAmount?: number;
    lastTransactionDate?: string;
  }

  export interface CreateAccountRequest {
    accountType: 'SAVINGS' | 'CHECKING' | 'BUSINESS' | 'FIXED_DEPOSIT';
    transactionPin: string;
    confirmPin: string;
    initialDeposit?: number;
  }
  
  export interface CreateAccountResponse {
    message: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
  }
  
  export interface Transaction {
    id: number;
    referenceNumber: string;
    amount: number;
    transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    transactionDirection: 'CREDIT' | 'DEBIT';
    description: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    balanceAfter: number;
    createdAt: string;
    transferReference?: string;
    account: {
      accountNumber: string;
      accountType: string;
    };
  }
  
  export interface TransferRequest {
    senderAccountNumber: string;
    receiverAccountNumber: string;
    amount: number;
    notes: string;
    transactionPin: string;
  }
  
  export interface WithdrawalRequest {
    accountNumber: string;
    amount: number;
    description: string;
    transactionPin: string;
  }
  
  export interface DepositRequest {
    accountNumber: string;
    amount: number;
    description: string;
  }
  
  export interface RegistrationRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    accountType: 'SAVINGS' | 'CHECKING';
    initialDeposit: number;
    transactionPin: string;
    confirmPin: string; 
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
    message: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp?: string;
  }
  
  export interface AccountListResponse {
    accounts: Account[];
    totalAccounts: number;
    totalBalance: number; 
    message: string;
  }
  
  export interface TransactionHistoryResponse {
    transactionDetails: Transaction[]; 
    currentPage: number;
    totalPages: number;
    totalElements: number; 
    hasNext: boolean; 
    hasPrevious: boolean;
  }
  
  export interface TotalBalanceResponse {
    totalBalance: number;
    totalAccounts: number;
  }
  
  export interface LowBalanceAccountsResponse {
    accounts: Account[];
    totalLowBalanceAccounts: number;
  }
  
  export interface UserListResponse {
    users: User[];
    totalUsers: number;
    currentPage: number;
    totalPages: number;
  }