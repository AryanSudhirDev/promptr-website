import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/promptr', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com/promptr', icon: Twitter },
  ];

  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-neutral-100 border-t border-neutral-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-neutral-400">© {currentYear} Promptr. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl border border-neutral-700 bg-neutral-800/50 hover:bg-violet-500/20 hover:border-violet-500/30 flex items-center justify-center text-neutral-400 hover:text-violet-400 transition-colors"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
            <a
              href="mailto:support@usepromptr.com"
              className="w-10 h-10 rounded-xl border border-neutral-700 bg-neutral-800/50 hover:bg-violet-500/20 hover:border-violet-500/30 flex items-center justify-center text-neutral-400 hover:text-violet-400 transition-colors"
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
