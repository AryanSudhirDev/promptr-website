import React from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';

interface AuthPageProps {
  mode: 'sign-in' | 'sign-up';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {mode === 'sign-in' ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'sign-in'
              ? 'Sign in to access your Promptr account'
              : 'Create your account to get started with Promptr'}
          </p>
        </div>
        <div className="flex justify-center">
          {mode === 'sign-in' ? <SignIn redirectUrl="/" /> : <SignUp redirectUrl="/account" />}
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      fallback || (
        <div className="text-center py-12 bg-background">
          <h3 className="text-xl font-semibold text-foreground mb-4">Sign in required</h3>
          <p className="text-muted-foreground mb-6">Please sign in to access this feature</p>
          <button
            onClick={() => (window.location.href = '/sign-in')}
            className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            Sign In
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
}; 