import React, { useEffect, useState } from 'react';
import { Check, Copy, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { enhancedFetch, handleApiError, handleSuccess } from '../utils/errorHandling';

const Success = () => {
  const [userToken, setUserToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId && isLoaded && user?.emailAddresses?.[0]?.emailAddress) {
          const email = user.emailAddresses[0].emailAddress;
          
          // Get the user's access token
          const response = await enhancedFetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-token`,
            {
              method: 'POST',
              headers: { 
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
              },
              body: JSON.stringify({ email }),
            },
            'Success - Get User Token'
          );

          const data = await response.json();
          
          if (data.success) {
            setUserToken(data.token);
            setUserEmail(email);
          }
        }
      } catch (error) {
        handleApiError(error, 'Success Page - Fetch User Data');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
    fetchUserData();
    }
  }, [isLoaded, user]);

  const copyToken = async () => {
    if (userToken) {
      try {
        await navigator.clipboard.writeText(userToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        handleSuccess('Access token copied to clipboard!');
      } catch (error) {
        handleApiError(error, 'Success Page - Copy Token');
      }
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-gray-300 mb-6">You need to be signed in to view this page.</p>
          <button 
            onClick={() => window.location.href = '/sign-in'}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:from-purple-500 hover:to-purple-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 px-4 py-4" style={{ backgroundColor: '#0B0B0E' }}>
      {/* Background effects matching your main site */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Promptr Pro! 🎉
            </h1>
            <p className="text-xl text-gray-300">
              Your 14-day free trial has started successfully
            </p>
        </div>

          {/* Token section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-6 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔑</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">Your Access Token</h2>
                  </div>
                  <p className="text-purple-200 text-sm">Copy this token to authenticate your VS Code extension</p>
                </div>

                {/* User Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium text-sm">Account Email:</span>
                    <span className="text-white font-mono text-xs bg-gray-800/50 px-2 py-1 rounded-full">{userEmail}</span>
                  </div>
                </div>

                {/* Token Display */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 font-medium text-sm">Access Token:</span>
                        <button
                          onClick={() => setShowToken(!showToken)}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"
                        >
                          {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showToken ? 'Hide' : 'Show'}
                        </button>
                </div>
                <div className="font-mono text-sm text-white bg-black/30 p-3 rounded-lg break-all border border-white/10">
                  {showToken ? userToken : '•'.repeat(40)}
                </div>
                        <button
                          onClick={copyToken}
                  className={`flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            copied 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                          }`}
                        >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Token'}
                        </button>
                    </div>
                    
              {/* Instructions */}
              <div className="space-y-3 text-sm">
                <h3 className="text-white font-semibold">Next Steps:</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">1.</span>
                    <span>Install the Promptr VS Code extension from the marketplace</span>
                        </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">2.</span>
                    <span>Open VS Code settings and paste your access token</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">3.</span>
                    <span>Start using Promptr to supercharge your coding workflow!</span>
                    </div>
                </div>
                </div>
              </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-full font-medium transition-all duration-300 hover:bg-white/20"
          >
              Back to Home
          </button>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=promptr.promptr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-medium transition-all duration-300 hover:from-purple-500 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
            >
              Install VS Code Extension
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success; 