export const REPORT_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'body-stats', label: 'Body Stats' },
  { id: 'water-intake', label: 'Water Intake' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'supplements', label: 'Supplements' },
];

export const TIME_PERIODS = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '3m', label: '3M' },
  { id: '1y', label: '1Y' },
];

export const KPI_METRICS = [
  {
    id: 'kpi-calories',
    title: 'Calories',
    value: '13,860',
    target: '15,400 kcal',
    change: '+8%',
    isPositive: true,
    comparisonText: 'vs previous period',
    type: 'calories',
    sparklineData: [40, 55, 48, 65, 58, 80, 88],
  },
  {
    id: 'kpi-protein',
    title: 'Protein',
    value: '924',
    target: '1,050 g',
    change: '+12%',
    isPositive: true,
    comparisonText: 'vs previous period',
    type: 'protein',
    sparklineData: [50, 62, 58, 70, 68, 85, 92],
  },
  {
    id: 'kpi-water',
    title: 'Water',
    value: '2.6',
    target: '4 L',
    change: '-10%',
    isPositive: false,
    comparisonText: 'vs previous period',
    type: 'water',
    sparklineData: [85, 80, 75, 70, 65, 60, 55],
  },
  {
    id: 'kpi-workouts',
    title: 'Workouts',
    value: '6',
    target: '8 sessions',
    change: '+20%',
    isPositive: true,
    comparisonText: 'vs previous period',
    type: 'workouts',
    sparklineData: [30, 45, 40, 60, 70, 75, 90],
  },
];

export const CALORIE_INTAKE_VS_BURN = [
  { day: '4 Jun', intake: 1950, burned: 1750 },
  { day: '5 Jun', intake: 2100, burned: 1820 },
  { day: '6 Jun', intake: 1980, burned: 1900 },
  { day: '7 Jun', intake: 2050, burned: 1800 },
  { day: '8 Jun', intake: 2150, burned: 2000 },
  { day: '9 Jun', intake: 1850, burned: 1700 },
  { day: '10 Jun', intake: 1980, burned: 1850 },
];

export const MACRONUTRIENT_DISTRIBUTION = {
  totalCalories: '13,860',
  items: [
    { name: 'Carbohydrates', percentage: 45, amount: '223g', color: '#2BAF34' },
    { name: 'Protein', percentage: 29, amount: '142g', color: '#F59E0B' },
    { name: 'Fats', percentage: 26, amount: '57g', color: '#3B82F6' },
  ],
};

export const WEIGHT_PROGRESS = {
  currentWeight: '82.4 kg',
  change: '-1.2 kg',
  comparison: 'vs last month',
  data: [
    { day: '4 Jun', weight: 83.6 },
    { day: '5 Jun', weight: 83.3 },
    { day: '6 Jun', weight: 83.1 },
    { day: '7 Jun', weight: 82.9 },
    { day: '8 Jun', weight: 82.7 },
    { day: '9 Jun', weight: 82.5 },
    { day: '10 Jun', weight: 82.4 },
  ],
};

export const BODY_COMPOSITION = [
  { day: '4 Jun', muscle: 48, fat: 22, water: 58 },
  { day: '5 Jun', muscle: 49, fat: 21.8, water: 59 },
  { day: '6 Jun', muscle: 49.5, fat: 21.5, water: 59 },
  { day: '7 Jun', muscle: 50, fat: 21.2, water: 60 },
  { day: '8 Jun', muscle: 50.2, fat: 21.0, water: 60.5 },
  { day: '9 Jun', muscle: 50.8, fat: 20.8, water: 61 },
  { day: '10 Jun', muscle: 51, fat: 20.5, water: 61.2 },
];

export const TOP_PERFORMING_DAYS = [
  {
    date: '8 Jun 2025',
    percentage: 92,
    calories: '2,100 kcal',
    protein: '142 g protein',
    extra: 'Workout completed',
  },
  {
    date: '6 Jun 2025',
    percentage: 88,
    calories: '1,980 kcal',
    protein: '136 g protein',
    extra: '4 L water',
  },
  {
    date: '4 Jun 2025',
    percentage: 85,
    calories: '1,950 kcal',
    protein: '130 g protein',
    extra: 'Workout completed',
  },
];

export const AREAS_FOR_IMPROVEMENT = [
  {
    id: 'imp-1',
    title: 'Increase Water Intake',
    description: 'Try to reach 4L daily for better recovery.',
    icon: 'water',
  },
  {
    id: 'imp-2',
    title: 'Improve Sleep Consistency',
    description: 'Your average sleep is 6.2 hrs. Aim for 7-8 hrs.',
    icon: 'sleep',
  },
  {
    id: 'imp-3',
    title: 'More Strength Workouts',
    description: 'Add 1-2 more strength sessions per week.',
    icon: 'strength',
  },
];

export const REPORT_SUMMARY = [
  { label: 'Avg. Daily Calories', value: '1,980 kcal', change: '+8%', positive: true },
  { label: 'Avg. Daily Protein', value: '132 g', change: '+12%', positive: true },
  { label: 'Avg. Daily Water', value: '2.4 L', change: '-5%', positive: false },
  { label: 'Total Workouts', value: '6 sessions', change: '+20%', positive: true },
];

export const REPORT_GOALS = [
  { title: 'Weight Goal', current: '72 kg', target: '65 kg', percentage: 85, color: '#2BAF34' },
  { title: 'Protein Goal', current: '132 g', target: '150 g', percentage: 88, color: '#2BAF34' },
  { title: 'Water Goal', current: '2.4 L', target: '4 L', percentage: 60, color: '#3B82F6' },
  { title: 'Workout Goal', current: '6', target: '8 sessions', percentage: 75, color: '#8B5CF6' },
];

export const RECENT_ACTIVITY = [
  { title: 'Push Day', meta: '1h 15m', date: '10 Jun 2025', icon: 'workout' },
  { title: 'Water Intake', meta: '2.6 L', date: '10 Jun 2025', icon: 'water' },
  { title: 'High Protein Breakfast', meta: '420 kcal', date: '10 Jun 2025', icon: 'food' },
];
