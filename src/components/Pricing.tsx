import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import { Badge } from './ui/badge';
import { Zap, Check, Crown, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { handleApiError } from '../utils/errorHandling';

const features = [
  'Unlimited AI-powered prompt refinements',
  'Custom context settings',
  'Creativity level control',
  'Multi-editor support (VS Code, Cursor, Windsurf)',
  'Seamless editor integration',
  'No usage limits',
];

const Pricing = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<'active' | 'inactive' | 'trialing' | null>(null);

  useEffect(() => {
    if (isSignedIn && isLoaded && user?.emailAddresses?.[0]?.emailAddress) {
      const checkSubscriptionStatus = async () => {
        setStatusLoading(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`,
            {
              method: 'POST',
              headers: {
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'get_subscription_status',
                email: user.emailAddresses[0]?.emailAddress,
              }),
            }
          );
          const data = await response.json();
          if (response.ok && data.status) setUserSubscriptionStatus(data.status);
          else setUserSubscriptionStatus('inactive');
        } catch {
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-token`, {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.emailAddresses[0].emailAddress, plan: 'free' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to create free plan access');
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.emailAddresses[0].emailAddress, plan }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.hasActiveSubscription) {
          handleApiError(new Error(data.message || data.error), 'Pricing - Existing Subscription');
          setTimeout(() => (window.location.href = '/account'), 2000);
          return;
        }
        throw new Error(data.message || data.error || 'Failed to create checkout session');
      }
      if (data.url) window.location.href = data.url;
      else throw new Error('No checkout URL received');
    } catch (error) {
      handleApiError(error, 'Pricing - Create Checkout Session');
    } finally {
      setIsLoading(false);
    }
  };

  const FeatureList = ({ items, highlight = false }: { items: string[]; highlight?: boolean }) => (
    <div className="space-y-2.5">
      {items.map((feature, i) => (
        <div key={i} className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
              highlight ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
        </div>
      ))}
    </div>
  );

  const FreePlanCard = () => (
    <Card className="h-full flex flex-col min-h-[400px] border-border bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="text-left px-5 pt-5 pb-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center">
            <Zap className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">Free</CardTitle>
            <CardDescription>Start for free, upgrade anytime.</CardDescription>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">$0</span>
          <span className="text-muted-foreground text-sm">/month</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow pt-0 px-5 pb-5">
        <FeatureList items={['50 prompt refinements/month', ...features.slice(1, 5)]} />
      </CardContent>
      <CardFooter className="pt-3 mt-auto px-5 pb-5">
        {isSignedIn ? (
          <Button variant="outline" onClick={handleFreePlan} disabled={isLoading} className="w-full rounded-xl font-semibold" size="lg">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                Creating free access...
              </span>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Start Free
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => (window.location.href = '/sign-up')} className="w-full rounded-xl font-semibold" size="lg">
            <Zap className="w-5 h-5 mr-2" />
            Start Free
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const ProPlanCard = () => (
    <Card className="h-full flex flex-col min-h-[400px] border-2 border-primary/25 bg-card rounded-2xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 transition-shadow relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          Most popular
        </Badge>
      </div>
      <CardHeader className="text-left px-5 pt-5 pb-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">Pro</CardTitle>
            <CardDescription>Full power, unlimited refinements.</CardDescription>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground line-through">$7.99</span>
          <span className="text-3xl font-bold text-foreground">$5.99</span>
          <span className="text-muted-foreground text-sm">/month</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow pt-0 px-5 pb-5">
        <FeatureList items={features} highlight />
      </CardContent>
      <CardFooter className="pt-3 mt-auto px-5 pb-5">
        {!isSignedIn ? (
          <Button onClick={() => (window.location.href = '/sign-up')} className="w-full rounded-xl font-semibold" size="lg">
            <Zap className="w-5 h-5 mr-2" />
            Start 14 Day Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : statusLoading ? (
          <div className="w-full py-4 px-6 rounded-xl border border-border bg-muted/50 flex items-center justify-center gap-3 text-muted-foreground font-semibold">
            <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            Checking subscription...
          </div>
        ) : userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' ? (
          <div className="space-y-3 w-full">
            <Button onClick={() => (window.location.href = '/account')} className="w-full rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white" size="lg">
              {userSubscriptionStatus === 'trialing' ? 'Manage Your Trial' : 'Manage Subscription'}
            </Button>
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl py-2 px-3 text-sm font-medium">
              <Check className="w-4 h-4" />
              You have {userSubscriptionStatus === 'trialing' ? 'an active free trial' : 'an active subscription'}
            </div>
          </div>
        ) : (
          <Button onClick={() => handleCheckout('pro')} disabled={isLoading} className="w-full rounded-xl font-semibold" size="lg">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating checkout...
              </span>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                {userSubscriptionStatus === 'inactive' ? 'Renew Subscription' : 'Start 14 Day Free Trial'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Choose your <span className="text-primary">perfect plan</span>
          </h2>
          <p className="text-lg text-muted-foreground">Start free. Upgrade when you need more power.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <FreePlanCard />
          <ProPlanCard />
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card border border-border shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>14-day free trial</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>No setup fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
