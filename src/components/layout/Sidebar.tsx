import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, History, User, Shield, FileText, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isSidebarOpen, 
  setIsSidebarOpen 
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
    await logout();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white transform ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 bg-blue-900">
        <div className="flex items-center">
          <CreditCard size={32} className="text-blue-200" />
          <span className="ml-2 text-xl font-bold">SecureBank</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden text-white hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive: linkActive }) => `
                  w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                  ${linkActive || isActive(item.path)
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700'
                  }
                `}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {user?.role === 'ADMIN' && (
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">Admin Panel</h3>
            <div className="mt-2 space-y-2">
              {adminMenuItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive: linkActive }) => `
                      w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                      ${linkActive || isActive(item.path)
                        ? 'bg-purple-700 text-white' 
                        : 'text-blue-100 hover:bg-purple-700'
                      }
                    `}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left text-blue-100 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};