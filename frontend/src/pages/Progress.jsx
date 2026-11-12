import { useState, useEffect } from 'react';
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
	Plus,
	X,
	Trash2,
	Upload,
	AlertCircle,
	CheckCircle2,
	RefreshCw,
} from 'lucide-react';

import '../styles/Progress.css';
import {
	fetchProgressOverview,
	fetchProgressTrends,
	createMilestone,
	updateMilestone,
	deleteMilestone,
	uploadProgressPhoto,
	deleteProgressPhoto,
	logWorkoutMetric,
} from '../services/progressApi';

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

const CardHead = ({ icon: Icon, title, link, to, onAction, actionLabel }) => {
	const navigate = useAppNav();
	return (
		<div className="prog-card-head">
			<h3 className="prog-card-title">
				{Icon && <Icon size={18} />}
				{title}
			</h3>
			{link && (
				<button className="prog-card-link" onClick={() => to && navigate(to)}>
					{link}
				</button>
			)}
			{actionLabel && (
				<button
					className="prog-card-link"
					style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
					onClick={onAction}
				>
					<Plus size={14} /> {actionLabel}
				</button>
			)}
		</div>
	);
};

function Photo({ p, className = '' }) {
	if (!p) {
		return <div className={`prog-photo ${className}`}>🧍</div>;
	}
	const src = p.src || p.image_url;
	return src ? (
		<img src={src} alt={`Progress photo, ${p.label || 'Progress'}`} className={`prog-photo ${className}`} />
	) : (
		<div className={`prog-photo ${className}`}>🧍</div>
	);
}

/* Dual-axis chart: left axis = series a (green), right axis = series b (blue, filled). Hover shows tooltip. */
function TrendChart({ data, meta, rangeLabel }) {
	const W = 760,
		H = 270,
		L = 42,
		R = 42,
		T = 16,
		B = 30;

	const [hover, setHover] = useState(null);

	if (!data || !data.a || data.a.length === 0) {
		return (
			<div className="prog-chart" style={{ display: 'grid', placeItems: 'center', height: H }}>
				<p style={{ color: 'var(--muted)', fontSize: 13 }}>No performance data recorded for this time window.</p>
			</div>
		);
	}

	const n = data.a.length;
	const idx = hover !== null && hover < n ? hover : Math.max(0, n - 1);
	const x = (i) => (n <= 1 ? (W - L - R) / 2 + L : L + (i / (n - 1)) * (W - L - R));

	const safeMinA = meta?.a?.min ?? 0;
	const safeMaxA = meta?.a?.max ?? 100;
	const spanA = safeMaxA - safeMinA || 1;

	const safeMinB = meta?.b?.min ?? 0;
	const safeMaxB = meta?.b?.max ?? 100;
	const spanB = safeMaxB - safeMinB || 1;

	const yOf = (v, min, span) => T + (1 - (v - min) / span) * (H - T - B);

	const ptsA = data.a.map((v, i) => [x(i), yOf(v, safeMinA, spanA)]);
	const ptsB = data.b.map((v, i) => [x(i), yOf(v, safeMinB, spanB)]);
	const path = (pts) => pts.map((p) => p.join(',')).join(' ');

	// Generate ticks
	const stepA = meta?.a?.step || spanA / 4;
	const stepB = meta?.b?.step || spanB / 4;

	const tickA = [];
	for (let v = safeMinA; v <= safeMaxA + 1e-9; v += stepA) tickA.push(+v.toFixed(1));
	const tickB = [];
	for (let v = safeMinB; v <= safeMaxB + 1e-9; v += stepB) tickB.push(+v.toFixed(1));

	const move = (e) => {
		if (n <= 1) return;
		const r = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		setHover(Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1)))));
	};

	const tipLeft = `${(x(idx) / W) * 100}%`;
	const flip = idx > n * 0.7;
	const fmt = (v, m) => `${m?.unit === 'sets' ? Math.round(v) : v} ${m?.unit || ''}`;

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

				{/* Y Axis A (Left) */}
				{tickA.map((v, i) => (
					<g key={`ta-${i}`}>
						<line x1={L} x2={W - R} y1={yOf(v, safeMinA, spanA)} y2={yOf(v, safeMinA, spanA)} stroke="#1E2D42" strokeDasharray="3 3" />
						<text x={L - 8} y={yOf(v, safeMinA, spanA) + 4} fontSize="11" fill="#94A3B8" textAnchor="end">
							{v}
						</text>
					</g>
				))}

				{/* Y Axis B (Right) */}
				{tickB.map((v, i) => (
					<text key={`tb-${i}`} x={W - R + 8} y={yOf(v, safeMinB, spanB) + 4} fontSize="11" fill="#94A3B8">
						{v}
					</text>
				))}

				{/* Area polygons and lines */}
				{n > 1 && (
					<>
						<polygon points={`${ptsB[0][0]},${H - B} ${path(ptsB)} ${ptsB[ptsB.length - 1][0]},${H - B}`} fill="url(#prog-gb)" />
						<polygon points={`${ptsA[0][0]},${H - B} ${path(ptsA)} ${ptsA[ptsA.length - 1][0]},${H - B}`} fill="url(#prog-ga)" />
						<polyline points={path(ptsB)} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
						<polyline points={path(ptsA)} fill="none" stroke={GREEN} strokeWidth="2" strokeLinejoin="round" />
					</>
				)}

				{ptsB.map(([px, py], i) => (
					<circle key={`b${i}`} cx={px} cy={py} r="3" fill={BLUE} />
				))}
				{ptsA.map(([px, py], i) => (
					<circle key={`a${i}`} cx={px} cy={py} r="3" fill={GREEN} />
				))}

				{ptsA[idx] && (
					<>
						<line x1={x(idx)} x2={x(idx)} y1={T} y2={H - B} stroke={GREEN} strokeOpacity=".45" strokeDasharray="3 3" />
						<circle cx={x(idx)} cy={ptsA[idx][1]} r="6" fill="#fff" stroke={GREEN} strokeWidth="3" />
					</>
				)}

				{(data.labels || []).map((d, i) => (
					<text key={`xl-${i}`} x={x(i)} y={H - 8} fontSize="11" fill="#94A3B8" textAnchor="middle">
						{d}
					</text>
				))}
			</svg>

			{ptsA[idx] && (
				<div className={`prog-tip${flip ? ' is-flip' : ''}`} style={{ left: tipLeft }}>
					<b>{rangeLabel}</b>
					<span>
						<i style={{ background: GREEN }} />
						{meta?.a?.name}: <em style={{ color: GREEN }}>{fmt(data.a[idx], meta?.a)}</em>
					</span>
					<span>
						<i style={{ background: BLUE }} />
						{meta?.b?.name}: <em style={{ color: BLUE }}>{fmt(data.b[idx], meta?.b)}</em>
					</span>
				</div>
			)}
		</div>
	);
}

export default function ProgressPage() {
	const [data, setData] = useState(null);
	const [trendsData, setTrendsData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [toast, setToast] = useState(null);

	const [mode, setMode] = useState('strength');
	const [range, setRange] = useState('90d');

	// Modals
	const [modalMode, setModalMode] = useState(null); // 'milestone' | 'photo' | 'compare' | 'workout'
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState('');

	// Milestone form
	const todayStr = new Date().toISOString().split('T')[0];
	const [msForm, setMsForm] = useState({
		title: '',
		date: todayStr,
		category: 'General',
		pr: false,
		done: false,
	});

	// Photo upload form
	const [photoForm, setPhotoForm] = useState({
		label: '',
		weight: '',
		category: 'Progress',
		date: todayStr,
		imageFile: null,
		src: '',
		notes: '',
	});

	// Compare selector
	const [compareA, setCompareA] = useState(0);
	const [compareB, setCompareB] = useState(1);

	// Workout log form
	const [workForm, setWorkForm] = useState({
		date: todayStr,
		volume: '',
		pace: '',
		distance: '',
	});

	const showToast = (message, type = 'success') => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3500);
	};

	const loadData = async (signal) => {
		try {
			setLoading(true);
			setError(null);
			const [overviewRes, trendsRes] = await Promise.all([
				fetchProgressOverview(signal),
				fetchProgressTrends(signal),
			]);
			setData(overviewRes);
			setTrendsData(trendsRes);
		} catch (err) {
			if (err.name !== 'AbortError') {
				setError(err.message || 'Failed to load Progress data.');
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

	// Handle Quick Actions
	const handleQuickAction = (key) => {
		if (key === 'share') {
			const text = `FitNova Progress Summary:\n- Range: ${data?.range}\n- Total Weight Lost: ${data?.stats?.[0]?.value || '0 kg'}\n- Muscle Gained: ${data?.stats?.[1]?.value || '0 kg'}\n- PRs Set: ${data?.stats?.[2]?.value || '0'}\n- Longest Streak: ${data?.stats?.[3]?.value || '0 Days'}`;
			if (navigator.clipboard) {
				navigator.clipboard.writeText(text);
				showToast('Progress summary copied to clipboard!');
			} else {
				showToast('Progress summary generated!');
			}
		} else if (key === 'compare') {
			setModalMode('compare');
		} else if (key === 'milestones') {
			setMsForm({
				title: '',
				date: todayStr,
				category: 'Strength',
				pr: true,
				done: false,
			});
			setFormError('');
			setModalMode('milestone');
		} else if (key === 'badges') {
			showToast('Viewing your achievement journey!');
		}
	};

	// Save Milestone
	const handleSaveMilestone = async (e) => {
		e.preventDefault();
		if (!msForm.title.trim()) {
			setFormError('Please enter a milestone title.');
			return;
		}

		setIsSubmitting(true);
		setFormError('');
		try {
			await createMilestone(msForm);
			showToast('Milestone successfully logged!');
			setModalMode(null);
			await loadData();
		} catch (err) {
			setFormError(err.message || 'Failed to create milestone.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Toggle Milestone Done
	const handleToggleMilestone = async (id, currentDone) => {
		try {
			await updateMilestone(id, { done: !currentDone });
			showToast(!currentDone ? 'Milestone achieved! 🎉' : 'Milestone marked pending.');
			await loadData();
		} catch (err) {
			showToast(err.message || 'Failed to update milestone.', 'error');
		}
	};

	// Delete Milestone
	const handleDeleteMilestone = async (id) => {
		if (!window.confirm('Delete this milestone?')) return;
		try {
			await deleteMilestone(id);
			showToast('Milestone removed.');
			await loadData();
		} catch (err) {
			showToast(err.message || 'Failed to delete milestone.', 'error');
		}
	};

	// Upload Photo
	const handleUploadPhoto = async (e) => {
		e.preventDefault();
		if (!photoForm.label.trim()) {
			setFormError('Please provide a label for this photo.');
			return;
		}
		if (!photoForm.imageFile && !photoForm.src.trim()) {
			setFormError('Please select an image file or provide an image URL.');
			return;
		}

		setIsSubmitting(true);
		setFormError('');
		try {
			if (photoForm.imageFile) {
				const formData = new FormData();
				formData.append('label', photoForm.label);
				formData.append('date', photoForm.date);
				formData.append('category', photoForm.category);
				if (photoForm.weight) formData.append('weight', photoForm.weight);
				if (photoForm.notes) formData.append('notes', photoForm.notes);
				formData.append('image', photoForm.imageFile);
				await uploadProgressPhoto(formData);
			} else {
				await uploadProgressPhoto({
					label: photoForm.label,
					date: photoForm.date,
					category: photoForm.category,
					weight: photoForm.weight ? parseFloat(photoForm.weight) : null,
					src: photoForm.src,
					notes: photoForm.notes,
				});
			}

			showToast('Progress photo added!');
			setModalMode(null);
			await loadData();
		} catch (err) {
			setFormError(err.message || 'Failed to upload photo.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Delete Photo
	const handleDeletePhoto = async (id) => {
		if (!window.confirm('Are you sure you want to delete this progress photo?')) return;
		try {
			await deleteProgressPhoto(id);
			showToast('Photo removed.');
			await loadData();
		} catch (err) {
			showToast(err.message || 'Failed to delete photo.', 'error');
		}
	};

	// Save Workout Metric
	const handleSaveWorkout = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setFormError('');
		try {
			await logWorkoutMetric({
				date: workForm.date,
				volume: workForm.volume ? parseInt(workForm.volume, 10) : 0,
				pace: workForm.pace ? parseFloat(workForm.pace) : null,
				distance: workForm.distance ? parseFloat(workForm.distance) : null,
			});
			showToast('Workout log saved!');
			setModalMode(null);
			await loadData();
		} catch (err) {
			setFormError(err.message || 'Failed to save workout metrics.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading && !data) {
		return (
			<div className="prog-page">
				<div className="prog-header">
					<div className="prog-head-left">
						<PersonStanding size={44} color="#2BAF34" />
						<div>
							<div className="prog-skeleton" style={{ width: 280, height: 28, marginBottom: 8 }} />
							<div className="prog-skeleton" style={{ width: 360, height: 16 }} />
						</div>
					</div>
				</div>
				<div className="prog-stats">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="prog-card prog-skeleton" style={{ height: 120 }} />
					))}
				</div>
				<div className="prog-layout" style={{ marginTop: 20 }}>
					<div className="prog-main">
						<div className="prog-card prog-skeleton" style={{ height: 320 }} />
					</div>
					<div className="prog-aside">
						<div className="prog-card prog-skeleton" style={{ height: 320 }} />
					</div>
				</div>
			</div>
		);
	}

	if (error && !data) {
		return (
			<div className="prog-page">
				<div className="prog-error-card">
					<div className="prog-error-text">
						<AlertCircle size={22} />
						<span>{error}</span>
					</div>
					<button className="prog-retry-btn" onClick={() => loadData()}>
						<RefreshCw size={14} style={{ display: 'inline', marginRight: 6 }} />
						Retry
					</button>
				</div>
			</div>
		);
	}

	const d = data || {
		range: 'Recent',
		stats: [],
		milestones: [],
		photos: [],
		insights: [],
		projected: { pct: 75, note: 'Journey in progress' },
		quickActions: [],
	};

	const trends = trendsData || {
		strength: { meta: { a: { name: 'Weight', unit: 'kg', min: 70, max: 90, step: 5 }, b: { name: 'Volume', unit: 'sets', min: 0, max: 300, step: 50 } }, '7d': { labels: [], a: [], b: [] }, '30d': { labels: [], a: [], b: [] }, '90d': { labels: [], a: [], b: [] }, all: { labels: [], a: [], b: [] } },
		cardio: { meta: { a: { name: 'Pace', unit: 'min/km', min: 4, max: 8, step: 1 }, b: { name: 'Distance', unit: 'km', min: 0, max: 12, step: 3 } }, '7d': { labels: [], a: [], b: [] }, '30d': { labels: [], a: [], b: [] }, '90d': { labels: [], a: [], b: [] }, all: { labels: [], a: [], b: [] } },
	};

	const trendMode = trends[mode] || trends.strength;
	const activeTrend = trendMode[range] || { labels: [], a: [], b: [] };

	const photos = d.photos || [];
	const firstPhoto = photos.length > 0 ? photos[0] : null;
	const lastPhoto = photos.length > 1 ? photos[photos.length - 1] : firstPhoto;

	const R = 52,
		C = 2 * Math.PI * R;

	return (
		<div className="prog-page">
			{/* Toast */}
			{toast && (
				<div className={`prog-toast is-${toast.type}`}>
					{toast.type === 'success' ? <CheckCircle2 size={18} color="#2BAF34" /> : <AlertCircle size={18} color="#EF4444" />}
					<span>{toast.message}</span>
				</div>
			)}

			{/* Header */}
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
					<button
						aria-label="Log Workout"
						title="Log Workout Metric"
						style={{ marginLeft: 14, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
						onClick={() => {
							setWorkForm({ date: todayStr, volume: '', pace: '', distance: '' });
							setFormError('');
							setModalMode('workout');
						}}
					>
						<Plus size={16} />
						<span style={{ fontSize: 12, fontWeight: 600 }}>Log Workout</span>
					</button>
				</div>
			</div>

			{/* 4 Main KPI Cards */}
			<div className="prog-stats">
				{(d.stats || []).map((s) => {
					const Icon = STAT_ICON[s.key] || Trophy;
					const c = STAT_COLOR[s.key] || GREEN;
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

			{/* Main Layout Grid */}
			<div className="prog-layout">
				<div className="prog-main">
					{/* Performance Trends Chart */}
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
							data={activeTrend}
							meta={trendMode.meta}
							rangeLabel={RANGE_LABEL[range]}
						/>
					</div>

					{/* Row 2: Milestones Timeline + Visual Progression Photos */}
					<div className="prog-row2">
						{/* Milestones */}
						<div className="prog-card">
							<CardHead
								icon={Flag}
								title="Milestones Timeline"
								actionLabel="Add"
								onAction={() => {
									setMsForm({ title: '', date: todayStr, category: 'Milestone', pr: false, done: false });
									setFormError('');
									setModalMode('milestone');
								}}
							/>
							<ul className="prog-timeline">
								{(d.milestones && d.milestones.length > 0) ? (
									d.milestones.map((m) => (
										<li key={m.id || m.title} className={m.done ? 'is-done' : ''}>
											<span
												className="prog-node"
												title={m.done ? 'Mark pending' : 'Mark achieved'}
												onClick={() => handleToggleMilestone(m.id, m.done)}
												style={{ cursor: 'pointer' }}
											/>
											<div className="prog-ms">
												<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
													<small>{m.display_date || m.date}</small>
													{m.pr && (
														<span style={{ fontSize: 10, background: '#F59E0B22', color: '#F59E0B', border: '1px solid #F59E0B55', padding: '1px 6px', borderRadius: 4 }}>
															PR
														</span>
													)}
												</div>
												<span style={{ display: 'block', marginTop: 2 }}>{m.title}</span>
											</div>
											{m.id && (
												<button
													style={{ color: '#64748B', padding: 4, cursor: 'pointer' }}
													title="Delete milestone"
													onClick={() => handleDeleteMilestone(m.id)}
												>
													<Trash2 size={13} />
												</button>
											)}
										</li>
									))
								) : (
									<li style={{ padding: 16, color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
										No milestones logged yet. Use '+ Add' to log your first target!
									</li>
								)}
							</ul>
						</div>

						{/* Visual Progression */}
						<div className="prog-card">
							<CardHead
								icon={ImageIcon}
								title="Visual Progression"
								actionLabel="Upload"
								onAction={() => {
									setPhotoForm({ label: '', weight: '', category: 'Progress', date: todayStr, imageFile: null, src: '', notes: '' });
									setFormError('');
									setModalMode('photo');
								}}
							/>
							<div className="prog-ba" onClick={() => setModalMode('compare')} style={{ cursor: 'pointer' }}>
								<Photo p={firstPhoto} className="prog-ba-img" />
								<Photo p={lastPhoto} className="prog-ba-img" />
								<span className="prog-ba-label">Before / After Comparison (Click to View)</span>
							</div>

							<div className="prog-ptl-head">
								<h4>Photos Timeline</h4>
								<button
									className="prog-outline-btn"
									onClick={() => setModalMode('compare')}
								>
									Compare Photos
								</button>
							</div>

							<div className="prog-thumbs">
								{photos.length > 0 ? (
									photos.map((p, idx) => (
										<div key={p.id || idx} style={{ position: 'relative' }}>
											<Photo p={p} className="prog-thumb" />
											<span>{p.label}</span>
											<span>{p.weight ? `${p.weight} kg` : ''}</span>
											{p.id && (
												<button
													style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#EF4444', borderRadius: '50%', width: 20, height: 20, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
													title="Delete photo"
													onClick={(e) => {
														e.stopPropagation();
														handleDeletePhoto(p.id);
													}}
												>
													<Trash2 size={11} />
												</button>
											)}
										</div>
									))
								) : (
									<div style={{ color: 'var(--muted)', fontSize: 13, padding: 12 }}>
										No photos added yet. Use 'Upload' to add progress snapshots!
									</div>
								)}
							</div>

							<button
								className="prog-wide-btn"
								onClick={() => setModalMode('compare')}
							>
								Compare Photos Tool
							</button>
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="prog-aside">
					{/* Projected Journey Timeline */}
					<div className="prog-card">
						<CardHead icon={Trophy} title="Projected Journey Timeline" />
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
									strokeDasharray={`${((d.projected?.pct || 0) / 100) * C} ${C}`}
									transform="rotate(-90 60 60)"
								/>
							</svg>
							<div className="prog-ring-center">
								<b>{d.projected?.pct || 0}%</b>
								<span>Estimated Target</span>
							</div>
						</div>
						<p className="prog-ring-title">{d.projected?.pct || 0}% of your targeted journey</p>
						<p className="prog-ring-note">{d.projected?.note}</p>
					</div>

					{/* Insights */}
					<div className="prog-card">
						<CardHead icon={Lightbulb} title="Data Insights" />
						<ul className="prog-insights">
							{(d.insights || []).map((n) => {
								const Icon = INSIGHT_ICON[n.tone] || ArrowUp;
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

					{/* Quick Actions */}
					<div className="prog-card">
						<CardHead icon={Target} title="Quick Actions" />
						<div className="prog-quick">
							{(d.quickActions || []).map((a) => {
								const Icon = ACTION_ICON[a.key] || Plus;
								return (
									<button
										key={a.key}
										className="prog-quick-tile"
										style={{ '--c': a.color }}
										onClick={() => handleQuickAction(a.key)}
									>
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

			{/* =========================================================================
			    MODALS: Add Milestone, Upload Photo, Compare Photos, Log Workout
			   ========================================================================= */}
			{modalMode === 'milestone' && (
				<div className="prog-modal-overlay" onClick={() => setModalMode(null)}>
					<div className="prog-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
						<div className="prog-modal-head">
							<h3>
								<Flag size={20} color="var(--green)" /> Add Milestone or PR
							</h3>
							<button className="prog-modal-close" onClick={() => setModalMode(null)}>
								<X size={18} />
							</button>
						</div>
						<form onSubmit={handleSaveMilestone}>
							<div className="prog-modal-body">
								{formError && (
									<div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 8, color: '#F87171', fontSize: 13, marginBottom: 14 }}>
										{formError}
									</div>
								)}
								<div className="prog-form-group" style={{ marginBottom: 12 }}>
									<label>Milestone Title *</label>
									<input
										type="text"
										placeholder="e.g. Ran 5k in under 24 mins"
										required
										autoFocus
										value={msForm.title}
										onChange={(e) => setMsForm({ ...msForm, title: e.target.value })}
									/>
								</div>
								<div className="prog-form-grid" style={{ marginBottom: 12 }}>
									<div className="prog-form-group">
										<label>Date</label>
										<input
											type="date"
											max={todayStr}
											value={msForm.date}
											onChange={(e) => setMsForm({ ...msForm, date: e.target.value })}
										/>
									</div>
									<div className="prog-form-group">
										<label>Category</label>
										<select
											value={msForm.category}
											onChange={(e) => setMsForm({ ...msForm, category: e.target.value })}
										>
											<option value="Strength">Strength</option>
											<option value="Cardio">Cardio</option>
											<option value="Consistency">Consistency</option>
											<option value="Body Composition">Body Composition</option>
											<option value="General">General</option>
										</select>
									</div>
								</div>
								<div className="prog-check-label">
									<input
										type="checkbox"
										id="ms-pr"
										checked={msForm.pr}
										onChange={(e) => setMsForm({ ...msForm, pr: e.target.checked })}
									/>
									<label htmlFor="ms-pr">Counts as a Personal Record (PR)</label>
								</div>
								<div className="prog-check-label">
									<input
										type="checkbox"
										id="ms-done"
										checked={msForm.done}
										onChange={(e) => setMsForm({ ...msForm, done: e.target.checked })}
									/>
									<label htmlFor="ms-done">Already Completed / Achieved</label>
								</div>
							</div>
							<div className="prog-modal-foot">
								<button type="button" className="prog-btn-secondary" onClick={() => setModalMode(null)}>
									Cancel
								</button>
								<button type="submit" className="prog-btn-primary" disabled={isSubmitting}>
									{isSubmitting ? 'Saving...' : 'Add Milestone'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{modalMode === 'photo' && (
				<div className="prog-modal-overlay" onClick={() => setModalMode(null)}>
					<div className="prog-modal" onClick={(e) => e.stopPropagation()}>
						<div className="prog-modal-head">
							<h3>
								<Camera size={20} color="var(--green)" /> Add Progress Photo
							</h3>
							<button className="prog-modal-close" onClick={() => setModalMode(null)}>
								<X size={18} />
							</button>
						</div>
						<form onSubmit={handleUploadPhoto}>
							<div className="prog-modal-body">
								{formError && (
									<div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 8, color: '#F87171', fontSize: 13, marginBottom: 14 }}>
										{formError}
									</div>
								)}
								<div className="prog-form-grid" style={{ marginBottom: 12 }}>
									<div className="prog-form-group">
										<label>Label *</label>
										<input
											type="text"
											placeholder="e.g. Week 8 Front View"
											required
											value={photoForm.label}
											onChange={(e) => setPhotoForm({ ...photoForm, label: e.target.value })}
										/>
									</div>
									<div className="prog-form-group">
										<label>Recorded Weight (kg)</label>
										<input
											type="number"
											step="0.1"
											placeholder="e.g. 81.5"
											value={photoForm.weight}
											onChange={(e) => setPhotoForm({ ...photoForm, weight: e.target.value })}
										/>
									</div>
								</div>
								<div className="prog-form-grid" style={{ marginBottom: 14 }}>
									<div className="prog-form-group">
										<label>Date</label>
										<input
											type="date"
											max={todayStr}
											value={photoForm.date}
											onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
										/>
									</div>
									<div className="prog-form-group">
										<label>Category</label>
										<select
											value={photoForm.category}
											onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
										>
											<option value="Progress">Progress</option>
											<option value="Front View">Front View</option>
											<option value="Side View">Side View</option>
											<option value="Back View">Back View</option>
										</select>
									</div>
								</div>
								<div className="prog-form-group" style={{ marginBottom: 14 }}>
									<label>Upload Image File (JPEG, PNG, WebP)</label>
									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											if (e.target.files && e.target.files[0]) {
												setPhotoForm({ ...photoForm, imageFile: e.target.files[0] });
											}
										}}
									/>
								</div>
								<div className="prog-form-group" style={{ marginBottom: 14 }}>
									<label>Or External Image URL</label>
									<input
										type="url"
										placeholder="https://images.unsplash.com/..."
										value={photoForm.src}
										onChange={(e) => setPhotoForm({ ...photoForm, src: e.target.value })}
									/>
								</div>
								<div className="prog-form-group">
									<label>Personal Notes</label>
									<textarea
										rows="2"
										placeholder="How are you feeling? Any visual changes noticed?"
										value={photoForm.notes}
										onChange={(e) => setPhotoForm({ ...photoForm, notes: e.target.value })}
									/>
								</div>
							</div>
							<div className="prog-modal-foot">
								<button type="button" className="prog-btn-secondary" onClick={() => setModalMode(null)}>
									Cancel
								</button>
								<button type="submit" className="prog-btn-primary" disabled={isSubmitting}>
									{isSubmitting ? 'Uploading...' : 'Save Photo'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{modalMode === 'compare' && (
				<div className="prog-modal-overlay" onClick={() => setModalMode(null)}>
					<div className="prog-modal" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
						<div className="prog-modal-head">
							<h3>
								<GitCompare size={20} color="var(--green)" /> Before &amp; After Photo Compare
							</h3>
							<button className="prog-modal-close" onClick={() => setModalMode(null)}>
								<X size={18} />
							</button>
						</div>
						<div className="prog-modal-body">
							{photos.length < 2 ? (
								<p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>
									You need at least 2 progress photos to use the comparison tool. Add photos to get started!
								</p>
							) : (
								<>
									<div className="prog-form-grid" style={{ marginBottom: 16 }}>
										<div className="prog-form-group">
											<label>Starting Photo (Before)</label>
											<select
												value={compareA}
												onChange={(e) => setCompareA(Number(e.target.value))}
											>
												{photos.map((p, i) => (
													<option key={p.id || i} value={i}>
														{p.label} - {p.date} ({p.weight} kg)
													</option>
												))}
											</select>
										</div>
										<div className="prog-form-group">
											<label>Current Photo (After)</label>
											<select
												value={compareB}
												onChange={(e) => setCompareB(Number(e.target.value))}
											>
												{photos.map((p, i) => (
													<option key={p.id || i} value={i}>
														{p.label} - {p.date} ({p.weight} kg)
													</option>
												))}
											</select>
										</div>
									</div>

									<div className="prog-compare-grid">
										<div className="prog-compare-card">
											<Photo p={photos[compareA]} className="prog-compare-img" />
											<b style={{ color: '#fff', fontSize: 14 }}>{photos[compareA]?.label}</b>
											<span style={{ color: 'var(--green)', fontSize: 13 }}>
												{photos[compareA]?.weight} kg &bull; {photos[compareA]?.date}
											</span>
										</div>
										<div className="prog-compare-card">
											<Photo p={photos[compareB]} className="prog-compare-img" />
											<b style={{ color: '#fff', fontSize: 14 }}>{photos[compareB]?.label}</b>
											<span style={{ color: 'var(--green)', fontSize: 13 }}>
												{photos[compareB]?.weight} kg &bull; {photos[compareB]?.date}
											</span>
										</div>
									</div>
								</>
							)}
						</div>
						<div className="prog-modal-foot">
							<button type="button" className="prog-btn-secondary" onClick={() => setModalMode(null)}>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{modalMode === 'workout' && (
				<div className="prog-modal-overlay" onClick={() => setModalMode(null)}>
					<div className="prog-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
						<div className="prog-modal-head">
							<h3>
								<Dumbbell size={20} color="var(--green)" /> Log Daily Workout Metric
							</h3>
							<button className="prog-modal-close" onClick={() => setModalMode(null)}>
								<X size={18} />
							</button>
						</div>
						<form onSubmit={handleSaveWorkout}>
							<div className="prog-modal-body">
								{formError && (
									<div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 8, color: '#F87171', fontSize: 13, marginBottom: 14 }}>
										{formError}
									</div>
								)}
								<div className="prog-form-group" style={{ marginBottom: 12 }}>
									<label>Workout Date *</label>
									<input
										type="date"
										max={todayStr}
										required
										value={workForm.date}
										onChange={(e) => setWorkForm({ ...workForm, date: e.target.value })}
									/>
								</div>
								<div className="prog-form-group" style={{ marginBottom: 12 }}>
									<label>Total Sets Completed (Strength Volume)</label>
									<input
										type="number"
										min="0"
										placeholder="e.g. 180"
										value={workForm.volume}
										onChange={(e) => setWorkForm({ ...workForm, volume: e.target.value })}
									/>
								</div>
								<div className="prog-form-grid">
									<div className="prog-form-group">
										<label>Distance (km)</label>
										<input
											type="number"
											step="0.1"
											min="0"
											placeholder="e.g. 5.5"
											value={workForm.distance}
											onChange={(e) => setWorkForm({ ...workForm, distance: e.target.value })}
										/>
									</div>
									<div className="prog-form-group">
										<label>Pace (min/km)</label>
										<input
											type="number"
											step="0.1"
											min="0"
											placeholder="e.g. 5.8"
											value={workForm.pace}
											onChange={(e) => setWorkForm({ ...workForm, pace: e.target.value })}
										/>
									</div>
								</div>
							</div>
							<div className="prog-modal-foot">
								<button type="button" className="prog-btn-secondary" onClick={() => setModalMode(null)}>
									Cancel
								</button>
								<button type="submit" className="prog-btn-primary" disabled={isSubmitting}>
									{isSubmitting ? 'Saving...' : 'Save Workout Log'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
