import { useState, useEffect } from 'react';
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
	X,
	Trash2,
	RefreshCw,
	AlertCircle,
	CheckCircle2,
} from 'lucide-react';
import '../styles/BodyStats.css';
import {
	fetchStatsOverview,
	logMeasurement,
	deleteMeasurement,
	saveGoal,
} from '../services/statsApi';

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
			{link && (
				<button className="bs-card-link" onClick={() => to && navigate(to)}>
					{link}
				</button>
			)}
		</div>
	);
};

function Delta({ value, unit, goodWhenDown = true }) {
	if (value === undefined || value === null || isNaN(value)) return null;
	const num = Number(value);
	const down = num < 0;
	const good = goodWhenDown ? down : !down;
	const Arrow = down ? ArrowDown : ArrowUp;
	return (
		<span className={`bs-delta${good ? '' : ' is-bad'}`}>
			<Arrow size={13} />
			{Math.abs(num)}
			{unit ? ` ${unit}` : ''}
		</span>
	);
}

function Photo({ p }) {
	if (!p) return <div className="bs-photo">🧍</div>;
	const src = p.src || p.image_url;
	return src ? (
		<img src={src} alt={`Progress photo, ${p.label || 'Progress'}`} className="bs-photo" />
	) : (
		<div className="bs-photo">🧍</div>
	);
}

function WeightChart({ labels = [], values = [] }) {
	const W = 620,
		H = 210,
		L = 38,
		R = 20,
		T = 16,
		B = 30;

	const [hover, setHover] = useState(null);

	if (!values || values.length === 0) {
		return (
			<div className="bs-chart" style={{ display: 'grid', placeItems: 'center', height: H }}>
				<p style={{ color: 'var(--muted)', fontSize: 13 }}>No weight history logged for this range yet.</p>
			</div>
		);
	}

	const rawMin = Math.min(...values);
	const rawMax = Math.max(...values);
	const min = Math.max(0, Math.floor(rawMin - 2));
	const max = Math.ceil(rawMax + 2) || (min + 10);
	const rangeSpan = max - min || 1;
	const n = values.length;

	const idx = hover !== null && hover < n ? hover : n - 1;
	const x = (i) => (n <= 1 ? (W - L - R) / 2 + L : L + (i / (n - 1)) * (W - L - R));
	const y = (v) => T + (1 - (v - min) / rangeSpan) * (H - T - B);

	const pts = values.map((v, i) => [x(i), y(v)]);
	const line = pts.map((p) => p.join(',')).join(' ');

	const move = (e) => {
		if (n <= 1) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * W;
		const bounded = Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1))));
		setHover(bounded);
	};

	const dateText = labels[idx] || (labels.length > 0 ? labels[labels.length - 1] : 'Recent');

	const yTicks = [
		min,
		Math.round(min + rangeSpan * 0.33),
		Math.round(min + rangeSpan * 0.66),
		max,
	];

	return (
		<div className="bs-chart" onMouseMove={move} onMouseLeave={() => setHover(null)}>
			<svg viewBox={`0 0 ${W} ${H}`} className="bs-chart-svg" role="img" aria-label="Weight trend chart">
				<defs>
					<linearGradient id="bs-wg" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={GREEN} stopOpacity=".3" />
						<stop offset="1" stopColor={GREEN} stopOpacity="0" />
					</linearGradient>
				</defs>

				{yTicks.map((v, i) => (
					<g key={`ytick-${i}-${v}`}>
						<line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#1E2D42" strokeDasharray="3 3" />
						<text x={L - 8} y={y(v) + 4} fontSize="11" fill="#94A3B8" textAnchor="end">
							{v}
						</text>
					</g>
				))}

				{labels.map((d, i) =>
					d ? (
						<g key={`xtick-${i}`}>
							<line x1={x(i)} x2={x(i)} y1={T} y2={H - B} stroke="#1E2D42" strokeOpacity=".5" />
							<text x={x(i)} y={H - 8} fontSize="11" fill="#94A3B8" textAnchor="middle">
								{d}
							</text>
						</g>
					) : null
				)}

				{n > 1 && (
					<>
						<polygon points={`${pts[0][0]},${H - B} ${line} ${pts[pts.length - 1][0]},${H - B}`} fill="url(#bs-wg)" />
						<polyline points={line} fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinejoin="round" />
					</>
				)}

				{pts.map(([px, py], i) => (
					<circle key={`pt-${i}`} cx={px} cy={py} r="3" fill={GREEN} />
				))}

				{pts[idx] && (
					<circle cx={pts[idx][0]} cy={pts[idx][1]} r="6" fill="#fff" stroke={GREEN} strokeWidth="3" />
				)}
			</svg>

			{pts[idx] && (
				<div className="bs-tip" style={{ left: `${(pts[idx][0] / W) * 100}%`, top: `${(pts[idx][1] / H) * 100}%` }}>
					<b>{values[idx]} kg</b>
					<span>{dateText}</span>
				</div>
			)}
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
	const navigate = useAppNav();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [range, setRange] = useState('30D');
	const [toast, setToast] = useState(null);

	// Modals
	const [modalMode, setModalMode] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState('');

	const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
	const [measForm, setMeasForm] = useState({
		date: todayStr,
		weight: '',
		body_fat: '',
		muscle: '',
		chest: '',
		waist: '',
		arms: '',
		steps: '',
	});

	const [goalForm, setGoalForm] = useState({
		weightStart: '85.0',
		weightGoal: '75.0',
		fatStart: '24.0',
		fatGoal: '15.0',
	});

	const showToast = (message, type = 'success') => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3500);
	};

	const loadData = async (signal) => {
		try {
			setLoading(true);
			setError(null);
			const res = await fetchStatsOverview(signal);
			setData(res);
		} catch (err) {
			if (err.name !== 'AbortError') {
				setError(err.message || 'Failed to load Body Stats data.');
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const controller = new AbortController();
		loadData(controller.signal);
		return () => controller.abort();
	}, []);

	const handleQuickAction = (key) => {
		if (key === 'weight') {
			setMeasForm({
				date: todayStr,
				weight: data?.stats?.find((s) => s.key === 'weight')?.value || '',
				body_fat: '',
				muscle: '',
				chest: '',
				waist: '',
				arms: '',
				steps: '',
			});
			setFormError('');
			setModalMode('weight');
		} else if (key === 'measure') {
			setMeasForm({
				date: todayStr,
				weight: data?.stats?.find((s) => s.key === 'weight')?.value || '',
				body_fat: data?.stats?.find((s) => s.key === 'fat')?.value || '',
				muscle: data?.stats?.find((s) => s.key === 'muscle')?.value || '',
				chest: data?.measurements?.find((m) => m.name === 'Chest')?.value || '',
				waist: data?.measurements?.find((m) => m.name === 'Waist')?.value || '',
				arms: data?.measurements?.find((m) => m.name === 'Arms')?.value || '',
				steps: data?.measurements?.find((m) => m.name === 'Steps')?.value || '',
			});
			setFormError('');
			setModalMode('measurement');
		} else if (key === 'goal') {
			const wGoal = data?.stats?.find((s) => s.key === 'weight');
			const fGoal = data?.stats?.find((s) => s.key === 'fat');
			setGoalForm({
				weightStart: wGoal?.start || '85.0',
				weightGoal: wGoal?.goal || '75.0',
				fatStart: fGoal?.start || '24.0',
				fatGoal: fGoal?.goal || '15.0',
			});
			setFormError('');
			setModalMode('goal');
		} else if (key === 'report') {
			navigate('reports');
		}
	};

	const handleSaveMeasurement = async (e) => {
		e.preventDefault();
		if (!measForm.weight || Number(measForm.weight) <= 0) {
			setFormError('Please enter a valid weight in kg.');
			return;
		}

		setIsSubmitting(true);
		setFormError('');
		try {
			const payload = {
				date: measForm.date,
				weight: parseFloat(measForm.weight),
				...(measForm.body_fat ? { body_fat: parseFloat(measForm.body_fat) } : {}),
				...(measForm.muscle ? { muscle: parseFloat(measForm.muscle) } : {}),
				...(measForm.chest ? { chest: parseFloat(measForm.chest) } : {}),
				...(measForm.waist ? { waist: parseFloat(measForm.waist) } : {}),
				...(measForm.arms ? { arms: parseFloat(measForm.arms) } : {}),
				...(measForm.steps ? { steps: parseInt(measForm.steps, 10) } : {}),
			};

			await logMeasurement(payload);
			showToast('Body measurement successfully saved!');
			setModalMode(null);
			await loadData();
		} catch (err) {
			setFormError(err.message || 'Failed to save measurement. Check your inputs.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSaveGoals = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setFormError('');
		try {
			await saveGoal({
				key: 'weight',
				label: 'Current Weight',
				start: parseFloat(goalForm.weightStart),
				goal: parseFloat(goalForm.weightGoal),
				unit: 'kg',
				color: '#2BAF34',
			});
			await saveGoal({
				key: 'fat',
				label: 'Body Fat',
				start: parseFloat(goalForm.fatStart),
				goal: parseFloat(goalForm.fatGoal),
				unit: '%',
				color: '#2D7FF9',
			});
			showToast('Target goals updated successfully!');
			setModalMode(null);
			await loadData();
		} catch (err) {
			setFormError(err.message || 'Failed to save goals.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteMeasurement = async (id) => {
		if (!window.confirm('Are you sure you want to delete this measurement entry?')) return;
		try {
			await deleteMeasurement(id);
			showToast('Measurement entry removed.');
			await loadData();
		} catch (err) {
			showToast(err.message || 'Failed to delete entry.', 'error');
		}
	};

	if (loading && !data) {
		return (
			<div className="bs-page">
				<div className="bs-header">
					<div className="bs-head-left">
						<PersonStanding size={44} color="#2BAF34" />
						<div>
							<div className="bs-skeleton" style={{ width: 220, height: 28, marginBottom: 8 }} />
							<div className="bs-skeleton" style={{ width: 340, height: 16 }} />
						</div>
					</div>
				</div>
				<div className="bs-stats">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="bs-card bs-skeleton" style={{ height: 130 }} />
					))}
				</div>
				<div className="bs-layout" style={{ marginTop: 20 }}>
					<div className="bs-main">
						<div className="bs-card bs-skeleton" style={{ height: 280 }} />
					</div>
					<div className="bs-aside">
						<div className="bs-card bs-skeleton" style={{ height: 280 }} />
					</div>
				</div>
			</div>
		);
	}

	if (error && !data) {
		return (
			<div className="bs-page">
				<div className="bs-error-card">
					<div className="bs-error-text">
						<AlertCircle size={22} />
						<span>{error}</span>
					</div>
					<button className="bs-retry-btn" onClick={() => loadData()}>
						<RefreshCw size={14} style={{ display: 'inline', marginRight: 6 }} />
						Retry
					</button>
				</div>
			</div>
		);
	}

	const d = data || {
		user: 'Athlete',
		range: 'Recent',
		stats: [],
		trend: { '7D': { labels: [], values: [] }, '30D': { labels: [], values: [] }, '90D': { labels: [], values: [] } },
		measurements: [],
		composition: { total: 0, parts: [] },
		recent: [],
		insights: [],
		summary: { pct: 0, goals: [] },
		quickActions: [],
	};

	const trend = d.trend?.[range] || { labels: [], values: [] };
	const R = 52,
		C = 2 * Math.PI * R;
	const CR = 15.9155;

	let acc = 0;
	const arcs = (d.composition?.parts || []).map((p) => {
		const a = { ...p, off: acc };
		acc += p.pct;
		return a;
	});

	return (
		<div className="bs-page">
			{toast && (
				<div className={`bs-toast is-${toast.type}`}>
					{toast.type === 'success' ? <CheckCircle2 size={18} color="#2BAF34" /> : <AlertCircle size={18} color="#EF4444" />}
					<span>{toast.message}</span>
				</div>
			)}

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
					<button
						aria-label="Add measurement"
						title="Log Measurement"
						style={{ marginLeft: 14, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
						onClick={() => handleQuickAction('measure')}
					>
						<Plus size={16} />
						<span style={{ fontSize: 12, fontWeight: 600 }}>Log Entry</span>
					</button>
				</div>
			</div>

			<div className="bs-stats">
				{(d.stats || []).map((s) => {
					const Icon = STAT_ICON[s.key] || Scale;
					const denom = (s.goal - s.start) || 1;
					const pct = Math.max(0, Math.min(100, Math.abs(((s.value - s.start) / denom) * 100)));
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
									<small>vs previous</small>
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
							<CardHead icon={Ruler} title="Body Measurements" link="Log Details" to="progress" />
							<div className="bs-meas">
								<Body />
								<ul>
									{(d.measurements || []).map((m) => {
										const Icon = MEAS_ICON[m.icon] || Ruler;
										return (
											<li key={m.name}>
												<span className="bs-meas-icon">
													<Icon size={16} />
												</span>
												<div>
													<small>{m.name}</small>
													<b>
														{m.value && m.value > 0 ? `${m.value} ${m.unit}` : 'Unavailable'}
													</b>
												</div>
												{m.value && m.value > 0 ? (
													<Delta value={m.delta} unit={m.unit} goodWhenDown={m.name !== 'Arms'} />
												) : (
													<span style={{ fontSize: 11, color: 'var(--muted)' }}>No data</span>
												)}
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					</div>

					<div className="bs-row bs-row-b">
						<div className="bs-card">
							<CardHead icon={Activity} title="Body Composition" link="View Analytics" to="reports" />
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
												strokeDasharray={`${a.pct} ${Math.max(0, 100 - a.pct)}`}
												strokeDashoffset={-a.off}
												transform="rotate(-90 21 21)"
											/>
										))}
									</svg>
									<div className="bs-donut-center">
										<b>
											{d.composition?.total || 0} <small>kg</small>
										</b>
										<span>Total Weight</span>
									</div>
								</div>
								<ul className="bs-legend">
									{(d.composition?.parts || []).map((p) => (
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
								{d.composition?.method && (
									<div style={{ width: '100%', marginTop: 10, paddingTop: 8, borderTop: '1px solid #1E2D42', fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
										ℹ️ {d.composition.method}
									</div>
								)}
							</div>
						</div>

						<div className="bs-card">
							<CardHead icon={Camera} title="Progress Photos" link="View Timeline" to="progress" />
							<div className="bs-thumbs">
								{(d.photos && d.photos.length > 0) ? (
									d.photos.map((p, idx) => (
										<HomePageLink to="/progress" key={p.id || idx} className="bs-thumb">
											<Photo p={p} />
											<span>{p.label}</span>
											<small>{p.weight} kg</small>
										</HomePageLink>
									))
								) : (
									<div style={{ gridColumn: 'span 3', padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
										No photos added yet. Upload in Progress page!
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="bs-row bs-row-c">
						<div className="bs-card">
							<div className="bs-card-head">
								<h3 className="bs-card-title">
									<FileText size={18} />
									Recent Measurements
								</h3>
								<button
									className="bs-card-link"
									style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
									onClick={() => handleQuickAction('measure')}
								>
									<Plus size={14} /> Add
								</button>
							</div>
							<div className="bs-table-wrap">
								<table className="bs-table">
									<thead>
										<tr>
											<th>Date</th>
											<th>Weight</th>
											<th>Body Fat</th>
											<th>Muscle Mass</th>
											<th>BMI</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{(d.recent && d.recent.length > 0) ? (
											d.recent.map((r) => (
												<tr key={r.id || r.date}>
													<td>{r.date}</td>
													<td>{r.weight} kg</td>
													<td>{r.fat !== null ? `${r.fat}%` : '—'}</td>
													<td>{r.muscle !== null ? `${r.muscle} kg` : '—'}</td>
													<td>
														{r.bmi || '—'}
														{r.latest && <span className="bs-latest">Latest</span>}
													</td>
													<td>
														{r.id && (
															<button
																className="bs-table-del"
																title="Delete entry"
																onClick={() => handleDeleteMeasurement(r.id)}
															>
																<Trash2 size={14} />
															</button>
														)}
													</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>
													No measurements logged yet. Use 'Log Entry' above to add your first!
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>

						<div className="bs-card">
							<CardHead icon={Lightbulb} title="Data-Driven Insights" />
							<ul className="bs-insights">
								{(d.insights || []).map((n) => {
									const Icon = INSIGHT_ICON[n.tone] || ArrowUp;
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
						<CardHead icon={Trophy} title="Progress Summary" link="Full Journey" to="progress" />
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
									strokeDasharray={`${((d.summary?.pct || 0) / 100) * C} ${C}`}
									transform="rotate(-90 60 60)"
								/>
							</svg>
							<div className="bs-ring-center">
								<b>{d.summary?.pct || 0}%</b>
								<span>Overall Goal</span>
							</div>
						</div>
						<p className="bs-ring-title">Great work, {d.user}!</p>
						<p className="bs-ring-note">You are {d.summary?.pct || 0}% closer to your health target.</p>
						<ul className="bs-goals">
							{(d.summary?.goals || []).map((g) => {
								const Icon = STAT_ICON[g.icon] || Target;
								return (
									<li key={g.name} style={{ '--c': g.color }}>
										<span className="bs-goal-icon">
											<Icon size={18} />
										</span>
										<div className="bs-goal-body">
											<div className="bs-goal-top">
												<b>{g.name}</b>
												<span className="bs-tag">Tracked</span>
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
							{(d.quickActions || []).map((a) => {
								const Icon = ACTION_ICON[a.key] || Plus;
								return (
									<button
										key={a.key}
										className="bs-quick-tile"
										style={{ '--c': a.color }}
										onClick={() => handleQuickAction(a.key)}
									>
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

			{modalMode === 'measurement' && (
				<div className="bs-modal-overlay" onClick={() => setModalMode(null)}>
					<div className="bs-modal" onClick={(e) => e.stopPropagation()}>
						<div className="bs-modal-head">
							<h3>
								<Ruler size={20} color="var(--green)" /> Log Full Body Measurements
							</h3>
							<button className="bs-modal-close" onClick={() => setModalMode(null)}>
								<X size={18} />
							</button>
						</div>
						<form onSubmit={handleSaveMeasurement}>
							<div className="bs-modal-body">
								{formError && (
									<div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 8, color: '#F87171', fontSize: 13, marginBottom: 14 }}>
										{formError}
									</div>
								)}
								<div className="bs-form-grid">
									<div className="bs-form-group">
										<label>Date *</label>
										<input
											type="date"
											max={todayStr}
											required
											value={measForm.date}
											onChange={(e) => setMeasForm({ ...measForm, date: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Weight (kg) *</label>
										<input
											type="number"
											step="0.1"
											min="20"
											max="500"
											placeholder="e.g. 82.5"
											required
											value={measForm.weight}
											onChange={(e) => setMeasForm({ ...measForm, weight: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Body Fat (%)</label>
										<input
											type="number"
											step="0.1"
											min="1"
											max="75"
											placeholder="e.g. 21.0"
											value={measForm.body_fat}
											onChange={(e) => setMeasForm({ ...measForm, body_fat: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Muscle Mass (kg)</label>
										<input
											type="number"
											step="0.1"
											min="5"
											placeholder="e.g. 61.2"
											value={measForm.muscle}
											onChange={(e) => setMeasForm({ ...measForm, muscle: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Chest (cm)</label>
										<input
											type="number"
											step="0.5"
											placeholder="e.g. 96"
											value={measForm.chest}
											onChange={(e) => setMeasForm({ ...measForm, chest: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Waist (cm)</label>
										<input
											type="number"
											step="0.5"
											placeholder="e.g. 80"
											value={measForm.waist}
											onChange={(e) => setMeasForm({ ...measForm, waist: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Arms (cm)</label>
										<input
											type="number"
											step="0.5"
											placeholder="e.g. 33"
											value={measForm.arms}
											onChange={(e) => setMeasForm({ ...measForm, arms: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Daily Steps</label>
										<input
											type="number"
											placeholder="e.g. 8500"
											value={measForm.steps}
											onChange={(e) => setMeasForm({ ...measForm, steps: e.target.value })}
										/>
									</div>
								</div>
							</div>
							<div className="bs-modal-foot">
								<button type="button" className="bs-btn-secondary" onClick={() => setModalMode(null)}>
									Cancel
								</button>
								<button type="submit" className="bs-btn-primary" disabled={isSubmitting}>
									{isSubmitting ? 'Saving...' : 'Save Measurements'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{modalMode === 'weight' && (
				<div className="bs-modal-overlay" onClick={() => setModalMode(null)}>
					<div className="bs-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
						<div className="bs-modal-head">
							<h3>
								<Scale size={20} color="var(--green)" /> Update Today's Weight
							</h3>
							<button className="bs-modal-close" onClick={() => setModalMode(null)}>
								<X size={18} />
							</button>
						</div>
						<form onSubmit={handleSaveMeasurement}>
							<div className="bs-modal-body">
								{formError && (
									<div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 8, color: '#F87171', fontSize: 13, marginBottom: 14 }}>
										{formError}
									</div>
								)}
								<div className="bs-form-group" style={{ marginBottom: 14 }}>
									<label>Date</label>
									<input
										type="date"
										max={todayStr}
										required
										value={measForm.date}
										onChange={(e) => setMeasForm({ ...measForm, date: e.target.value })}
									/>
								</div>
								<div className="bs-form-group">
									<label>Current Weight (kg) *</label>
									<input
										type="number"
										step="0.1"
										min="20"
										max="500"
										placeholder="e.g. 82.4"
										required
										autoFocus
										value={measForm.weight}
										onChange={(e) => setMeasForm({ ...measForm, weight: e.target.value })}
									/>
								</div>
							</div>
							<div className="bs-modal-foot">
								<button type="button" className="bs-btn-secondary" onClick={() => setModalMode(null)}>
									Cancel
								</button>
								<button type="submit" className="bs-btn-primary" disabled={isSubmitting}>
									{isSubmitting ? 'Updating...' : 'Update Weight'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{modalMode === 'goal' && (
				<div className="bs-modal-overlay" onClick={() => setModalMode(null)}>
					<div className="bs-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
						<div className="bs-modal-head">
							<h3>
								<Target size={20} color="var(--green)" /> Set Target Goals
							</h3>
							<button className="bs-modal-close" onClick={() => setModalMode(null)}>
								<X size={18} />
							</button>
						</div>
						<form onSubmit={handleSaveGoals}>
							<div className="bs-modal-body">
								{formError && (
									<div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 8, color: '#F87171', fontSize: 13, marginBottom: 14 }}>
										{formError}
									</div>
								)}
								<h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weight Goal (kg)</h4>
								<div className="bs-form-grid" style={{ marginBottom: 20 }}>
									<div className="bs-form-group">
										<label>Starting Weight (kg)</label>
										<input
											type="number"
											step="0.1"
											required
											value={goalForm.weightStart}
											onChange={(e) => setGoalForm({ ...goalForm, weightStart: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Target Weight (kg)</label>
										<input
											type="number"
											step="0.1"
											required
											value={goalForm.weightGoal}
											onChange={(e) => setGoalForm({ ...goalForm, weightGoal: e.target.value })}
										/>
									</div>
								</div>

								<h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Body Fat Goal (%)</h4>
								<div className="bs-form-grid">
									<div className="bs-form-group">
										<label>Starting Fat (%)</label>
										<input
											type="number"
											step="0.1"
											required
											value={goalForm.fatStart}
											onChange={(e) => setGoalForm({ ...goalForm, fatStart: e.target.value })}
										/>
									</div>
									<div className="bs-form-group">
										<label>Target Fat (%)</label>
										<input
											type="number"
											step="0.1"
											required
											value={goalForm.fatGoal}
											onChange={(e) => setGoalForm({ ...goalForm, fatGoal: e.target.value })}
										/>
									</div>
								</div>
							</div>
							<div className="bs-modal-foot">
								<button type="button" className="bs-btn-secondary" onClick={() => setModalMode(null)}>
									Cancel
								</button>
								<button type="submit" className="bs-btn-primary" disabled={isSubmitting}>
									{isSubmitting ? 'Saving Goals...' : 'Save Goals'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
