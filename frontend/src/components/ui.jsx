import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import { addDays, fmtDate, isToday, pct as pctOf } from "../utils/format";
import BrandMark from "./BrandMark";

export const cx = (...a) => a.filter(Boolean).join(" ");

export function Logo({ size = 26, text = true }) {
  return (
    <div className="flex items-center gap-2">
      <BrandMark size={size} />
      {text && <span className="text-xl font-bold tracking-tight text-white">Fit<span className="text-brand">Nova</span></span>}
    </div>
  );
}

export const Spinner = ({ className = "" }) => <Loader2 className={cx("animate-spin text-brand", className)} size={22} />;

export const PageLoader = () => (
  <div className="flex h-64 items-center justify-center"><Spinner className="!h-8 !w-8" /></div>
);

export function ErrorBox({ message = "Could not load data.", onRetry }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-muted">{message}</p>
      {onRetry && <button className="btn-ghost" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export const Empty = ({ children }) => <p className="py-6 text-center text-sm text-muted">{children}</p>;

export function Card({ title, action, children, className = "" }) {
  return (
    <section className={cx("card", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="card-title">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const COLORS = {
  green: ["bg-brand", "text-brand"], amber: ["bg-amber", "text-amber"], blue: ["bg-sky", "text-sky"],
  violet: ["bg-violet", "text-violet"], rose: ["bg-rose", "text-rose"],
};
export function ProgressBar({ value, goal, color = "green", className = "" }) {
  const p = pctOf(value, goal);
  return (
    <div className={cx("h-2 overflow-hidden rounded-full bg-white/10", className)}>
      <motion.div className={cx("h-full rounded-full", COLORS[color][0])} initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.7 }} />
    </div>
  );
}

const toNum = (v) => Number(String(v).replace(/,/g, "")) || 0;

export function StatCard({ label, value, goal, unit, icon: Icon, color = "green", text }) {
  const [, fg] = COLORS[color];
  return (
    <div className="card !p-4">
      <div className="mb-2 flex items-start justify-between">
        <span className="text-[15px] font-medium text-white">{label}</span>
        {Icon && <Icon size={22} className={fg} />}
      </div>
      <div className="mb-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-sm text-muted">{goal != null ? `/ ${goal} ${unit}` : unit}</span>
      </div>
      <ProgressBar value={toNum(value)} goal={toNum(goal)} color={color} />
      <p className="mt-2.5 text-xs text-muted">{text ?? `${pctOf(toNum(value), toNum(goal))}% of daily goal`}</p>
    </div>
  );
}

/** Donut with centered label. segments: [{value, color}] */
export function Donut({ segments, center, sub, size = 190, thickness = 26 }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const data = total > 0 ? segments : [{ value: 1, color: "#1E2D42" }];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie data={data} dataKey="value" innerRadius={size / 2 - thickness} outerRadius={size / 2 - 2} startAngle={90} endAngle={-270} stroke="none" paddingAngle={total > 0 ? 1 : 0}>
          {data.map((s, i) => <Cell key={i} fill={s.color} />)}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{center}</span>
        <span className="text-xs text-muted">{sub}</span>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            className={cx("my-8 w-full rounded-2xl border border-cardBorder bg-panel p-6 shadow-2xl", wide ? "max-w-2xl" : "max-w-md")}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button onClick={onClose} className="rounded-md p-1 text-muted hover:bg-white/10 hover:text-white"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Field({ label, error, children, className = "" }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return <div className="mb-4 rounded-xl border border-rose/30 bg-rose/10 px-3.5 py-2.5 text-sm text-rose">{message}</div>;
}

export function DateNav({ date, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button className="btn-ghost !px-2.5" onClick={() => onChange(addDays(date, -1))} aria-label="Previous day"><ChevronLeft size={18} /></button>
      <label className="relative flex min-w-[170px] cursor-pointer items-center justify-center rounded-xl border border-cardBorder bg-panel px-4 py-2.5 text-sm font-medium">
        {isToday(date) ? "Today, " : ""}{fmtDate(date, { day: "numeric", month: "short", year: "numeric" })}
        <input type="date" value={date} onChange={(e) => e.target.value && onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
      <button className="btn-ghost !px-2.5" onClick={() => onChange(addDays(date, 1))} aria-label="Next day"><ChevronRight size={18} /></button>
    </div>
  );
}

export const MACRO_COLORS = { protein: "#F59E0B", carbs: "#2BAF34", fat: "#8B5CF6", calories: "#2BAF34", fiber: "#3B82F6", water: "#3B82F6" };

export const chartTooltipStyle = {
  contentStyle: { background: "#121B26", border: "1px solid #1E2D42", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#94A3B8" },
};
