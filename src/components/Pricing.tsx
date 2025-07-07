import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { enhancedFetch, handleApiError } from '../utils/errorHandling';

const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<'trialing' | 'active' | 'inactive' | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { user, isSignedIn, isLoaded } = useUser();
  
  const features = [
    'Unlimited prompt refinements',
    'One-click AI enhancement',
    'Prompt creativity control',
    'Custom context integration'
  ];

  // Check user's subscription status when signed in
  React.useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!isSignedIn || !user?.emailAddresses?.[0]?.emailAddress) {
        setUserSubscriptionStatus(null);
        return;
      }

      setStatusLoading(true);
      try {
        const response = await enhancedFetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`,
          {
            method: 'POST',
            headers: { 
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
            },
            body: JSON.stringify({ 
              action: 'get_subscription_status', 
              email: user.emailAddresses[0].emailAddress 
            }),
          },
          'Pricing - Check Subscription Status'
        );

        const data = await response.json();
        if (data.success && data.subscription) {
          setUserSubscriptionStatus(data.subscription.status);
        }
      } catch (error) {
        // Silently fail - user might not have a subscription yet
        setUserSubscriptionStatus(null);
      } finally {
        setStatusLoading(false);
      }
    };

    if (isLoaded) {
      checkSubscriptionStatus();
    }
  }, [isSignedIn, isLoaded, user]);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      // Redirect to sign up if not authenticated
      window.location.href = '/sign-up';
      return;
    }

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      handleApiError(new Error('Please ensure you are signed in with a valid email address'), 'Pricing - Checkout');
      return;
    }

    setIsLoading(true);
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
          handleApiError(new Error(data.message || data.error), 'Pricing - Existing Subscription');
          // Redirect to account dashboard after showing error
          setTimeout(() => {
            window.location.href = '/account';
          }, 2000);
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
      handleApiError(error, 'Pricing - Create Checkout Session');
    } finally {
      setIsLoading(false);
    }
  };

  const PricingCard = () => (
    <div className="flex justify-center">
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 max-w-md w-full transition-all duration-300 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transform hover:scale-105">
        {/* Popular badge */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-semibold">
            Most Popular
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
          <p className="text-gray-300 mb-6">Everything you need to supercharge your prompts</p>
          
          <div className="mb-6">
            <span className="text-5xl font-bold text-white">$4.99</span>
            <span className="text-gray-400 text-lg">/month</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-purple-400" />
              </div>
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button - changes based on auth state and subscription status */}
        {isSignedIn ? (
          <>
            {statusLoading ? (
              <div className="w-full bg-gray-600 text-white font-semibold py-4 px-6 rounded-full opacity-50 cursor-not-allowed">
                Checking subscription...
              </div>
            ) : userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' ? (
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/account'}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 hover:from-green-500 hover:to-green-600 hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
                >
                  {userSubscriptionStatus === 'trialing' ? 'Manage Your Trial' : 'Manage Subscription'}
                </button>
                <p className="text-center text-sm text-green-300">
                  ✅ You already have {userSubscriptionStatus === 'trialing' ? 'an active free trial' : 'an active subscription'}
                </p>
              </div>
            ) : (
              <button 
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 hover:from-purple-500 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Creating checkout...' : userSubscriptionStatus === 'inactive' ? 'Renew Subscription' : 'Start 14 Day Free Trial'}
              </button>
            )}
          </>
        ) : (
          <button 
            onClick={() => window.location.href = '/sign-up'}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 hover:from-purple-500 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
          >
            Start 14 Day Free Trial
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              pricing
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            One plan, all features. Start your free trial today.
          </p>
        </div>

        <PricingCard />
      </div>
    </section>
  );
};

export default Pricing;