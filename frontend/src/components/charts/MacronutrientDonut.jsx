import React, { useState } from 'react';

export default function MacronutrientDonut({ distribution }) {
  const [activeItem, setActiveItem] = useState(null);

  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const items = distribution?.items || [];
  const totalCalories = distribution?.totalCalories || '0';

  let accumulatedPercent = 0;
  const slices = items.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Macronutrient Distribution</h3>
      </div>

      {/* Donut Body & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* SVG Donut Graphic */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#121B26"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Slices */}
            {slices.map((slice) => (
              <circle
                key={slice.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 cursor-pointer"
                onMouseEnter={() => setActiveItem(slice)}
                onMouseLeave={() => setActiveItem(null)}
              />
            ))}
          </svg>

          {/* Center Info Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
            {activeItem ? (
              <div className="animate-fadeIn">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  {activeItem.name}
                </span>
                <span className="text-lg font-black text-white">
                  {activeItem.percentage}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {activeItem.amount}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-lg sm:text-xl font-black text-white block">
                  {totalCalories}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Total kcal
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 w-full sm:w-auto">
          {items.map((item) => (
            <div
              key={item.name}
              className={`flex items-center justify-between sm:justify-start gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                activeItem?.name === item.name
                  ? 'bg-[#121B26] border border-[#1E2D42]'
                  : 'hover:bg-[#121B26]/50'
              }`}
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-300 font-semibold">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">{item.amount}</span>
                <span className="font-bold text-white min-w-[28px] text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
