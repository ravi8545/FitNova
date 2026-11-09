import { useEffect, useState } from "react";
import { Plus, Check, Circle, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import "../styles/Dashboard.css";
import { dashboardData } from "../services/mockData";
import { useAppNav } from '../context/NavContext';

// TODO: replace with api.get("/dashboard/") once the backend endpoint exists
const fetchDashboard = () => Promise.resolve(dashboardData);

const Bar = ({ pct, color }) => (
  <div className="dash-bar"><span style={{ width: `${Math.min(pct, 100)}%`, background: color }} /></div>
);

const CardHead = ({ title, action, to }) => {
  const navigate = useAppNav();
  return (
    <div className="dash-card-head">
      <h3 className="dash-card-title">{title}</h3>
      {action && <button className="dash-link" onClick={() => to && navigate(to)}>{action}</button>}
    </div>
  );
};

function Donut({ macros, total }) {
  const sum = macros.reduce((a, m) => a + m.pct, 0);
  let acc = 0;
  const stops = macros.map((m) => { const w = (m.pct / sum) * 100; const s = `${m.color} ${acc}% ${acc + w}%`; acc += w; return s; }).join(",");
  return (
    <div className="dash-donut" style={{ background: `conic-gradient(${stops})` }}>
      <div className="dash-donut-hole">
        <span className="dash-donut-num">{total.toLocaleString()}</span>
        <span className="dash-donut-unit">kcal</span>
      </div>
    </div>
  );
}

function LineChart({ points }) {
  const W = 640, H = 170, vals = points.map((p) => p[1]);
  const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1;
  const xy = points.map(([, v], i) => [(i / (points.length - 1)) * (W - 20) + 10, H - ((v - min) / (max - min)) * (H - 20) - 10]);
  const line = xy.map((p) => p.join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="dash-line">
      <defs><linearGradient id="dash-wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2BAF34" stopOpacity=".3" /><stop offset="1" stopColor="#2BAF34" stopOpacity="0" /></linearGradient></defs>
      <polygon points={`${xy[0][0]},${H} ${line} ${xy.at(-1)[0]},${H}`} fill="url(#dash-wg)" />
      <polyline points={line} fill="none" stroke="#2BAF34" strokeWidth="2" />
      {xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === xy.length - 1 ? 5 : 3} fill="#2BAF34" />)}
      {points.map(([d], i) => <text key={d} x={xy[i][0]} y={H + 15} fontSize="11" fill="#94A3B8" textAnchor="middle">{d}</text>)}
    </svg>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d[1]));
  return (
    <div className="dash-bars">
      {data.map(([d, v], i) => (
        <div key={d}>
          <span>{i === data.length - 1 ? v : ""}</span>
          <b style={{ height: `${Math.round((v / max) * 190)}px` }} />
          <span>{d}</span>
        </div>
      ))}
    </div>
  );
}

function CalendarCard({ cal }) {
  const [offset, setOffset] = useState(0);
  const d = new Date(cal.year, cal.month + offset, 1);
  const isBase = offset === 0;
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const cells = [...Array(d.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="dash-card">
      <CardHead title="Calendar" action="View Full Calendar" to="calendar" />
      <div className="dash-cal-nav">
        <button aria-label="Previous month" onClick={() => setOffset((o) => o - 1)}><ChevronLeft size={18} /></button>
        <span>{d.toLocaleString("en-GB", { month: "long", year: "numeric" })}</span>
        <button aria-label="Next month" onClick={() => setOffset((o) => o + 1)}><ChevronRight size={18} /></button>
      </div>
      <div className="dash-cal">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((w) => <span key={w} className="dash-cal-wd">{w}</span>)}
        {cells.map((n, i) => (
          <div key={i} className="dash-cal-cell">
            {n && (
              <>
                <span className={`dash-cal-day${isBase && n === cal.today ? " is-today" : ""}`}>{n}</span>
                <span className="dash-cal-dot" style={{ background: isBase && cal.dots[n] ? cal.dots[n] : "transparent" }} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakCard({ streak }) {
  return (
    <div className="dash-card dash-streak">
      <div className="dash-streak-top">
        <div><b>{streak.days}</b><span>Day Streak</span></div>
        <Flame size={36} />
      </div>
      <div className="dash-week">
        {["M", "T", "W", "T", "F", "S", "S"].map((w, i) => (
          <div key={i}><i className={streak.week[i] ? "on" : ""}>{streak.week[i] && <Check size={12} />}</i>{w}</div>
        ))}
      </div>
      <p className="dash-quote">"Consistency today, progress tomorrow."</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useAppNav();
  const [data, setData] = useState(null);
  useEffect(() => { fetchDashboard().then(setData); }, []);
  if (!data) return <div className="dash-page">Loading…</div>;

  const { calendar, streak, stats, macros, macroGoals, workout, weight, activity, meals, plan } = data;
  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Good Morning, {data.user.name}! 👋</h1>
          <p className="dash-sub">Stay consistent, stay stronger. Small steps today, big results tomorrow.</p>
        </div>
        <button className="dash-btn" onClick={() => navigate("workout")}><Plus size={16} /> Log Activity</button>
      </div>

      <div className="dash-stats">
        {stats.map((s) => (
          <div key={s.key} className="dash-card">
            <p className="dash-stat-label">{s.label}</p>
            <p className="dash-stat-value">{s.value} <span className="dash-stat-unit">/ {s.goal.toLocaleString()} {s.unit}</span></p>
            <Bar pct={(s.value / s.goal) * 100} color={s.color} />
            <p className="dash-stat-note">{Math.round((s.value / s.goal) * 100)}% of daily goal</p>
          </div>
        ))}
      </div>

      <div className="dash-row3">
        <div className="dash-card">
          <CardHead title="Nutrition Overview" />
          <div className="dash-nutri">
            <Donut macros={macros} total={1980} />
            <ul className="dash-legend">
              {macros.map((m) => (
                <li key={m.name}><i style={{ background: m.color }} /><span>{m.name}<small>{m.pct}% ({m.val})</small></span></li>
              ))}
            </ul>
          </div>
          <div className="dash-macros">
            {macroGoals.map((m) => (
              <div key={m.name} className="dash-macro">
                <p>{m.name}</p>
                <p>{m.v}{m.unit} / {m.g}{m.unit}</p>
                <Bar pct={(m.v / m.g) * 100} color={m.color} />
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <CardHead title="Workout Summary" action="View All" to="workout" />
          <div className="dash-wk-top">
            <b>{workout.name}</b><span className="dash-badge">{workout.status}</span><span className="dash-wk-time">{workout.duration}</span>
          </div>
          <div className="dash-wk-stats">
            {[[workout.exercises, "Exercises"], [workout.sets, "Total Sets"], [workout.volume, "Total Volume"]].map(([v, l]) => (
              <div key={l}><b>{v}</b><span>{l}</span></div>
            ))}
          </div>
          <p className="dash-sub-title">Top Exercises</p>
          <ul className="dash-ex">
            {workout.top.map(([n, d], i) => (
              <li key={n}><em>{i + 1}</em><span>{n}</span><small>{d}</small></li>
            ))}
          </ul>
        </div>

        <div className="dash-card">
          <CardHead title="Today's Plan" action="View All" to="calendar" />
          <ul className="dash-plan">
            {plan.map((p) => (
              <li key={p.title}>
                <div>{p.title}<small>{p.time}</small></div>
                {p.done ? <Check size={18} className="dash-done" /> : <Circle size={18} className="dash-todo" />}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dash-row2">
        <div className="dash-card">
          <CardHead title="Weight Progress" action="View All" to="body-stats" />
          <p className="dash-big">{weight.current} <small>kg</small><em>↓ {Math.abs(weight.change)} kg vs last week</em></p>
          <LineChart points={weight.points} />
          <div className="dash-three">
            {[["Start", weight.start], ["Current", weight.current], ["Goal", weight.goal]].map(([l, v]) => (
              <div key={l}><small>{l}</small>{v} kg</div>
            ))}
          </div>
        </div>
        <div className="dash-card">
          <CardHead title="Activity Overview" action="View All" to="progress" />
          <BarChart data={activity} />
        </div>
      </div>

      <div className="dash-row3">
        <CalendarCard cal={calendar} />
        <StreakCard streak={streak} />
        <div className="dash-card dash-banner"><p>Discipline today,<br />a stronger you tomorrow.</p></div>
      </div>

      <div className="dash-card">
        <CardHead title="Recent Meals" action="View All" to="nutrition" />
        <div className="dash-meals">
          {meals.map((m) => (
            <div key={m.name} className="dash-meal">
              <b>{m.name}</b><small>{m.time}</small>
              <div className="dash-meal-foot"><span>{m.kcal} kcal</span><span>{m.protein}g protein</span></div>
            </div>
          ))}
          <button className="dash-add" onClick={() => navigate("nutrition")}><Plus size={16} /> Add Meal</button>
        </div>
      </div>
    </div>
  );
}
