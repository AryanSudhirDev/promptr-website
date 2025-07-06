import React from 'react';
import { Zap, Rocket, Flame, Key, Shield, MessageSquare } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: 'One-click refinement',
      description: 'Instantly improve your prompts with a single keyboard shortcut'
    },
    {
      icon: Rocket,
      title: 'Streaming output',
      description: 'See AI responses in real-time as they generate'
    },
    {
      icon: Flame,
      title: 'Temperature slider',
      description: 'Control creativity levels for different prompting tasks'
    },
    {
      icon: MessageSquare,
      title: 'Custom context',
      description: 'Add tailored context to refine prompts for specific use cases'
    },
    {
      icon: Key,
      title: 'No API key needed',
      description: 'Get started immediately without configuration hassles'
    },
    {
      icon: Shield,
      title: 'Privacy-first',
      description: 'Your prompts stay secure with local processing when possible'
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Built for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              developers
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of prompt engineering with AI-powered assistance that understands your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transform hover:scale-105"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-6 group-hover:bg-purple-500/30 transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;