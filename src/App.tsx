import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { AppRoutes } from './routes/AppRoutes';
import './index.css';

const App: React.FC = () => {
  const auth = useAuthProvider();

  return (
    <BrowserRouter>
      <AuthContext.Provider value={auth}>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

export default App;