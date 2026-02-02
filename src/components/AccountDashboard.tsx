import React, { useEffect, useState } from 'react';
import { Check, Copy, Eye, EyeOff, ExternalLink, CreditCard, Calendar, User, X, AlertTriangle, Key } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useUser } from '@clerk/clerk-react';
import { RequireAuth } from './AuthWrapper';
import { enhancedFetch, handleApiError, handleSuccess } from '../utils/errorHandling';

interface SubscriptionData {
  status: 'trialing' | 'active' | 'inactive';
  plan: string;
  amount: number;
  interval: string;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  plan_type?: 'free' | 'pro';
  stripe_product_id?: string;
  stripe_price_id?: string;
}

interface UsageData {
  current_usage: number;
  limit: number;
  plan: 'free' | 'pro';
  message: string;
}

const AccountDashboard = () => {
  const [userToken, setUserToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;
      
      try {
        const email = user.emailAddresses[0].emailAddress;
        
        // Get the user's access token and subscription data in parallel
        const [tokenResponse, subscriptionResponse] = await Promise.all([
          enhancedFetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-token`,
            {
              method: 'POST',
              headers: { 
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email }),
            },
            'Account - Get User Token'
          ),
          enhancedFetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`,
            {
              method: 'POST',
              headers: { 
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ action: 'get_subscription_status', email }),
            },
            'Account - Get Subscription Status'
          )
        ]);

        const tokenData = await tokenResponse.json();
        const subData = await subscriptionResponse.json();
        
        // Get usage data after we have the token
        let usageData = null;
        if (tokenData.success) {
          try {
            const usageResponse = await enhancedFetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-usage-limit`,
              {
                method: 'POST',
                headers: { 
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: tokenData.token }),
              },
              'Account - Get Usage Data'
            );
            usageData = await usageResponse.json();
          } catch (error) {
            console.log('Usage data not available:', error);
          }
        }
        
        // If user doesn't exist in database but is authenticated via Clerk,
        // they might have completed payment but webhook failed
        
        if (tokenData.success) {
          setUserToken(tokenData.token);
        }

        if (subData.success) {
          setSubscriptionData(subData.subscription);
        }

        if (usageData && usageData.allowed !== undefined) {
          setUsageData(usageData);
        }
      } catch (error) {
        handleApiError(error, 'Account Dashboard - Fetch User Data');
      } finally {
        setLoading(false);
        setSubscriptionLoading(false);
        setUsageLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const copyToken = async () => {
    if (userToken) {
      try {
        await navigator.clipboard.writeText(userToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        handleSuccess('Access token copied to clipboard!');
      } catch (error) {
        handleApiError(error, 'Account Dashboard - Copy Token');
      }
    }
  };

    const handleUpdatePaymentMethod = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;
    
    try {
      const response = await enhancedFetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`,
        {
          method: 'POST',
          headers: { 
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            action: 'create_customer_portal', 
            email: user.emailAddresses[0].emailAddress 
          }),
        },
        'Account - Open Customer Portal'
      );

      const data = await response.json();
      if (data.success) {
        window.open(data.url, '_blank');
        handleSuccess('Opening billing portal...');
      } else {
        handleApiError(new Error(data.error || 'Failed to open billing portal'), 'Account - Customer Portal');
      }
    } catch (error) {
      // Error already handled by enhancedFetch
    }
  };

  const handleRenewSubscription = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;
    
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
          handleApiError(new Error(data.message || data.error), 'Account - Already Active Subscription');
          // Refresh the page to update subscription status
          setTimeout(() => {
            window.location.reload();
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
      handleApiError(error, 'Account - Renew Subscription');
    }
  };

  const handleUpgradeToPro = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;
    
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
            plan: 'pro'
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create checkout session');
      }

      // Success - redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      handleApiError(error, 'Account - Upgrade to Pro');
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;
    
    setCancelLoading(true);
    try {
      const response = await enhancedFetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`,
        {
          method: 'POST',
          headers: { 
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            action: 'cancel_subscription', 
            email: user.emailAddresses[0].emailAddress 
          }),
        },
        'Account - Cancel Subscription'
      );

      const data = await response.json();
      if (data.success) {
        handleSuccess('Subscription cancelled successfully. You\'ll continue to have access until the end of your current billing period.');
        // Refresh subscription data
        window.location.reload();
      } else {
        handleApiError(new Error(data.error || 'Failed to cancel subscription'), 'Account - Cancel Subscription');
      }
    } catch (error) {
      // Error already handled by enhancedFetch
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTrialDaysRemaining = () => {
    if (!subscriptionData?.trial_end) return 0;
    const trialEnd = new Date(subscriptionData.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusDisplay = () => {
    if (!subscriptionData) return { text: 'Loading...', color: 'gray' };
    
    // Check if trial is cancelled but still active
    if (subscriptionData.status === 'inactive' && subscriptionData.trial_end) {
      const trialEnd = new Date(subscriptionData.trial_end);
      const now = new Date();
      if (trialEnd > now) {
        return { text: 'Pro Plan - Trial Cancelled (Active until trial ends)', color: 'yellow' };
      }
    }
    
    if (subscriptionData.cancel_at_period_end) {
      return { text: 'Pro Plan - Cancelled (Active until end of period)', color: 'yellow' };
    }
    
    // Check plan type
    const planType = subscriptionData.plan_type || 'pro';
    
    switch (subscriptionData.status) {
      case 'trialing':
        return { text: `${planType === 'free' ? 'Free Plan' : 'Pro Plan'} - Active Trial`, color: 'green' };
      case 'active':
        return { text: `${planType === 'free' ? 'Free Plan' : 'Pro Plan'} - Active`, color: 'green' };
      case 'inactive':
        return { text: `${planType === 'free' ? 'Free Plan' : 'Pro Plan'} - Inactive`, color: 'red' };
      default:
        return { text: 'Unknown Status', color: 'gray' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <section className="relative flex flex-col px-4 py-16">
          <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = '/')}
              className="text-primary hover:text-primary/80 mb-4 inline-flex items-center px-0 hover:bg-primary/10 rounded-xl transition-colors"
            >
              ← Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Account Dashboard</h1>
            <p className="text-muted-foreground">Manage your Promptr subscription and access token</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Account Info */}
            <div className="lg:col-span-6 group relative bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Account Info</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{user?.emailAddresses?.[0]?.emailAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-foreground font-medium">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.firstName || 'Not set'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="text-foreground font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="lg:col-span-6 group relative bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Check className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Subscription</h2>
              </div>
              
              <div className="space-y-4">
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        statusDisplay.color === 'green' ? 'bg-emerald-400' :
                        statusDisplay.color === 'yellow' ? 'bg-yellow-500' :
                        statusDisplay.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-foreground font-medium">{statusDisplay.text}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Show usage for free plan */}
                      {subscriptionData?.plan_type === 'free' && usageData && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Requests used</span>
                          <span className="text-foreground text-sm">
                            {usageData.current_usage}/{usageData.limit} per month
                          </span>
                        </div>
                      )}
                      
                      {/* Show trial cancelled status */}
                      {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end && 
                       new Date(subscriptionData.trial_end) > new Date() ? (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Trial ends (cancelled)</span>
                          <span className="text-foreground text-sm">{getTrialDaysRemaining()} days remaining</span>
                        </div>
                      ) : subscriptionData?.status === 'trialing' && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Trial ends</span>
                          <span className="text-foreground text-sm">{getTrialDaysRemaining()} days remaining</span>
                        </div>
                      )}
                      {!subscriptionData?.cancel_at_period_end && 
                       !(subscriptionData?.status === 'inactive' && subscriptionData?.trial_end) && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            {subscriptionData?.plan_type === 'free' ? 'Plan' : 'Next billing'}
                          </span>
                          <span className="text-foreground text-sm">
                            {subscriptionData?.plan_type === 'free' 
                              ? 'Free plan (50 prompt refinements/month)'
                              : subscriptionData?.status === 'trialing' 
                                ? formatDate(subscriptionData.current_period_end)
                                : `$${(subscriptionData?.amount || 599) / 100}/month`
                            }
                          </span>
                        </div>
                      )}
                      {subscriptionData?.cancel_at_period_end && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Access ends</span>
                          <span className="text-foreground text-sm">{formatDate(subscriptionData.current_period_end)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-3">
                      {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end &&
                      new Date(subscriptionData.trial_end) > new Date() ? (
                        <Button onClick={handleRenewSubscription} className="w-full">
                          Renew Subscription
                        </Button>
                      ) : subscriptionData?.plan_type === 'free' ? (
                        <>
                          <Button
                            onClick={handleUpgradeToPro}
                            className="w-full"
                          >
                            Upgrade to Pro
                          </Button>
                          <Button
                            onClick={() => setShowSubscriptionModal(true)}
                            variant="outline"
                            className="w-full"
                          >
                            Manage Free Plan
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => setShowSubscriptionModal(true)}
                            className="w-full"
                          >
                            Manage Subscription
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Access Token */}
            <div className="lg:col-span-12 group relative bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Key className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Access Token</h2>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Use this token to authenticate with the Promptr VS Code extension. Keep it secure and don&apos;t share it with others.
                    </p>
                    
                    <div className="relative">
                      <div className="flex items-center gap-2 p-4 bg-muted/50 border border-border rounded-xl">
                        <div className="flex-1 font-mono text-sm text-foreground">
                          {showToken ? userToken : '•'.repeat(userToken.length || 20)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowToken(!showToken)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyToken}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Install the VS Code extension</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Token automatically syncs with your subscription</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Management Modal */}
        <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end &&
                new Date(subscriptionData.trial_end) > new Date()
                  ? 'Renew Subscription'
                  : 'Manage Subscription'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current Plan Info */}
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    statusDisplay.color === 'green'
                      ? 'bg-emerald-400'
                      : statusDisplay.color === 'yellow'
                      ? 'bg-yellow-500'
                      : statusDisplay.color === 'red'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}></div>
                  <span className="text-foreground font-medium">{statusDisplay.text}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {/* Check if trial is cancelled */}
                  {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end &&
                  new Date(subscriptionData.trial_end) > new Date() ? (
                    <p>Access ends: {formatDate(subscriptionData.trial_end)}</p>
                  ) : subscriptionData?.status === 'trialing' ? (
                    <p>{getTrialDaysRemaining()} days remaining in your free trial</p>
                  ) : null}
                  {!subscriptionData?.cancel_at_period_end &&
                  !(subscriptionData?.status === 'inactive' && subscriptionData?.trial_end) && (
                                            <p>Next billing: ${(subscriptionData?.amount || 599) / 100}/month</p>
                  )}
                  {subscriptionData?.cancel_at_period_end && (
                    <p>Access ends: {formatDate(subscriptionData.current_period_end)}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end &&
                new Date(subscriptionData.trial_end) > new Date() ? (
                  <Button
                    onClick={handleRenewSubscription}
                    className="w-full"
                  >
                    Renew Subscription
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleUpdatePaymentMethod}
                      className="w-full"
                    >
                      Update Payment Method
                    </Button>

                    {!subscriptionData?.cancel_at_period_end && subscriptionData?.status !== 'inactive' && (
                      <Button
                        onClick={handleCancelSubscription}
                        disabled={cancelLoading}
                        variant="destructive"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
                      </Button>
                    )}
                  </>
                )}
              </div>

              {!subscriptionData?.cancel_at_period_end && subscriptionData?.status !== 'inactive' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    You'll continue to have access until the end of your current billing period.
                  </p>
                </div>
              )}

              {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end &&
              new Date(subscriptionData.trial_end) > new Date() && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-700">
                    Your trial was cancelled but you still have access until {formatDate(subscriptionData.trial_end)}. Renew now to continue using Promptr Pro.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </RequireAuth>
  );
};

export default AccountDashboard; 