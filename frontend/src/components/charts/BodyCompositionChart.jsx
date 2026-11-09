import React, { useState } from 'react';

export default function BodyCompositionChart({ data = [] }) {
  const [activeMetric, setActiveMetric] = useState(null); // 'muscle' | 'fat' | 'water' | null

  const width = 450;
  const height = 150;
  const paddingX = 35;
  const paddingY = 20;

  // Scale: 0 to 80
  const minY = 0;
  const maxY = 80;
  const rangeY = maxY - minY;

  const getPoints = (key) => {
    return data.map((d, i) => {
      const divisor = Math.max(1, data.length - 1);
      const x = paddingX + (i / divisor) * (width - 2 * paddingX);
      const normalizedY = (d[key] - minY) / rangeY;
      const y = height - paddingY - normalizedY * (height - 2 * paddingY);
      return { val: d[key], day: d.day, x, y };
    });
  };

  const musclePoints = getPoints('muscle');
  const fatPoints = getPoints('fat');
  const waterPoints = getPoints('water');

  const makePath = (pts) =>
    pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white">Body Composition Trend</h3>
      </div>

      {/* Metric Selector / Legend */}
      <div className="flex items-center gap-4 text-xs mb-2">
        <button
          onClick={() => setActiveMetric(activeMetric === 'muscle' ? null : 'muscle')}
          className={`flex items-center gap-1.5 transition-all cursor-pointer ${
            activeMetric === null || activeMetric === 'muscle' ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#2BAF34]" />
          <span className="text-slate-300 font-semibold">Muscle</span>
        </button>

        <button
          onClick={() => setActiveMetric(activeMetric === 'fat' ? null : 'fat')}
          className={`flex items-center gap-1.5 transition-all cursor-pointer ${
            activeMetric === null || activeMetric === 'fat' ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span className="text-slate-300 font-semibold">Body Fat</span>
        </button>

        <button
          onClick={() => setActiveMetric(activeMetric === 'water' ? null : 'water')}
          className={`flex items-center gap-1.5 transition-all cursor-pointer ${
            activeMetric === null || activeMetric === 'water' ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
          <span className="text-slate-300 font-semibold">Body Water</span>
        </button>
      </div>

      {/* SVG Multi-Line Trend Chart */}
      <div className="relative h-40 w-full flex items-center justify-center">
        {data.length === 0 ? (
          <div className="text-xs text-slate-500">No body composition records in this period.</div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Horizontal Grid lines */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="#1E2D42"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke="#162230"
              strokeDasharray="2 2"
            />

            {/* Muscle Line (Green) */}
            {(activeMetric === null || activeMetric === 'muscle') && musclePoints.length > 1 && (
              <path
                d={makePath(musclePoints)}
                fill="none"
                stroke="#2BAF34"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Body Fat Line (Amber) */}
            {(activeMetric === null || activeMetric === 'fat') && fatPoints.length > 1 && (
              <path
                d={makePath(fatPoints)}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Water Line (Blue) */}
            {(activeMetric === null || activeMetric === 'water') && waterPoints.length > 1 && (
              <path
                d={makePath(waterPoints)}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Day Labels and Dots */}
            {data.map((d, i) => {
              const divisor = Math.max(1, data.length - 1);
              const x = paddingX + (i / divisor) * (width - 2 * paddingX);
              return (
                <text
                  key={d.day || i}
                  x={x}
                  y={height - 4}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontWeight="500"
                >
                  {d.day}
                </text>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
