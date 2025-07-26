import React from 'react';
import { Home, CreditCard, History, User, Shield, FileText, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen 
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: Shield },
    { id: 'admin-transactions', label: 'All Transactions', icon: FileText },
    { id: 'admin-users', label: 'User Management', icon: Users },
  ];

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
          className="lg:hidden text-white"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  currentView === item.id 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </button>
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
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      currentView === item.id 
                        ? 'bg-purple-700 text-white' 
                        : 'text-blue-100 hover:bg-purple-700'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-blue-700">
          <button
            onClick={logout}
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