import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white font-bold text-xl">Promptr</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI super-powers for your code editor
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/promptr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com/promptr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button 
                onClick={() => alert('Privacy Policy - Coming soon!')}
                className="hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => alert('Terms of Service - Coming soon!')}
                className="hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Promptr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;