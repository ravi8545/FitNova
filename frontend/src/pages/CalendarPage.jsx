import React from 'react';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
        <Calendar className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Calendar Module</h2>
      <p className="text-slate-400 max-w-md mb-6">
        Schedule workouts, rest days, and milestone tracking.
      </p>
      <div className="text-xs font-mono text-emerald-400/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
        src/pages/CalendarPage.jsx
      </div>
    </div>
  );
}
