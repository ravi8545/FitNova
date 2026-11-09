import React from 'react';
import { TrendingUp, User, Droplets, Moon, Target, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';

export function ProgressPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
        <TrendingUp className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Progress Module</h2>
      <p className="text-slate-400 max-w-md mb-6">Historical trends, 1RM progression, and personal records.</p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">src/pages/OtherPages.jsx</div>
    </div>
  );
}

export function BodyStatsPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
        <User className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Body Stats Module</h2>
      <p className="text-slate-400 max-w-md mb-6">BMI, body fat %, measurements (chest, waist, arms), and DEXA scan records.</p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">src/pages/OtherPages.jsx</div>
    </div>
  );
}

export function WaterIntakePage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
        <Droplets className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Water Intake Module</h2>
      <p className="text-slate-400 max-w-md mb-6">Daily hydration log, smart reminders, and glassware tracker.</p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">src/pages/OtherPages.jsx</div>
    </div>
  );
}

export function SleepPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
        <Moon className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Sleep Tracker Module</h2>
      <p className="text-slate-400 max-w-md mb-6">Sleep duration, REM cycles, deep sleep, and circadian rhythm optimization.</p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">src/pages/OtherPages.jsx</div>
    </div>
  );
}

export function GoalsPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
        <Target className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Goals Module</h2>
      <p className="text-slate-400 max-w-md mb-6">Set targets for weight cut, bulking, marathon running, strength, or flexibility.</p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">src/pages/OtherPages.jsx</div>
    </div>
  );
}

export function PhotosPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
        <ImageIcon className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Progress Photos Module</h2>
      <p className="text-slate-400 max-w-md mb-6">Before & After comparison slider, date tagged progress galleries, and private storage.</p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">src/pages/OtherPages.jsx</div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-300 mb-4">
        <SettingsIcon className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Settings & Profile</h2>
      <p className="text-slate-400 max-w-md mb-6">User preferences, unit switching (kg/lbs, kcal/kJ), integrations (Apple Health, Garmin), and accounts.</p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">src/pages/OtherPages.jsx</div>
    </div>
  );
}
