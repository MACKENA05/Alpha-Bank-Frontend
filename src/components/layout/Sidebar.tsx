// Updated Sidebar Component - Role-Based Navigation with Grey/Emerald Theme
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  History, 
  User, 
  Shield, 
  FileText, 
  Users, 
  LogOut, 
  X,
  Settings,
  HelpCircle,
  BarChart3,
  Database,
  UserCheck,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      onClose(); // Close sidebar after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // User menu items - Grey and Emerald theme
  const userMenuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/accounts', label: 'My Accounts', icon: CreditCard },
    { to: '/transactions', label: 'My Transactions', icon: History },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  // Admin menu items - Enhanced with more admin-specific options
  const adminMenuItems = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/transactions', label: 'All Transactions', icon: FileText },
  ];

  const UserNavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-emerald-600 text-white shadow-lg transform scale-105' 
            : 'text-gray-200 hover:bg-emerald-600 hover:text-white hover:transform hover:scale-105'
        }`
      }
    >
      <Icon size={20} className="mr-3 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );

  const AdminNavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-gray-600 text-white shadow-lg transform scale-105' 
            : 'text-gray-200 hover:bg-gray-600 hover:text-white hover:transform hover:scale-105'
        }`
      }
    >
      <Icon size={20} className="mr-3 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Overlay - Show when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Dynamic theme based on user role */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 ${
        user?.role === 'ADMIN' 
          ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
          : 'bg-gradient-to-b from-emerald-800 to-emerald-900'
      } text-white transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out shadow-2xl`}>
        
        {/* Header - Role-based branding */}
        <div className={`flex items-center justify-between h-16 px-6 ${
          user?.role === 'ADMIN' ? 'bg-gray-900 border-b border-gray-600' : 'bg-emerald-900 border-b border-emerald-600'
        }`}>
          <div className="flex items-center">
            {user?.role === 'ADMIN' ? (
              <>
                <Shield size={32} className="text-gray-400" />
                <span className="ml-2 text-xl font-bold">AlphaBank Admin</span>
              </>
            ) : (
              <>
                <CreditCard size={32} className="text-emerald-400" />
                <span className="ml-2 text-xl font-bold">AlphaBank</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className={`${
              user?.role === 'ADMIN' ? 'text-white hover:text-gray-300' : 'text-white hover:text-emerald-300'
            } transition-colors p-1 rounded`}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info - Enhanced for admin */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className={`w-10 h-10 ${
              user?.role === 'ADMIN' ? 'bg-gray-600' : 'bg-emerald-600'
            } rounded-full flex items-center justify-center`}>
              {user?.role === 'ADMIN' ? <Shield size={20} /> : <User size={20} />}
            </div>
            <div className="ml-3">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                {user?.role === 'ADMIN' && (
                  <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full font-medium">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300">{user?.email}</p>
              {user?.role === 'ADMIN' && (
                <p className="text-xs text-gray-400 mt-1">System Administrator</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation - Role-based menu */}
        <nav className="mt-6 px-4 flex-1 overflow-y-auto">
          {user?.role === 'ADMIN' ? (
            // Admin Navigation
            <>
              <div className="mb-4">
                <h3 className="px-4 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  Administrative Panel
                </h3>
                <div className="space-y-2">
                  {adminMenuItems.map(item => (
                    <AdminNavItem key={item.to} {...item} />
                  ))}
                </div>
              </div>

            </>
          ) : (
            // Regular User Navigation
            <>
              <div className="mb-4">
                <h3 className="px-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-3">
                  Banking Services
                </h3>
                <div className="space-y-2">
                  {userMenuItems.map(item => (
                    <UserNavItem key={item.to} {...item} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Settings Section */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-left text-gray-200 hover:bg-red-700 rounded-lg transition-all duration-200 hover:transform hover:scale-105"
              >
                <LogOut size={20} className="mr-3 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};