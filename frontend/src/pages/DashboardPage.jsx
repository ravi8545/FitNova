import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
        <LayoutDashboard className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Dashboard Module</h2>
      <p className="text-slate-400 max-w-md mb-6">
        Daily summary, activity feed, and workout highlights.
      </p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
        src/pages/DashboardPage.jsx
      </div>
    </div>
  );
}
