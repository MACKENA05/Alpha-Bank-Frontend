import React, { useState, useEffect } from 'react';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Sidebar } from './components/layout/Sidebar';
import { MessageBar } from './components/common/MessageBar';
import { PageLoader } from './components/common/LoadingSpinner';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const auth = useAuthProvider();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const renderCurrentView = () => {
    if (!auth.isAuthenticated) {
      return (
        <>
          <LoginForm onRegisterClick={() => setShowRegisterModal(true)} />
          <RegisterForm 
            isOpen={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
            onSuccess={() => showMessage('Registration successful! Please login.', 'success')}
          />
        </>
      );
    }

    const MainLayout = ({ children }: { children: React.ReactNode }) => (
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    );

  }

  if (auth.loading) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={auth}>
      <div className="App">
        <MessageBar 
          message={message}
          type={messageType}
          onClose={() => setMessage('')}
        />
        {renderCurrentView()}
      </div>
    </AuthContext.Provider>
  );
};

export default App;
