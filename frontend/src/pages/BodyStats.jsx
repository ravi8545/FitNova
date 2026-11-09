import { useState } from 'react';
import HomePageLink from '../components/HomePageLink';
import { useAppNav } from '../context/NavContext';
import {
	PersonStanding,
	ChevronLeft,
	ChevronRight,
	Calendar,
	ArrowUp,
	ArrowDown,
	Scale,
	Percent,
	Dumbbell,
	User,
	Shirt,
	Ruler,
	Activity,
	Footprints,
	TrendingUp,
	Trophy,
	Camera,
	Lightbulb,
	FileText,
	Plus,
	ClipboardList,
	Target,
} from 'lucide-react';
import "../styles/BodyStats.css";
import { bodyStatsData } from '../services/photosData.js';

// TODO: replace with api.get("/body-stats/") once the backend endpoint exists
const RANGES = ['7D', '30D', '90D'];
const STAT_ICON = { weight: Scale, fat: Percent, muscle: Dumbbell, bmi: User };
const MEAS_ICON = { shirt: Shirt, ruler: Ruler, activity: Activity, dumbbell: Dumbbell, footprints: Footprints };
const INSIGHT_ICON = { green: ArrowUp, purple: Percent, blue: Dumbbell };
const ACTION_ICON = { weight: Scale, measure: Plus, report: ClipboardList, goal: Target };
const GREEN = '#2BAF34';

const CardHead = ({ icon: Icon, title, link, to }) => {
	const navigate = useAppNav();
	return (
	<div className="bs-card-head">
		<h3 className="bs-card-title">
			{Icon && <Icon size={18} />}
			{title}
		</h3>
		{link && <button className="bs-card-link" onClick={() => to && navigate(to)}>{link}</button>}
	</div>
	);
};

// Arrow + value. `goodWhenDown` decides the colour (losing weight/fat/BMI is good, gaining muscle is good).
function Delta({ value, unit, goodWhenDown = true }) {
	const down = value < 0;
	const good = goodWhenDown ? down : !down;
	const Arrow = down ? ArrowDown : ArrowUp;
	return (
		<span className={`bs-delta${good ? '' : ' is-bad'}`}>
			<Arrow size={13} />
			{Math.abs(value)}
			{unit ? ` ${unit}` : ''}
		</span>
	);
}

function Photo({ p }) {
	return p.src ? (
		<img src={p.src} alt={`Progress photo, ${p.label}`} className="bs-photo" />
	) : (
		<div className="bs-photo">🧍</div>
	);
}

function WeightChart({ labels, values }) {
	const W = 620,
		H = 210,
		L = 34,
		R = 20,
		T = 12,
		B = 30;
	const min = 80,
		max = 88,
		n = values.length;
	const [hover, setHover] = useState(null);
	const idx = hover ?? n - 1;
	const x = (i) => L + (i / (n - 1)) * (W - L - R);
	const y = (v) => T + (1 - (v - min) / (max - min)) * (H - T - B);
	const pts = values.map((v, i) => [x(i), y(v)]);
	const line = pts.map((p) => p.join(',')).join(' ');
	const move = (e) => {
		const r = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		setHover(Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1)))));
	};
	const label = labels.filter(Boolean)[0] && (labels[idx] || labels.slice(0, idx).reverse().find(Boolean) || '');
	const dateText = labels[idx] || label;
	return (
		<div className="bs-chart" onMouseMove={move} onMouseLeave={() => setHover(null)}>
			<svg viewBox={`0 0 ${W} ${H}`} className="bs-chart-svg" role="img" aria-label="Weight trend chart">
				<defs>
					<linearGradient id="bs-wg" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={GREEN} stopOpacity=".3" />
						<stop offset="1" stopColor={GREEN} stopOpacity="0" />
					</linearGradient>
				</defs>
				{[80, 82, 84, 86, 88].map((v) => (
					<g key={v}>
						<line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#1E2D42" />
						<text x={L - 8} y={y(v) + 4} fontSize="11" fill="#94A3B8" textAnchor="end">
							{v}
						</text>
					</g>
				))}
				{labels.map(
					(d, i) =>
						d && (
							<g key={i}>
								<line x1={x(i)} x2={x(i)} y1={T} y2={H - B} stroke="#1E2D42" />
								<text x={x(i)} y={H - 8} fontSize="11" fill="#94A3B8" textAnchor="middle">
									{d}
								</text>
							</g>
						),
				)}
				<polygon points={`${pts[0][0]},${H - B} ${line} ${pts.at(-1)[0]},${H - B}`} fill="url(#bs-wg)" />
				<polyline points={line} fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinejoin="round" />
				{pts.map(([px, py], i) => (
					<circle key={i} cx={px} cy={py} r="3" fill={GREEN} />
				))}
				<circle cx={pts[idx][0]} cy={pts[idx][1]} r="6" fill="#fff" stroke={GREEN} strokeWidth="3" />
			</svg>
			<div className="bs-tip" style={{ left: `${(pts[idx][0] / W) * 100}%`, top: `${(pts[idx][1] / H) * 100}%` }}>
				<b>{values[idx]} kg</b>
				<span>{dateText}</span>
			</div>
		</div>
	);
}

function Body() {
	return (
		<svg viewBox="0 0 100 250" className="bs-body" aria-hidden="true">
			<g fill="rgba(59, 130, 246,.1)" stroke="#3B82F6" strokeWidth="1.6" strokeLinejoin="round">
				<circle cx="50" cy="16" r="12" />
				<path d="M44 28h12v7c14 3 26 8 28 22l5 55-8 2-5-38-3 40 4 92h-14l-6-82-6 82H37l4-92-3-40-5 38-8-2 5-55c2-14 14-19 28-22z" />
			</g>
		</svg>
	);
}

export default function BodyStatsPage() {
	const d = bodyStatsData;
	const [range, setRange] = useState('30D');
	const trend = d.trend[range];
	const R = 52,
		C = 2 * Math.PI * R;
	let acc = 0;
	const CR = 15.9155,
		CC = 2 * Math.PI * CR; // donut radius for circumference 100
	const arcs = d.composition.parts.map((p) => {
		const a = { ...p, off: acc };
		acc += p.pct;
		return a;
	});

	return (
		<div className="bs-page">
			<div className="bs-header">
				<div className="bs-head-left">
					<PersonStanding size={44} />
					<div>
						<h1 className="bs-title">Body Stats &amp; Progress</h1>
						<p className="bs-sub">Track your body measurements, check your progress and see real results.</p>
					</div>
				</div>
				<div className="bs-date">
					<Calendar size={16} />
					<span>{d.range}</span>
					<button aria-label="Previous period">
						<ChevronLeft size={16} />
					</button>
					<button aria-label="Next period">
						<ChevronRight size={16} />
					</button>
				</div>
			</div>

			<div className="bs-stats">
				{d.stats.map((s) => {
					const Icon = STAT_ICON[s.key];
					const pct = Math.max(0, Math.min(100, ((s.value - s.start) / (s.goal - s.start)) * 100));
					const goodWhenDown = s.key !== 'muscle';
					return (
						<div key={s.key} className="bs-card bs-stat" style={{ '--c': s.color }}>
							<div className="bs-stat-top">
								<span className="bs-stat-icon">
									<Icon size={24} />
								</span>
								<div className="bs-stat-main">
									<span className="bs-stat-label">{s.label}</span>
									<b>
										{s.value}
										{s.unit && <small> {s.unit}</small>}
									</b>
								</div>
								<div className="bs-stat-delta">
									<Delta value={s.delta} unit={s.deltaUnit} goodWhenDown={goodWhenDown} />
									<small>vs last week</small>
								</div>
							</div>
							<div className="bs-bar">
								<div style={{ width: `${pct}%` }} />
							</div>
							<div className="bs-stat-foot">
								<span>Start: {s.startLabel}</span>
								<span>Goal: {s.goalLabel}</span>
							</div>
						</div>
					);
				})}
			</div>

			<div className="bs-layout">
				<div className="bs-main">
					<div className="bs-row bs-row-a">
						<div className="bs-card">
							<div className="bs-card-head">
								<h3 className="bs-card-title">
									<TrendingUp size={18} />
									Weight Trend
								</h3>
								<div className="bs-seg">
									{RANGES.map((r) => (
										<button key={r} className={range === r ? 'is-active' : ''} onClick={() => setRange(r)}>
											{r}
										</button>
									))}
								</div>
							</div>
							<WeightChart key={range} labels={trend.labels} values={trend.values} />
						</div>

						<div className="bs-card">
							<CardHead icon={Ruler} title="Body Measurements" link="View All" to="progress" />
							<div className="bs-meas">
								<Body />
								<ul>
									{d.measurements.map((m) => {
										const Icon = MEAS_ICON[m.icon];
										return (
											<li key={m.name}>
												<span className="bs-meas-icon">
													<Icon size={16} />
												</span>
												<div>
													<small>{m.name}</small>
													<b>
														{m.value} {m.unit}
													</b>
												</div>
												<Delta value={m.delta} unit={m.unit} goodWhenDown={m.name !== 'Arms'} />
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					</div>

					<div className="bs-row bs-row-b">
						<div className="bs-card">
							<CardHead icon={Activity} title="Body Composition" link="View All" to="reports" />
							<div className="bs-comp">
								<div className="bs-donut">
									<svg width="140" height="140" viewBox="0 0 42 42" aria-hidden="true">
										<circle cx="21" cy="21" r={CR} fill="none" stroke="#1E2D42" strokeWidth="6" />
										{arcs.map((a) => (
											<circle
												key={a.name}
												cx="21"
												cy="21"
												r={CR}
												fill="none"
												stroke={a.color}
												strokeWidth="6"
												strokeDasharray={`${a.pct} ${100 - a.pct}`}
												strokeDashoffset={-a.off}
												transform="rotate(-90 21 21)"
											/>
										))}
									</svg>
									<div className="bs-donut-center">
										<b>
											{d.composition.total} <small>kg</small>
										</b>
										<span>Total Weight</span>
									</div>
								</div>
								<ul className="bs-legend">
									{d.composition.parts.map((p) => (
										<li key={p.name}>
											<i style={{ background: p.color }} />
											<div>
												{p.name}
												<small>
													{p.kg} kg ({p.pct}%)
												</small>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>

						<div className="bs-card">
							<CardHead icon={Camera} title="Progress Photos" />
							<div className="bs-thumbs">
								{d.photos.map((p) => (
									<HomePageLink to="/photos" key={p.id} className="bs-thumb">
										<Photo p={p} />
										<span>{p.label}</span>
										<small>{p.weight} kg</small>
									</HomePageLink>
								))}
							</div>
						</div>
					</div>

					<div className="bs-row bs-row-c">
						<div className="bs-card">
							<CardHead icon={FileText} title="Recent Measurements" />
							<div className="bs-table-wrap">
								<table className="bs-table">
									<thead>
										<tr>
											<th>Date</th>
											<th>Weight</th>
											<th>Body Fat</th>
											<th>Muscle Mass</th>
											<th>BMI</th>
										</tr>
									</thead>
									<tbody>
										{d.recent.map((r) => (
											<tr key={r.date}>
												<td>{r.date}</td>
												<td>{r.weight} kg</td>
												<td>{r.fat}%</td>
												<td>{r.muscle} kg</td>
												<td>
													{r.bmi}
													{r.latest && <span className="bs-latest">Latest</span>}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						<div className="bs-card">
							<CardHead icon={Lightbulb} title="Insights" />
							<ul className="bs-insights">
								{d.insights.map((n) => {
									const Icon = INSIGHT_ICON[n.tone];
									return (
										<li key={n.title} className={`tone-${n.tone}`}>
											<span className="bs-ins-icon">
												<Icon size={16} />
											</span>
											<div>
												<b>{n.title}</b>
												<p>{n.text}</p>
											</div>
										</li>
									);
								})}
							</ul>
						</div>
					</div>
				</div>

				<div className="bs-aside">
					<div className="bs-card">
						<CardHead icon={Trophy} title="Progress Summary" link="View All" to="progress" />
						<div className="bs-ring">
							<svg width="150" height="150" viewBox="0 0 120 120" aria-hidden="true">
								<circle cx="60" cy="60" r={R} fill="none" stroke="#121B26" strokeWidth="10" />
								<circle
									cx="60"
									cy="60"
									r={R}
									fill="none"
									stroke={GREEN}
									strokeWidth="10"
									strokeLinecap="round"
									strokeDasharray={`${(d.summary.pct / 100) * C} ${C}`}
									transform="rotate(-90 60 60)"
								/>
							</svg>
							<div className="bs-ring-center">
								<b>{d.summary.pct}%</b>
								<span>Overall Progress</span>
							</div>
						</div>
						<p className="bs-ring-title">Great work, {d.user}!</p>
						<p className="bs-ring-note">You're {d.summary.pct}% closer to your goal.</p>
						<ul className="bs-goals">
							{d.summary.goals.map((g) => {
								const Icon = STAT_ICON[g.icon];
								return (
									<li key={g.name} style={{ '--c': g.color }}>
										<span className="bs-goal-icon">
											<Icon size={18} />
										</span>
										<div className="bs-goal-body">
											<div className="bs-goal-top">
												<b>{g.name}</b>
												<span className="bs-tag">On Track</span>
											</div>
											<small>{g.text}</small>
											<div className="bs-bar">
												<div style={{ width: `${g.pct}%` }} />
											</div>
										</div>
									</li>
								);
							})}
						</ul>
					</div>

					<div className="bs-card">
						<CardHead icon={Target} title="Quick Actions" />
						<div className="bs-quick">
							{d.quickActions.map((a) => {
								const Icon = ACTION_ICON[a.key];
								return (
									<button key={a.key} className="bs-quick-tile" style={{ '--c': a.color }}>
										<span className="bs-quick-icon">
											<Icon size={16} />
										</span>
										{a.label}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
