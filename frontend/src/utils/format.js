export const pad = (n) => String(n).padStart(2, "0");

/** Local-date ISO string (YYYY-MM-DD) – avoids UTC shifting from toISOString(). */
export const toISO = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (iso, n) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
export const isToday = (iso) => iso === toISO();

export const fmtDate = (iso, opts = { day: "numeric", month: "long", year: "numeric" }) =>
  fromISO(iso).toLocaleDateString("en-GB", opts);
export const fmtShort = (iso) => fromISO(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : 0;
};
export const pct = (v, goal) => (goal > 0 ? Math.min(100, Math.round((Number(v) / goal) * 100)) : 0);

export const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${pad(h % 12 || 12)}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

export const nowHHMM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const mealForNow = () => {
  const h = new Date().getHours();
  return h < 11 ? "breakfast" : h < 15 ? "lunch" : h < 18 ? "snack" : "dinner";
};

export const bmiCategory = (bmi) =>
  bmi < 18.5 ? ["Underweight", "text-sky"] : bmi < 25 ? ["Healthy", "text-brand"] : bmi < 30 ? ["Overweight", "text-amber"] : ["Obese", "text-rose"];

export const goalLabel = { weight_loss: "Weight Loss", muscle_gain: "Muscle Gain", maintenance: "Maintenance" };
export const activityLabel = {
  sedentary: "Sedentary", light: "Lightly Active", moderate: "Moderately Active",
  very_active: "Very Active", athlete: "Athlete",
};
