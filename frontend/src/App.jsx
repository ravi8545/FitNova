import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import HomePage from './pages/Home';
import PremiumPage from './pages/PremiumPage';
import DashboardDynamic from './pages/Dashboard';
import PhotosDynamic from './pages/Photos';
import CalendarDynamic from './pages/Calendar';
import GoalsDynamic from './pages/Goals';
import BodyStatsDynamic from './pages/BodyStats';
import ProgressDynamic from './pages/Progress';
import SettingsDynamic from './pages/Settings';
import WaterDynamic from './pages/Water';
import SleepDynamic from './pages/Sleep';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import MainLayout from './layouts/MainLayout';
import { NavContext } from './context/NavContext';
import { PAGE_BY_PATH } from './components/HomePageLink';
import {
  SupplementsPage,
  ReportsPage,
  NutritionPage,
  WorkoutsPage,
  CalendarPage,
  ProgressPage,
  BodyStatsPage,
  WaterIntakePage,
  SleepPage,
  GoalsPage,
  SettingsPage,
} from './pages';

export default function App() {
  const location = useLocation();
  const [activePage, setActivePage] = useState(() => PAGE_BY_PATH[location.pathname] || 'home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Follow real URL changes (e.g. after login, or /terms from the sign-up form).
  useEffect(() => {
    const pageId = PAGE_BY_PATH[location.pathname];
    if (pageId) setActivePage(pageId);
  }, [location.pathname]);

  // Authentication pages use a focused layout without the dashboard sidebar.
  if (location.pathname === '/login') return <LoginPage />;
  if (location.pathname === '/register') return <RegisterPage />;

  // One navigate() for the whole app: switch page, close the mobile menu, scroll to top.
  const navigate = (pageId) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'supplements':
        return (
          <SupplementsPage
            searchQuery={searchQuery}
            isAddModalOpen={isAddModalOpen}
            setIsAddModalOpen={setIsAddModalOpen}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        );
      case 'reports':
        return <ReportsPage />;
      case 'dashboard':
        return <DashboardDynamic />;
      case 'nutrition':
        return <NutritionPage onNavigateToPremium={() => navigate('premium')} />;
      case 'premium':
        return <PremiumPage onNavigateToNutrition={() => navigate('nutrition')} />;
      case 'workout':
      case 'workouts':
        return <WorkoutsPage onNavigate={navigate} />;
      case 'calendar':
        return <CalendarDynamic />;
      case 'progress':
        return <ProgressDynamic />;
      case 'body-stats':
        return <BodyStatsDynamic />;
      case 'water-intake':
        return <WaterDynamic />;
      case 'sleep':
        return <SleepDynamic />;
      case 'goals':
        return <GoalsDynamic />;
      case 'photos':
        return <PhotosDynamic />;
      case 'settings':
        return <SettingsDynamic />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <SupplementsPage searchQuery={searchQuery} />;
    }
  };

  return (
    <NavContext.Provider value={navigate}>
    <MainLayout
      activePage={activePage}
      setActivePage={setActivePage}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onAddClick={() => {
        if (activePage === 'supplements') {
          setIsAddModalOpen(true);
          window.dispatchEvent(new Event('fitnova_open_add_supplement_modal'));
        } else {
          alert('Add metric dialog for Reports');
        }
      }}
    >
      {renderCurrentPage()}
    </MainLayout>
    </NavContext.Provider>
  );
}
