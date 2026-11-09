import { useSyncExternalStore } from "react";
import { addDays, toISO } from "../utils/format";

/**
 * Frontend-only data layer. Everything lives in localStorage so the pages
 * behave like a real app without any backend. Swap these actions for API
 * calls later – the pages only talk to this module.
 */
const KEY = "fitnova.frontend.v2";
const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const pad = (n) => String(n).padStart(2, "0");
const hhmm = (min) => `${pad(Math.floor(((min % 1440) + 1440) % 1440 / 60))}:${pad(Math.round(((min % 1440) + 1440) % 1440) % 60)}`;

export const toMin = (t) => { const [h, m] = (t || "0:0").split(":").map(Number); return h * 60 + m; };
/** Minutes slept between bedtime and wake time (wake is always after bed, crossing midnight if needed). */
export const sleepMinutes = (bed, wake) => { const d = toMin(wake) - toMin(bed); return d <= 0 ? d + 1440 : d; };

export const DEFAULT_SETTINGS = { waterGoalMl: 3000, glassMl: 250, sleepGoalH: 8 };

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seed() {
  const r = mulberry32(42);
  const today = toISO();
  const now = new Date();
  const water = [], sleep = [];
  const types = ["Water", "Water", "Water", "Water", "Tea", "Water", "Coffee"];
  for (let i = 29; i >= 0; i--) {
    const date = addDays(today, -i);
    if (i === 0) {
      const h = now.getHours();
      [[Math.max(0, h - 5), 250], [Math.max(0, h - 3), 500], [Math.max(0, h - 1), 250]].forEach(([hr, ml], k) =>
        water.push({ id: uid("w"), date, time: `${pad(hr)}:${pad(10 + k * 7)}`, ml, type: "Water", at: Date.now() - (3 - k) * 1000 }));
    } else {
      const target = Math.round((1700 + r() * 2000) / 50) * 50;
      const amounts = [250, 330, 500, 250, 750, 200, 500];
      let left = target, hour = 7 + Math.floor(r() * 2), k = 0;
      while (left > 0 && hour < 22) {
        const ml = Math.min(amounts[Math.floor(r() * amounts.length)], left);
        water.push({ id: uid("w"), date, time: `${pad(hour)}:${pad(Math.floor(r() * 50))}`, ml, type: types[k % types.length], at: Date.now() - i * 864e5 + k });
        left -= ml; hour += 1 + Math.floor(r() * 2); k++;
      }
    }
    // sleep: entry keyed by the morning you woke up
    const bed = 22 * 60 + 15 + Math.floor(r() * 150);
    const dur = Math.round((5.8 + r() * 3.4) * 12) * 5;
    const q = dur >= 450 ? 4 + Math.round(r()) : dur >= 390 ? 3 + Math.round(r()) : 2 + Math.round(r());
    sleep.push({
      id: uid("s"), date, bed: hhmm(bed), wake: hhmm(bed + dur), hours: +(dur / 60).toFixed(2),
      quality: Math.min(5, q), mood: q >= 4 ? "Refreshed" : q === 3 ? "Okay" : "Tired", notes: "",
    });
  }
  return { version: 2, water, sleep, settings: { ...DEFAULT_SETTINGS } };
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s?.version === 2) return { ...s, settings: { ...DEFAULT_SETTINGS, ...s.settings } };
  } catch { /* ignore corrupt storage */ }
  return seed();
}

let state = load();
const listeners = new Set();
const commit = (next) => {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full / private mode */ }
  listeners.forEach((l) => l());
};
commit(state);

export const useStore = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => state);

export const actions = {
  addWater({ date, ml, type = "Water", time }) {
    const entry = { id: uid("w"), date, ml: Math.round(ml), type, time: time || hhmm(new Date().getHours() * 60 + new Date().getMinutes()), at: Date.now() };
    commit({ ...state, water: [...state.water, entry] });
    return entry;
  },
  removeWater: (id) => commit({ ...state, water: state.water.filter((w) => w.id !== id) }),
  undoWater(date) {
    const last = state.water.filter((w) => w.date === date).sort((a, b) => b.at - a.at)[0];
    if (last) commit({ ...state, water: state.water.filter((w) => w.id !== last.id) });
    return last;
  },
  /** One sleep entry per wake-up date (saving again replaces it). */
  saveSleep({ date, bed, wake, quality, mood, notes }) {
    const mins = sleepMinutes(bed, wake);
    const entry = { id: state.sleep.find((s) => s.date === date)?.id || uid("s"), date, bed, wake, hours: +(mins / 60).toFixed(2), quality, mood, notes: notes || "" };
    commit({ ...state, sleep: [...state.sleep.filter((s) => s.date !== date), entry] });
  },
  removeSleep: (id) => commit({ ...state, sleep: state.sleep.filter((s) => s.id !== id) }),
  setSettings: (patch) => commit({ ...state, settings: { ...state.settings, ...patch } }),
  resetDemo: () => commit(seed()),
  clearAll: () => commit({ version: 2, water: [], sleep: [], settings: { ...state.settings } }),
};

// ---------- selectors ----------
export const waterByDay = (water) => water.reduce((m, w) => ((m[w.date] = (m[w.date] || 0) + w.ml), m), {});
export const lastNDays = (n, end = toISO()) => Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));

/** Consecutive days (ending today, or yesterday if today isn't done yet) meeting the goal. */
export function waterStreak(water, goal, today = toISO()) {
  const by = waterByDay(water);
  let d = (by[today] || 0) >= goal ? today : addDays(today, -1);
  let n = 0;
  while ((by[d] || 0) >= goal) { n++; d = addDays(d, -1); }
  return n;
}
