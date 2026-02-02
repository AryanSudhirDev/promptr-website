import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { handleApiError } from '../utils/errorHandling';

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
            body: JSON.stringify({ 
              email: user.emailAddresses[0].emailAddress,
              plan: 'pro' // Default to pro plan for checkout redirect
            }),
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
        console.error('Checkout error details:', error);
        handleApiError(error, 'Checkout Redirect');
        
        // Show more specific error for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Debug: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    handleCheckout();
  }, [isLoaded, user]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
          <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Setting up your subscription...</h2>
          <p className="text-muted-foreground">We're redirecting you to complete your subscription setup.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full border border-border text-foreground font-semibold py-3 px-6 rounded-xl hover:bg-muted transition-colors"
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