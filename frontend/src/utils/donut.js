// Shared maths for the segmented donut rings (Goals + Calendar pages).
// Every segment is sized from real values, so each status is always visible.
export const DONUT_CIRC = 2 * Math.PI * 16; // r = 16 in a 42x42 viewBox

export function donutArcs(items, { gap = 2 } = {}) {
  const values = items.map((i) => Math.max(0, Number(i.value) || 0));
  const total = values.reduce((sum, v) => sum + v, 0);
  const gapSize = values.filter((v) => v > 0).length > 1 ? gap : 0;
  let used = 0;
  return items
    .map((item, i) => {
      const share = total ? (values[i] / total) * DONUT_CIRC : 0;
      const arc = { label: item.label, color: item.color, len: Math.max(0, share - gapSize), offset: used };
      used += share;
      return arc;
    })
    .filter((arc) => arc.len > 0);
}
