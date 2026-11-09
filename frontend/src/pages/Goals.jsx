import { useEffect, useState } from "react";
import "../styles/Goal.css";
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
    <div className="goal-card">
      <div className="goal-card-head">
        <b className="goal-card-title">{title}</b>
        {link && <button type="button" className="goal-card-link" onClick={() => to && navigate(to)}>{link}</button>}
      </div>
      {children}
    </div>
  );
}

function Bar({ pct, color, thin }) {
  return (
    <div className={`goal-bar${thin ? " goal-bar--thin" : ""}`} style={{ "--c": color }}>
      <div className="goal-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ icon, color, label, value, unit, pct, note }) {
  return (
    <div className="goal-stat" style={{ "--c": color }}>
      <div className="goal-stat-head">
        <Icon name={icon} size={30} />
        {label}
      </div>
      <div className="goal-stat-value">
        {value} <span className="goal-stat-unit">{unit}</span>
      </div>
      <Bar pct={pct} color={color} />
      <div className="goal-stat-note">{note}</div>
    </div>
  );
}

const activeCountSafe = (items, state) => items.filter((g) => g.state === state).length;

/* FitTrack Pro - Goals page (content only: the sidebar and top bar live in AppLayout). */

const STATS = [
  { icon: "Goals", color: GREEN, label: "Active Goals", value: "6", unit: "/ 8", pct: 75, note: "75% of goals active" },
  { icon: "check", color: YELLOW, label: "Completed", value: "12", unit: "/ 20", pct: 60, note: "60% of all goals" },
  { icon: "Progress", color: BLUE, label: "Avg Progress", value: "68", unit: "%", pct: 68, note: "68% across active goals" },
  { icon: "flame", color: PURPLE, label: "Best Streak", value: "12", unit: "days", pct: 40, note: "40% to the 30 day goal" },
];

const TABS = ["Active", "Completed", "Paused", "Templates"];

const GOALS = [
  { icon: "Body Stats", color: GREEN, title: "Reach 78 kg", sub: "82.4 kg now, 4.4 kg to go", pct: 40, due: "Due 30 Sep", status: "Behind" },
  { icon: "Nutrition", color: YELLOW, title: "Protein 150 g daily", sub: "142 g today, 7 day average 138 g", pct: 95, due: "Daily", status: "On Track" },
  { icon: "Workout", color: PURPLE, title: "Workout 5 times a week", sub: "4 of 5 sessions this week", pct: 80, due: "Weekly", status: "On Track" },
  { icon: "Water Intake", color: BLUE, title: "Drink 4 L of water", sub: "2.6 L today, 1.4 L to go", pct: 65, due: "Daily", status: "On Track" },
  { icon: "Sleep", color: PURPLE, title: "Sleep 8 hours", sub: "7h 20m last night", pct: 92, due: "Daily", status: "Almost There" },
  { icon: "flame", color: ORANGE, title: "30 day streak", sub: "12 of 30 days", pct: 40, due: "Due 30 Jun", status: "Behind" },
];

const OVERVIEW = [
  { color: GREEN, label: "On Track", value: "4 goals" },
  { color: YELLOW, label: "Behind", value: "2 goals" },
  { color: BLUE, label: "Completed", value: "12 goals" },
];

const MILESTONES = [
  { name: "Lose 4.4 kg", value: "1.8 / 4.4 kg", pct: 40, color: GREEN },
  { name: "Weekly workouts", value: "4 / 5", pct: 80, color: PURPLE },
  { name: "Daily protein", value: "142 / 150 g", pct: 95, color: YELLOW },
  { name: "Streak to 30", value: "12 / 30", pct: 40, color: BLUE },
];

const QUICK_ADD = [
  { icon: "Body Stats", color: GREEN, label: "Weight" },
  { icon: "Nutrition", color: YELLOW, label: "Protein" },
  { icon: "Workout", color: PURPLE, label: "Workout" },
  { icon: "Water Intake", color: BLUE, label: "Water" },
];

function GoalRow({ goal }) {
  const tagColor = goal.status === "Behind" ? YELLOW : GREEN;
  return (
    <div className="goal-goal-row">
      <span className="goal-goal-icon" style={{ "--c": goal.color }}>
        <Icon name={goal.icon} size={22} />
      </span>
      <div className="goal-goal-body">
        <div className="goal-goal-top">
          <b className="goal-goal-name">{goal.title}</b>
          <span className="goal-tag" style={{ "--c": tagColor }}>{goal.status}</span>
        </div>
        <div className="goal-goal-sub">{goal.sub}</div>
        <Bar pct={goal.pct} color={goal.color} />
      </div>
      <div className="goal-goal-side">
        <div className="goal-goal-pct">{goal.pct}%</div>
        <div className="goal-goal-due">{goal.due}</div>
      </div>
    </div>
  );
}

function GoalOverview({ goals }) {
  const navigate = useAppNav();
  const active = goals.filter((g) => g.state === "Active").length;
  const completed = goals.filter((g) => g.state === "Completed").length;
  const behind = goals.filter((g) => g.state === "Active" && g.status === "Behind").length;
  const average = goals.length ? Math.round(goals.reduce((sum, g) => sum + (Number(g.pct) || 0), 0) / goals.length) : 0;
  const counts = [
    { color: GREEN, label: "On Track", count: Math.max(0, active - behind) },
    { color: YELLOW, label: "Behind", count: behind },
    { color: BLUE, label: "Completed", count: completed },
  ];
  const overview = counts.map((c) => ({ ...c, value: `${c.count} goals` }));

  const arcs = donutArcs(counts.map((c) => ({ label: c.label, color: c.color, value: c.count })));
  return (
    <Card title="Goal Overview">
      <div className="goal-overview">
        <div className="goal-donut">
          <DonutRing arcs={arcs} />
          <div className="goal-donut-center">
            <b>{average}%</b>
            <span>overall</span>
          </div>
        </div>
        <div>
          {overview.map((o) => (
            <div key={o.label} className="goal-legend-item" style={{ "--c": o.color }}>
              <span className="goal-legend-dot" />
              <div>
                {o.label}
                <div className="goal-legend-value">{o.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="goal-report-btn" onClick={() => navigate("reports")}>View Full Report</button>
    </Card>
  );
}

function GoalModal({ onClose, onSave, initialGoal = null }) {
  const [title, setTitle] = useState(initialGoal?.title || "");
  const [target, setTarget] = useState(initialGoal?.target || 100);
  const [unit, setUnit] = useState(initialGoal?.unit || "%");
  const [due, setDue] = useState(initialGoal?.due || "Daily");
  return (
    <div className="fit-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="fit-modal" onSubmit={(e) => { e.preventDefault(); if (title.trim()) onSave({ id: initialGoal?.id, title: title.trim(), target: Number(target) || 100, unit, due }); }}>
        <div className="fit-modal-heading"><h2>{initialGoal ? "Edit Goal" : "New Goal"}</h2><button type="button" className="fit-modal-close" onClick={onClose} aria-label="Close">×</button></div>
        <label>Goal name<input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Walk 8,000 steps daily" /></label>
        <div className="fit-modal-fields"><label>Target<input type="number" min="1" value={target} onChange={(e) => setTarget(e.target.value)} /></label><label>Unit<input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, L, steps..." /></label></div>
        <label>Frequency<select value={due} onChange={(e) => setDue(e.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option><option>One-time</option></select></label>
        <div className="fit-modal-actions"><button type="button" className="goal-box" onClick={onClose}>Cancel</button><button className="goal-box goal-box--primary" type="submit">{initialGoal ? "Save Changes" : "Create Goal"}</button></div>
      </form>
    </div>
  );
}

export default function GoalsPage() {
  const [tab, setTab] = useState("Active");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("fitnova-goals");
      return saved ? JSON.parse(saved) : GOALS.map((g, i) => ({ ...g, id: `${i}-${g.title}`, state: "Active" }));
    } catch {
      return GOALS.map((g, i) => ({ ...g, id: `${i}-${g.title}`, state: "Active" }));
    }
  });
  useEffect(() => {
    try { localStorage.setItem("fitnova-goals", JSON.stringify(goals)); } catch { /* storage may be disabled */ }
  }, [goals]);
  const [quickSearch, setQuickSearch] = useState("");
  const dynamicStats = [
    { icon: "Goals", color: GREEN, label: "Active Goals", value: activeCountSafe(goals, "Active"), unit: ` / ${goals.length}`, pct: goals.length ? Math.round(activeCountSafe(goals, "Active") / goals.length * 100) : 0, note: "Goals currently in progress" },
    { icon: "check", color: YELLOW, label: "Completed", value: activeCountSafe(goals, "Completed"), unit: " goals", pct: goals.length ? Math.round(activeCountSafe(goals, "Completed") / goals.length * 100) : 0, note: "Goals you have completed" },
    { icon: "Progress", color: BLUE, label: "Avg Progress", value: goals.length ? Math.round(goals.filter((g) => g.state !== "Paused").reduce((sum, g) => sum + (Number(g.pct) || 0), 0) / Math.max(1, goals.filter((g) => g.state !== "Paused").length)) : 0, unit: "%", pct: goals.length ? Math.round(goals.filter((g) => g.state !== "Paused").reduce((sum, g) => sum + (Number(g.pct) || 0), 0) / Math.max(1, goals.filter((g) => g.state !== "Paused").length)) : 0, note: "Average across your goals" },
    { icon: "flame", color: PURPLE, label: "Best Streak", value: goals.reduce((best, g) => Math.max(best, Number(g.streak) || 0), 0), unit: " days", pct: Math.min(100, goals.reduce((best, g) => Math.max(best, Number(g.streak) || 0), 0) / 30 * 100), note: "Based on streaks you record" },
  ];
  const [notice, setNotice] = useState("");

  const visible = tab === "Templates"
    ? QUICK_ADD.filter((t) => t.label.toLowerCase().includes(query.trim().toLowerCase())).map((t) => ({ id: `template-${t.label}`, icon: t.icon, color: t.color, title: `${t.label} goal`, sub: "Ready-to-use goal template", pct: 0, due: "Customise", status: "Template", state: "Template", templateLabel: t.label }))
    : goals.filter((g) => g.state === tab && g.title.toLowerCase().includes(query.trim().toLowerCase()) && (filter === "All" || g.status === filter));
  const activeCount = goals.filter((g) => g.state === "Active").length;
  const completedCount = goals.filter((g) => g.state === "Completed").length;
  const updateGoal = (id, updates) => setGoals((prev) => prev.map((g) => g.id === id ? { ...g, ...updates } : g));
  const addGoal = ({ id, title, target, unit, due }) => {
    if (id) {
      setGoals((prev) => prev.map((g) => g.id === id ? { ...g, title, target, unit, due, sub: `Target: ${target} ${unit}` } : g));
      setNotice("Goal updated successfully.");
    } else {
      setGoals((prev) => [{ id: `goal-${Date.now()}`, icon: "Goals", color: GREEN, title, sub: `Target: ${target} ${unit}`, target, unit, pct: 0, due, status: "On Track", state: "Active" }, ...prev]);
      setTab("Active"); setQuery(""); setNotice("Goal created successfully.");
    }
    setShowModal(false); setEditingGoal(null);
  };
  const quickAdd = (label) => {
    const presets = {
      Weight: { title: "Track my weight", sub: "Add your latest weight", pct: 0, due: "Weekly", icon: "Body Stats", color: GREEN },
      Protein: { title: "Protein 150 g daily", sub: "0 g logged today", pct: 0, due: "Daily", icon: "Nutrition", color: YELLOW },
      Workout: { title: "Workout 5 times a week", sub: "0 of 5 sessions this week", pct: 0, due: "Weekly", icon: "Workout", color: PURPLE },
      Water: { title: "Drink 4 L of water", sub: "0 L today", pct: 0, due: "Daily", icon: "Water Intake", color: BLUE },
    };
    const item = presets[label];
    if (!item) return;
    setGoals((prev) => [{ ...item, id: `quick-${Date.now()}`, status: "On Track", state: "Active" }, ...prev]);
    setTab("Active"); setNotice(`${label} goal added.`);
  };

  return (
    <div className="goal-page">
      <div className="goal-header"><div><h1 className="goal-title">Goals</h1><div className="goal-subtitle">Set targets and track your progress</div></div>
        <div className="goal-actions"><button className="goal-box goal-box--primary" onClick={() => setShowModal(true)}><Icon name="plus" size={16} />New Goal</button><button className="goal-box goal-box--icon" title="Reset search and filters" onClick={() => { setQuery(""); setFilter("All"); setNotice("Filters cleared."); }}><Icon name="dots" size={16} /></button></div>
      </div>
      {notice && <div className="fit-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
      <div className="goal-stats">{dynamicStats.map((s) => <StatCard key={s.label} {...s} />)}</div>
      <div className="goal-layout">
        <div className="goal-panel"><div className="goal-tabs">{TABS.map((t) => <button key={t} className={`goal-tab${tab === t ? " is-active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}</div>
          <div className="goal-panel-body"><div className="goal-toolbar"><b className="goal-toolbar-title">{tab === "Templates" ? "Goal Templates" : `Your ${tab} Goals`}</b><div className="goal-toolbar-actions">
            <label className="goal-box goal-box--search"><Icon name="search" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search goals..." /></label>
            <div className="fit-filter-wrap"><button className="goal-box" onClick={() => setShowFilter((v) => !v)}><Icon name="filter" size={16} />Filter</button>{showFilter && <div className="fit-filter-menu">{["All", "On Track", "Behind", "Almost There"].map((f) => <button key={f} className={filter === f ? "selected" : ""} onClick={() => { setFilter(f); setShowFilter(false); }}>{f}</button>)}</div>}</div>
          </div></div>
          <div className="goal-goal-list">{visible.map((g) => <div className="goal-row-wrap" key={g.id}><GoalRow goal={g} /><div className="goal-row-actions">
            {g.state === "Template" && <button onClick={() => quickAdd(g.templateLabel)}>Use Template</button>}
            {g.state !== "Template" && <button onClick={() => { setEditingGoal(g); setShowModal(true); }}>Edit</button>}
            {g.state === "Active" && <><button onClick={() => updateGoal(g.id, { pct: Math.min(100, (Number(g.pct) || 0) + 10), status: (Number(g.pct) || 0) + 10 >= 100 ? "Almost There" : g.status === "Behind" ? "On Track" : g.status })}>+10% progress</button><button onClick={() => updateGoal(g.id, { pct: Math.max(0, (Number(g.pct) || 0) - 10) })}>−10%</button><button onClick={() => updateGoal(g.id, { state: "Completed", pct: 100, status: "Completed" })}>✓ Complete</button><button onClick={() => updateGoal(g.id, { state: "Paused" })}>Pause</button></>}
            {g.state === "Paused" && <button onClick={() => updateGoal(g.id, { state: "Active" })}>Resume</button>}
            {g.state === "Completed" && <button onClick={() => updateGoal(g.id, { state: "Active", status: "On Track" })}>Reactivate</button>}
            <button className="danger" onClick={() => setGoals((prev) => prev.filter((item) => item.id !== g.id))}>Remove</button>
          </div></div>)}{visible.length === 0 && <div className="goal-empty">{tab === "Templates" ? "Choose a quick-add template on the right." : `No ${tab.toLowerCase()} goals match your search.`}</div>}</div>
          <div className="goal-total"><span className="goal-total-label">TOTAL</span><span><b>{activeCount}</b> active goals</span><span style={{ color: GREEN }}>Completed: {completedCount}</span><span style={{ color: YELLOW }}>Behind: {goals.filter((g) => g.state === "Active" && g.status === "Behind").length}</span></div>
          </div>
        </div>
        <div className="goal-aside"><GoalOverview goals={goals} /><Card title="Milestones" link="View All" to="progress">{goals.filter((g) => g.state !== "Paused").slice(0, 4).map((g) => <div key={g.id}><div className="goal-break-row"><span>{g.title}</span><span className="goal-break-value">{g.pct}%</span><span>{g.pct}%</span></div><Bar pct={g.pct} color={g.color || GREEN} thin /></div>)}{goals.length === 0 && <div className="goal-empty">Create a goal to track milestones.</div>}</Card>
          <Card title="Quick Add Goal"><label className="goal-quick-search"><Icon name="search" size={16} /><input value={quickSearch} onChange={(e) => setQuickSearch(e.target.value)} placeholder="Search goal to add..." /></label><div className="goal-quick-grid">{QUICK_ADD.filter((t) => t.label.toLowerCase().includes(quickSearch.toLowerCase())).map((t) => <button key={t.label} className="goal-quick-tile" style={{ "--c": t.color }} onClick={() => quickAdd(t.label)}><Icon name={t.icon} size={22} />{t.label}</button>)}</div></Card>
        </div>
      </div>
      {showModal && <GoalModal initialGoal={editingGoal} onClose={() => { setShowModal(false); setEditingGoal(null); }} onSave={addGoal} />}
    </div>
  );
}
