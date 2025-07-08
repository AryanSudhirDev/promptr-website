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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Checkout Cancelled</h1>
            <p className="text-gray-300 mb-6">No worries! You can try again anytime.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:from-purple-500 hover:to-purple-600"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900" style={{ backgroundColor: '#0B0B0E' }}>
        <div className="relative">
          {/* Background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
          
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