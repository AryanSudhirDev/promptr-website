import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

const faqs = [
  {
    question: 'How does Promptr work?',
    answer:
      'Promptr integrates directly into VS Code as an extension. Simply select any text in your editor, press ⌘⇧G (or Ctrl+Shift+G on Windows/Linux), and Promptr will analyze and improve your prompts using AI to make them more effective.',
  },
  {
    question: 'Does Promptr improve my code?',
    answer:
      "No, Promptr doesn't directly improve your code. Instead, it helps you craft better prompts that you can then use with AI coding assistants like ChatGPT, Claude, or Copilot to get more accurate and useful responses.",
  },
  {
    question: 'Do I need to configure API keys?',
    answer:
      'No! Promptr comes with built-in AI capabilities that work out of the box. You can start using it immediately after installation without any configuration.',
  },
  {
    question: 'Can I add custom context to my prompts?',
    answer:
      'Absolutely! Promptr allows you to add custom context to tailor your prompts for specific use cases, coding patterns, or project requirements. This helps generate more relevant and targeted prompts.',
  },
  {
    question: 'Is my prompt data secure?',
    answer:
      'Yes. Promptr is designed with privacy in mind. Your prompts are processed locally when possible, and we never store or share your prompt data with third parties.',
  },
  {
    question: 'What programming languages are supported?',
    answer:
      'Promptr works with all programming languages since it focuses on improving prompts rather than code directly. The AI understands context from various codebases and can help craft prompts for any language.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Yes, you can cancel your subscription at any time. There are no long-term commitments, and you'll continue to have access to all features until the end of your current billing period.",
  },
];

const FAQ = () => {
  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Questions & <span className="text-primary">Answers</span>
          </h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about getting started with Promptr</p>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-xl bg-card px-6 data-[state=open]:border-primary/30 transition-colors overflow-hidden"
            >
              <AccordionTrigger className="py-6 text-left hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <span className="text-lg font-semibold text-foreground pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-0">
                <div className="border-t border-border pt-4">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
