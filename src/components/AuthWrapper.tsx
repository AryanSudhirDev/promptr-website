import React from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';

interface AuthPageProps {
  mode: 'sign-in' | 'sign-up';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4" style={{ backgroundColor: '#0B0B0E' }}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'sign-in' ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-gray-300">
            {mode === 'sign-in' 
              ? 'Sign in to access your Promptr account' 
              : 'Create your account to start your free trial'
            }
          </p>
        </div>
        
        <div className="flex justify-center">
          {mode === 'sign-in' ? (
            <SignIn 
              redirectUrl="/"
            />
          ) : (
            <SignUp 
              redirectUrl="/checkout"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Auth guard component
export const RequireAuth: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return fallback || (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-white mb-4">Sign in required</h3>
        <p className="text-gray-300 mb-6">Please sign in to access this feature</p>
        <button 
          onClick={() => window.location.href = '/sign-in'}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:from-purple-500 hover:to-purple-600"
        >
          Sign In
        </button>
      </div>
    );
  }

  return <>{children}</>;
}; 