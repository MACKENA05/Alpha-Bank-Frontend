import React, { useState } from 'react';
import { TransactionHistory } from '../components/transactions/TransactionHistory';
import { MessageBar } from '../components/common/MessageBar';

export const TransactionsPage: React.FC = () => {
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
      <TransactionHistory showMessage={showMessage} />
    </>
  );
};