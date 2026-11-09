// FitNova Reports API Service
import apiClient, { isAuthenticated } from './api';
import {
  KPI_METRICS,
  CALORIE_INTAKE_VS_BURN,
  MACRONUTRIENT_DISTRIBUTION,
  WEIGHT_PROGRESS,
  BODY_COMPOSITION,
  TOP_PERFORMING_DAYS,
  AREAS_FOR_IMPROVEMENT,
  REPORT_SUMMARY,
  REPORT_GOALS,
  RECENT_ACTIVITY,
} from './reportsData';

/**
 * Fetches dynamic analytics report from Django backend for selected duration and tab
 * @param {string} period '7d' | '30d' | '3m' | '1y'
 * @param {string} tab 'overview' | 'nutrition' | 'workouts' | 'body-stats' | 'water-intake' | 'sleep' | 'supplements'
 */
export async function fetchAnalyticsReport(period = '7d', tab = 'overview') {
  try {
    const data = await apiClient(`/reports/analytics/?period=${period}&tab=${tab}`);
    return {
      isLive: true,
      error: null,
      period: data.period || period,
      tab: data.tab || tab,
      dateRange: data.date_range,
      aiInsight: data.ai_insight || null,
      kpiMetrics: data.kpi_metrics || [],
      calorieIntakeVsBurn: data.calorie_intake_vs_burn || [],
      macronutrientDistribution: data.macronutrient_distribution || {
        totalCalories: '0',
        items: [
          { name: 'Carbohydrates', percentage: 0, amount: '0g', color: '#2BAF34' },
          { name: 'Protein', percentage: 0, amount: '0g', color: '#F59E0B' },
          { name: 'Fats', percentage: 0, amount: '0g', color: '#3B82F6' },
        ],
      },
      weightProgress: data.weight_progress || { currentWeight: null, change: '0 kg', comparison: '', data: [] },
      bodyComposition: data.body_composition || [],
      topPerformingDays: data.top_performing_days || [],
      areasForImprovement: data.areas_for_improvement || [],
      reportSummary: data.report_summary || [],
      reportGoals: data.report_goals || [],
      recentActivity: data.recent_activity || [],
    };
  } catch (err) {
    return {
      isLive: false,
      error: err.message || 'Failed to fetch live analytics from server.',
      period,
      tab,
      dateRange: null,
      aiInsight: null,
      kpiMetrics: [],
      calorieIntakeVsBurn: [],
      macronutrientDistribution: {
        totalCalories: '0',
        items: [
          { name: 'Carbohydrates', percentage: 0, amount: '0g', color: '#2BAF34' },
          { name: 'Protein', percentage: 0, amount: '0g', color: '#F59E0B' },
          { name: 'Fats', percentage: 0, amount: '0g', color: '#3B82F6' },
        ],
      },
      weightProgress: { currentWeight: null, change: '0 kg', comparison: '', data: [] },
      bodyComposition: [],
      topPerformingDays: [],
      areasForImprovement: [],
      reportSummary: [],
      reportGoals: [],
      recentActivity: [],
    };
  }
}

/**
 * Fetch daily health logs
 */
export async function fetchDailyHealthLogs() {
  if (!isAuthenticated()) return [];
  const data = await apiClient('/reports/logs/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Create or update a daily health log
 */
export async function saveDailyHealthLog(logData) {
  return await apiClient('/reports/logs/', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}

/**
 * Fetch improvement areas
 */
export async function fetchImprovements() {
  if (!isAuthenticated()) return [];
  const data = await apiClient('/reports/improvements/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Resolve an area of improvement
 */
export async function resolveImprovement(id) {
  const rawId = typeof id === 'string' && id.startsWith('imp-') ? id.replace('imp-', '') : id;
  try {
    await apiClient(`/reports/improvements/${rawId}/resolve/`, {
      method: 'POST',
    });
    return true;
  } catch (err) {
    console.error('Failed to resolve improvement:', err);
    return false;
  }
}

/**
 * Fetch user goals
 */
export async function fetchReportGoals() {
  if (!isAuthenticated()) return [];
  const data = await apiClient('/reports/goals/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Create a new goal
 */
export async function createReportGoal(goalData) {
  return await apiClient('/reports/goals/', {
    method: 'POST',
    body: JSON.stringify(goalData),
  });
}

/**
 * Fetch recent activities
 */
export async function fetchRecentActivities() {
  if (!isAuthenticated()) return [];
  const data = await apiClient('/reports/activities/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Returns static demo data for explicit fallback/demo view
 */
export function getDemoReportsDataset() {
  return {
    isLive: false,
    isDemo: true,
    error: null,
    period: '7d',
    tab: 'overview',
    dateRange: '1 Jun 2025 - 10 Jun 2025',
    aiInsight: {
      title: 'FitNova AI Performance Report (Demo)',
      headline: 'Consistent High-Protein Intake & Recovery',
      description: 'You maintained a strong caloric deficit this week with consistent protein consumption, supporting muscle retention while promoting fat oxidation.',
    },
    kpiMetrics: KPI_METRICS,
    calorieIntakeVsBurn: CALORIE_INTAKE_VS_BURN,
    macronutrientDistribution: MACRONUTRIENT_DISTRIBUTION,
    weightProgress: WEIGHT_PROGRESS,
    bodyComposition: BODY_COMPOSITION,
    topPerformingDays: TOP_PERFORMING_DAYS,
    areasForImprovement: AREAS_FOR_IMPROVEMENT,
    reportSummary: REPORT_SUMMARY,
    reportGoals: REPORT_GOALS,
    recentActivity: RECENT_ACTIVITY,
  };
}
