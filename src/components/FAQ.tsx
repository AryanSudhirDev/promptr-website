import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: 'How does Promptr work?',
      answer: 'Promptr integrates directly into VS Code as an extension. Simply select any text in your editor, press ⌘⇧G (or Ctrl+Shift+G on Windows/Linux), and Promptr will analyze and improve your prompts using AI to make them more effective.'
    },
    {
      question: 'Does Promptr improve my code?',
      answer: 'No, Promptr doesn\'t directly improve your code. Instead, it helps you craft better prompts that you can then use with AI coding assistants like ChatGPT, Claude, or Copilot to get more accurate and useful responses.'
    },
    {
      question: 'Do I need to configure API keys?',
      answer: 'No! Promptr comes with built-in AI capabilities that work out of the box. You can start using it immediately after installation without any configuration.'
    },
    {
      question: 'Can I add custom context to my prompts?',
      answer: 'Absolutely! Promptr allows you to add custom context to tailor your prompts for specific use cases, coding patterns, or project requirements. This helps generate more relevant and targeted prompts.'
    },
    {
      question: 'Is my prompt data secure?',
      answer: 'Yes. Promptr is designed with privacy in mind. Your prompts are processed locally when possible, and we never store or share your prompt data with third parties.'
    },
    {
      question: 'What programming languages are supported?',
      answer: 'Promptr works with all programming languages since it focuses on improving prompts rather than code directly. The AI understands context from various codebases and can help craft prompts for any language.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. There are no long-term commitments, and you\'ll continue to have access to all features until the end of your current billing period.'
    }
  ];

  return (
    <section id="faq" className="relative py-32 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Questions &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Answers
            </span>
          </h2>
          <p className="text-xl text-gray-300 font-light">
            Everything you need to know about getting started with Promptr
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-6">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden transition-colors duration-200 hover:bg-gray-800/60 hover:border-blue-500/30 data-[state=open]:bg-gray-800/60 data-[state=open]:border-blue-500/30"
            >
              <AccordionTrigger className="w-full px-8 py-8 text-left flex items-center justify-between hover:no-underline group [&>svg]:hidden">
                <span className="text-lg md:text-xl font-semibold text-white pr-6 group-hover:text-blue-100 transition-colors duration-200">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 group-hover:border-blue-400/50 transition-colors duration-200 group-data-[state=open]:from-blue-500/30 group-data-[state=open]:to-purple-500/30 group-data-[state=open]:border-blue-400/50">
                  <div className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 group-hover:from-blue-300 group-hover:to-purple-300 transition-colors duration-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-0.5 bg-current rounded-full"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center group-data-[state=open]:rotate-90 transition-transform duration-200">
                      <div className="w-0.5 h-3 bg-current rounded-full"></div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 pt-0">
                <div className="border-t border-gray-700/50 pt-6">
                  <p className="text-gray-300 leading-relaxed text-lg font-light">
                    {faq.answer}
                  </p>
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