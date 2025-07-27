
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Home, Eye, EyeOff, CreditCard } from 'lucide-react';
import { PinInput } from '../common/PinInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { authApi } from '../../services/api';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    deposit: '',
    pin: '',
    confirmPin: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const validateForm = () => {
    const {
      name, email, phone, address, password,
       deposit, pin, confirmPin
    } = formData;

    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!name.trim() || !/^[a-zA-Z\s]+$/.test(name)) return 'Valid name required';
    if (!emailRegex.test(email)) return 'Invalid email';
    if (phone && !phoneRegex.test(phone)) return 'Invalid phone number';
    if (address && (address.length < 10 || address.length > 500)) return 'Address must be 10–500 characters';
    if (!passwordStrength.test(password)) return 'Password must be 8+ chars, with uppercase, lowercase, and number';
    if (isNaN(Number(deposit)) || Number(deposit) < 100 || Number(deposit) > 1000000) return 'Deposit must be between 100 and 1,000,000 KES';
    if (!/^\d{4}$/.test(pin)) return 'PIN must be 4 digits';
    if (pin !== confirmPin) return 'PINs do not match';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        ...formData,
        deposit: Number(formData.deposit),
      };
      await authApi.register(data);
      setSuccess('Account created successfully! Redirecting...');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        deposit: '',
        pin: '',
        confirmPin: ''
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-10 flex flex-col justify-center items-center text-center">
          <div className="mb-6">
            <CreditCard size={48} className="mx-auto mb-4" />
            <h1 className="text-4xl font-bold">Welcome to Alpha Bank</h1>
            <p className="mt-4 text-lg opacity-90">
              Secure, smart, and seamless banking.<br />
              Manage your accounts and transactions with confidence.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Your Account</h2>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <User size={16} className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254712345678"
                className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Home size={16} className="inline mr-2" />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Alpha Street, Nairobi"
                className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Lock size={16} className="inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Deposit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Initial Deposit (KES)
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                placeholder="1000"
                className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* PIN */}
            <PinInput
              pin={formData.pin}
              confirmPin={formData.confirmPin}
              onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner /> : '📝 Create Account'}
            </button>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Already have an account? Log in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
