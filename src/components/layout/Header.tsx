
import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-800 mr-4"
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search transactions, accounts..."
              className="bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-600 hover:text-gray-800">
            <Bell size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-600">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};