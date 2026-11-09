export const photosData = {
	stats: { thisMonth: 2, months: 3, since: 'Mar 2025', weightChange: -3.2, consistency: 75 },
	// src: null renders a placeholder. Later, src = image URL from the backend.
	photos: [
		{
			id: 1,
			date: '01 Mar 2025',
			weight: 85.6,
			bodyFat: 24,
			chest: 96,
			waist: 83,
			arms: 32,
			category: 'Progress',
			src: null,
		},
		{
			id: 2,
			date: '15 Mar 2025',
			weight: 84.8,
			bodyFat: 23,
			chest: 96,
			waist: 82,
			arms: 32,
			category: 'Progress',
			src: null,
		},
		{
			id: 3,
			date: '01 Apr 2025',
			weight: 83.9,
			bodyFat: 22,
			chest: 95,
			waist: 81,
			arms: 32,
			category: 'Progress',
			src: null,
		},
		{
			id: 4,
			date: '15 Apr 2025',
			weight: 83.1,
			bodyFat: 22,
			chest: 95,
			waist: 80,
			arms: 33,
			category: 'Front View',
			src: null,
		},
		{
			id: 5,
			date: '01 May 2025',
			weight: 82.6,
			bodyFat: 21,
			chest: 94,
			waist: 79,
			arms: 33,
			category: 'Side View',
			src: null,
		},
		{
			id: 6,
			date: '10 Jun 2025',
			weight: 82.4,
			bodyFat: 20,
			chest: 94,
			waist: 78,
			arms: 33,
			category: 'Progress',
			src: null,
		},
	],
};

// TODO: replace with api.get("/progress/") once the backend endpoint exists
// Deterministic series so the chart looks the same on every render.
const wave = (n, a, b, amp, seed) =>
	Array.from({ length: n }, (_, i) => +(a + (b - a) * (i / (n - 1)) + Math.sin(i * 1.7 + seed) * amp).toFixed(1));
const labels = (n, prefix) => Array.from({ length: n }, (_, i) => `${prefix} ${i + 1}`);
const dates = ['May 25', 'May 28', 'May 31', 'Jun 02', 'Jun 04', 'Jun 06', 'Jun 08', 'Jun 10', 'Jun 12', 'Jun 14'];

export const progressData = {
	range: 'May 25, 2025 – Jun 10, 2025',
	stats: [
		{ key: 'weight', label: 'Total Weight Lost', value: '6.4 kg', sub: 'May 1 - Jun 10', done: true },
		{ key: 'muscle', label: 'Total Muscle Gained', value: '3.2 kg', sub: 'May 1 - Jun 10', done: true },
		{ key: 'pr', label: 'New Personal Records (PRs)', value: '2 New', sub: 'May 1 - Jun 10' },
		{ key: 'streak', label: 'Longest Workout Streak', value: '14 Days', sub: 'May 1 - Jun 10' },
	],
	// trends[mode][range] = { labels, a, b }; a = left axis, b = right axis
	trends: {
		strength: {
			meta: {
				a: { name: 'Weight', unit: 'kg', min: 80, max: 88, step: 2 },
				b: { name: 'Workout Volume', unit: 'sets', min: 0, max: 400, step: 100 },
			},
			'7d': {
				labels: ['4 Jun', '5 Jun', '6 Jun', '7 Jun', '8 Jun', '9 Jun', '10 Jun'],
				a: [85.6, 85.0, 84.1, 83.8, 83.2, 82.9, 82.4],
				b: [210, 240, 190, 260, 230, 280, 250],
			},
			'30d': {
				labels: ['12 May', '17 May', '22 May', '27 May', '1 Jun', '6 Jun', '10 Jun'],
				a: [85.1, 84.6, 84.0, 83.4, 83.0, 82.7, 82.4],
				b: [150, 190, 170, 230, 210, 260, 240],
			},
			'90d': {
				labels: dates,
				a: wave(10, 86.5, 81.7, 0.25, 1),
				b: [60, 110, 150, 120, 200, 240, 215, 160, 250, 305],
			},
			all: {
				labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
				a: [87.0, 86.2, 85.6, 83.9, 82.6, 82.4],
				b: [90, 140, 190, 230, 270, 300],
			},
		},
		cardio: {
			meta: {
				a: { name: 'Pace', unit: 'min/km', min: 5, max: 7, step: 0.5 },
				b: { name: 'Distance', unit: 'km', min: 0, max: 12, step: 3 },
			},
			'7d': {
				labels: ['4 Jun', '5 Jun', '6 Jun', '7 Jun', '8 Jun', '9 Jun', '10 Jun'],
				a: [6.2, 6.1, 6.0, 5.9, 5.9, 5.8, 5.7],
				b: [3, 0, 5, 4, 0, 6, 7.2],
			},
			'30d': {
				labels: ['12 May', '17 May', '22 May', '27 May', '1 Jun', '6 Jun', '10 Jun'],
				a: [6.5, 6.3, 6.2, 6.0, 5.9, 5.8, 5.7],
				b: [3, 4, 4.5, 5, 5.5, 6.5, 7.2],
			},
			'90d': { labels: dates, a: wave(10, 6.8, 5.6, 0.08, 2), b: [2, 3, 3.5, 3, 5, 5.5, 6, 5.5, 7, 7.2] },
			all: {
				labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
				a: [7.0, 6.8, 6.5, 6.1, 5.9, 5.7],
				b: [2, 3, 4, 5, 6, 7.2],
			},
		},
	},
	projected: { pct: 72, note: 'Projected to hit body fat goal on July 15' },
	insights: [
		{
			tone: 'green',
			title: 'Your muscle mass trend is excellent.',
			text: 'Consider introducing high-intensity intervals once a week to boost fat loss while maintaining muscle.',
		},
		{
			tone: 'purple',
			title: 'Body fat decreased by 0.7%',
			text: 'Keep tracking your progress and your hard work will pay off.',
		},
		{ tone: 'blue', title: 'Muscle mass increased by 0.8 kg', text: "You're getting stronger!" },
	],
	milestones: [
		{ date: 'Jun 8', title: 'Ran 5k in <25 mins!', done: true },
		{ date: 'Jun 1', title: '30-Day Workout Streak Logged' },
		{ date: 'May 22', title: 'Halfway to Weight Goal' },
		{ date: 'May 15', title: 'New Bench PR +5 kg' },
		{ date: 'May 1', title: 'Journey Started' },
	],
	photos: [
		{ id: 1, label: 'Week 1', weight: 85.6, src: null },
		{ id: 2, label: 'Week 2', weight: 84.3, src: null },
		{ id: 3, label: 'Week 3', weight: 84.3, src: null },
		{ id: 4, label: 'Week 4', weight: 83.1, src: null },
		{ id: 5, label: 'Week 5', weight: 82.4, src: null },
	],
	quickActions: [
		{ key: 'share', label: 'Share Progress Summary', color: '#2BAF34' },
		{ key: 'compare', label: 'View Compare Tool', color: '#3B82F6' },
		{ key: 'milestones', label: 'Update Milestones', color: '#8B5CF6' },
		{ key: 'badges', label: 'View Achievement Badges', color: '#F59E0B' },
	],
};

// Mock data for Body Stats & Progress page.
// Replace with real API calls later (GET /api/body-stats/).
export const bodyStatsData = {
	user: 'Anuj',
	range: 'Jun 04 – Jun 10, 2025',

	// Top stat cards
	// pct = (value - start) / (goal - start) * 100
	stats: [
		{
			key: 'weight',
			label: 'Current Weight',
			value: 82.4,
			unit: 'kg',
			start: 85.6,
			startLabel: '85.6 kg',
			goal: 75,
			goalLabel: '75 kg',
			delta: -1.2,
			deltaUnit: 'kg',
			color: '#2BAF34',
		},
		{
			key: 'fat',
			label: 'Body Fat',
			value: 20.0,
			unit: '%',
			start: 24,
			startLabel: '24%',
			goal: 15,
			goalLabel: '15%',
			delta: -0.8,
			deltaUnit: '%',
			color: '#3B82F6',
		},
		{
			key: 'muscle',
			label: 'Muscle Mass',
			value: 61.8,
			unit: 'kg',
			start: 59.2,
			startLabel: '59.2 kg',
			goal: 65,
			goalLabel: '65 kg',
			delta: 0.8,
			deltaUnit: 'kg',
			color: '#8B5CF6',
		},
		{
			key: 'bmi',
			label: 'BMI',
			value: 25.4,
			unit: '',
			start: 26.4,
			startLabel: '26.4',
			goal: 23,
			goalLabel: '23',
			delta: -0.4,
			deltaUnit: '',
			color: '#F59E0B',
		},
	],

	// Weight chart data for the 7D, 30D and 90D buttons.
	// Each range contains labels and matching weight values.
	trend: {
		'7D': {
			labels: ['4 Jun', '5 Jun', '6 Jun', '7 Jun', '8 Jun', '9 Jun', '10 Jun'],
			values: [85.6, 85.0, 84.1, 83.8, 83.2, 82.9, 82.4],
		},

		'30D': {
			labels: ['12 May', '17 May', '22 May', '27 May', '1 Jun', '6 Jun', '10 Jun'],
			values: [85.1, 84.6, 84.0, 83.4, 83.0, 82.7, 82.4],
		},

		'90D': {
			labels: ['15 Mar', '25 Mar', '5 Apr', '15 Apr', '25 Apr', '5 May', '15 May', '25 May', '5 Jun', '10 Jun'],
			values: [87.2, 86.5, 85.8, 85.1, 84.5, 83.9, 83.4, 82.9, 82.6, 82.4],
		},
	},

	// Body Measurements card
	// icon values must match MEAS_ICON in BodyStats.jsx.
	measurements: [
		{
			name: 'Chest',
			value: 94,
			unit: 'cm',
			delta: -2,
			icon: 'shirt',
		},
		{
			name: 'Waist',
			value: 78,
			unit: 'cm',
			delta: -5,
			icon: 'ruler',
		},
		{
			name: 'Body Fat',
			value: 20,
			unit: '%',
			delta: -0.8,
			icon: 'activity',
		},
		{
			name: 'Arms',
			value: 33,
			unit: 'cm',
			delta: 1,
			icon: 'dumbbell',
		},
		{
			name: 'Steps',
			value: 8500,
			unit: 'steps',
			delta: 1200,
			icon: 'footprints',
		},
	],

	// Body Composition donut chart.
	// Percentages add up to 100.
	composition: {
		total: 82.4,

		parts: [
			{
				name: 'Muscle Mass',
				kg: 61.8,
				pct: 75,
				color: '#2BAF34',
			},
			{
				name: 'Fat Mass',
				kg: 16.5,
				pct: 20,
				color: '#3B82F6',
			},
			{
				name: 'Other',
				kg: 4.1,
				pct: 5,
				color: '#8B5CF6',
			},
		],
	},

	// Progress Photos card.
	// src: null displays the placeholder in the existing Photo component.
	photos: [
		{
			id: 1,
			label: 'Week 1',
			weight: 85.6,
			src: null,
		},
		{
			id: 2,
			label: 'Week 2',
			weight: 84.3,
			src: null,
		},
		{
			id: 3,
			label: 'Week 3',
			weight: 83.1,
			src: null,
		},
		{
			id: 4,
			label: 'Week 4',
			weight: 82.4,
			src: null,
		},
	],

	// Recent Measurements table.
	recent: [
		{
			date: '10 Jun 2025',
			weight: 82.4,
			fat: 20.0,
			muscle: 61.8,
			bmi: 25.4,
			latest: true,
		},
		{
			date: '06 Jun 2025',
			weight: 82.9,
			fat: 20.4,
			muscle: 61.4,
			bmi: 25.6,
			latest: false,
		},
		{
			date: '01 Jun 2025',
			weight: 83.0,
			fat: 20.8,
			muscle: 61.2,
			bmi: 25.6,
			latest: false,
		},
		{
			date: '25 May 2025',
			weight: 84.0,
			fat: 21.5,
			muscle: 60.7,
			bmi: 25.9,
			latest: false,
		},
		{
			date: '12 May 2025',
			weight: 85.1,
			fat: 22.4,
			muscle: 60.0,
			bmi: 26.3,
			latest: false,
		},
	],

	// Insights card.
	// tone values must match INSIGHT_ICON in BodyStats.jsx.
	insights: [
		{
			tone: 'green',
			title: 'Your weight is trending in the right direction.',
			text: 'You have lost 3.2 kg since the beginning of your tracking period. Keep following your routine consistently.',
		},
		{
			tone: 'purple',
			title: 'Your body fat percentage is decreasing.',
			text: 'Your recorded body fat has dropped from 24% to 20%. Continue tracking measurements alongside weight.',
		},
		{
			tone: 'blue',
			title: 'Your muscle mass is improving.',
			text: 'Your recorded muscle mass has increased by 2.6 kg. Maintain consistent strength training and recovery.',
		},
	],

	// Progress Summary card.
	summary: {
		pct: 68,

		goals: [
			{
				name: 'Weight Goal',
				icon: 'weight',
				color: '#2BAF34',
				text: '82.4 kg of 75 kg target',
				pct: 70,
			},
			{
				name: 'Body Fat Goal',
				icon: 'fat',
				color: '#3B82F6',
				text: '20% of 15% target',
				pct: 44,
			},
			{
				name: 'Muscle Mass Goal',
				icon: 'muscle',
				color: '#8B5CF6',
				text: '61.8 kg of 65 kg target',
				pct: 45,
			},
			{
				name: 'BMI Goal',
				icon: 'bmi',
				color: '#F59E0B',
				text: '25.4 of 23 target',
				pct: 29,
			},
		],
	},

	// Quick Actions card.
	// Keys must match ACTION_ICON in BodyStats.jsx.
	quickActions: [
		{
			key: 'weight',
			label: 'Update Weight',
			color: '#2BAF34',
		},
		{
			key: 'measure',
			label: 'Add Measurement',
			color: '#3B82F6',
		},
		{
			key: 'goal',
			label: 'Set New Goals',
			color: '#8B5CF6',
		},
		{
			key: 'report',
			label: 'View Progress Report',
			color: '#F59E0B',
		},
	],
};
