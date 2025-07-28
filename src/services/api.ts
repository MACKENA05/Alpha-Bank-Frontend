import { CreateAccountRequest, CreateAccountResponse } from "./types";
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';



export const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
  console.log('apiCall called:', endpoint, method, data);
  
  const token = localStorage.getItem('authToken');
  const headers: any = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  console.log('About to fetch:', `${API_BASE_URL}${endpoint}`);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  console.log('Fetch completed, response status:', response.status);
  
  if (!response.ok) {
    console.log('Response not ok, status:', response.status);
    
    const errorData = await response.json().catch(() => ({}));
    console.log('Error data from response:', errorData);
    
    // Only redirect on 401 if we're NOT on the login page
    if (response.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    // For login page 401 errors, just throw the backend error
    const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    (error as any).response = { data: errorData };
    throw error;
  }
  
  console.log('Fetch successful, returning data');
  return await response.json();
};

export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    apiCall('/auth/login', 'POST', credentials),
  register: (userData: any) => 
    apiCall('/auth/register', 'POST', userData),
  logout: () => 
    apiCall('/auth/logout', 'POST')
};

export const accountApi = {
  getUserAccounts: () => 
    apiCall('/accounts'),
  getAccountByNumber: (accountNumber: string) => 
    apiCall(`/accounts/${accountNumber}`),
  getLowBalanceAccounts: (threshold: number = 100) => 
    apiCall(`/accounts/low-balance?threshold=${threshold}`),
  getTotalSystemBalance: () => 
    apiCall('/accounts/total-balance'),
  
  // New method for transfer validation - no ownership required
  validateForTransfer: (accountNumber: string) => 
    apiCall(`/accounts/validate-for-transfer/${accountNumber}`),

  createAccount: (data: CreateAccountRequest) =>
    apiCall('/accounts/create', 'POST', data),
};

export const userApi = {
  getProfile: () => apiCall('/users/profile'),
  
  getUserById: async (userId: number) => {
    console.log(`Fetching user with ID: ${userId}`);
    const response = await apiCall(`/admin/users/${userId}`);
    console.log('User API response:', JSON.stringify(response, null, 2));
    return response;
  },
  
  getAllUsers: (params?: any) => {
    // Convert frontend params to match backend expectations
    const backendParams = {
      page: params?.page || 0,
      size: params?.size || 10,
      sortBy: params?.sortBy || 'id',
      sortDirection: params?.sortDir || params?.sortDirection || 'ASC' // Convert sortDir to sortDirection
    };
    
    const queryString = new URLSearchParams(backendParams.toString());
    console.log('Calling getAllUsers with params:', backendParams);
    return apiCall(`/admin/users?${queryString}`);
  },
  
  deleteUser: (userId: number) => apiCall(`/admin/users/${userId}`, 'DELETE')
};

// Keep transaction API separate
export const transactionApi = {
  withdraw: (data: any) => 
    apiCall('/transactions/withdraw', 'POST', data),
  deposit: (data: any) => 
    apiCall('/transactions/deposit', 'POST', data),
  transfer: (data: any) => 
    apiCall('/transactions/transfer', 'POST', data),
  getHistory: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/transactions/history${queryString}`);
  },
  getAllTransactions: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/transactions/admin/all${queryString}`);
  },
  
  // This is for getting transactions by user, not user details
  getUserTransactions: (userId: number, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/transactions/admin/user/${userId}${queryString}`);
  },
  
  getByReference: (referenceNumber: string) => 
    apiCall(`/transactions/reference/${referenceNumber}`),
  getById: (transactionId: number) => 
    apiCall(`/transactions/id/${transactionId}`)
};