import { useEffect, useState } from "react";
import "../styles/Calender.css";
import DonutRing from "../components/DonutRing";
import { donutArcs } from "../utils/donut";
import { useAppNav } from "../context/NavContext";

// accent colors used as data (each is set on an element as --c)
const GREEN = "#2BAF34";
const YELLOW = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";
const ORANGE = "#F97316";

/* ---------- icons (24x24 stroke paths) ---------- */
const PATHS = {
  Dashboard: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  Nutrition: '<path d="M5 3v8a2 2 0 0 0 2 2v8M9 3v8M7 3v6M17 3c-2 2-3 5-3 8h3v10"/>',
  Workout: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  Calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  Progress: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  "Body Stats": '<circle cx="12" cy="5" r="2"/><path d="M12 8v7M8 11h8M10 21l2-6 2 6"/>',
  "Water Intake": '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  Sleep: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>',
  Supplements: '<path d="M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7zM8.5 8.5l7 7"/>',
  Goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  Reports: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6"/>',
  Photos: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
  Settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  dots: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
};

// Color comes from the parent's CSS `color`, so styling stays in the stylesheet.
function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  );
}

/* ---------- small building blocks ---------- */
function Card({ title, link, to, children }) {
  const navigate = useAppNav();
  return (
    <div className="cal-card">
      <div className="cal-card-head">
        <b className="cal-card-title">{title}</b>
        {link && <button type="button" className="cal-card-link" onClick={() => to && navigate(to)}>{link}</button>}
      </div>
      {children}
    </div>
  );
}

function Bar({ pct, color, thin }) {
  return (
    <div className={`cal-bar${thin ? " cal-bar--thin" : ""}`} style={{ "--c": color }}>
      <div className="cal-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ icon, color, label, value, unit, pct, note }) {
  return (
    <div className="cal-stat" style={{ "--c": color }}>
      <div className="cal-stat-head">
        <Icon name={icon} size={30} />
        {label}
      </div>
      <div className="cal-stat-value">
        {value} <span className="cal-stat-unit">{unit}</span>
      </div>
      <Bar pct={pct} color={color} />
      <div className="cal-stat-note">{note}</div>
    </div>
  );
}

/* FitTrack Pro - Calendar page (content only: the sidebar and top bar live in AppLayout). */

/* ---------- data ---------- */
const STATS = [
  { icon: "flame", color: GREEN, label: "Workouts", value: "14", unit: "/ 20 planned", pct: 70, note: "70% of monthly goal" },
  { icon: "Nutrition", color: YELLOW, label: "Meals Logged", value: "86", unit: "/ 120", pct: 72, note: "72% of monthly goal" },
  { icon: "Calendar", color: BLUE, label: "Active Days", value: "9", unit: "/ 10", pct: 90, note: "90% of days so far" },
  { icon: "Sleep", color: PURPLE, label: "Rest Days", value: "1", unit: "/ 4 planned", pct: 25, note: "25% of rest goal" },
];

// June 2025: the 1st is a Sunday, 30 days, today is the 10th
const TODAY = 10;
const DAYS_IN_MONTH = 30;
const FIRST_WEEKDAY = 0; // 0 = Sunday
// const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const EVENTS = {
  2: [["Push", PURPLE]],
  3: [["Pull", PURPLE]],
  4: [["Legs", PURPLE]],
  6: [["Upper", PURPLE], ["Cardio", BLUE]],
  7: [["Yoga", GREEN]],
  9: [["Pull", PURPLE]],
  10: [["Push", PURPLE], ["Cardio", BLUE]],
  11: [["Legs", PURPLE]],
  13: [["Upper", PURPLE]],
  14: [["Yoga", GREEN]],
  16: [["Push", PURPLE]],
  17: [["Pull", PURPLE], ["Weigh-in", YELLOW]],
  18: [["Legs", PURPLE]],
  20: [["Upper", PURPLE], ["Cardio", BLUE]],
  23: [["Push", PURPLE]],
  24: [["Pull", PURPLE]],
  25: [["Legs", PURPLE]],
  27: [["Upper", PURPLE]],
  28: [["Cardio", BLUE]],
  30: [["Weigh-in", YELLOW]],
};

const TABS = ["Month View", "Week View", "Agenda", "Events"];

const OVERVIEW = [
  { color: GREEN, label: "Workouts", value: "14 / 20", pct: 70 },
  { color: YELLOW, label: "Meals", value: "86 / 120", pct: 72 },
  { color: BLUE, label: "Water", value: "65%", pct: 65 },
];

const BREAKDOWN = [
  { name: "Workouts", value: "14 / 20", pct: 70, color: PURPLE },
  { name: "Meals", value: "86 / 120", pct: 72, color: GREEN },
  { name: "Water", value: "26 / 40 L", pct: 65, color: BLUE },
  { name: "Sleep", value: "7h 20m / 8h", pct: 92, color: YELLOW },
];

const QUICK_ADD = [
  { icon: "Workout", color: PURPLE, label: "Workout" },
  { icon: "Nutrition", color: GREEN, label: "Meal" },
  { icon: "Water Intake", color: BLUE, label: "Water" },
  { icon: "Body Stats", color: YELLOW, label: "Weigh-in" },
];

/* ---------- interactive calendar ---------- */
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const INITIAL_EVENTS = Object.fromEntries(Object.entries(EVENTS).map(([day, items]) => {
  const now = new Date();
  const safeDay = Math.min(Number(day), new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
  return [`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`, items];
}));
const formatKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const monthLabel = (date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

function EventModal({ date, initialType = "Workout", initialEvent, onClose, onSave }) {
  const [title, setTitle] = useState(initialEvent?.name || (initialType === "Workout" ? "Workout" : initialType));
  const [type, setType] = useState(initialEvent?.type || initialType);
  const [eventDate, setEventDate] = useState(initialEvent?.key || formatKey(date));
  const [time, setTime] = useState(initialEvent?.time || "09:00");
  const [notes, setNotes] = useState(initialEvent?.notes || "");
  const typeColors = { Workout: PURPLE, Meal: GREEN, Water: BLUE, "Weigh-in": YELLOW, Rest: PURPLE, Cardio: BLUE };
  return <div className="fit-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="fit-modal" onSubmit={(e) => { e.preventDefault(); if (title.trim()) onSave({ title: title.trim(), type, date: eventDate, time, notes, color: typeColors[type] || GREEN }); }}>
      <div className="fit-modal-heading"><h2>{initialEvent ? "Edit Calendar Event" : "Add Calendar Event"}</h2><button type="button" className="fit-modal-close" onClick={onClose} aria-label="Close">×</button></div>
      <label>Event name<input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Upper body workout" /></label>
      <div className="fit-modal-fields"><label>Type<select value={type} onChange={(e) => { setType(e.target.value); if (title === "Workout" || title === "Meal" || title === "Water" || title === "Weigh-in") setTitle(e.target.value); }}><option>Workout</option><option>Meal</option><option>Water</option><option>Weigh-in</option><option>Cardio</option><option>Rest</option></select></label><label>Date<input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></label></div>
      <div className="fit-modal-fields"><label>Time<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label><label>Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" /></label></div>
      <div className="fit-modal-actions"><button type="button" className="cal-box" onClick={onClose}>Cancel</button><button type="submit" className="cal-box cal-box--primary">{initialEvent ? "Update Event" : "Save Event"}</button></div>
    </form>
  </div>;
}

function DayCell({ day, date, events, isToday, selected, onClick, onEventClick }) {
  const completed = date < new Date() && events.length > 0;
  return <button type="button" onClick={onClick} className={`cal-day${isToday ? " is-today" : ""}${selected ? " is-selected" : ""}`} aria-label={`${monthLabel(date)} ${day}, ${events.length} events`}>
    {isToday ? <span className="cal-today-num">{day}</span> : <span className="cal-day-num">{day}</span>}
    {completed && <span className="cal-check">✓</span>}
    {events.slice(0, 3).map(([label, color], i) => <span key={`${label}-${i}`} className="cal-event" style={{ "--c": color }} onClick={(e) => { e.stopPropagation(); onEventClick?.({ label, color, date }); }}><span className="cal-event-dot" />{label}</span>)}
    {events.length > 3 && <span className="cal-event-more">+{events.length - 3} more</span>}
  </button>;
}

function MonthGrid({ date, events, query, selectedDate, onSelectDate, onAdd }) {
  const year = date.getFullYear(), month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const first = new Date(year, month, 1).getDay();
  const todayKey = formatKey(new Date());
  const q = query.trim().toLowerCase();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(<div className="cal-day cal-day--empty" key={`blank-${i}`} />);
  for (let day = 1; day <= days; day++) {
    const dayDate = new Date(year, month, day);
    const dayKey = formatKey(dayDate);
    const dayEvents = (events[dayKey] || []).filter(([label]) => label.toLowerCase().includes(q));
    cells.push(<DayCell key={dayKey} day={day} date={dayDate} events={dayEvents} isToday={dayKey === todayKey} selected={selectedDate === dayKey} onClick={() => onSelectDate(dayDate)} onEventClick={(event) => onAdd(dayDate, event.label)} />);
  }
  return <><div className="cal-weekdays">{WEEKDAYS.map((d) => <span key={d}>{d}</span>)}</div><div className="cal-grid">{cells}</div></>;
}

function TotalRow({ events }) {
  const all = Object.values(events).flat();
  const count = (type) => all.filter(([label]) => label.toLowerCase().includes(type)).length;
  return <div className="cal-total"><span className="cal-total-label">TOTAL</span><span><b>{count("push") + count("pull") + count("legs") + count("upper") + count("workout")}</b> workouts</span><span style={{ color: GREEN }}>M: {count("meal")} meals</span><span style={{ color: BLUE }}>C: {count("cardio")} cardio</span><span style={{ color: YELLOW }}>W: {count("weigh")} weigh-ins</span></div>;
}

function MonthOverview({ eventCount }) {
  const navigate = useAppNav();
  const arcs = donutArcs(OVERVIEW.map((o) => ({ label: o.label, color: o.color, value: o.pct })));
  return <Card title="Month Overview"><div className="cal-overview"><div className="cal-donut"><DonutRing arcs={arcs} /><div className="cal-donut-center"><b>{Math.min(100, Math.round(eventCount / 20 * 100))}%</b><span>planned</span></div></div><div>{OVERVIEW.map((o) => <div key={o.label} className="cal-legend-item" style={{ "--c": o.color }}><span className="cal-legend-dot" /><div>{o.label}<div className="cal-legend-value">{o.value}</div></div></div>)}</div></div><button className="cal-report-btn" onClick={() => navigate("reports")}>View Full Report</button></Card>;
}

function GoalBreakdown() { return <Card title="Goal Breakdown" link="View All" to="goals">{BREAKDOWN.map((b) => <div key={b.name}><div className="cal-break-row"><span>{b.name}</span><span className="cal-break-value">{b.value}</span><span>{b.pct}%</span></div><Bar pct={b.pct} color={b.color} thin /></div>)}</Card>; }

function QuickAddEvent({ onAdd, quickSearch, setQuickSearch }) {
  return <Card title="Quick Add Event"><label className="cal-quick-search"><Icon name="search" size={16} /><input value={quickSearch} onChange={(e) => setQuickSearch(e.target.value)} placeholder="Search to add event..." /></label><div className="cal-quick-grid">{QUICK_ADD.filter((t) => t.label.toLowerCase().includes(quickSearch.toLowerCase())).map((t) => <button key={t.label} className="cal-quick-tile" style={{ "--c": t.color }} onClick={() => onAdd(t.label)}><Icon name={t.icon} size={22} />{t.label}</button>)}</div></Card>;
}

export default function CalendarPage() {
  const [date, setDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [tab, setTab] = useState("Month View");
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fitnova-calendar-events")) || INITIAL_EVENTS; }
    catch { return INITIAL_EVENTS; }
  });
  useEffect(() => {
    try { localStorage.setItem("fitnova-calendar-events", JSON.stringify(events)); } catch { /* storage may be disabled */ }
  }, [events]);
  const [selectedDate, setSelectedDate] = useState(() => formatKey(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(() => new Date());
  const [modalType, setModalType] = useState("Workout");
  const [editingEvent, setEditingEvent] = useState(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const label = monthLabel(date);
  const allEvents = Object.entries(events).flatMap(([key, list]) => list.map((item, index) => ({ key, index, name: item[0], color: item[1], time: item[2] || "09:00", notes: item[3] || "", type: item[4] || "Workout" })));
  const monthPrefix = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-`;
  const monthItems = allEvents.filter((event) => event.key.startsWith(monthPrefix));
  const workoutCount = monthItems.filter((e) => ["workout", "push", "pull", "legs", "upper", "cardio", "yoga"].some((term) => e.name.toLowerCase().includes(term) || e.type.toLowerCase() === term)).length;
  const mealCount = monthItems.filter((e) => e.type === "Meal" || e.name.toLowerCase().includes("meal")).length;
  const activeDays = new Set(monthItems.map((e) => e.key)).size;
  const dynamicStats = [
    { icon: "flame", color: GREEN, label: "Workouts", value: workoutCount, unit: "/ 20 planned", pct: Math.min(100, Math.round(workoutCount / 20 * 100)), note: `${Math.min(100, Math.round(workoutCount / 20 * 100))}% of monthly goal` },
    { icon: "Nutrition", color: YELLOW, label: "Meals Logged", value: mealCount, unit: "/ 120", pct: Math.min(100, Math.round(mealCount / 120 * 100)), note: `${Math.min(100, Math.round(mealCount / 120 * 100))}% of monthly goal` },
    { icon: "Calendar", color: BLUE, label: "Active Days", value: activeDays, unit: ` / ${new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()}`, pct: Math.round(activeDays / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() * 100), note: `${activeDays} days with planned events` },
    { icon: "Sleep", color: PURPLE, label: "Rest Days", value: monthItems.filter((e) => e.type === "Rest").length, unit: " logged", pct: Math.min(100, monthItems.filter((e) => e.type === "Rest").length / 4 * 100), note: "Based on your saved events" },
  ];
  const monthEvents = Object.entries(events).filter(([key]) => key.startsWith(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-`)).flatMap(([key, list]) => list.map(([name, color, time, notes, type], index) => ({ name, color, time, notes, type, key, index })));
  const visibleEvents = monthEvents.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || (filter === "Workout" ? ["push", "pull", "legs", "upper", "yoga", "cardio", "workout"].some((w) => e.name.toLowerCase().includes(w)) : e.name.toLowerCase().includes(filter.toLowerCase()))));
  const openAdd = (type = "Workout", chosenDate = new Date(date.getFullYear(), date.getMonth(), 1)) => { setModalType(type); setModalDate(chosenDate); setShowModal(true); };
  const saveEvent = ({ title, type, date: dateKey, color, time, notes }) => {
    if (editingEvent) {
      setEvents((prev) => {
        const next = { ...prev };
        next[editingEvent.key] = (next[editingEvent.key] || []).filter((_, i) => i !== editingEvent.index);
        if (!next[editingEvent.key].length) delete next[editingEvent.key];
        next[dateKey] = [...(next[dateKey] || []), [title, color, time, notes, type]];
        return next;
      });
      setNotice(`“${title}” updated.`);
    } else {
      setEvents((prev) => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), [title, color, time, notes, type]] }));
      setNotice(`“${title}” added to your calendar.`);
    }
    setDate(new Date(`${dateKey}T12:00:00`));
    setSelectedDate(dateKey); setShowModal(false); setEditingEvent(null);
  };
  const removeEvent = (key, index) => {
    setEvents((prev) => {
      const next = { ...prev, [key]: (prev[key] || []).filter((_, i) => i !== index) };
      if (!next[key].length) delete next[key];
      return next;
    });
    setNotice("Event removed.");
  };
  const openEdit = (event) => {
    setEditingEvent(event);
    setModalType(event.type || "Workout");
    setModalDate(new Date(`${event.key}T12:00:00`));
    setShowModal(true);
  };
  const changeMonth = (offset) => setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  const selected = new Date(`${selectedDate}T12:00:00`);
  const selectedEvents = events[selectedDate] || [];
  const weekStart = new Date(selected); weekStart.setDate(selected.getDate() - selected.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });

  return <div className="cal-page">
    <div className="cal-header"><div><h1 className="cal-title">Calendar</h1><div className="cal-subtitle">Plan your workouts and meals, and stay on track</div></div><div className="cal-actions"><button className="cal-box cal-box--icon" onClick={() => changeMonth(-1)} aria-label="Previous month"><Icon name="left" size={16} /></button><label className="cal-box cal-box--wide cal-month-select"><Icon name="Calendar" size={18} /><select aria-label="Choose month" value={`${date.getFullYear()}-${date.getMonth()}`} onChange={(e) => { const [y, m] = e.target.value.split("-").map(Number); setDate(new Date(y, m, 1)); }}><option value={`${date.getFullYear()}-${date.getMonth()}`}>{label}</option>{Array.from({ length: 36 }, (_, i) => { const d = new Date(new Date().getFullYear(), new Date().getMonth() - 12 + i, 1); return <option key={i} value={`${d.getFullYear()}-${d.getMonth()}`}>{monthLabel(d)}</option>; })}</select><Icon name="chevron" size={16} /></label><button className="cal-box cal-box--icon" onClick={() => changeMonth(1)} aria-label="Next month"><Icon name="right" size={16} /></button><button className="cal-box cal-box--primary" onClick={() => openAdd("Workout", new Date(date.getFullYear(), date.getMonth(), 1))}><Icon name="plus" size={16} />Add Event</button><button className="cal-box cal-box--icon" title="Clear search and filters" onClick={() => { setQuery(""); setFilter("All"); setNotice("Calendar filters cleared."); }}><Icon name="dots" size={16} /></button></div></div>
    {notice && <div className="fit-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
    <div className="cal-stats">{dynamicStats.map((s) => <StatCard key={s.label} {...s} />)}</div>
    <div className="cal-layout"><div className="cal-panel"><div className="cal-tabs">{TABS.map((t) => <button key={t} className={`cal-tab${tab === t ? " is-active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="cal-panel-body"><div className="cal-toolbar"><b className="cal-toolbar-title">{tab === "Week View" ? `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : tab === "Month View" ? label : `${tab} · ${label}`}</b><div className="cal-toolbar-actions"><label className="cal-box cal-box--search"><Icon name="search" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events..." /></label><div className="fit-filter-wrap"><button className="cal-box" onClick={() => setShowFilter((v) => !v)}><Icon name="filter" size={16} />Filter</button>{showFilter && <div className="fit-filter-menu">{["All", "Workout", "Meal", "Water", "Weigh-in", "Cardio"].map((f) => <button key={f} className={filter === f ? "selected" : ""} onClick={() => { setFilter(f); setShowFilter(false); }}>{f}</button>)}</div>}</div></div></div>
      {tab === "Month View" ? <MonthGrid date={date} events={Object.fromEntries(Object.entries(events).map(([key, list]) => [key, list.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || name.toLowerCase().includes(filter.toLowerCase())))]))} query={query} selectedDate={selectedDate} onSelectDate={(d) => setSelectedDate(formatKey(d))} onAdd={(d, title) => openAdd(title, d)} /> : tab === "Week View" ? <><div className="cal-weekdays">{WEEKDAYS.map((d) => <span key={d}>{d}</span>)}</div><div className="cal-grid">{weekDates.map((d) => <DayCell key={formatKey(d)} day={d.getDate()} date={d} events={(events[formatKey(d)] || []).filter(([n]) => n.toLowerCase().includes(query.toLowerCase()))} isToday={formatKey(d) === formatKey(new Date())} selected={formatKey(d) === selectedDate} onClick={() => setSelectedDate(formatKey(d))} onEventClick={() => openAdd("Workout", d)} />)}</div></> : <div className="cal-agenda">{visibleEvents.length ? visibleEvents.map((e, i) => <div className="cal-agenda-row" key={`${e.key}-${e.name}-${i}`}><div className="cal-agenda-date">{new Date(`${e.key}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}</div><span className="cal-agenda-dot" style={{ "--c": e.color }} /><div className="cal-agenda-name">{e.name}</div><div className="cal-agenda-actions"><button onClick={() => openEdit(e)}>Edit</button><button onClick={() => removeEvent(e.key, e.index)}>Remove</button></div></div>) : <div className="goal-empty">No events found. Use Add Event to schedule one.</div>}</div>}
      {tab === "Month View" && <TotalRow events={events} />}
      {tab === "Week View" && <div className="cal-selected-events"><b>Selected day · {selected.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</b>{selectedEvents.length ? selectedEvents.map(([name, color], i) => <span key={`${name}-${i}`} style={{ "--c": color }}><i />{name}</span>) : <span>No events planned.</span>}<button className="cal-box cal-box--primary" onClick={() => openAdd("Workout", selected)}>+ Add to this day</button></div>}
      </div></div>
      <div className="cal-aside"><MonthOverview eventCount={monthEvents.length} /><GoalBreakdown /><QuickAddEvent quickSearch={quickSearch} setQuickSearch={setQuickSearch} onAdd={(type) => openAdd(type, selected)} /></div>
    </div>
    {showModal && <EventModal key={editingEvent ? `${editingEvent.key}-${editingEvent.index}` : `new-${formatKey(modalDate)}`} date={modalDate} initialType={modalType} initialEvent={editingEvent} onClose={() => { setShowModal(false); setEditingEvent(null); }} onSave={saveEvent} />}
  </div>;
}
