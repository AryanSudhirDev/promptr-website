import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

const Hero = () => {
  const [lottieData, setLottieData] = useState<object | null>(null);

  useEffect(() => {
    const url = 'https://assets10.lottiefiles.com/packages/lf20_2pzg2z2x.json';
    fetch(url)
      .then((res) => res.json())
      .then(setLottieData)
      .catch(() => setLottieData(null));
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex items-center px-4 sm:px-6 lg:px-8 py-20 lg:py-28 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" aria-hidden />
      <div className="relative z-10 max-w-7xl mx-auto w-full pt-12 pb-8">
        <div className="grid lg:grid-cols-[1.05fr_1.55fr] gap-10 lg:gap-14 items-center">
          <div className="text-left order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              <span className="text-primary">Supercharge</span> your coding workflow
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Transform vague ideas into precise, actionable prompts. AI-powered prompt refinement inside your editor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-xl text-base font-semibold shadow-sm">
                <a
                  href="https://open-vsx.org/extension/aryansudhir/promptr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Install Extension
                </a>
              </Button>
              <Button variant="outline" size="lg" onClick={scrollToPricing} className="rounded-xl text-base font-semibold">
                Get started for free
              </Button>
            </div>
          </div>
          <div className="relative order-1 lg:order-2 flex items-center justify-center">
            <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-xl">
              {lottieData ? (
                <Lottie animationData={lottieData} loop className="w-full h-full max-h-[760px]" />
              ) : (
                <img
                  src="/promptr-demo.gif"
                  alt="Promptr VS Code extension demo showing prompt selection and AI refinement"
                  className="w-full h-auto object-cover rounded-3xl"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
