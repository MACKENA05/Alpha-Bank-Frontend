import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/accounts', label: 'Accounts', icon: CreditCard },
    { path: '/transactions', label: 'Transactions', icon: History },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
    { path: '/admin/transactions', label: 'All Transactions', icon: FileText },
    { path: '/admin/users', label: 'User Management', icon: Users },
  ];

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await logout();
      navigate('/auth');
    }
  };

  // Ensure sidebar is open on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarOpen]);

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out
      bg-gradient-to-b from-blue-800 to-blue-900 text-white
      dark:from-gray-900 dark:to-gray-800
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static lg:inset-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 bg-blue-900 dark:bg-gray-800">
        <div className="flex items-center">
          <CreditCard size={32} className="text-blue-200 dark:text-gray-300" />
          <span className="ml-2 text-xl font-bold">SecureBank</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden text-white hover:text-gray-200"
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="mt-8 px-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              aria-label={`Go to ${label}`}
              className={({ isActive }) =>
                `
                w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left
                ${isActive || location.pathname.startsWith(path)
                  ? 'bg-blue-700 dark:bg-gray-700 text-white'
                  : 'text-blue-100 dark:text-gray-300 hover:bg-blue-700 dark:hover:bg-gray-700'}
              `
              }
            >
              <Icon size={20} className="mr-3" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Admin Section */}
        {user?.role === 'ADMIN' && (
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-blue-300 dark:text-gray-400 uppercase tracking-wider">
              Admin Panel
            </h3>
            <div className="mt-2 space-y-2">
              {adminMenuItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label={`Go to ${label}`}
                  className={({ isActive }) =>
                    `
                    w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left
                    ${isActive || location.pathname.startsWith(path)
                      ? 'bg-purple-700 dark:bg-purple-600 text-white'
                      : 'text-blue-100 dark:text-gray-300 hover:bg-purple-700 dark:hover:bg-purple-600'}
                  `
                  }
                >
                  <Icon size={20} className="mr-3" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="mt-8 pt-8 border-t border-blue-700 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-blue-100 dark:text-gray-300 hover:bg-red-700"
            aria-label="Logout"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};
