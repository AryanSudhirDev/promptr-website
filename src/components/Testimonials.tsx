import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const testimonials = [
    {
      name: 'Arjun Sharma',
      role: 'Senior Frontend Engineer at FinFlow',
      content: 'I used to spend 30 minutes writing PR descriptions and explaining code changes to my team. Now I just select the code, hit ⌘⇧G, and Promptr generates a clear explanation in seconds. The custom context feature understands our React patterns perfectly.',
      avatar: null
    },
    {
      name: 'Priya Mehta',
      role: 'Backend Engineer at CloudSync',
      content: 'Debugging complex SQL queries was a nightmare. I\'d copy-paste between ChatGPT and my editor constantly. Promptr stays in VS Code, so I can refine my debugging prompts without losing context. The creativity slider helps me get more precise answers.',
      avatar: null
    },
    {
      name: 'Rahul Verma',
      role: 'Full-stack Developer at DataViz',
      content: 'Code reviews were taking forever because I couldn\'t explain complex algorithms clearly. Now I select the code, use Promptr to generate explanations, and my team actually understands what I\'m doing. Saves me 2-3 hours per week on reviews.',
      avatar: null
    },
    {
      name: 'Anjali Desai',
      role: 'DevOps Engineer at SecureStack',
      content: 'I was constantly switching between VS Code and ChatGPT to debug Kubernetes YAML files. Promptr understands infrastructure code and generates better debugging prompts. I can explain complex configurations to my team in minutes instead of hours.',
      avatar: null
    },
    {
      name: 'Vikram Singh',
      role: 'Tech Lead at CodeCraft',
      content: 'Our team was struggling with inconsistent code documentation. I set up custom context for our coding standards, and now everyone uses Promptr to generate consistent documentation. It\'s reduced our onboarding time by 40%.',
      avatar: null
    }
  ];

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isHovered, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Loved by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              developers
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            See what our community has to say about Promptr
          </p>
        </div>

        <div
          className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 md:p-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="text-center relative z-10">
            <div className="mb-8">
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6 min-h-[80px] flex items-center justify-center">
                "{testimonials[currentIndex].content}"
              </p>
              <div>
                <p className="text-white font-semibold">{testimonials[currentIndex].name}</p>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8 relative z-10">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-gray-800/50 hover:bg-blue-600/20 border border-gray-700/50 hover:border-blue-500/30 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300 hover:text-blue-400" />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-600/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-gray-800/50 hover:bg-blue-600/20 border border-gray-700/50 hover:border-blue-500/30 transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-300 hover:text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;