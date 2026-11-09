import React, { useState } from 'react';

export default function InteractiveBarChart({ data = [], title = "Calorie Intake vs Burn" }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Dynamically calculate max value from data with sensible default
  const highestValue = data.reduce(
    (max, item) => Math.max(max, Number(item.intake || 0), Number(item.burned || 0)),
    0
  );
  const maxVal = Math.max(2500, Math.ceil(highestValue / 500) * 500);
  const step = Math.round(maxVal / 5);
  const yTicks = [maxVal, maxVal - step, maxVal - step * 2, maxVal - step * 3, step, 0];

  return (
    <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2BAF34]" />
              <span className="text-slate-400">Intake</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#334155]" />
              <span className="text-slate-400">Burned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-56 w-full flex">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-[10px] text-slate-500 pr-3 select-none pb-6">
          {yTicks.map((val) => (
            <span key={val} className="text-right w-8">{val.toLocaleString()}</span>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative flex-1 flex items-end justify-between border-b border-[#1E2D42] pb-6 gap-2 sm:gap-4">
          {/* Background Grid Lines */}
          <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between pointer-events-none">
            {yTicks.map((val) => (
              <div key={val} className="w-full border-b border-[#162230]/70" />
            ))}
          </div>

          {!data || data.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-xs text-slate-400 font-semibold">No calorie logs recorded for this period</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Log daily food intake & workouts to see intake vs burn balance</span>
            </div>
          ) : (
            data.map((item, idx) => {
              const intakeHeight = Math.min(100, (Number(item.intake || 0) / maxVal) * 100);
              const burnedHeight = Math.min(100, (Number(item.burned || 0) / maxVal) * 100);
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.day || idx}
                  className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-[#090D16] border border-[#2BAF34]/50 shadow-xl rounded-lg px-2.5 py-1 text-[11px] whitespace-nowrap pointer-events-none animate-fadeIn">
                      <span className="text-[#2BAF34] font-bold">{item.intake}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="text-slate-300 font-semibold">{item.burned} kcal</span>
                    </div>
                  )}

                  {/* Bars */}
                  <div className="flex items-end gap-1 sm:gap-1.5 w-full max-w-[28px] h-full justify-center">
                    {/* Intake Bar (Green) */}
                    <div
                      style={{ height: `${intakeHeight}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isHovered
                          ? 'bg-[#35D440] shadow-glow-subtle'
                          : 'bg-[#2BAF34]'
                      }`}
                    />
                    {/* Burned Bar (Slate) */}
                    <div
                      style={{ height: `${burnedHeight}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isHovered
                          ? 'bg-[#475569]'
                          : 'bg-[#1E293B]'
                      }`}
                    />
                  </div>

                  {/* X Axis Label */}
                  <span className="absolute -bottom-6 text-[10px] text-slate-400 font-medium">
                    {item.day}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
