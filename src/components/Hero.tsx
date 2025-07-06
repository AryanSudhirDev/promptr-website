import React from 'react';
import { Download } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-900/10"></div>
      
      {/* Hero content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto pt-16">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            AI super-powers for your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              code editor
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Turn vague ideas into precise, high-quality prompts. 
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a
            href="https://google.com"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full transition-all duration-300 hover:from-purple-500 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
          >
            <Download className="w-5 h-5 mr-2" />
            Install on VS Code
          </a>
        </div>

        {/* Demo video */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <video
              src="/promptr-demo.mp4"
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full aspect-video rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;