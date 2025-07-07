import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about Promptr
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-purple-500/30"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-6 h-6 text-purple-400" />
                  ) : (
                    <Plus className="w-6 h-6 text-purple-400" />
                  )}
                </div>
              </button>
              <div
                className={`px-8 pb-6 transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;