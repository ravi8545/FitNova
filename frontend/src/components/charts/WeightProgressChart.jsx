import React, { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function WeightProgressChart({ weightData }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const currentWeight = weightData?.currentWeight || null;
  const change = weightData?.change || '0 kg';
  const comparison = weightData?.comparison || 'in this period';
  const data = weightData?.data || [];

  const isPositiveChange = change.startsWith('+');

  const width = 450;
  const height = 150;
  const paddingX = 35;
  const paddingY = 20;

  // Calculate dynamic min and max from data
  const weights = data.map((d) => d.weight);
  const minWeight = weights.length > 0 ? Math.min(...weights) - 1 : 70;
  const maxWeight = weights.length > 0 ? Math.max(...weights) + 1 : 80;
  const rangeY = Math.max(1, maxWeight - minWeight);

  const points = data.map((d, i) => {
    const divisor = Math.max(1, data.length - 1);
    const x = paddingX + (i / divisor) * (width - 2 * paddingX);
    const normalizedY = (d.weight - minWeight) / rangeY;
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : '';

  return (
    <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Weight Progress</h3>
          {currentWeight ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{currentWeight}</span>
              <span
                className={`flex items-center text-xs font-bold ${
                  isPositiveChange ? 'text-[#EF4444]' : 'text-[#2BAF34]'
                }`}
              >
                {isPositiveChange ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                )}
                {change}
              </span>
              <span className="text-[11px] text-slate-400">{comparison}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">No recorded weight</span>
          )}
        </div>
      </div>

      {/* SVG Line / Area Graph */}
      <div className="relative h-40 w-full flex items-center justify-center">
        {data.length === 0 ? (
          <div className="text-xs text-slate-500">No weight measurements in this period.</div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2BAF34" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2BAF34" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Line */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="#1E2D42"
              strokeDasharray="4 4"
            />

            {/* Area Fill */}
            {points.length > 1 && <path d={areaD} fill="url(#weightGradient)" />}

            {/* Main Path */}
            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="#2BAF34"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((p, i) => (
              <g key={p.day || i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === i ? 6 : 4}
                  fill="#0D141C"
                  stroke="#2BAF34"
                  strokeWidth="2.5"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* Day Labels */}
                <text
                  x={p.x}
                  y={height - 4}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontWeight="500"
                >
                  {p.day}
                </text>

                {/* Tooltip on Hover */}
                {hoveredIdx === i && (
                  <g>
                    <rect
                      x={p.x - 30}
                      y={p.y - 28}
                      width="60"
                      height="20"
                      rx="6"
                      fill="#090D16"
                      stroke="#2BAF34"
                      strokeWidth="1"
                    />
                    <text
                      x={p.x}
                      y={p.y - 14}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {p.weight} kg
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}
