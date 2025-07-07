import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Frontend Dev at fintech startup',
      content: 'I\'ve been using this for 3 months now. The context feature is incredibly useful when working with our React/TypeScript codebase. Still requires some fine-tuning but significantly better than my previous copy-paste workflow with ChatGPT.',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Backend Engineer, 8 years exp',
      content: 'I was initially skeptical, but the prompt refinements genuinely help. Particularly effective when debugging complex SQL queries or explaining legacy code. The temperature slider could be more intuitive though.',
      avatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Sarah Kim',
      role: 'Full-stack @ YC startup',
      content: 'Real game changer for code reviews. I use it to generate better PR descriptions and explain complex algorithms to junior developers. The ⌘⇧G shortcut has become second nature. No more switching to ChatGPT in another tab.',
      avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Jake Thompson',
      role: 'DevOps/Platform Engineer',
      content: 'Extremely useful for Kubernetes YAML debugging and generating Terraform explanations. The offline functionality is essential for our security-conscious team. Still discovering all the features it offers.',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Priya Patel',
      role: 'Senior Frontend @ Big Tech',
      content: 'Primarily use it for refactoring legacy jQuery into modern React. The context awareness is surprisingly accurate - it understands our component patterns well. Saves approximately 30 minutes daily, which adds up significantly.',
      avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
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
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Loved by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              developers
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            See what our community has to say about Promptr
          </p>
        </div>

        <div
          className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="text-center">
            <div className="mb-8">
              <img
                src={testimonials[currentIndex].avatar}
                alt={testimonials[currentIndex].name}
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
              />
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6 min-h-[80px] flex items-center justify-center">
                "{testimonials[currentIndex].content}"
              </p>
              <div>
                <p className="text-white font-semibold">{testimonials[currentIndex].name}</p>
                <p className="text-purple-400">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-purple-500' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;