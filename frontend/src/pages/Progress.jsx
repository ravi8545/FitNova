import { useState } from 'react';
import HomePageLink from '../components/HomePageLink';
import { useAppNav } from '../context/NavContext';
import {
	PersonStanding,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Check,
	Dumbbell,
	Flame,
	TrendingUp,
	Trophy,
	Flag,
	Image as ImageIcon,
	Lightbulb,
	Target,
	Share2,
	GitCompare,
	Award,
	ArrowUp,
	Percent,
	ListChecks,
} from 'lucide-react';

import '../styles/Progress.css';
import { progressData } from '../services/photosData';

// TODO: replace with api.get("/progress/") once the backend endpoint exists
const RANGES = [
	['7d', '7d'],
	['30d', '30d'],
	['90d', '90d'],
	['all', 'All Time'],
];
const RANGE_LABEL = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', all: 'All Time' };
const STAT_ICON = { weight: Check, muscle: Check, pr: Dumbbell, streak: Flame };
const STAT_COLOR = { weight: '#2BAF34', muscle: '#2BAF34', pr: '#F59E0B', streak: '#F97316' };
const INSIGHT_ICON = { green: ArrowUp, purple: Percent, blue: Dumbbell };
const ACTION_ICON = { share: Share2, compare: GitCompare, milestones: ListChecks, badges: Award };
const GREEN = '#2BAF34',
	BLUE = '#3B82F6';

const CardHead = ({ icon: Icon, title, link, to }) => {
	const navigate = useAppNav();
	return (
	<div className="prog-card-head">
		<h3 className="prog-card-title">
			{Icon && <Icon size={18} />}
			{title}
		</h3>
		{link && <button className="prog-card-link" onClick={() => to && navigate(to)}>{link}</button>}
	</div>
	);
};

function Photo({ p, className = '' }) {
	return p.src ? (
		<img src={p.src} alt={`Progress photo, ${p.label}`} className={`prog-photo ${className}`} />
	) : (
		<div className={`prog-photo ${className}`}>🧍</div>
	);
}

/* Dual-axis chart: left axis = series a (green), right axis = series b (blue, filled). Hover shows a tooltip. */
function TrendChart({ data, meta, rangeLabel }) {
	const W = 760,
		H = 270,
		L = 38,
		R = 38,
		T = 14,
		B = 30;
	const n = data.a.length;
	const [hover, setHover] = useState(null);
	const idx = hover ?? Math.round((n - 1) * 0.62);
	const x = (i) => L + (i / (n - 1)) * (W - L - R);
	const yOf = (v, ax) => T + (1 - (v - ax.min) / (ax.max - ax.min)) * (H - T - B);
	const ptsA = data.a.map((v, i) => [x(i), yOf(v, meta.a)]);
	const ptsB = data.b.map((v, i) => [x(i), yOf(v, meta.b)]);
	const path = (pts) => pts.map((p) => p.join(',')).join(' ');
	const ticks = (ax) => {
		const out = [];
		for (let v = ax.min; v <= ax.max + 1e-9; v += ax.step) out.push(+v.toFixed(2));
		return out;
	};
	const tickA = ticks(meta.a),
		tickB = ticks(meta.b);
	const move = (e) => {
		const r = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		setHover(Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1)))));
	};
	const tipLeft = `${(x(idx) / W) * 100}%`;
	const flip = idx > n * 0.7;
	const fmt = (v, ax) => `${ax.unit === 'sets' ? Math.round(v) : v} ${ax.unit}`;

	return (
		<div className="prog-chart" onMouseMove={move} onMouseLeave={() => setHover(null)}>
			<svg viewBox={`0 0 ${W} ${H}`} className="prog-chart-svg" role="img" aria-label="Performance trends chart">
				<defs>
					<linearGradient id="prog-ga" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={GREEN} stopOpacity=".22" />
						<stop offset="1" stopColor={GREEN} stopOpacity="0" />
					</linearGradient>
					<linearGradient id="prog-gb" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={BLUE} stopOpacity=".28" />
						<stop offset="1" stopColor={BLUE} stopOpacity="0" />
					</linearGradient>
				</defs>
				{tickA.map((v) => (
					<g key={v}>
						<line x1={L} x2={W - R} y1={yOf(v, meta.a)} y2={yOf(v, meta.a)} stroke="#1E2D42" />
						<text x={L - 8} y={yOf(v, meta.a) + 4} fontSize="11" fill="#94A3B8" textAnchor="end">
							{v}
						</text>
					</g>
				))}
				{tickB.map((v) => (
					<text key={v} x={W - R + 8} y={yOf(v, meta.b) + 4} fontSize="11" fill="#94A3B8">
						{v}
					</text>
				))}
				<polygon points={`${ptsB[0][0]},${H - B} ${path(ptsB)} ${ptsB.at(-1)[0]},${H - B}`} fill="url(#prog-gb)" />
				<polygon points={`${ptsA[0][0]},${H - B} ${path(ptsA)} ${ptsA.at(-1)[0]},${H - B}`} fill="url(#prog-ga)" />
				<polyline points={path(ptsB)} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
				<polyline points={path(ptsA)} fill="none" stroke={GREEN} strokeWidth="2" strokeLinejoin="round" />
				{ptsB.map(([px, py], i) => (
					<circle key={`b${i}`} cx={px} cy={py} r="3" fill={BLUE} />
				))}
				{ptsA.map(([px, py], i) => (
					<circle key={`a${i}`} cx={px} cy={py} r="3" fill={GREEN} />
				))}
				<line x1={x(idx)} x2={x(idx)} y1={T} y2={H - B} stroke={GREEN} strokeOpacity=".45" strokeDasharray="3 3" />
				<circle cx={x(idx)} cy={ptsA[idx][1]} r="6" fill="#fff" stroke={GREEN} strokeWidth="3" />
				{data.labels.map((d, i) => (
					<text key={i} x={x(i)} y={H - 8} fontSize="11" fill="#94A3B8" textAnchor="middle">
						{d}
					</text>
				))}
			</svg>
			<div className={`prog-tip${flip ? ' is-flip' : ''}`} style={{ left: tipLeft }}>
				<b>{rangeLabel}</b>
				<span>
					<i style={{ background: GREEN }} />
					{meta.a.name}: <em style={{ color: GREEN }}>{fmt(data.a[idx], meta.a)}</em>
				</span>
				<span>
					<i style={{ background: BLUE }} />
					{meta.b.name}: <em style={{ color: BLUE }}>{fmt(data.b[idx], meta.b)}</em>
				</span>
			</div>
		</div>
	);
}

export default function ProgressPage() {
	const d = progressData;
	const [mode, setMode] = useState('strength');
	const [range, setRange] = useState('90d');
	const trend = d.trends[mode];
	const first = d.photos[0],
		last = d.photos.at(-1);
	const R = 52,
		C = 2 * Math.PI * R;

	return (
		<div className="prog-page">
			<div className="prog-header">
				<div className="prog-head-left">
					<PersonStanding size={44} />
					<div>
						<h1 className="prog-title">Your Fitness Journey: Progress &amp; Trends</h1>
						<p className="prog-sub">Track your body measurements, check your progress and see real results.</p>
					</div>
				</div>
				<div className="prog-date">
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

			<div className="prog-stats">
				{d.stats.map((s) => {
					const Icon = STAT_ICON[s.key];
					const c = STAT_COLOR[s.key];
					const badge = s.done;
					return (
						<div key={s.key} className="prog-card prog-stat" style={{ '--c': c }}>
							<div className="prog-stat-head">
								{!badge && <Icon size={22} className="prog-stat-icon" />}
								<span>{s.label}</span>
								{badge && (
									<span className="prog-tick">
										<Check size={14} />
									</span>
								)}
							</div>
							<div className="prog-stat-value">{s.value}</div>
							<div className="prog-stat-sub">{s.sub}</div>
						</div>
					);
				})}
			</div>

			<div className="prog-layout">
				<div className="prog-main">
					<div className="prog-card">
						<div className="prog-trend-head">
							<h3 className="prog-card-title">
								<TrendingUp size={18} />
								Performance Trends
							</h3>
							<div className="prog-modes">
								<button
									className={`prog-pill${mode === 'strength' ? ' is-active' : ''}`}
									onClick={() => setMode('strength')}
								>
									Weight &amp; Strength
								</button>
								<button
									className="prog-switch"
									role="switch"
									aria-checked={mode === 'cardio'}
									aria-label="Toggle cardio and pace"
									onClick={() => setMode((m) => (m === 'strength' ? 'cardio' : 'strength'))}
								>
									<span />
								</button>
								<button
									className={`prog-mode-text${mode === 'cardio' ? ' is-active' : ''}`}
									onClick={() => setMode('cardio')}
								>
									Cardio &amp; Pace
								</button>
							</div>
							<div className="prog-ranges">
								<span className="prog-range-label">{RANGE_LABEL[range]}</span>
								{RANGES.map(([k, l]) => (
									<button
										key={k}
										className={`prog-range${range === k ? ' is-active' : ''}`}
										onClick={() => setRange(k)}
									>
										{l}
									</button>
								))}
							</div>
						</div>
						<TrendChart
							key={`${mode}-${range}`}
							data={trend[range]}
							meta={trend.meta}
							rangeLabel={RANGE_LABEL[range]}
						/>
					</div>

					<div className="prog-row2">
						<div className="prog-card">
							<CardHead icon={Flag} title="Milestones Timeline" link="View All" to="goals" />
							<ul className="prog-timeline">
								{d.milestones.map((m) => (
									<li key={m.title} className={m.done ? 'is-done' : ''}>
										<span className="prog-node" />
										<div className="prog-ms">
											<small>{m.date}</small>
											{m.title}
										</div>
									</li>
								))}
							</ul>
						</div>

						<div className="prog-card">
							<CardHead icon={ImageIcon} title="Visual Progression" link="View All" to="photos" />
							<div className="prog-ba">
								<Photo p={first} className="prog-ba-img" />
								<Photo p={last} className="prog-ba-img" />
								<span className="prog-ba-label">Before / After Comparison</span>
							</div>
							<div className="prog-ptl-head">
								<h4>Photos Timeline</h4>
								<HomePageLink to="/photos" className="prog-outline-btn">
									Compare Photos
								</HomePageLink>
							</div>
							<div className="prog-thumbs">
								{d.photos.map((p) => (
									<div key={p.id}>
										<Photo p={p} className="prog-thumb" />
										<span>{p.label}</span>
										<span>{p.weight} kg</span>
									</div>
								))}
							</div>
							<HomePageLink to="/photos" className="prog-wide-btn">
								Compare Photos
							</HomePageLink>
						</div>
					</div>
				</div>

				<div className="prog-aside">
					<div className="prog-card">
						<CardHead icon={Trophy} title="Projected Journey Timeline" link="View All" to="goals" />
						<div className="prog-ring">
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
									strokeDasharray={`${(d.projected.pct / 100) * C} ${C}`}
									transform="rotate(-90 60 60)"
								/>
							</svg>
							<div className="prog-ring-center">
								<b>{d.projected.pct}%</b>
								<span>Overall Progress</span>
							</div>
						</div>
						<p className="prog-ring-title">{d.projected.pct}% of the overall journey</p>
						<p className="prog-ring-note">{d.projected.note}</p>
					</div>

					<div className="prog-card">
						<CardHead icon={Lightbulb} title="Insights" />
						<ul className="prog-insights">
							{d.insights.map((n) => {
								const Icon = INSIGHT_ICON[n.tone];
								return (
									<li key={n.title} className={`tone-${n.tone}`}>
										<span className="prog-ins-icon">
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

					<div className="prog-card">
						<CardHead icon={Target} title="Quick Actions" />
						<div className="prog-quick">
							{d.quickActions.map((a) => {
								const Icon = ACTION_ICON[a.key];
								return (
									<button key={a.key} className="prog-quick-tile" style={{ '--c': a.color }}>
										<span className="prog-quick-icon">
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
