import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';

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
        <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Checkout Cancelled</h1>
            <p className="text-muted-foreground mb-8 font-light">No worries! You can try again anytime when you're ready.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm"
            >
              Return to Home
            </button>
          </div>
        </div>
        <NotificationSystem />
      </>
    );
  }

  // Default home page - Attio-inspired light theme
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="relative">
          <Hero />
          <div id="features">
            <Features />
          </div>
          <div id="testimonials">
            <Testimonials />
          </div>
          <div id="pricing">
            <Pricing />
          </div>
          <div id="faq">
            <FAQ />
          </div>
          <Footer />
        </main>
      </div>
      <NotificationSystem />
    </>
  );
}

export default App;