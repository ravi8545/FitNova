// Mock data. Replace with real API calls later (GET /api/dashboard/, /api/progress/photos/)
export const dashboardData = {
  user: { name: 'Akash' },
  stats: [
    { key: 'calories', label: 'Calories', value: 1980, goal: 2200, unit: 'kcal', color: '#2BAF34' },
    { key: 'protein', label: 'Protein', value: 142, goal: 150, unit: 'g', color: '#f59e0b' },
    { key: 'water', label: 'Water', value: 2.6, goal: 4, unit: 'L', color: '#3b82f6' },
    { key: 'workout', label: 'Workout', value: 1, goal: 1, unit: 'session', color: '#8B5CF6' },
  ],
  macros: [
    { name: 'Carbohydrates', pct: 45, val: '223g', color: '#2BAF34' },
    { name: 'Protein', pct: 29, val: '142g', color: '#f59e0b' },
    { name: 'Fats', pct: 26, val: '57g', color: '#3b82f6' },
    { name: 'Fiber', pct: 10, val: '28g', color: '#8B5CF6' },
  ],
  macroGoals: [
    { name: 'Carbs', v: 223, g: 275, unit: 'g', color: '#2BAF34' },
    { name: 'Protein', v: 142, g: 150, unit: 'g', color: '#f59e0b' },
    { name: 'Fats', v: 57, g: 70, unit: 'g', color: '#3b82f6' },
    { name: 'Fiber', v: 28, g: 30, unit: 'g', color: '#8B5CF6' },
  ],
  workout: {
    name: 'Push Day', status: 'Completed', duration: '1h 15m', exercises: 6, sets: 18, volume: '4,680 kg',
    top: [['Bench Press', '4 × 60 kg'], ['Incline Dumbbell Press', '4 × 22.5 kg'], ['Shoulder Press', '3 × 20 kg'], ['Tricep Pushdown', '3 × 15 kg']],
  },
  weight: { current: 82.4, start: 85.6, goal: 75, change: -1.2,
    points: [['4 Jun', 85.6], ['5 Jun', 85.0], ['6 Jun', 84.1], ['7 Jun', 83.8], ['8 Jun', 83.2], ['9 Jun', 82.9], ['10 Jun', 82.4]] },
  activity: [['4 Jun', 1600], ['5 Jun', 1700], ['6 Jun', 1950], ['7 Jun', 1750], ['8 Jun', 1850], ['9 Jun', 1950], ['10 Jun', 1980]],
  meals: [
    { name: 'Oats with Banana', time: '08:00 AM', kcal: 420, protein: 22 },
    { name: 'Grilled Chicken & Rice', time: '01:00 PM', kcal: 650, protein: 45 },
    { name: 'Whey Protein Shake', time: '04:30 PM', kcal: 200, protein: 24 },
  ],
  calendar: { year: 2025, month: 5, today: 10, dots: { 1: '#2BAF34', 2: '#f59e0b', 3: '#3b82f6', 9: '#f59e0b', 10: '#2BAF34', 11: '#2BAF34', 12: '#3b82f6', 16: '#f59e0b', 17: '#2BAF34', 19: '#f59e0b', 20: '#f59e0b', 23: '#f59e0b', 24: '#2BAF34', 26: '#3b82f6', 30: '#2BAF34' } },
  streak: { days: 12, week: [true, true, true, true, true, false, false] },
  plan: [
    { title: 'High Protein Breakfast', time: '08:00 AM', done: true },
    { title: 'Push Workout', time: '09:00 AM', done: true },
    { title: 'Lunch', time: '01:00 PM', done: false },
    { title: 'Water Intake', time: 'Throughout Day', done: false },
    { title: 'Evening Cardio', time: '06:00 PM', done: false },
    { title: 'Dinner', time: '08:00 PM', done: false },
  ],
};

export const photosData = {
  stats: { thisMonth: 2, months: 3, since: 'Mar 2025', weightChange: -3.2, consistency: 75 },
  // src: null renders a placeholder. Later, src = image URL from the backend.
  photos: [
    { id: 1, date: '01 Mar 2025', weight: 85.6, bodyFat: 24, chest: 96, waist: 83, arms: 32, category: 'Progress', src: null },
    { id: 2, date: '15 Mar 2025', weight: 84.8, bodyFat: 23, chest: 96, waist: 82, arms: 32, category: 'Progress', src: null },
    { id: 3, date: '01 Apr 2025', weight: 83.9, bodyFat: 22, chest: 95, waist: 81, arms: 32, category: 'Progress', src: null },
    { id: 4, date: '15 Apr 2025', weight: 83.1, bodyFat: 22, chest: 95, waist: 80, arms: 33, category: 'Front View', src: null },
    { id: 5, date: '01 May 2025', weight: 82.6, bodyFat: 21, chest: 94, waist: 79, arms: 33, category: 'Side View', src: null },
    { id: 6, date: '10 Jun 2025', weight: 82.4, bodyFat: 20, chest: 94, waist: 78, arms: 33, category: 'Progress', src: null },
  ],
};
