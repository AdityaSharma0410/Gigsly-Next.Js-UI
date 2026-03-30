'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useNotification } from '@/lib/contexts/NotificationContext';
import { chatApi } from '@/lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Briefcase,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Shield,
  UsersRound,
  Mail,
  Info,
} from 'lucide-react';
import SiteInteractiveBackground from '@/components/site/SiteInteractiveBackground';
import { useEffect, useState } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useNotification();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadMessages(0);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const count = await chatApi.getUnreadCount();
        if (!cancelled) setUnreadMessages(Number.isFinite(count) ? count : 0);
      } catch {
        if (!cancelled) setUnreadMessages(0);
      }
    };

    load();
    const t = window.setInterval(load, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [isAuthenticated]);

  const browseHref = isAuthenticated ? '/browse' : '/register?next=%2Fbrowse';
  const professionalsHref = isAuthenticated ? '/professionals' : '/register?next=%2Fprofessionals';

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Browse', href: browseHref, icon: Search },
    ...(user?.role === 'PROFESSIONAL' ? [{ name: 'Find Work', href: '/find-work', icon: Briefcase }] : []),
    { name: 'Browse Professionals', href: professionalsHref, icon: UsersRound },
    ...(user?.role === 'ADMIN' ? [{ name: 'Browse Clients', href: '/clients', icon: UsersRound }] : []),
    { name: 'Contact', href: '/contact', icon: Mail },
    ...(isAuthenticated
      ? [
          { name: 'Messages', href: '/chat', icon: MessageSquare },
          user?.role === 'ADMIN'
            ? { name: 'Admin', href: '/admin', icon: Shield }
            : { name: 'Dashboard', href: '/dashboard', icon: User },
        ]
      : []),
  ];

  const navLinkActive = (href: string) => {
    const pathOnly = href.split('?')[0];
    if (pathname === pathOnly) return true;
    if (pathOnly === '/register' && pathname === '/register') return true;
    return false;
  };

  const scrollT = Math.min(1, scrollY / 180);
  const headerBlur = 12 + (1 - scrollT) * 14;
  const headerTop = 0.62 + (1 - scrollT) * 0.14;
  const headerMid = 0.28 + (1 - scrollT) * 0.14;
  const headerBot = 0.04 + scrollT * 0.16;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteInteractiveBackground />

      {/* Header: vertical glass gradient (frosted top → translucent bottom) + scroll-linked strength */}
      <header className="sticky top-0 z-50 border-b border-border/80 relative overflow-hidden shadow-[0_1px_0_hsl(var(--border)/0.35)]">
        <div
          className="absolute inset-0 -z-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom,
              hsl(var(--card) / ${headerTop}) 0%,
              hsl(var(--card) / ${headerMid}) 52%,
              hsl(var(--card) / ${headerBot}) 100%)`,
            backdropFilter: `blur(${headerBlur}px) saturate(1.25)`,
            WebkitBackdropFilter: `blur(${headerBlur}px) saturate(1.25)`,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              <span className="text-gradient">Gigsly</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = navLinkActive(item.href);
                const showUnread = item.href === '/chat' && unreadMessages > 0;
                return (
                  <Link
                    key={`${item.name}-${item.href}`}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="relative inline-flex">
                      <Icon className="w-4 h-4" />
                      {showUnread && (
                        <span
                          className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[10px] leading-4 text-white bg-red-600 rounded-full text-center"
                          aria-label={`${unreadMessages} unread messages`}
                        >
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/notifications"
                    aria-label="Notifications"
                    className={`p-2 hover:bg-muted rounded-lg transition-colors relative ${
                      pathname === '/notifications' ? 'bg-muted' : ''
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {(notifications.length > 0 || unreadMessages > 0) && (
                      <span
                        className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/profile/me"
                      className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-border overflow-hidden shrink-0 hover:opacity-90 transition-opacity"
                      aria-label="Profile"
                    >
                      {user?.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.fullName?.[0]?.toUpperCase()
                      )}
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg hover:bg-muted font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-lg gradient-hero text-white font-medium hover:opacity-90"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md p-4 relative z-10">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = navLinkActive(item.href);
                return (
                  <Link
                    key={item.name + item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-border">
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/profile/me"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted"
                  >
                    <span className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 ring-2 ring-border">
                      {user?.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.fullName?.[0]?.toUpperCase()
                      )}
                    </span>
                    <span className="font-medium">Profile</span>
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      pathname === '/notifications' ? 'bg-blue-600 text-white' : 'hover:bg-muted'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">Notifications</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg border border-border text-center font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg gradient-hero text-white text-center font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border glass-surface py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                <span className="text-gradient">Gigsly</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                India&apos;s #1 freelance marketplace connecting talent with opportunities.
              </p>
            </div>
            {!isAuthenticated && (
              <>
                <div>
                  <h4 className="font-semibold mb-4">For Clients</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/register?next=%2Fbrowse" className="hover:text-foreground">
                        Browse Services
                      </Link>
                    </li>
                    <li>
                      <Link href="/register?next=%2Fcreate-gig" className="hover:text-foreground">
                        Post a Job
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">For Freelancers</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/register?next=%2Ffind-work" className="hover:text-foreground">
                        Find Work
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="hover:text-foreground">
                        Become a Seller
                      </Link>
                    </li>
                  </ul>
                </div>
              </>
            )}
            {isAuthenticated && user?.role === 'CLIENT' && (
              <div>
                <h4 className="font-semibold mb-4">For Clients</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/browse" className="hover:text-foreground">
                      Browse Services
                    </Link>
                  </li>
                  <li>
                    <Link href="/create-gig" className="hover:text-foreground">
                      Post a Job
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            {isAuthenticated && user?.role === 'PROFESSIONAL' && (
              <div>
                <h4 className="font-semibold mb-4">For Freelancers</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/find-work" className="hover:text-foreground">
                      Find Work
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/me" className="hover:text-foreground">
                      Your profile
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <>
                <div>
                  <h4 className="font-semibold mb-4">Platform</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/admin" className="hover:text-foreground">
                        Admin
                      </Link>
                    </li>
                    <li>
                      <Link href="/browse" className="hover:text-foreground">
                        Browse Services
                      </Link>
                    </li>
                    <li>
                      <Link href="/clients" className="hover:text-foreground">
                        Browse Clients
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">More</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/professionals" className="hover:text-foreground">
                        Professionals
                      </Link>
                    </li>
                    <li>
                      <Link href="/find-work" className="hover:text-foreground">
                        Find Work
                      </Link>
                    </li>
                  </ul>
                </div>
              </>
            )}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Gigsly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
