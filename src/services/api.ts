const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Network error occurred');
  }
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
    apiCall('/accounts/total-balance')
};

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
  getByReference: (referenceNumber: string) => 
    apiCall(`/transactions/reference/${referenceNumber}`),
  getById: (transactionId: number) => 
    apiCall(`/transactions/id/${transactionId}`)
};

export const userApi = {
  getProfile: () => 
    apiCall('/users/profile'),
  getUserById: (userId: number) => 
    apiCall(`/users/${userId}`),
  getAllUsers: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/users${queryString}`);
  },
  deleteUser: (userId: number) => 
    apiCall(`/users/${userId}`, 'DELETE')
};