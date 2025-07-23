import React from 'react';
import { Download, Sparkles } from 'lucide-react';

const CTA = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background glow effects */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl -z-10"></div>
          
          <div className="mb-8 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Transform your coding workflow today
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Get started in seconds, no setup required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
            <div className="text-left group">
              <h3 className="text-xl font-semibold text-white mb-4">Install Extension</h3>
              <p className="text-gray-300 mb-4">
                Download from VS Code marketplace and start using immediately. 
                Free to install with no configuration required.
              </p>
              <a
                href="https://marketplace.visualstudio.com/items?itemName=AryanSudhir.promptr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] group-hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Install Now
              </a>
            </div>

            <div className="text-left group">
              <h3 className="text-xl font-semibold text-white mb-4">Get Started</h3>
              <p className="text-gray-300 mb-4">
                Choose your plan and start using Promptr today. 
                Free plan available with 50 prompt refinements per month.
              </p>
              <button
                onClick={scrollToPricing}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 hover:border-purple-500/50 bg-gray-800/50 hover:bg-gray-700/80 text-white font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm transform hover:scale-[1.02] group-hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-400 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Free to install</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>No setup required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Works offline</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA; 