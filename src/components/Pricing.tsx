import React, { useState } from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { enhancedFetch, handleApiError } from '../utils/errorHandling';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<'trialing' | 'active' | 'inactive' | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { user, isSignedIn, isLoaded } = useUser();
  
  const features = [
    'Unlimited prompt refinements',
    'AI-powered code explanations',
    'Advanced context awareness',
    'Custom prompt templates',
    'Multi-language support',
    'Batch processing capability'
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
      <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 md:p-12 max-w-lg w-full transition-all duration-500 hover:bg-gray-800/40 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-[1.02] hover:-translate-y-2">
        {/* Popular badge */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 border-2 border-purple-500 text-white px-6 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-purple-600">
            <Star className="w-4 h-4 fill-current" />
            Most Popular
          </Badge>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/10 to-purple-600/20 rounded-3xl blur-xl opacity-60"></div>
        
        <div className="relative">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-white mb-4">Everything you need</h3>
            <p className="text-gray-400 mb-8 text-lg font-light">
              Professional AI-powered prompting for serious developers
            </p>
            
            <div className="mb-8">
              <div className="flex items-end justify-center gap-2">
                <span className="text-6xl font-bold text-white">$6.99</span>
                <div className="flex flex-col items-start pb-2">
                  <span className="text-gray-400 text-lg font-medium">/month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 mb-10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300">
                  <Check className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button - changes based on auth state and subscription status */}
          {isSignedIn ? (
            <>
              {statusLoading ? (
                <div className="w-full bg-gray-700/50 text-gray-300 font-semibold py-4 px-6 rounded-2xl opacity-50 cursor-not-allowed border border-gray-600/50">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                    Checking subscription...
                  </div>
                </div>
              ) : userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' ? (
                <div className="space-y-4">
                  <Button 
                    onClick={() => window.location.href = '/account'}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/25 transform hover:scale-[1.02] hover:-translate-y-1"
                  >
                    {userSubscriptionStatus === 'trialing' ? 'Manage Your Trial' : 'Manage Subscription'}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl py-3 px-4">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      You have {userSubscriptionStatus === 'trialing' ? 'an active free trial' : 'an active subscription'}
                    </span>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating checkout...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      {userSubscriptionStatus === 'inactive' ? 'Renew Subscription' : 'Start 14 Day Free Trial'}
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button 
              onClick={() => window.location.href = '/sign-up'}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <Zap className="w-5 h-5" />
              Start 14 Day Free Trial
            </Button>
          )}

          <p className="text-center text-gray-500 text-sm mt-6">
            No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="pricing" className="py-32 px-4 bg-black relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-black to-black"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            One plan,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500">
              unlimited possibilities
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light">
            Start with a 14-day free trial. No commitments, no hidden fees. 
            Experience the full power of AI-enhanced prompting.
          </p>
        </div>

        <PricingCard />
      </div>
    </section>
  );
};

export default Pricing;