// FitNova Body Stats API Service
import { apiClient } from './api';

/**
 * Fetch the complete aggregated Body Stats overview
 */
export async function fetchStatsOverview(signal = null) {
  return apiClient('/stats/overview/', { signal });
}

/**
 * Fetch weight trend data for a specific range ('7d', '30d', '90d')
 */
export async function fetchStatsTrends(range = '30d', signal = null) {
  return apiClient(`/stats/trends/?range=${encodeURIComponent(range)}`, { signal });
}

/**
 * Fetch body composition breakdown
 */
export async function fetchStatsComposition(signal = null) {
  return apiClient('/stats/composition/', { signal });
}

/**
 * List all body measurements for the authenticated user
 */
export async function fetchMeasurements(signal = null) {
  return apiClient('/stats/measurements/', { signal });
}

/**
 * Create or update a body measurement entry for a given date
 * @param {Object} data - { date, weight, body_fat, muscle, chest, waist, arms, steps }
 */
export async function logMeasurement(data) {
  return apiClient('/stats/measurements/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing measurement entry
 */
export async function updateMeasurement(id, data) {
  return apiClient(`/stats/measurements/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a measurement entry
 */
export async function deleteMeasurement(id) {
  return apiClient(`/stats/measurements/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * Fetch user body metric goals
 */
export async function fetchGoals(signal = null) {
  return apiClient('/stats/goals/', { signal });
}

/**
 * Create or update a metric goal (weight, fat, muscle, bmi)
 */
export async function saveGoal(data) {
  return apiClient('/stats/goals/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update goal by ID
 */
export async function updateGoal(id, data) {
  return apiClient(`/stats/goals/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

