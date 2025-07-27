
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
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-700 text-white' 
            : 'text-blue-100 hover:bg-blue-700 hover:text-white'
        }`
      }
    >
      <Icon size={20} className="mr-3" />
      {label}
    </NavLink>
  );

  const AdminNavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
          isActive 
            ? 'bg-purple-700 text-white' 
            : 'text-blue-100 hover:bg-purple-700 hover:text-white'
        }`
      }
    >
      <Icon size={20} className="mr-3" />
      {label}
    </NavLink>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-900">
          <div className="flex items-center">
            <CreditCard size={32} className="text-blue-200" />
            <span className="ml-2 text-xl font-bold">SecureBank</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 flex-1">
          <div className="space-y-2">
            {menuItems.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          {/* Admin Section */}
          {user?.role === 'ADMIN' && (
            <div className="mt-8">
              <h3 className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
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
          <div className="mt-8 pt-8 border-t border-blue-700">
            <div className="space-y-2">
              <button className="w-full flex items-center px-4 py-3 text-left text-blue-100 hover:bg-blue-700 rounded-lg transition-colors">
                <Settings size={20} className="mr-3" />
                Settings
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left text-blue-100 hover:bg-blue-700 rounded-lg transition-colors">
                <HelpCircle size={20} className="mr-3" />
                Help & Support
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-left text-blue-100 hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut size={20} className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};