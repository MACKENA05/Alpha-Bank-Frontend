import React from 'react';


export const LoadingSpinner: React.FC = () => (
    <div className="loading-spinner">
        <div className = "animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
);

export const PageLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  
