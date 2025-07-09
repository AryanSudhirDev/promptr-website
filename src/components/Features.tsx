import React from 'react';
import { Zap, Rocket, Flame, MessageSquare, Globe, Layers } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: 'Unlimited prompt refinements',
      description: 'Refine and improve your prompts as many times as you need',
      highlight: 'Unlimited'
    },
    {
      icon: MessageSquare,
      title: 'AI-powered code explanations',
      description: 'Get intelligent explanations for complex code snippets',
      highlight: 'Smart AI'
    },
    {
      icon: Rocket,
      title: 'Advanced context awareness',
      description: 'AI understands your project context for better results',
      highlight: 'Context-aware'
    },
    {
      icon: Flame,
      title: 'Custom prompt templates',
      description: 'Create and save templates for your most common prompting tasks',
      highlight: 'Customizable'
    },
    {
      icon: Globe,
      title: 'Multi-language support',
      description: 'Works seamlessly with code in any programming language',
      highlight: 'Universal'
    },
    {
      icon: Layers,
      title: 'Batch processing capability',
      description: 'Process multiple prompts and files efficiently in one go',
      highlight: 'Efficient'
    }
  ];

  return (
    <section className="py-32 px-4 bg-black relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-black to-black"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500">
              craft perfect prompts
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light">
            Built for developers who demand precision, speed, and simplicity in their AI workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gray-900/20 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 transition-all duration-500 hover:bg-gray-800/30 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transform hover:scale-[1.02] hover:-translate-y-2"
            >
              {/* Feature highlight badge */}
              <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {feature.highlight}
              </div>

              <div className="flex items-center justify-center w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-6 group-hover:bg-purple-500/20 group-hover:border-purple-400/40 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-purple-100 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/0 via-purple-600/0 to-purple-600/0 group-hover:from-purple-600/5 group-hover:via-purple-600/5 group-hover:to-purple-600/5 transition-all duration-500 -z-10"></div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default Features;