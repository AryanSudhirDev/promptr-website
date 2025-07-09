import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Trash2 } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
  };

  const handleDeleteAccount = async () => {
    if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) return;

    const email = user.primaryEmailAddress.emailAddress;
    
    if (!confirm(`Are you absolutely sure you want to delete your account for ${email}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setDeleteMessage('');

    try {
      // Call our simple delete function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-self-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        setDeleteMessage('✅ Account successfully deleted! All your data has been removed.');
        
        // Delete from Clerk (this happens in background)
        await user.delete();
        
        // Redirect to home page immediately
        window.location.href = 'https://usepromptr.com';
      } else {
        setDeleteMessage(`❌ Error: ${result.message || 'Failed to delete account'}`);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setDeleteMessage(`❌ Error: Failed to delete account. Please try again.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-black/90 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl shadow-black/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => window.location.href = '/'}
              className="text-white font-bold text-xl hover:text-purple-400 transition-colors duration-300"
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
                  className="text-gray-400 hover:text-white transition-colors duration-300 font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:block">
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = '/account'}
                    className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-700/50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                      >
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl shadow-black/20">
                      <DropdownMenuLabel className="px-4 py-3 border-b border-gray-800/50">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate mt-1">
                          {user?.emailAddresses?.[0]?.emailAddress}
                        </p>
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteModal(true)}
                        className="text-red-300 hover:bg-red-600/10 hover:text-red-200 transition-colors flex items-center gap-3 rounded-xl mx-2 my-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-800/50" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors flex items-center gap-3 rounded-xl mx-2 my-1 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = '/sign-in'}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 px-6 py-2 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-700/50 font-medium"
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-purple-400 hover:bg-gray-800/50 transition-colors duration-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-2xl mt-4 shadow-2xl shadow-black/20">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-300 font-medium rounded-xl"
                >
                  {item.name}
                </button>
              ))}
              
              <div className="border-t border-gray-800/50 pt-3 mt-3">
                {isSignedIn ? (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => window.location.href = '/account'}
                      className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-xl"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-xl"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => window.location.href = '/sign-in'}
                      className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-xl"
                    >
                      Sign in
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400 flex items-center gap-3">
              <Trash2 className="w-6 h-6" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {deleteMessage && (
              <div className={`p-4 rounded-xl ${
                deleteMessage.includes('✅') 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {deleteMessage}
              </div>
            )}
            
            <div className="text-sm text-gray-400 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <p className="font-medium text-white mb-2">What will be deleted:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your user account and profile</li>
                <li>All subscription data</li>
                <li>Usage history and preferences</li>
                <li>Account access tokens</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navigation;