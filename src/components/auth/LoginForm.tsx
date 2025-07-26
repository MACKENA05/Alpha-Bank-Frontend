import React, { useState } from 'react';
import { Mail, Lock, CreditCard, Eye, EyeOff,Smartphone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LoginFormProps {
  onRegisterClick: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side – Image / Branding */}
      <div className="relative hidden md:block h-screen overflow-hidden">
  <img
    src="/brand1.jpg"
    alt="Bank Visual"
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black opacity-30"></div> {/* optional overlay */}
</div>


      {/* Right Side – Login Form */}
      <div className="flex items-center justify-center bg-stone-400 p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-3">
          <Smartphone size={40} className="text-grey-700 mb-3 justify-center " />
            Welcome to Alpha Bank
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Secure, smart, and seamless banking. Manage your accounts and transactions with confidence.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="you@example.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
      
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Enter your password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
      
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-400 text-black py-3 rounded-lg font-semibold text-sm hover:bg-blue-800 transition disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner /> : '🚀 Sign In'}
            </button>
          </form>
      
          <div className="mt-6 text-center text-sm">
            <button
              onClick={onRegisterClick}
              className="text-blue-600 hover:text-blue-800 transition font-medium"
            >
              New here? Create an account
            </button>
          </div>
        </div>
        </div>
</div>
  );
};
