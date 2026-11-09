import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

/**
 * App shell: fixed sidebar + sticky top bar + ONE content frame (.app-main).
 * Pages render inside the frame and must not add their own outer padding,
 * max-width or background - that is what keeps every page aligned and consistent.
 */
export default function MainLayout({
  activePage,
  setActivePage,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  searchQuery,
  setSearchQuery,
  onAddClick,
  children,
}) {
  return (
    <div className="min-h-screen bg-bg text-slate-100 flex flex-col antialiased font-sans">
      <Sidebar
        activePage={activePage}
        onNavigate={(pageId) => {
          setActivePage(pageId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <TopNavbar
          activePage={activePage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onAddClick={onAddClick}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
