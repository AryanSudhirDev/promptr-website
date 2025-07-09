import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import CheckoutRedirect from './components/CheckoutRedirect';
import AccountDashboard from './components/AccountDashboard';
import NotificationSystem from './components/NotificationSystem';
import { AuthPage } from './components/AuthWrapper';

function App() {
  const path = window.location.pathname;

  // Handle authentication pages
  if (path === '/sign-in') {
    return (
      <>
        <AuthPage mode="sign-in" />
        <NotificationSystem />
      </>
    );
  }

  if (path === '/sign-up') {
    return (
      <>
        <AuthPage mode="sign-up" />
        <NotificationSystem />
      </>
    );
  }

  // Handle immediate checkout after signup
  if (path === '/checkout') {
    return (
      <>
        <CheckoutRedirect />
        <NotificationSystem />
      </>
    );
  }

  // Handle account dashboard
  if (path === '/account') {
    return (
      <>
        <AccountDashboard />
        <NotificationSystem />
      </>
    );
  }

  // Handle cancelled page
  if (path === '/cancelled') {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Checkout Cancelled</h1>
            <p className="text-gray-400 mb-8 font-light">No worries! You can try again anytime when you're ready.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] hover:-translate-y-1"
            >
              Return to Home
            </button>
          </div>
        </div>
        <NotificationSystem />
      </>
    );
  }

  // Default home page
  return (
    <>
      <div className="min-h-screen bg-black">
        <div className="relative">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <Navigation />
            <Hero />
            <div id="features">
              <Features />
            </div>
            <div id="pricing">
              <Pricing />
            </div>
            <div id="faq">
              <FAQ />
            </div>
            <Footer />
          </div>
        </div>
      </div>
      <NotificationSystem />
    </>
  );
}

export default App;