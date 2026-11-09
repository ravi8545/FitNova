import { DONUT_CIRC } from "../utils/donut";

export default function DonutRing({ arcs, size = 140 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" aria-hidden="true">
      <circle cx="21" cy="21" r="16" fill="none" stroke="#1E2D42" strokeWidth="5" />
      {arcs.map((a) => (
        <circle
          key={a.label}
          cx="21" cy="21" r="16" fill="none"
          stroke={a.color} strokeWidth="5" strokeLinecap="butt"
          strokeDasharray={`${a.len} ${DONUT_CIRC - a.len}`}
          strokeDashoffset={-a.offset}
          transform="rotate(-90 21 21)"
        />
      ))}
    </svg>
  );
}
