import React from 'react';
import { Zap, Code, Brain, Sparkles, Settings, Monitor } from 'lucide-react';

const Features = () => {
  return (
    <section className="relative pb-20 px-4 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
      
        {/* Features section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Features
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-blue-400/40 transition-colors duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Creativity Control</h3>
            <p className="text-gray-300 leading-relaxed">
              Adjust creativity levels for your AI responses. From conservative to experimental, 
              get exactly the type of suggestions you need.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/40 transition-colors duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Smart Prompt Templates</h3>
            <p className="text-gray-300 leading-relaxed">
              Pre-built templates for common coding tasks. Refactor code, debug issues, 
              and generate documentation with one click.
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-900/30 to-red-900/30 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6 hover:border-pink-400/40 transition-colors duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Seamless Integration</h3>
            <p className="text-gray-300 leading-relaxed">
              Works directly in your editor with keyboard shortcuts and command palette. 
              No context switching or external tools needed.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-400/40 transition-colors duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Prompt Refinement</h3>
            <p className="text-gray-300 leading-relaxed">
              Transform vague ideas into precise, actionable prompts. Get better AI responses 
              with intelligent prompt engineering built-in.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-400/40 transition-colors duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Custom Context</h3>
            <p className="text-gray-300 leading-relaxed">
              Set custom context for your prompts to get more relevant AI responses. 
              Define your project structure, coding style, and specific requirements.
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-colors duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-4">
              <Monitor className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Multi-Editor Support</h3>
            <p className="text-gray-300 leading-relaxed">
              Works seamlessly across VS Code, Cursor, Windsurf, and other popular editors. 
              Same powerful features, wherever you code.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;