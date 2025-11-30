import React from 'react';
import { Download } from 'lucide-react';

const Hero = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative flex items-center px-4 lg:px-8 xl:px-16 py-32 overflow-hidden">
      {/* Hero content - Two column layout like Second Nature */}
      <div className="relative z-10 max-w-7xl mx-auto w-full pt-16 pb-0">
        <div className="grid lg:grid-cols-[45%_55%] gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Supercharge
              </span>{' '}
              your coding workflow
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed font-light max-w-lg">
              Transform vague ideas into precise, actionable prompts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 lg:mr-32">
              <a
                href="https://open-vsx.org/extension/aryansudhir/promptr"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-2xl transition-colors duration-200 shadow-lg shadow-blue-500/25"
              >
                <Download className="w-5 h-5 mr-2" />
                Install Extension
              </a>
              <button
                onClick={scrollToPricing}
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-600 hover:border-purple-500/50 bg-gray-800/50 hover:bg-gray-700/80 text-white font-semibold rounded-2xl transition-colors duration-200 backdrop-blur-sm"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Right Column - Demo */}
          <div className="relative lg:-ml-20 pr-8 lg:pr-12">
            <div className="rounded-3xl overflow-hidden">
              <img 
                src="/promptr-demo.gif" 
                alt="Promptr VS Code extension demo showing prompt selection and AI refinement"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/10 to-pink-600/20 rounded-3xl blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;