import React from 'react';

export default function MacrosDonut({ calories = 1980, proteinPct = 29, carbsPct = 37, fatsPct = 24 }) {
  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Percentages normalized to circumference
  const proteinDash = (proteinPct / 100) * circumference;
  const carbsDash = (carbsPct / 100) * circumference;
  const fatsDash = (fatsPct / 100) * circumference;

  // Offsets (starting from top -90deg)
  const proteinOffset = 0;
  const carbsOffset = -proteinDash;
  const fatsOffset = -(proteinDash + carbsDash);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track matching dark navy theme #121B26 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#121B26"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Protein Segment (Green) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2BAF34"
          strokeWidth={strokeWidth}
          strokeDasharray={`${proteinDash} ${circumference}`}
          strokeDashoffset={proteinOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />

        {/* Carbs Segment (Cyan) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#06b6d4"
          strokeWidth={strokeWidth}
          strokeDasharray={`${carbsDash} ${circumference}`}
          strokeDashoffset={carbsOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />

        {/* Fats Segment (Purple) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8B5CF6"
          strokeWidth={strokeWidth}
          strokeDasharray={`${fatsDash} ${circumference}`}
          strokeDashoffset={fatsOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-2xl font-extrabold text-white tracking-tight leading-none">
          {calories}
        </span>
        <span className="text-xs text-slate-400 font-medium mt-1">kcal</span>
      </div>
    </div>
  );
}
