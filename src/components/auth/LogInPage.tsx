import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, CreditCard, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { MessageBar } from '../common/MessageBar';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const clearLoginForm = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('FORM SUBMITTED!');
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
  
    try {
      console.log('ABOUT TO CALL LOGIN!');
      await login(email, password);
      
      clearLoginForm();
      setSuccessMessage('Login successful! Redirecting...');
      setLoginSuccess(true); // Trigger redirect via useEffect
    } catch (error: any) {
      console.log('Error caught in LoginPage:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      
      setError(errorMessage); 
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loginSuccess && user) {
      const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : from;
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
        setLoginSuccess(false); // Reset after redirect
      }, 800);
    }
  }, [loginSuccess, user, navigate, from]);

  const handleCloseMessage = () => {
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex items-center justify-center">
      {(error || successMessage) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <MessageBar
            message={error || successMessage}
            type={error ? 'error' : 'success'}
            onClose={handleCloseMessage}
            autoClose={true}
            duration={error ? 6000 : 3000}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex w-full md:w-1/2 bg-emerald-600 items-center justify-center">
          <img
            src="/brand2.jpg"
            alt="Bank illustration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-emerald-700">🏦 AlphaBank</h1>
            <p className="text-gray-500">Welcome back to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete='off'>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Mail size={16} className="inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                placeholder="you@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Lock size={16} className="inline mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm pr-12 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : '🚀 Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/register" className="text-emerald-600 hover:underline text-sm">
              Don't have an account? Open one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};