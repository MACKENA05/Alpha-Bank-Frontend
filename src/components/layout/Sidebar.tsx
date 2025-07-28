// Updated Sidebar Component - Grey/Emerald Theme
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
  HelpCircle
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

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/accounts', label: 'Accounts', icon: CreditCard },
    { to: '/transactions', label: 'Transactions', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const adminMenuItems = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
    { to: '/admin/transactions', label: 'All Transactions', icon: FileText },
    { to: '/admin/users', label: 'User Management', icon: Users },
  ];

  const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => (
    <NavLink
      to={to}
      onClick={onClose} // Always close sidebar when clicking a nav item
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
      onClick={onClose} // Always close sidebar when clicking a nav item
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-slate-600 text-white shadow-lg transform scale-105' 
            : 'text-gray-200 hover:bg-slate-600 hover:text-white hover:transform hover:scale-105'
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
      
      {/* Sidebar - Grey/Emerald Theme */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out shadow-2xl`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gray-900 border-b border-emerald-600">
          <div className="flex items-center">
            <CreditCard size={32} className="text-emerald-400" />
            <span className="ml-2 text-xl font-bold">AlphaBank</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-emerald-300 transition-colors p-1 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-300">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          {/* Admin Section */}
          {user?.role === 'ADMIN' && (
            <div className="mt-8">
              <h3 className="px-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-3">
                Admin Panel
              </h3>
              <div className="space-y-2">
                {adminMenuItems.map(item => (
                  <AdminNavItem key={item.to} {...item} />
                ))}
              </div>
            </div>
          )}

          {/* Settings Section */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="space-y-2">
              <button 
                onClick={onClose}
                className="w-full flex items-center px-4 py-3 text-left text-gray-200 hover:bg-gray-700 rounded-lg transition-all duration-200 hover:transform hover:scale-105"
              >
                <HelpCircle size={20} className="mr-3 flex-shrink-0" />
                <span>Help & Support</span>
              </button>
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