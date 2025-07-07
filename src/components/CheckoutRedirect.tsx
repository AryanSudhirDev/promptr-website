import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { enhancedFetch, handleApiError } from '../utils/errorHandling';

const CheckoutRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const handleCheckout = async () => {
      if (!isLoaded) return;
      
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        setError('No email address found. Please sign in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
          {
            method: 'POST',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: user.emailAddresses[0].emailAddress }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          // Handle the case where user already has active subscription
          if (data.hasActiveSubscription) {
            setError(data.message || data.error);
            setIsLoading(false);
            // Redirect to account dashboard after showing error
            setTimeout(() => {
              window.location.href = '/account';
            }, 3000);
            return;
          }
          
          // Handle other errors
          throw new Error(data.message || data.error || 'Failed to create checkout session');
        }

        // Success - redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (error) {
        handleApiError(error, 'Checkout Redirect');
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    };

    handleCheckout();
  }, [isLoaded, user]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4" style={{ backgroundColor: '#0B0B0E' }}>
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Setting up your trial...</h2>
          <p className="text-gray-300">We're redirecting you to complete your free trial setup.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4" style={{ backgroundColor: '#0B0B0E' }}>
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:from-purple-500 hover:to-purple-600"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full border border-white/20 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:bg-white/10"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CheckoutRedirect; 