import React from 'react';
import {X, CheckCircle, AlertCircle } from 'lucide-react';


interface MessageBarProps{
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const MessageBar: React.FC<MessageBarProps> = ({message, type, onClose}) => {
    if(!message) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
            type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {type === 'success' ? (
                  <CheckCircle size={20} className="mr-2" />
                ) : (
                  <AlertCircle size={20} className="mr-2" />
                )}
                <span>{message}</span>
              </div>
              <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
                <X size={16} />
              </button>
            </div>
          </div>
        );
      };