import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../services/types';
import { authApi, userApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegistrationRequest) => Promise<void>; // ✅ ADD THIS
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// You may define this in types.ts if you like
type RegistrationRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  transactionPin: string;
  confirmPin: string;
  initialDeposit: number;
  accountType: string;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      userApi.getProfile()
        .then(response => {
          setUser(response.user || response);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthContext login function called!'); 
    
    try {
      console.log('About to call authApi.login'); // Add this
      const response = await authApi.login({ email, password });
      console.log('authApi.login completed successfully:', response); 
      
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      console.log('=====Login success, user set============'); 
    } catch (error: any) {
      console.log('============AuthContext caught error:============', error); 
      throw error; 
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (data: RegistrationRequest) => {
    await authApi.register(data); 
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      register // ✅ ADD THIS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
