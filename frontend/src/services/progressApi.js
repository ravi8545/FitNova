// FitNova Progress API Service
import { apiClient } from './api';

/**
 * Fetch the complete Progress page overview
 */
export async function fetchProgressOverview(signal = null) {
  return apiClient('/progress/overview/', { signal });
}

/**
 * Fetch performance trends (dual-axis data for strength & cardio across 7d, 30d, 90d, all)
 */
export async function fetchProgressTrends(signal = null) {
  return apiClient('/progress/trends/', { signal });
}

/**
 * Fetch user milestones timeline
 */
export async function fetchMilestones(signal = null) {
  return apiClient('/progress/milestones/', { signal });
}

/**
 * Create a new milestone
 */
export async function createMilestone(data) {
  return apiClient('/progress/milestones/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update milestone by ID (e.g. toggle done, edit title)
 */
export async function updateMilestone(id, data) {
  return apiClient(`/progress/milestones/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(id) {
  return apiClient(`/progress/milestones/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * Fetch all progress photos
 */
export async function fetchProgressPhotos(signal = null) {
  return apiClient('/progress/photos/', { signal });
}

/**
 * Upload a new progress photo (supports multipart FormData or JSON with image URL)
 */
export async function uploadProgressPhoto(dataOrFormData) {
  const isFormData = dataOrFormData instanceof FormData;
  return apiClient('/progress/photos/', {
    method: 'POST',
    body: isFormData ? dataOrFormData : JSON.stringify(dataOrFormData),
  });
}

/**
 * Delete a progress photo
 */
export async function deleteProgressPhoto(id) {
  return apiClient(`/progress/photos/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * Fetch unlocked and in-progress achievement badges
 */
export async function fetchAchievements(signal = null) {
  return apiClient('/progress/achievements/', { signal });
}

/**
 * Log or update daily workout metrics (volume, pace, distance)
 */
export async function logWorkoutMetric(data) {
  return apiClient('/progress/workout-logs/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

