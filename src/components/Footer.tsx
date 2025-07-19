import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/promptr',
      icon: Github
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/promptr',
      icon: Twitter
    }
  ];

  return (
    <footer className="py-16 px-4 border-t border-gray-700/50 relative">
      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-400 text-sm">© {currentYear} Promptr. All rights reserved.</p>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800/50 hover:bg-blue-600/20 border border-gray-700/50 hover:border-blue-500/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
            <a
              href="mailto:support@usepromptr.com"
              className="w-10 h-10 bg-gray-800/50 hover:bg-blue-600/20 border border-gray-700/50 hover:border-blue-500/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;