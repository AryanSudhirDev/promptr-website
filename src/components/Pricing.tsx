import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Zap, Check, Star, Crown, Sparkles, ArrowRight } from 'lucide-react';
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

  const handleFreePlan = async () => {
    if (!isSignedIn) {
      window.location.href = '/sign-up';
      return;
    }

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      handleApiError(new Error('Please ensure you are signed in with a valid email address'), 'Pricing - Free Plan');
      return;
    }

    setIsLoading(true);
    try {
      // Directly create user access for free plan
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-token`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            email: user.emailAddresses[0].emailAddress,
            plan: 'free'
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create free plan access');
      }

      // Redirect to account dashboard
      window.location.href = '/account';
    } catch (error) {
      handleApiError(error, 'Pricing - Free Plan Access');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (plan: 'pro' = 'pro') => {
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
          body: JSON.stringify({ 
            email: user.emailAddresses[0].emailAddress,
            plan: plan
          }),
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

  const FreePlanCard = () => (
    <Card className="relative h-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl shadow-black/20 hover:shadow-3xl hover:shadow-black/30 transition-all duration-500 group flex flex-col min-h-[480px]">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white mb-2">Free</CardTitle>
        
        {/* Pricing */}
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-white">$0</span>
            <span className="text-gray-300 text-base font-medium">/month</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">

        
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-gray-400" />
          </div>
          <span className="text-gray-300 text-sm">100 requests/month</span>
        </div>
        
        {features.slice(1, 5).map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-gray-400" />
            </div>
            <span className="text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter className="pt-4 mt-auto">
        {isSignedIn ? (
          <Button 
            onClick={handleFreePlan}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 hover:text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group text-base"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin mr-2"></div>
                Creating free access...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Start Free Plan
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={() => window.location.href = '/sign-up'}
            variant="outline"
            className="w-full bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 hover:text-white font-semibold py-4 rounded-xl transition-all duration-200 group text-base"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Free Plan
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const ProPlanCard = () => (
    <Card className="relative h-full bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-xl border border-blue-700/50 rounded-3xl shadow-2xl shadow-blue-500/20 hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-500 group flex flex-col min-h-[480px]">

      
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white mb-2">Pro</CardTitle>
        
        {/* Pricing */}
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-white">$5.99</span>
            <span className="text-gray-300 text-base font-medium">/month</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter className="pt-4 mt-auto">
        {isSignedIn ? (
          <>
            {statusLoading ? (
              <div className="w-full bg-gray-700/50 text-gray-300 font-semibold py-4 px-6 rounded-xl opacity-50 cursor-not-allowed border border-gray-600/50 text-base">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                  Checking subscription...
                </div>
              </div>
            ) : userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' ? (
              <div className="space-y-3 w-full">
                <Button 
                  onClick={() => window.location.href = '/account'}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-4 rounded-xl transition-colors duration-200 text-base"
                >
                  {userSubscriptionStatus === 'trialing' ? 'Manage Your Trial' : 'Manage Subscription'}
                </Button>
                <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl py-2 px-3">
                  <Check className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    You have {userSubscriptionStatus === 'trialing' ? 'an active free trial' : 'an active subscription'}
                  </span>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => handleCheckout('pro')}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-blue-500/30 text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating checkout...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    {userSubscriptionStatus === 'inactive' ? 'Renew Subscription' : 'Start 14 Day Free Trial'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            )}
          </>
        ) : (
          <Button 
            onClick={() => window.location.href = '/sign-up'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 group shadow-xl shadow-blue-500/30 text-base"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start 14 Day Free Trial
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <section id="pricing" className="relative py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Choose your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              perfect plan
            </span>
          </h2>

        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="w-full max-w-sm mx-auto">
            <FreePlanCard />
          </div>
          <div className="w-full max-w-sm mx-auto">
            <ProPlanCard />
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>No setup fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;