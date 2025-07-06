import React from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
  const features = [
    'Unlimited prompt refinements',
    'One-click AI enhancement',
    'Streaming output responses',
    'Temperature control slider',
    'Custom context integration',
    'Privacy-first processing',
    'No API key required',
    'Priority support'
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              pricing
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            One plan, all features. Start your free trial today.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 max-w-md w-full transition-all duration-300 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transform hover:scale-105">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
              <p className="text-gray-300 mb-6">Everything you need to supercharge your prompts</p>
              
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$4.99</span>
                <span className="text-gray-400 text-lg">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-purple-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 hover:from-purple-500 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105">
              Start 2 week free trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;