import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { Award, Clock, Coffee, CupSoda, Droplet, Droplets, Flame, GlassWater, Leaf, Lightbulb, Minus, Plus, Settings2, Target, Trash2, TrendingUp } from "lucide-react";
import { Card, DateNav, Empty, Field, Modal, PageHeader, chartTooltipStyle, cx } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { useAppNav } from "../context/NavContext";
import { actions, lastNDays, toMin, useStore, waterByDay, waterStreak } from "../data/store";
import { fmtShort, fmtTime, isToday, nowHHMM, num, pct, toISO } from "../utils/format";

const AXIS = { stroke: "#64748B", fontSize: 11, tickLine: false, axisLine: false };
const QUICK = [150, 250, 330, 500, 750];
const DRINKS = { Water: GlassWater, Tea: Leaf, Coffee: Coffee, Juice: CupSoda, Smoothie: CupSoda };
const litres = (ml, d = 1) => `${num(ml / 1000, d)} L`;

function GoalModal({ open, onClose, settings }) {
  const toast = useToast();
  const [goal, setGoal] = useState(settings.waterGoalMl);
  const [glass, setGlass] = useState(settings.glassMl);
  const valid = goal >= 500 && goal <= 8000 && glass >= 50 && glass <= 1000;
  return (
    <Modal open={open} onClose={onClose} title="Hydration settings">
      <div className="space-y-4">
        <Field label="Daily goal (ml)">
          <input type="number" step="100" min="500" max="8000" className="input" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
          <div className="mt-2 flex flex-wrap gap-2">{[2000, 2500, 3000, 3500, 4000].map((g) => (
            <button key={g} onClick={() => setGoal(g)} className={cx("rounded-full border px-3 py-1 text-xs", goal === g ? "border-sky bg-sky/15 text-sky" : "border-line text-slate-300")}>{litres(g)}</button>))}</div>
        </Field>
        <Field label="Glass / bottle size (ml)"><input type="number" step="10" min="50" max="1000" className="input" value={glass} onChange={(e) => setGlass(Number(e.target.value))} /></Field>
        {!valid && <p className="text-xs text-rose">Goal must be 500–8000 ml and glass size 50–1000 ml.</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={() => { actions.setSettings({ waterGoalMl: goal, glassMl: glass }); toast.success("Settings saved"); onClose(); }}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Water() {
  const navigate = useAppNav();
  const s = useStore();
  const toast = useToast();
  const { waterGoalMl: goal, glassMl: glass } = s.settings;
  const [date, setDate] = useState(toISO());
  const [range, setRange] = useState(7);
  const [drink, setDrink] = useState("Water");
  const [custom, setCustom] = useState({ ml: "", time: nowHHMM() });
  const [modal, setModal] = useState(false);

  const logs = useMemo(() => s.water.filter((w) => w.date === date).sort((a, b) => b.time.localeCompare(a.time) || b.at - a.at), [s.water, date]);
  const total = logs.reduce((a, w) => a + w.ml, 0);
  const p = pct(total, goal);
  const by = useMemo(() => waterByDay(s.water), [s.water]);
  const days = lastNDays(range, toISO());
  const series = days.map((d) => ({ date: d, ml: by[d] || 0 }));
  const avg = series.reduce((a, x) => a + x.ml, 0) / range;
  const best = series.reduce((b, x) => (x.ml > b.ml ? x : b), series[0]);
  const hit = series.filter((x) => x.ml >= goal).length;
  const streak = waterStreak(s.water, goal);

  // cumulative intake through the selected day
  const timeline = useMemo(() => {
    const asc = [...logs].sort((a, b) => a.time.localeCompare(b.time));
    let cum = 0;
    const pts = [{ t: 0, cum: 0 }];
    asc.forEach((w) => { cum += w.ml; pts.push({ t: toMin(w.time), cum }); });
    const end = isToday(date) ? Math.max(toMin(nowHHMM()), pts.at(-1).t) : 1440;
    pts.push({ t: end, cum });
    return pts;
  }, [logs, date]);

  // insights
  const peak = useMemo(() => {
    const recent = new Set(lastNDays(14));
    const buckets = {};
    s.water.filter((w) => recent.has(w.date)).forEach((w) => { const h = Math.floor(toMin(w.time) / 60); buckets[h] = (buckets[h] || 0) + w.ml; });
    const top = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];
    return top ? Number(top[0]) : null;
  }, [s.water]);
  const insights = [];
  if (isToday(date)) {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    const expected = Math.round((goal * Math.min(1, Math.max(0, (h - 7) / 15))) / 50) * 50; // drinking window 7am–10pm
    const diff = expected - total;
    if (total >= goal) insights.push(["Goal reached — great work! Keep sipping if you're active or it's hot.", Award, "text-brand"]);
    else if (diff > 250) insights.push([`You're about ${num(diff)} ml behind pace for this time of day. A glass now gets you back on track.`, Clock, "text-amber"]);
    else insights.push(["You're on pace for today's goal. Nice and steady.", TrendingUp, "text-brand"]);
  }
  if (peak != null) insights.push([`You drink the most around ${fmtTime(`${peak}:00`)}. Try spreading intake more evenly across the day.`, Lightbulb, "text-sky"]);
  insights.push([hit >= Math.ceil(range * 0.7) ? `You hit your goal on ${hit} of the last ${range} days — excellent consistency.` : `You hit your goal on ${hit} of the last ${range} days. Small, regular glasses beat big catch-up sessions.`, Target, "text-violet"]);

  const add = (ml, type = drink, time) => {
    actions.addWater({ date, ml, type, time: time || (isToday(date) ? nowHHMM() : "12:00") });
    toast.success(`+${ml} ml ${type.toLowerCase()}`);
  };
  const undo = () => { const r = actions.undoWater(date); if (r) toast.success(`Removed ${r.ml} ml`); };
  const R = 88, C = 2 * Math.PI * R;
  const glasses = Math.min(16, Math.max(1, Math.ceil(goal / glass)));
  const filled = Math.round(total / glass);

  return (
    <div>
      <PageHeader title="Water Intake" subtitle="Stay hydrated — small sips add up">
        <DateNav date={date} onChange={setDate} />
        <button className="btn-ghost" onClick={() => setModal(true)}><Settings2 size={16} /> Goal</button>
        <button className="btn-ghost" onClick={() => navigate("reports")}>View Report</button>
      </PageHeader>

       
<div className="relative mb-6 min-h-[300px] sm:min-h-[340px] overflow-hidden rounded-2xl border border-cardBorder bg-panel">

          <img src="https://images.unsplash.com/photo-1563374928-66e57628d1b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="Clear water being poured into a glass" className="absolute inset-0 h-full w-full object-cover opacity-55" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B111A]/95 via-[#0B111A]/75 to-[#0B111A]/20" />
          <div className="relative max-w-3xl p-6 sm:p-10 lg:p-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky">Your hydration guide</p>
            <h2 className="max-w-lg text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">Hydration is a habit, not a last-minute catch-up.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">Keep water within reach, drink regularly through the day, and adjust for heat, exercise and how much you sweat. Your daily goal is a helpful reminder—not a one-size-fits-all medical rule.</p>
          </div>
        </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <div className="relative mx-auto h-60 w-60">
              <svg viewBox="0 0 200 200" className="-rotate-90">
                <circle cx="100" cy="100" r={R} fill="none" stroke="#1E2D42" strokeWidth="16" />
                <motion.circle cx="100" cy="100" r={R} fill="none" stroke={total >= goal ? "#2BAF34" : "#3B82F6"} strokeWidth="16" strokeLinecap="round" strokeDasharray={C}
                  initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - Math.min(p, 100) / 100) }} transition={{ duration: 0.8 }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplets className={total >= goal ? "mb-1 text-brand" : "mb-1 text-sky"} />
                <p className="text-4xl font-bold">{num(total / 1000, 2)}<span className="text-lg">L</span></p>
                <p className="text-sm text-muted">of {litres(goal)} · {p}%</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5" aria-label="Glasses">
              {Array.from({ length: glasses }, (_, i) => <Droplet key={i} size={22} className={i < filled ? "fill-sky text-sky" : "text-slate-600"} />)}
            </div>
            <p className="mt-2 text-center text-xs text-muted">{filled} of {glasses} glasses ({glass} ml each)</p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {Object.entries(DRINKS).map(([k, I]) => (
                <button key={k} onClick={() => setDrink(k)} className={cx("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition", drink === k ? "border-sky bg-sky/15 text-sky" : "border-line text-slate-300 hover:border-muted")}><I size={13} />{k}</button>))}
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {QUICK.map((ml) => <button key={ml} className="btn-ghost !px-0 !py-2.5" onClick={() => add(ml)}>+{ml}</button>)}
            </div>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_118px_42px_42px] gap-2">
              <input type="number" min="1" max="3000" className="input" placeholder="ml" aria-label="Custom amount in ml" value={custom.ml} onChange={(e) => setCustom({ ...custom, ml: e.target.value })} />
              <input type="time" className="input !px-2 text-xs" aria-label="Time" value={custom.time} onChange={(e) => setCustom({ ...custom, time: e.target.value })} />
              <button className="btn-primary !px-0" disabled={!(Number(custom.ml) >= 1 && Number(custom.ml) <= 3000)} aria-label="Add custom amount" onClick={() => { add(Number(custom.ml), drink, custom.time); setCustom({ ml: "", time: nowHHMM() }); }}><Plus size={16} /></button>
              <button className="btn-ghost !px-0" onClick={undo} aria-label="Undo last" disabled={!logs.length}><Minus size={16} /></button>
            </div>
            {total >= goal && <p className="mt-4 rounded-lg bg-brand/10 p-3 text-center text-sm text-brand">🎉 Daily goal reached!</p>}
          </Card>

          <Card title="Insights">
            <ul className="space-y-3">
              {insights.map(([t, I, c], i) => (<li key={i} className="flex gap-3 text-sm text-slate-300"><I size={18} className={cx("mt-0.5 shrink-0", c)} />{t}</li>))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Intake history" action={
            <div className="flex gap-1 rounded-xl border border-cardBorder p-1">{[[7, "7D"], [14, "14D"], [30, "30D"]].map(([k, l]) => (
              <button key={k} onClick={() => setRange(k)} className={cx("rounded-md px-3 py-1 text-xs", range === k ? "bg-panel2 text-white" : "text-muted")}>{l}</button>))}</div>}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={series} onClick={(e) => e?.activeLabel && setDate(e.activeLabel)}>
                <CartesianGrid stroke="#1E2D42" vertical={false} />
                <XAxis dataKey="date" tickFormatter={fmtShort} interval={range > 14 ? 3 : "preserveStartEnd"} {...AXIS} />
                <YAxis width={40} tickFormatter={(v) => `${v / 1000}L`} {...AXIS} />
                <Tooltip {...chartTooltipStyle} labelFormatter={fmtShort} formatter={(v) => [`${v} ml`, "Water"]} cursor={{ fill: "#ffffff08" }} />
                <ReferenceLine y={goal} stroke="#2BAF34" strokeDasharray="4 4" label={{ value: "Goal", fill: "#2BAF34", fontSize: 11, position: "insideTopLeft" }} />
                <Bar dataKey="ml" radius={[5, 5, 0, 0]} cursor="pointer">
                  {series.map((x) => <Cell key={x.date} fill={x.date === date ? "#3B82F6" : x.ml >= goal ? "#2BAF34" : "#3B82F6"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-1 text-center text-xs text-muted">Green = goal met · click a bar to view that day</p>
          </Card>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
            <Card title={isToday(date) ? "Today's progress" : fmtShort(date)}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline}>
                  <defs><linearGradient id="wt" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="#1E2D42" vertical={false} />
                  <XAxis dataKey="t" type="number" domain={[0, 1440]} ticks={[0, 360, 720, 1080, 1440]} tickFormatter={(m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:00`} {...AXIS} />
                  <YAxis width={40} domain={[0, Math.max(goal, total)]} tickFormatter={(v) => `${num(v / 1000, 1)}L`} {...AXIS} />
                  <Tooltip {...chartTooltipStyle} labelFormatter={(m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`} formatter={(v) => [`${v} ml`, "Total so far"]} />
                  <ReferenceLine y={goal} stroke="#2BAF34" strokeDasharray="4 4" />
                  <Area type="stepAfter" dataKey="cum" stroke="#3B82F6" strokeWidth={2.5} fill="url(#wt)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card title={`Log · ${logs.length} ${logs.length === 1 ? "entry" : "entries"}`}>
              {logs.length ? (
                <ul className="max-h-[200px] divide-y divide-line overflow-y-auto pr-1">
                  {logs.map((l) => { const I = DRINKS[l.type] || GlassWater; return (
                    <li key={l.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky/15 text-sky"><I size={15} /></span>
                        <span><span className="font-medium">{l.ml} ml</span> <span className="text-xs text-muted">{l.type}</span></span></span>
                      <span className="flex items-center gap-3 text-xs text-muted">{fmtTime(l.time)}
                        <button className="rounded p-1 hover:bg-white/10 hover:text-rose" onClick={() => { actions.removeWater(l.id); toast.success("Entry removed"); }} aria-label={`Delete ${l.ml} ml at ${l.time}`}><Trash2 size={14} /></button></span>
                    </li>); })}
                </ul>
              ) : <Empty>No drinks logged for this day yet.</Empty>}
            </Card>
          </div>
        </div>
      </div>
      <section className="mt-6 space-y-5" aria-label="Hydration guide">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card !p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky/15 text-sky"><Droplets size={21}/></div><h3 className="font-semibold text-white">Your body uses water all day</h3><p className="mt-2 text-sm leading-6 text-muted">Water helps regulate body temperature, transport nutrients and support normal digestion. Fluid needs rise with heat and physical activity.</p></article>
          <article className="card !p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand"><Leaf size={21}/></div><h3 className="font-semibold text-white">Food contributes too</h3><p className="mt-2 text-sm leading-6 text-muted">Drinks provide most fluid for many people, while foods such as watermelon, cucumber, oranges and soups also contribute water.</p></article>
          <article className="card !p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet/15 text-violet"><Lightbulb size={21}/></div><h3 className="font-semibold text-white">Look for everyday cues</h3><p className="mt-2 text-sm leading-6 text-muted">Thirst and pale-yellow urine can be useful everyday cues for many healthy adults. Vitamins and some medicines can change urine colour.</p></article>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <Card title="Build a hydration rhythm">
            <div className="space-y-4">
              {[["Start gently", "Have a glass of water when you begin your day."],["Pair it with routines", "Drink with meals and after a walk or workout; refill your bottle when you return."],["Sip during activity", "For longer or sweaty workouts, take regular small drinks and consider your individual needs."],["Keep it accessible", "Carry a reusable bottle and use the quick-add buttons above to keep a simple record."]].map(([title, text], i) => <div key={title} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky/15 text-sm font-bold text-sky">{i+1}</span><div><h4 className="text-sm font-semibold text-white">{title}</h4><p className="mt-1 text-sm leading-5 text-muted">{text}</p></div></div>)}
            </div>
          </Card>
          <div className="overflow-hidden rounded-2xl border border-cardBorder bg-panel">
            <img src="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1000&q=85" alt="Fresh water in a clear glass bottle" className="h-44 w-full object-cover" loading="lazy" />
            <div className="p-5"><p className="text-xs font-semibold uppercase tracking-wider text-sky">A simple reminder</p><h3 className="mt-2 text-lg font-semibold text-white">Small, steady sips are easier to maintain.</h3><p className="mt-2 text-sm leading-6 text-muted">You do not need to force large amounts at once. Spread drinks across your waking hours and use your log to notice patterns that work for you.</p><p className="mt-3 rounded-lg border border-cardBorder bg-panel2 p-3 text-xs leading-5 text-muted">Health note: needs vary with body size, diet, activity, climate, pregnancy and health conditions. Follow clinician advice if you have a fluid restriction or a condition affecting fluid balance.</p></div>
          </div>
        </div>
      </section>

      {/* Summary statistics are intentionally placed below the educational content. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[[Droplets, "Today's intake", litres(total, 2), `${p}% of ${litres(goal)}`, "text-sky"],
          [Target, "Remaining", total >= goal ? "Done 🎉" : litres(goal - total, 2), `${Math.max(0, Math.ceil((goal - total) / glass))} glasses to go`, "text-violet"],
          [TrendingUp, `${range}-day average`, litres(avg, 2), `Best: ${litres(best.ml, 1)} · ${fmtShort(best.date)}`, "text-brand"],
          [Flame, "Goal streak", `${streak} day${streak === 1 ? "" : "s"}`, `${hit}/${range} days on target`, "text-amber"]].map(([I, l, v, sub, c]) => (
          <div key={l} className="card !p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted">{l}</p><I size={20} className={c} /></div>
            <p className="mt-2 text-2xl font-bold">{v}</p><p className="mt-1 text-xs text-muted">{sub}</p></div>))}
      </div>

      <GoalModal key={String(modal)} open={modal} onClose={() => setModal(false)} settings={s.settings} />
    </div>
  );
}
