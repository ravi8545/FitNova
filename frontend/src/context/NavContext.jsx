import { createContext, useContext } from 'react';

/**
 * App-wide page navigation. FitNova switches pages with state (not URLs), so
 * any component can call `const navigate = useAppNav(); navigate('reports')`
 * instead of having an `onNavigate` prop threaded down to it.
 * Page ids match the sidebar: home, dashboard, nutrition, premium, workout,
 * calendar, progress, body-stats, water-intake, sleep, supplements, goals,
 * reports, photos, settings, about, contact.
 */
export const NavContext = createContext(() => {});

export const useAppNav = () => useContext(NavContext);
