import React from 'react';
import { Zap, Code, Brain, Sparkles, Settings, Monitor } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const features = [
  {
    icon: Zap,
    title: 'Creativity Control',
    description: 'Adjust creativity levels for your AI responses. From conservative to experimental, get exactly the type of suggestions you need.',
  },
  {
    icon: Code,
    title: 'Smart Prompt Templates',
    description: 'Pre-built templates for common coding tasks. Refactor code, debug issues, and generate documentation with one click.',
  },
  {
    icon: Brain,
    title: 'Seamless Integration',
    description: 'Works directly in your editor with keyboard shortcuts and command palette. No context switching or external tools needed.',
  },
  {
    icon: Sparkles,
    title: 'Prompt Refinement',
    description: 'Transform vague ideas into precise, actionable prompts. Get better AI responses with intelligent prompt engineering built-in.',
  },
  {
    icon: Settings,
    title: 'Custom Context',
    description: 'Set custom context for your prompts to get more relevant AI responses. Define your project structure, coding style, and specific requirements.',
  },
  {
    icon: Monitor,
    title: 'Multi-Editor Support',
    description: 'Works seamlessly across VS Code, Cursor, Windsurf, and other popular editors. Same powerful features, wherever you code.',
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to craft better prompts without leaving your editor.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-border bg-card rounded-xl p-6 transition-shadow hover:shadow-md">
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
