import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface MessageBarProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const MessageBar: React.FC<MessageBarProps> = ({
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const buttonColor = type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800';

  return (
    <div className={`${bgColor} border-l-4 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <CheckCircle className={`h-5 w-5 ${iconColor}`} />
          ) : (
            <AlertCircle className={`h-5 w-5 ${iconColor}`} />
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
            } rounded-md p-1.5 transition-colors duration-200`}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};