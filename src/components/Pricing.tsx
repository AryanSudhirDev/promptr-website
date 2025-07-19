import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Zap, Check, Star } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { handleApiError } from '../utils/errorHandling';

const Pricing = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<'active' | 'inactive' | 'trialing' | null>(null);

  const features = [
    'Unlimited AI-powered prompt refinements',
    'Custom context settings',
    'Creativity level control',
    'Multi-editor support (VS Code, Cursor, Windsurf)',
    'Seamless editor integration',
    'No usage limits'
  ];

  useEffect(() => {
    if (isSignedIn && isLoaded && user) {
      const checkSubscriptionStatus = async () => {
        setStatusLoading(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`,
            {
              method: 'POST',
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                action: 'get_status',
                email: user.emailAddresses[0]?.emailAddress 
              }),
            }
          );

          const data = await response.json();
          
          if (response.ok && data.status) {
            setUserSubscriptionStatus(data.status);
          } else {
            setUserSubscriptionStatus('inactive');
          }
        } catch (error) {
          console.error('Error checking subscription status:', error);
          setUserSubscriptionStatus('inactive');
        } finally {
          setStatusLoading(false);
        }
      };
      
      checkSubscriptionStatus();
    }
  }, [isSignedIn, isLoaded, user]);

  const handleCheckout = async () => {
    if (!isSignedIn) {
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
        if (data.hasActiveSubscription) {
          handleApiError(new Error(data.message || data.error), 'Pricing - Existing Subscription');
          setTimeout(() => {
            window.location.href = '/account';
          }, 2000);
          return;
        }
        
        throw new Error(data.message || data.error || 'Failed to create checkout session');
      }

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
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl shadow-black/20">
        {/* Popular badge */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-500/50 text-white px-6 py-2 text-sm font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 fill-current" />
            Most Popular
          </Badge>
        </div>
        
        <div className="relative">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">Everything you need</h3>
            <p className="text-gray-300 mb-6 text-lg font-light">
              Professional AI-powered prompting for serious developers
            </p>
            
            <div className="mb-6">
              <div className="flex items-end justify-center gap-2">
                <span className="text-2xl font-semibold text-gray-400 line-through">$10.99</span>
                <span className="text-6xl font-bold text-white">$5.99</span>
                <div className="flex flex-col items-start pb-2">
                  <span className="text-gray-400 text-lg font-medium">/month</span>
                </div>
              </div>
              <p className="text-green-400 text-sm font-medium mt-2">Save 45% • Limited time</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          {isSignedIn ? (
            <>
              {statusLoading ? (
                <div className="w-full bg-gray-700/50 text-gray-300 font-semibold py-6 px-6 rounded-2xl opacity-50 cursor-not-allowed border border-gray-600/50">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                    Checking subscription...
                  </div>
                </div>
              ) : userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' ? (
                <div className="space-y-4">
                  <Button 
                    onClick={() => window.location.href = '/account'}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-6 px-6 rounded-2xl transition-colors duration-200 text-lg"
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-6 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 text-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating checkout...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      {userSubscriptionStatus === 'inactive' ? 'Renew Subscription' : 'Start 14 Day Free Trial'}
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button 
              onClick={() => window.location.href = '/sign-up'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-6 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 text-lg"
            >
              <Zap className="w-6 h-6" />
              Start 14 Day Free Trial
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section id="pricing" className="relative py-32 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            One plan,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              unlimited possibilities
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
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