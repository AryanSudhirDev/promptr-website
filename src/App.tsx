import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
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
        </div>
      </div>
    </div>
  );
}

export default App;