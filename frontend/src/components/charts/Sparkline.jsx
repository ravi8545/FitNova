import React from 'react';

export default function Sparkline({ data = [], isPositive = true, color }) {
  const width = 120;
  const height = 35;
  const strokeColor = color || (isPositive ? '#2BAF34' : '#EF4444');

  // Guard against empty or single-point data
  if (!data || !Array.isArray(data) || data.length < 2) {
    return (
      <svg width={width} height={height} className="overflow-visible opacity-30">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const divisor = Math.max(1, data.length - 1);
    const x = (idx / divisor) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const lastPoint = points[points.length - 1];
  const areaD = lastPoint
    ? `${pathD} L ${lastPoint.x} ${height} L ${points[0].x} ${height} Z`
    : '';
  const gradId = `sparklineGrad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {areaD && <path d={areaD} fill={`url(#${gradId})`} />}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
