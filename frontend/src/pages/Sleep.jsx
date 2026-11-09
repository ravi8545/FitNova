import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Cell, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { AlarmClock, BedDouble, CalendarClock, Hourglass, Lightbulb, Moon, Pencil, Settings2, Star, Sunrise, Trash2, TrendingUp } from "lucide-react";
import { Card, DateNav, Empty, Field, Modal, PageHeader, chartTooltipStyle, cx } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { useAppNav } from "../context/NavContext";
import { actions, lastNDays, sleepMinutes, toMin, useStore } from "../data/store";
import { fmtDate, fmtShort, fmtTime, isToday, num, pct, toISO } from "../utils/format";

const AXIS = { stroke: "#64748B", fontSize: 11, tickLine: false, axisLine: false };
const MOODS = ["Refreshed", "Okay", "Tired", "Groggy"];
const fmtH = (h) => { const m = Math.round(h * 60); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`; };
/** Bedtime as minutes after 18:00 so that 23:30 and 00:30 sit next to each other. */
const bedOffset = (bed) => { const m = toMin(bed); return (m < 1080 ? m + 1440 : m) - 1080; };
const clock = (offsetH) => `${String((18 + Math.round(offsetH)) % 24).padStart(2, "0")}:00`;

function GoalModal({ open, onClose, goal: g0 }) {
  const toast = useToast();
  const [goal, setGoal] = useState(g0);
  const valid = goal >= 4 && goal <= 12;
  return (
    <Modal open={open} onClose={onClose} title="Sleep goal">
      <Field label="Hours per night">
        <input type="number" step="0.25" min="4" max="12" className="input" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
        <div className="mt-2 flex flex-wrap gap-2">{[6, 7, 7.5, 8, 9].map((g) => (
          <button key={g} onClick={() => setGoal(g)} className={cx("rounded-full border px-3 py-1 text-xs", goal === g ? "border-violet bg-violet/15 text-violet" : "border-line text-slate-300")}>{g} h</button>))}</div>
      </Field>
      {!valid && <p className="mt-2 text-xs text-rose">Choose between 4 and 12 hours.</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" disabled={!valid} onClick={() => { actions.setSettings({ sleepGoalH: goal }); toast.success("Sleep goal saved"); onClose(); }}>Save</button>
      </div>
    </Modal>
  );
}

const Stars = ({ value, onChange }) => (
  <div className="flex gap-1" role="radiogroup" aria-label="Sleep quality">
    {[1, 2, 3, 4, 5].map((q) => (
      <button type="button" key={q} onClick={() => onChange(q)} role="radio" aria-checked={q === value} aria-label={`${q} star${q > 1 ? "s" : ""}`}>
        <Star size={28} className={q <= value ? "fill-amber text-amber" : "text-slate-600"} />
      </button>))}
  </div>
);

export default function Sleep() {
  const navigate = useAppNav();
  const s = useStore();
  const toast = useToast();
  const goal = s.settings.sleepGoalH;
  const [date, setDate] = useState(toISO());
  const [range, setRange] = useState(7);
  const [modal, setModal] = useState(false);
  const entry = s.sleep.find((x) => x.date === date);
  const blank = { bed: "23:00", wake: "07:00", quality: 4, mood: "Refreshed", notes: "" };
  const [f, setF] = useState(entry || blank);
  useEffect(() => { setF(entry ? { bed: entry.bed, wake: entry.wake, quality: entry.quality, mood: entry.mood, notes: entry.notes } : blank); /* eslint-disable-next-line */ }, [date, entry?.id]);

  const mins = sleepMinutes(f.bed, f.wake);
  const diff = mins / 60 - goal;
  const p = pct(entry ? entry.hours : 0, goal);

  const byDate = useMemo(() => Object.fromEntries(s.sleep.map((x) => [x.date, x])), [s.sleep]);
  const days = lastNDays(range, toISO());
  const series = days.map((d) => ({ date: d, hours: byDate[d]?.hours ?? 0, entry: byDate[d] }));
  const logged = series.filter((x) => x.entry);
  const week = lastNDays(7).map((d) => byDate[d]).filter(Boolean);
  const avg7 = week.length ? week.reduce((a, x) => a + x.hours, 0) / week.length : 0;
  const debt = week.reduce((a, x) => a + Math.max(0, goal - x.hours), 0);
  const avgQ = week.length ? week.reduce((a, x) => a + x.quality, 0) / week.length : 0;
  const bedMins = week.map((x) => bedOffset(x.bed));
  const sd = bedMins.length > 1 ? Math.sqrt(bedMins.reduce((a, m) => a + (m - bedMins.reduce((x, y) => x + y, 0) / bedMins.length) ** 2, 0) / bedMins.length) : null;
  const consistency = sd == null ? ["—", "Need 2+ nights"] : sd < 30 ? ["Very consistent", `±${Math.round(sd)} min bedtime`] : sd < 60 ? ["Fairly consistent", `±${Math.round(sd)} min bedtime`] : ["Irregular", `±${Math.round(sd)} min bedtime`];

  const schedule = series.map((x) => x.entry ? { date: x.date, base: bedOffset(x.entry.bed) / 60, dur: x.entry.hours, bed: x.entry.bed, wake: x.entry.wake } : { date: x.date, base: 0, dur: 0 });

  const best = logged.length ? logged.reduce((b, x) => (x.hours > b.hours ? x : b)) : null;
  const wkEnd = (d) => [0, 6].includes(new Date(d + "T00:00").getDay());
  const avgOf = (arr) => (arr.length ? arr.reduce((a, x) => a + x.hours, 0) / arr.length : null);
  const wkday = avgOf(logged.filter((x) => !wkEnd(x.date)).map((x) => x.entry)), wkend = avgOf(logged.filter((x) => wkEnd(x.date)).map((x) => x.entry));
  const insights = [];
  if (week.length) insights.push([avg7 >= goal ? `You're averaging ${fmtH(avg7)} — right on your ${goal} h goal.` : `You're averaging ${fmtH(avg7)}, about ${fmtH(goal - avg7)} short of your ${goal} h goal each night.`, TrendingUp, avg7 >= goal ? "text-brand" : "text-amber"]);
  if (debt > 0.5) insights.push([`Sleep debt this week: ${fmtH(debt)}. Going to bed 30 minutes earlier for a few nights helps pay it back.`, Hourglass, "text-rose"]);
  if (sd != null) insights.push([sd < 45 ? "Your bedtime is steady — a regular schedule is one of the best things for sleep quality." : "Your bedtime varies quite a bit. Aim for the same bedtime within 30–45 minutes, even on weekends.", CalendarClock, "text-sky"]);
  if (wkday != null && wkend != null && Math.abs(wkend - wkday) >= 0.5) insights.push([`You sleep ${fmtH(Math.abs(wkend - wkday))} ${wkend > wkday ? "more" : "less"} on weekends than on weekdays.`, Lightbulb, "text-violet"]);
  if (best) insights.push([`Best night in this range: ${fmtH(best.hours)} on ${fmtShort(best.date)} (${best.entry.quality}★).`, Moon, "text-violet"]);

  const save = () => {
    if (mins < 30) return toast.error("Sleep must be at least 30 minutes");
    actions.saveSleep({ date, ...f });
    toast.success(entry ? "Sleep updated" : "Sleep logged");
  };
  const R = 80, C = 2 * Math.PI * R;
  const cat = !entry ? null : entry.hours >= goal ? ["Goal met", "text-brand"] : entry.hours >= goal - 1 ? ["Almost there", "text-amber"] : ["Short night", "text-rose"];

  return (
    <div>
      <PageHeader title="Sleep" subtitle="Recovery drives results — aim for 7–9 hours">
        <DateNav date={date} onChange={setDate} />
        <button className="btn-ghost" onClick={() => setModal(true)}><Settings2 size={16} /> Goal</button>
        <button className="btn-ghost" onClick={() => navigate("reports")}>View Report</button>
      </PageHeader>

        <div className="relative mb-6 min-h-[300px] sm:min-h-[340px] overflow-hidden rounded-2xl border border-cardBorder bg-panel">
          <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85" alt="A calm, softly lit bedroom prepared for rest" className="absolute inset-0 h-full w-full object-cover opacity-50" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B111A]/95 via-[#0B111A]/75 to-[#0B111A]/20" />
          <div className="relative max-w-3xl p-6 sm:p-10 lg:p-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet">Sleep and recovery</p>
            <h2 className="max-w-lg text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">Make room for the recovery your day depends on.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">Sleep supports attention, mood, learning and physical recovery. Track your hours and quality, then use a steady routine to make restful nights more likely.</p>
          </div>
        </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card title={isToday(date) ? "Last night" : fmtDate(date, { weekday: "short", day: "numeric", month: "short" })}>
            <div className="relative mx-auto mb-5 h-48 w-48">
              <svg viewBox="0 0 200 200" className="-rotate-90">
                <circle cx="100" cy="100" r={R} fill="none" stroke="#1E2D42" strokeWidth="14" />
                <motion.circle cx="100" cy="100" r={R} fill="none" stroke={entry && entry.hours >= goal ? "#2BAF34" : "#8B5CF6"} strokeWidth="14" strokeLinecap="round" strokeDasharray={C}
                  initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - Math.min(p, 100) / 100) }} transition={{ duration: 0.8 }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Moon className="mb-1 text-violet" size={22} />
                <p className="text-3xl font-bold">{entry ? fmtH(entry.hours) : "—"}</p>
                <p className={cx("text-xs", cat ? cat[1] : "text-muted")}>{cat ? `${cat[0]} · ${p}%` : "Not logged"}</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-line pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bedtime"><div className="relative"><Moon size={15} className="pointer-events-none absolute left-3 top-3.5 text-violet" /><input type="time" className="input !pl-9" value={f.bed} onChange={(e) => setF({ ...f, bed: e.target.value })} /></div></Field>
                <Field label="Wake-up"><div className="relative"><Sunrise size={15} className="pointer-events-none absolute left-3 top-3.5 text-amber" /><input type="time" className="input !pl-9" value={f.wake} onChange={(e) => setF({ ...f, wake: e.target.value })} /></div></Field>
              </div>
              <p className={cx("rounded-lg bg-panel2 px-3 py-2 text-center text-sm", diff >= 0 ? "text-brand" : "text-amber")}>
                {fmtH(mins / 60)} · {diff >= 0 ? `${fmtH(diff)} over goal` : `${fmtH(-diff)} under goal`}
              </p>
              <Field label="Sleep quality"><Stars value={f.quality} onChange={(q) => setF({ ...f, quality: q })} /></Field>
              <Field label="How do you feel?">
                <div className="flex flex-wrap gap-2">{MOODS.map((m) => (
                  <button type="button" key={m} onClick={() => setF({ ...f, mood: m })} className={cx("rounded-full border px-3 py-1.5 text-xs", f.mood === m ? "border-violet bg-violet/15 text-violet" : "border-line text-slate-300 hover:border-muted")}>{m}</button>))}</div>
              </Field>
              <Field label="Notes (optional)"><textarea rows={2} maxLength={200} className="input resize-none" placeholder="Late coffee, noisy night, nap…" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
              <div className="flex gap-2">
                <button className="btn-primary flex-1" onClick={save}><AlarmClock size={16} /> {entry ? "Update sleep" : "Save sleep"}</button>
                {entry && <button className="btn-danger" aria-label="Delete entry" onClick={() => { actions.removeSleep(entry.id); toast.success("Entry deleted"); }}><Trash2 size={16} /></button>}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Sleep duration" action={
            <div className="flex gap-1 rounded-xl border border-cardBorder p-1">{[[7, "7D"], [14, "14D"], [30, "30D"]].map(([k, l]) => (
              <button key={k} onClick={() => setRange(k)} className={cx("rounded-md px-3 py-1 text-xs", range === k ? "bg-panel2 text-white" : "text-muted")}>{l}</button>))}</div>}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={series} onClick={(e) => e?.activeLabel && setDate(e.activeLabel)}>
                <CartesianGrid stroke="#1E2D42" vertical={false} />
                <XAxis dataKey="date" tickFormatter={fmtShort} interval={range > 14 ? 3 : "preserveStartEnd"} {...AXIS} />
                <YAxis domain={[0, 12]} ticks={[0, 3, 6, 9, 12]} width={32} tickFormatter={(v) => `${v}h`} {...AXIS} />
                <Tooltip {...chartTooltipStyle} labelFormatter={fmtShort} formatter={(v) => [v ? fmtH(v) : "No entry", "Sleep"]} cursor={{ fill: "#ffffff08" }} />
                <ReferenceLine y={goal} stroke="#2BAF34" strokeDasharray="4 4" label={{ value: "Goal", fill: "#2BAF34", fontSize: 11, position: "insideTopLeft" }} />
                <Bar dataKey="hours" radius={[5, 5, 0, 0]} cursor="pointer">
                  {series.map((x) => <Cell key={x.date} fill={x.date === date ? "#a78bfa" : x.hours >= goal ? "#2BAF34" : "#8B5CF6"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-1 text-center text-xs text-muted">Green = goal met · click a bar to view or edit that night</p>
          </Card>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
            <Card title="Sleep schedule">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={schedule}>
                  <CartesianGrid stroke="#1E2D42" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={fmtShort} interval={range > 14 ? 3 : "preserveStartEnd"} {...AXIS} />
                  <YAxis reversed domain={[0, 18]} ticks={[0, 3, 6, 9, 12, 15, 18]} width={44} tickFormatter={clock} {...AXIS} />
                  <Tooltip cursor={{ fill: "#ffffff08" }} content={({ active, payload, label }) => {
                    const d = payload?.[0]?.payload;
                    if (!active || !d) return null;
                    return <div style={chartTooltipStyle.contentStyle} className="px-3 py-2 text-xs"><p className="text-muted">{fmtShort(label)}</p>{d.dur ? <p>{fmtTime(d.bed)} → {fmtTime(d.wake)}</p> : <p>No entry</p>}</div>;
                  }} />
                  <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
                  <Bar dataKey="dur" stackId="a" fill="#8B5CF6" radius={[5, 5, 5, 5]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted">Bedtime (top of bar) to wake-up (bottom)</p>
            </Card>

            <Card title="Insights">
              {insights.length ? <ul className="space-y-3">{insights.map(([t, I, c], i) => (<li key={i} className="flex gap-3 text-sm text-slate-300"><I size={18} className={cx("mt-0.5 shrink-0", c)} />{t}</li>))}</ul>
                : <Empty>Log a few nights to unlock insights.</Empty>}
            </Card>
          </div>

          <Card title="History">
            {s.sleep.length ? (
              <ul className="max-h-[340px] divide-y divide-line overflow-y-auto pr-1">
                {[...s.sleep].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map((x) => (
                  <li key={x.id} className={cx("flex items-center gap-3 py-2.5 text-sm", x.date === date && "rounded-lg bg-violet/5")}>
                    <span className="w-24 shrink-0 text-muted">{fmtDate(x.date, { weekday: "short", day: "numeric", month: "short" })}</span>
                    <span className="w-20 font-medium">{fmtH(x.hours)}</span>
                    <span className="hidden flex-1 text-xs text-muted sm:block">{fmtTime(x.bed)} → {fmtTime(x.wake)}{x.mood ? ` · ${x.mood}` : ""}</span>
                    <span className="ml-auto flex items-center gap-0.5 text-amber">{Array.from({ length: x.quality }, (_, i) => <Star key={i} size={12} className="fill-amber" />)}</span>
                    <button className="rounded p-1 text-muted hover:bg-white/10 hover:text-white" aria-label="Edit" onClick={() => { setDate(x.date); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil size={14} /></button>
                    <button className="rounded p-1 text-muted hover:bg-white/10 hover:text-rose" aria-label="Delete" onClick={() => { actions.removeSleep(x.id); toast.success("Entry deleted"); }}><Trash2 size={14} /></button>
                  </li>))}
              </ul>
            ) : <Empty>No sleep logged yet.</Empty>}
          </Card>
        </div>
      </div>
      <section className="mt-6 space-y-5" aria-label="Sleep and recovery guide">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card !p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet/15 text-violet"><Moon size={21}/></div><h3 className="font-semibold text-white">Know your sleep window</h3><p className="mt-2 text-sm leading-6 text-muted">Most adults are generally advised to get at least 7 hours of sleep regularly; many do best around 7–9 hours. Individual needs vary.</p></article>
          <article className="card !p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky/15 text-sky"><Sunrise size={21}/></div><h3 className="font-semibold text-white">Keep timing consistent</h3><p className="mt-2 text-sm leading-6 text-muted">Going to bed and waking up at similar times—including weekends—helps reinforce your body clock.</p></article>
          <article className="card !p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand"><Lightbulb size={21}/></div><h3 className="font-semibold text-white">Build a wind-down</h3><p className="mt-2 text-sm leading-6 text-muted">Dim bright lights, reduce stimulating screen use, and choose a quiet activity before bed. Keep the room dark, quiet and comfortably cool.</p></article>
        </div>
        <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
          <div className="overflow-hidden rounded-2xl border border-cardBorder bg-panel">
            <img src="https://images.unsplash.com/photo-1585128719715-46776b56a0d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="Soft bedside lighting in a restful bedroom" className="h-44 w-full object-cover" loading="lazy" />
            <div className="p-5"><p className="text-xs font-semibold uppercase tracking-wider text-violet">Prepare your space</p><h3 className="mt-2 text-lg font-semibold text-white">Make the bedroom signal rest.</h3><p className="mt-2 text-sm leading-6 text-muted">Reduce noise and unnecessary light, choose comfortable bedding, and keep work or stressful tasks outside your wind-down routine when possible.</p></div>
          </div>
          <Card title="A practical pre-sleep checklist">
            <div className="space-y-3">{[["Choose a realistic bedtime", "Plan enough time in bed to meet your sleep goal."],["Watch caffeine timing", "Caffeine can affect sleep for hours; try avoiding it in the afternoon or evening if you are sensitive."],["Move intense tasks earlier", "Finish demanding work and vigorous exercise with enough time to relax before bed."],["Review patterns, not one night", "Use your sleep log to spot trends in duration, timing and quality over several days."]].map(([title, text], i) => <div key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet/15 text-xs font-bold text-violet">{i+1}</span><div><h4 className="text-sm font-semibold text-white">{title}</h4><p className="mt-1 text-sm leading-5 text-muted">{text}</p></div></div>)}</div>
            <p className="mt-4 rounded-lg border border-cardBorder bg-panel2 p-3 text-xs leading-5 text-muted">If you regularly struggle to sleep, feel very sleepy during the day, or have loud snoring or gasping during sleep, consider speaking with a healthcare professional.</p>
          </Card>
        </div>
      </section>

      {/* Summary statistics are intentionally placed below the educational content. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[[BedDouble, "7-day average", week.length ? fmtH(avg7) : "—", `Goal ${goal} h`, "text-violet"],
          [Hourglass, "Sleep debt (7d)", week.length ? fmtH(debt) : "—", debt > 0.5 ? "Below goal this week" : "No debt 🎉", debt > 0.5 ? "text-rose" : "text-brand"],
          [CalendarClock, "Consistency", consistency[0], consistency[1], "text-sky"],
          [Star, "Avg quality", week.length ? `${num(avgQ, 1)} / 5` : "—", "Last 7 nights", "text-amber"]].map(([I, l, v, sub, c]) => (
          <div key={l} className="card !p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted">{l}</p><I size={20} className={c} /></div>
            <p className="mt-2 text-2xl font-bold">{v}</p><p className="mt-1 text-xs text-muted">{sub}</p></div>))}
      </div>

      <GoalModal key={String(modal)} open={modal} onClose={() => setModal(false)} goal={goal} />
    </div>
  );
}
