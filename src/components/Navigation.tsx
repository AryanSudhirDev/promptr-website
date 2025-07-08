import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, LogOut, Trash2 } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { handleApiError, handleSuccess } from '../utils/errorHandling';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const handleDeleteAccount = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;
    
    setDeleteLoading(true);
    try {
      const email = user.emailAddresses[0].emailAddress;
      
      // Try to clean up backend data, but don't fail if it doesn't work
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`,
          {
            method: 'POST',
            headers: { 
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              action: 'delete_account', 
              email: email 
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log('Backend cleanup result:', result);
        } else {
          console.log('Backend cleanup failed, but continuing with account deletion');
        }
      } catch (backendError) {
        console.log('Backend cleanup failed:', backendError, 'but continuing with account deletion');
      }

      // Delete the Clerk account (this is the main action)
      await user.delete();
      
      // Close modals and clear loading state
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setShowUserMenu(false);
      
      // Redirect to home page with success message
      handleSuccess('Your account has been permanently deleted');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error('Delete account error:', error);
      
      // Check if it's a Clerk error about user not existing
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        handleSuccess('Account has already been deleted');
        setDeleteLoading(false);
        setShowDeleteModal(false);
        setShowUserMenu(false);
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        handleApiError(error, 'Navigation - Delete Account');
        setDeleteLoading(false);
      }
    }
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
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-red-300 hover:bg-red-600/20 hover:text-red-200 transition-colors flex items-center gap-2 border-t border-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
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
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-red-300 hover:text-red-200 hover:bg-red-600/20 rounded-md transition-colors duration-300"
                  >
                    Delete Account
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
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-gray-800/95 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Account</h3>
                <p className="text-red-200 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-300">
                Are you sure you want to permanently delete your account? This will:
              </p>
              <ul className="text-sm text-gray-400 space-y-2 ml-4">
                <li>• Cancel your subscription and stop all billing</li>
                <li>• Delete your access token and VS Code extension access</li>
                <li>• Remove all your account data permanently</li>
                <li>• Sign you out of all devices</li>
              </ul>
              <p className="text-red-300 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;