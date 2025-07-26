import React, { useState, useEffect } from 'react';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
// import { Dashboard } from './components/dashboard/Dashboard';
// import { TransactionHistory } from './components/transactions/TransactionHistory';
// import { AdminDashboard } from './components/admin/AdminDashboard';
// import { AllTransactions } from './components/admin/AllTransactions';
// import { UserManagement } from './components/admin/UserManagement';
// import { UserProfile } from './components/profile/UserProfile';
import { Sidebar } from './components/layout/Sidebar';
// import { Header } from './components/layout/Header';
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <Header /> */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    );

    // switch (currentView) {
    //   case 'dashboard':
    //     return <MainLayout><Dashboard showMessage={showMessage} /></MainLayout>;
    //   case 'accounts':
    //     return <MainLayout><Dashboard showMessage={showMessage} /></MainLayout>;
    //   case 'transactions':
    //     return <MainLayout><TransactionHistory showMessage={showMessage} /></MainLayout>;
    //   case 'profile':
    //     return <MainLayout><UserProfile showMessage={showMessage} /></MainLayout>;
    //   case 'admin-dashboard':
    //     return auth.user?.role === 'ADMIN' ? 
    //       <MainLayout><AdminDashboard showMessage={showMessage} /></MainLayout> : 
    //       <MainLayout><Dashboard showMessage={showMessage} /></MainLayout>;
    //   case 'admin-transactions':
    //     return auth.user?.role === 'ADMIN' ? 
    //       <MainLayout><AllTransactions showMessage={showMessage} /></MainLayout> : 
    //       <MainLayout><Dashboard showMessage={showMessage} /></MainLayout>;
    //   case 'admin-users':
    //     return auth.user?.role === 'ADMIN' ? 
    //       <MainLayout><UserManagement showMessage={showMessage} /></MainLayout> : 
    //       <MainLayout><Dashboard showMessage={showMessage} /></MainLayout>;
    //   default:
    //     return <MainLayout><Dashboard showMessage={showMessage} /></MainLayout>;
    // }
  };

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