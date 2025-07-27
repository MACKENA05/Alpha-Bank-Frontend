import React, { useState } from 'react';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { MessageBar } from '../../components/common/MessageBar';

export const AdminDashboardPage: React.FC = () => {
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
      <AdminDashboard showMessage={showMessage} />
    </>
  );
};