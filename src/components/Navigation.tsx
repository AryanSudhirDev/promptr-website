import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Menu, X, User, LogOut, Trash2 } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const Navigation = () => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => signOut();

  const handleDeleteAccount = async () => {
    if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) return;
    const email = user.primaryEmailAddress.emailAddress;
    if (!confirm(`Are you absolutely sure you want to delete your account for ${email}? This action cannot be undone.`)) return;
    setIsDeleting(true);
    setDeleteMessage('');
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-self-deletion`, {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (result.success) {
        setDeleteMessage('✅ Account successfully deleted! All your data has been removed.');
        await user.delete();
        window.location.href = 'https://usepromptr.com';
      } else {
        setDeleteMessage(`❌ Error: ${result.message || result.error || 'Failed to delete account'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account. Please try again.';
      setDeleteMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background border-b border-border/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <button
              onClick={() => (window.location.href = '/')}
              className="text-foreground font-bold text-xl hover:text-primary transition-colors duration-200"
            >
              Promptr
            </button>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = '/account')}
                  className="gap-2 text-foreground hover:text-primary hover:bg-muted"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl border-border bg-primary text-primary-foreground hover:bg-primary/90">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Signed in as</p>
                      <p className="text-sm font-medium text-foreground truncate mt-1">{user?.emailAddresses?.[0]?.emailAddress}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteModal(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => (window.location.href = '/sign-in')} className="text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
                <Button onClick={() => (window.location.href = '/sign-up')}>Get started</Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="text-foreground hover:bg-muted rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-nav" className="md:hidden pb-4">
            <div className="pt-2 space-y-1 border-t border-border rounded-b-xl bg-muted/30 mt-2 px-2 py-3">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-medium transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <div className="border-t border-border pt-3 mt-3 space-y-2">
                {isSignedIn ? (
                  <>
                    <Button variant="ghost" onClick={() => (window.location.href = '/account')} className="w-full justify-start rounded-xl">
                      Dashboard
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start rounded-xl text-muted-foreground">
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => (window.location.href = '/sign-in')} className="w-full justify-start rounded-xl">
                      Sign in
                    </Button>
                    <Button onClick={() => (window.location.href = '/sign-up')} className="w-full rounded-xl">
                      Get started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-destructive">
              <Trash2 className="w-6 h-6" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {deleteMessage && (
              <div
                className={`p-4 rounded-xl text-sm ${
                  deleteMessage.includes('✅') ? 'bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400' : 'bg-destructive/10 border border-destructive/20 text-destructive'
                }`}
              >
                {deleteMessage}
              </div>
            )}
            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl border border-border">
              <p className="font-medium text-foreground mb-2">What will be deleted:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your user account and profile</li>
                <li>All subscription data</li>
                <li>Usage history and preferences</li>
                <li>Account access tokens</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDeleteAccount} disabled={isDeleting} variant="destructive" className="flex-1">
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navigation;
