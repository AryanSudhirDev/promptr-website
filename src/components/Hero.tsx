import React from 'react';
import { Download } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden bg-black">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-black to-purple-950/20"></div>
      
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      {/* Hero content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto pt-16">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
            AI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500">
              super-powers
            </span>{' '}for your
            <br className="hidden md:block" />
            code editor
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
            Transform vague ideas into precise, actionable prompts designed for maximum impact.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <a
            href="https://marketplace.visualstudio.com/items?itemName=promptr.promptr"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] hover:-translate-y-1"
          >
            <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
            Install Extension
          </a>
          <button
            onClick={() => window.location.href = '/sign-up'}
            className="inline-flex items-center justify-center px-8 py-4 border border-gray-700 hover:border-purple-500/50 bg-gray-900/50 hover:bg-gray-800/80 text-white font-semibold rounded-2xl transition-all duration-300 backdrop-blur-sm transform hover:scale-[1.02] hover:-translate-y-1"
          >
            Start Free Trial
          </button>
        </div>

        {/* Demo */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              <div className="ml-4 text-xs text-gray-500 font-mono">VS Code - Promptr Extension</div>
            </div>
            
            <div className="aspect-video rounded-2xl overflow-hidden bg-black/20 border border-gray-800/30">
              <img 
                src="/promptr-demo.gif" 
                alt="Promptr VS Code extension demo showing prompt selection and AI refinement"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-purple-400/10 to-purple-600/20 rounded-3xl blur-2xl -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;