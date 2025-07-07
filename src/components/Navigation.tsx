import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
  };

  const getInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => window.location.href = '/'}
              className="text-white font-bold text-xl hover:text-purple-400 transition-colors"
            >
              Promptr
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <>
                  <button
                    onClick={() => window.location.href = '/account'}
                    className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </button>
                  
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center hover:from-purple-500 hover:to-purple-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1">
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-sm text-gray-300">Signed in as</p>
                          <p className="text-sm font-medium text-white truncate">
                            {user?.emailAddresses?.[0]?.emailAddress}
                          </p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => window.location.href = '/sign-in'}
                    className="text-white/80 hover:text-white transition-colors mr-4"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'max-h-80 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-md rounded-lg mt-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-300"
              >
                {item.name}
              </button>
            ))}
            
            {/* Mobile Auth */}
            <div className="pt-2 border-t border-white/10">
              {isSignedIn ? (
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-300">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = '/account';
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-300"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-300"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = '/sign-in'}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-300"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;