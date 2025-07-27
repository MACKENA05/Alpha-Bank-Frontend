import React, { useState } from 'react';
import { Dashboard } from '../components/dashboard/Dashboard';
import { MessageBar } from '../components/common/MessageBar';

export const DashboardPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <>
      <MessageBar 
        message={message}
        type={messageType}
        onClose={() => setMessage('')}
      />
      <Dashboard showMessage={showMessage} />
    </>
  );
};