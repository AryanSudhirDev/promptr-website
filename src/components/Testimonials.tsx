import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const testimonials = [
  {
    name: 'Arjun Sharma',
    role: 'Senior Frontend Engineer at FinFlow',
    content:
      "I used to spend 30 minutes writing PR descriptions and explaining code changes to my team. Now I just select the code, hit ⌘⇧G, and Promptr generates a clear explanation in seconds. The custom context feature understands our React patterns perfectly.",
  },
  {
    name: 'Priya Mehta',
    role: 'Backend Engineer at CloudSync',
    content:
      "Debugging complex SQL queries was a nightmare. I'd copy-paste between ChatGPT and my editor constantly. Promptr stays in VS Code, so I can refine my debugging prompts without losing context. The creativity slider helps me get more precise answers.",
  },
  {
    name: 'Rahul Verma',
    role: 'Full-stack Developer at DataViz',
    content:
      "Code reviews were taking forever because I couldn't explain complex algorithms clearly. Now I select the code, use Promptr to generate explanations, and my team actually understands what I'm doing. Saves me 2-3 hours per week on reviews.",
  },
  {
    name: 'Anjali Desai',
    role: 'DevOps Engineer at SecureStack',
    content:
      "I was constantly switching between VS Code and ChatGPT to debug Kubernetes YAML files. Promptr understands infrastructure code and generates better debugging prompts. I can explain complex configurations to my team in minutes instead of hours.",
  },
  {
    name: 'Vikram Singh',
    role: 'Tech Lead at CodeCraft',
    content:
      "Our team was struggling with inconsistent code documentation. I set up custom context for our coding standards, and now everyone uses Promptr to generate consistent documentation. It's reduced our onboarding time by 40%.",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[currentIndex];

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by <span className="text-primary">developers</span>
          </h2>
          <p className="text-lg text-muted-foreground">See what our community has to say about Promptr</p>
        </div>

        <Card
          className="border-border bg-card rounded-2xl p-8 md:p-12 shadow-sm"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-0">
            <div className="text-center" aria-live="polite" aria-atomic="true">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 min-h-[80px] flex items-center justify-center">
                &ldquo;{t.content}&rdquo;
              </p>
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-primary text-sm mt-1">{t.role}</p>
            </div>

            <div className="flex justify-center items-center gap-4 mt-8">
              <Button variant="outline" size="icon" onClick={prev} className="rounded-full border-border hover:bg-muted" aria-label="Previous testimonial">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex gap-2" role="tablist" aria-label="Testimonial slides">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === currentIndex}
                    aria-label={`Testimonial ${i + 1}`}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={next} className="rounded-full border-border hover:bg-muted" aria-label="Next testimonial">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Testimonials;
