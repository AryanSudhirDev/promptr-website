import React, { useEffect, useState } from 'react';
import { Check, Copy, Eye, EyeOff, ExternalLink, CreditCard, Calendar, User, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser, useAuth } from '@clerk/clerk-react';
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
        
        // If user doesn't exist in database but is authenticated via Clerk,
        // they might have completed payment but webhook failed
        
        if (tokenData.success) {
          setUserToken(tokenData.token);
        }

        if (subData.success) {
          setSubscriptionData(subData.subscription);
        }
      } catch (error) {
        handleApiError(error, 'Account Dashboard - Fetch User Data');
      } finally {
        setLoading(false);
        setSubscriptionLoading(false);
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
        handleSuccess(data.message || 'Subscription cancelled successfully');
        setShowSubscriptionModal(false);
        // Refresh subscription data
        window.location.reload();
      } else {
        handleApiError(new Error(data.error || 'Unknown error occurred'), 'Account - Cancel Subscription');
      }
    } catch (error) {
      // Error already handled by enhancedFetch
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getTrialDaysRemaining = () => {
    if (!subscriptionData?.trial_end) return 0;
    const trialEnd = new Date(subscriptionData.trial_end);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return Math.max(0, days);
  };

  const getStatusDisplay = () => {
    if (!subscriptionData) return { text: 'Loading...', color: 'gray' };
    
    // Check if trial is cancelled (inactive status but still has trial_end in the future)
    if (subscriptionData.status === 'inactive' && subscriptionData.trial_end) {
      const trialEnd = new Date(subscriptionData.trial_end);
      const now = new Date();
      if (trialEnd > now) {
        return { text: 'Trial Cancelled (Active until trial ends)', color: 'yellow' };
      }
    }
    
    if (subscriptionData.cancel_at_period_end) {
      return { text: 'Cancelled (Active until end of period)', color: 'yellow' };
    }
    
    switch (subscriptionData.status) {
      case 'trialing':
        return { text: 'Pro Plan - Active Trial', color: 'green' };
      case 'active':
        return { text: 'Pro Plan - Active', color: 'green' };
      case 'inactive':
        return { text: 'Pro Plan - Inactive', color: 'red' };
      default:
        return { text: 'Unknown Status', color: 'gray' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 px-4 py-8" style={{ backgroundColor: '#0B0B0E' }}>
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
        
        {/* Subscription Management Modal */}
        <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
          <DialogContent className="bg-gray-800/95 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end &&
                new Date(subscriptionData.trial_end) > new Date()
                  ? 'Renew Subscription'
                  : 'Manage Subscription'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current Plan Info */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    statusDisplay.color === 'green'
                      ? 'bg-green-500'
                      : statusDisplay.color === 'yellow'
                      ? 'bg-yellow-500'
                      : statusDisplay.color === 'red'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}></div>
                  <span className="text-white font-medium">{statusDisplay.text}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {/* Check if trial is cancelled */}
                  {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end &&
                  new Date(subscriptionData.trial_end) > new Date() ? (
                    <p>Access ends: {formatDate(subscriptionData.trial_end)}</p>
                  ) : subscriptionData?.status === 'trialing' ? (
                    <p>{getTrialDaysRemaining()} days remaining in your free trial</p>
                  ) : null}
                  {!subscriptionData?.cancel_at_period_end &&
                  !(subscriptionData?.status === 'inactive' && subscriptionData?.trial_end) && (
                    <p>Next billing: ${(subscriptionData?.amount || 499) / 100}/month</p>
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
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600"
                  >
                    Renew Subscription
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleUpdatePaymentMethod}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600"
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
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-300">
                    You'll continue to have access until the end of your current billing period.
                  </p>
                </div>
              )}

              {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end &&
              new Date(subscriptionData.trial_end) > new Date() && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-sm text-green-300">
                    Your trial was cancelled but you still have access until {formatDate(subscriptionData.trial_end)}. Renew now to continue using Promptr Pro.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="link"
              onClick={() => (window.location.href = '/')}
              className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center px-0"
            >
              ← Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">Account Dashboard</h1>
            <p className="text-gray-300">Manage your Promptr Pro subscription and access token</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Info */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Account Info</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{user?.emailAddresses?.[0]?.emailAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-white font-medium">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.firstName || 'Not set'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member since</p>
                  <p className="text-white font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Subscription</h2>
              </div>
              
              <div className="space-y-4">
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        statusDisplay.color === 'green' ? 'bg-green-500' :
                        statusDisplay.color === 'yellow' ? 'bg-yellow-500' :
                        statusDisplay.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-white font-medium">{statusDisplay.text}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Show trial cancelled status */}
                      {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end && 
                       new Date(subscriptionData.trial_end) > new Date() ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Trial ends (cancelled)</span>
                          <span className="text-white text-sm">{getTrialDaysRemaining()} days remaining</span>
                        </div>
                      ) : subscriptionData?.status === 'trialing' && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Trial ends</span>
                          <span className="text-white text-sm">{getTrialDaysRemaining()} days remaining</span>
                        </div>
                      )}
                      {!subscriptionData?.cancel_at_period_end && 
                       !(subscriptionData?.status === 'inactive' && subscriptionData?.trial_end) && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            {subscriptionData?.status === 'trialing' ? 'Price after trial' : 'Monthly cost'}
                          </span>
                          <span className="text-white text-sm">${(subscriptionData?.amount || 499) / 100}/month</span>
                        </div>
                      )}
                      {subscriptionData?.cancel_at_period_end && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Access ends</span>
                          <span className="text-white text-sm">{formatDate(subscriptionData.current_period_end)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Show different button text based on status */}
                {subscriptionData?.status === 'inactive' && subscriptionData?.trial_end && 
                 new Date(subscriptionData.trial_end) > new Date() ? (
                  <Button 
                    onClick={handleRenewSubscription}
                    disabled={subscriptionLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600 disabled:opacity-50"
                  >
                    {subscriptionLoading ? 'Loading...' : 'Renew Subscription'}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowSubscriptionModal(true)}
                    disabled={subscriptionLoading}
                    variant="secondary"
                    className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    {subscriptionLoading ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Access Token Section */}
          <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔑</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">VS Code Access Token</h2>
                  <p className="text-purple-200 text-sm">Use this token to authenticate your extension</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
              ) : userToken ? (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium text-sm">Your Token:</span>
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showToken ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-white bg-black/30 p-3 rounded-lg break-all border border-white/10 mb-3">
                    {showToken ? userToken : '•'.repeat(40)}
                  </div>
                  <button
                    onClick={copyToken}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      copied 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy Token'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No access token found. Please contact support.</p>
                </div>
              )}

              {/* Setup Instructions */}
              <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Setup Instructions:</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">1.</span>
                    <span>Install the Promptr VS Code extension</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">2.</span>
                    <span>Copy your access token above</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">3.</span>
                    <span>Open VS Code settings and paste your token in Promptr settings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">4.</span>
                    <span>Start using Promptr with ⌘⇧G (or Ctrl+Shift+G)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default AccountDashboard; 