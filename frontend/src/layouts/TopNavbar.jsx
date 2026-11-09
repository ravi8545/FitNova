import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, Plus, ShoppingCart, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

export default function TopNavbar({
  activePage,
  onOpenMobileMenu,
  onAddClick,
  searchQuery,
  setSearchQuery,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fitnova_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [cartCount, setCartCount] = useState(() => {
    try {
      const stored = localStorage.getItem('fitnova_cart');
      const items = stored ? JSON.parse(stored) : [];
      return items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUser = localStorage.getItem('fitnova_user');
        setCurrentUser(storedUser ? JSON.parse(storedUser) : null);

        const storedCart = localStorage.getItem('fitnova_cart');
        const items = storedCart ? JSON.parse(storedCart) : [];
        setCartCount(items.reduce((acc, item) => acc + (item.quantity || 1), 0));
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fitnova_cart_updated', handleStorageChange);
    window.addEventListener('fitnova_auth_changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fitnova_cart_updated', handleStorageChange);
      window.removeEventListener('fitnova_auth_changed', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fitnova_auth_token');
    localStorage.removeItem('fitnova_refresh_token');
    localStorage.removeItem('fitnova_user');
    setCurrentUser(null);
    setShowProfileMenu(false);
    window.dispatchEvent(new Event('fitnova_auth_changed'));
  };

  const handleOpenCart = () => {
    window.dispatchEvent(new Event('fitnova_open_cart'));
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Time for your Post-Workout Whey Protein (1 scoop)', time: '10m ago', unread: true },
    { id: 2, text: 'Great job! You reached 92% score on 8 Jun 2025', time: '1h ago', unread: true },
    { id: 3, text: 'Water intake is 10% below goal for this week', time: '4h ago', unread: true },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const displayName = currentUser?.name || currentUser?.username || 'Raj Pawar';
  const displayEmail = currentUser?.email || 'demo@fitnova.com';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'RP';

  return (
    <header className="sticky top-0 z-30 bg-[#090D16]/90 backdrop-blur-md border-b border-[#162230]">
      <div className="app-topbar-inner">
      {/* Left Section: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#0D141C] border border-[#162230]"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activePage === 'supplements'
                ? 'Search supplements, brands or categories...'
                : 'Search reports, metrics or logs...'
            }
            className="w-full pl-10 pr-4 py-2 bg-[#0D141C] border border-[#1E2D42] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#2BAF34] focus:ring-1 focus:ring-[#2BAF34] transition-all"
          />
        </div>
      </div>

      {/* Right Section: Cart, Add Button, Notifications, Authentication, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Cart Button (Always visible with badge) */}
        <button
          onClick={handleOpenCart}
          className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#0D141C] border border-[#162230] hover:border-[#2BAF34]/50 transition-all cursor-pointer"
          aria-label="Shopping Cart"
          title="Open Cart"
        >
          <ShoppingCart className="w-4 h-4 text-[#2BAF34]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2BAF34] text-black font-extrabold text-[10px] flex items-center justify-center shadow-lg shadow-[#2BAF34]/30 animate-pulse">
              {cartCount}
            </span>
          )}
        </button>

        {/* If NOT logged in: Show Login and Register */}
        {!currentUser ? (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-xl border border-[#1E2D42] text-slate-300 hover:text-white hover:border-[#2BAF34] text-xs font-semibold transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black text-xs font-bold transition-colors"
            >
              Register
            </Link>
          </div>
        ) : null}

        {/* Contextual Action Button */}
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2BAF34] text-[#2BAF34] hover:bg-[#2BAF34] hover:text-black font-semibold text-xs transition-all duration-200 active:scale-95 shadow-sm shadow-[#2BAF34]/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">
            {activePage === 'supplements' ? 'Add Supplement' : 'Add Metric'}
          </span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#0D141C] border border-[#162230] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-[#090D16]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0D141C] border border-[#1E2D42] rounded-2xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E2D42]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-[#2BAF34] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition-all ${
                      n.unread ? 'bg-[#121B26]/80 border border-[#2BAF34]/30' : 'bg-[#090D16]/50'
                    }`}
                  >
                    <p className="text-white text-[11px] leading-tight mb-1">{n.text}</p>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill with Dropdown */}
        <div className="relative pl-2 border-l border-[#162230]">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#0D141C] transition-colors cursor-pointer text-left"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#2BAF34]/40 border border-[#2BAF34]/60 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                <span>{initials}</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2BAF34] rounded-full border-2 border-[#090D16]" />
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                {displayName}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
              <span className="text-[10px] text-[#2BAF34] font-medium leading-tight">
                {currentUser ? 'Active Athlete' : 'Pro Athlete'}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0D141C] border border-[#1E2D42] rounded-2xl shadow-2xl p-3 z-50 space-y-3">
              <div className="pb-2 border-b border-[#1E2D42]">
                <p className="text-xs font-bold text-white leading-tight">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
                <span className="mt-1.5 inline-block text-[9px] font-extrabold text-[#2BAF34] bg-[#2BAF34]/15 px-2 py-0.5 rounded">
                  {currentUser ? 'LOGGED IN' : 'GUEST MODE'}
                </span>
              </div>

              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#121B26] transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#2BAF34]" />
                    <span>Login to your account</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#2BAF34] hover:bg-[#2BAF34]/10 transition-colors"
                  >
                    <span>Create new account</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
