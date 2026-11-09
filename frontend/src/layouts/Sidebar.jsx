import React from 'react';
import BrandMark from '../components/BrandMark';
import {
  LayoutDashboard,
  House,
  Utensils,
  Dumbbell,
  Calendar,
  TrendingUp,
  User,
  Droplets,
  Moon,
  Pill,
  Target,
  FileText,
  Image as ImageIcon,
  Settings,
  Crown,
  X,
  Info,
  Mail,
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'premium', label: 'Premium', icon: Crown, highlight: true },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'body-stats', label: 'Body Stats', icon: User },
  { id: 'water-intake', label: 'Water Intake', icon: Droplets },
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'supplements', label: 'Supplements', icon: Pill, highlight: true },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'reports', label: 'Reports', icon: FileText, highlight: true },
  { id: 'photos', label: 'Photos', icon: ImageIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About FitNova', icon: Info },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export default function Sidebar({
  activePage,
  onNavigate,
  isMobileOpen,
  setIsMobileOpen,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090D16] border-r border-[#162230] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#162230]/70">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <BrandMark size={32} />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold tracking-tight text-white">FitNova</span>
              <span className="text-[10px] font-bold text-[#2BAF34] uppercase tracking-wider bg-[#2BAF34]/15 px-1.5 py-0.5 rounded">PRO</span>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left relative ${
                  isActive
                    ? 'bg-[#0D141C] text-[#2BAF34] border border-[#2BAF34]/30 shadow-md shadow-[#2BAF34]/10'
                    : 'text-slate-400 hover:text-white hover:bg-[#0D141C]/60'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2BAF34] rounded-r-full shadow-glow-primary" />
                )}
                
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-[#2BAF34]'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                
                <span className="truncate">{item.label}</span>

                {item.highlight && !isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2BAF34]/50" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Go Premium Card */}
        <div className="p-4 border-t border-[#162230]/70">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0D141C] to-[#0B111A] border border-[#1E2D42] p-4 text-center">
            {/* Ambient subtle glow inside card */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#2BAF34]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-[#2BAF34]/15 border border-[#2BAF34]/30 flex items-center justify-center text-[#2BAF34]">
              <Crown className="w-5 h-5 fill-[#2BAF34]" />
            </div>

            <h4 className="font-bold text-white text-sm mb-1">Go Premium</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Unlock advanced analytics, custom plans and more.
            </p>

            <button
              onClick={() => {
                onNavigate('premium');
                setIsMobileOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black font-bold text-xs shadow-lg shadow-[#2BAF34]/20 transition-all duration-200 active:scale-95"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
