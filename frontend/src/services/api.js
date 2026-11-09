// FitNova Shared API Client & Authentication Management

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Extracts a clear human-readable error string from DRF error responses
 */
export function parseDrfError(status, data) {
  if (!data) {
    return `Request failed with HTTP ${status}`;
  }
  if (typeof data === 'string') {
    return data;
  }
  if (data.detail && typeof data.detail === 'string') {
    return data.detail;
  }
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors.join(' ');
  }
  if (typeof data === 'object') {
    const errorMessages = [];
    for (const [field, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        errorMessages.push(`${field}: ${val.join(' ')}`);
      } else if (typeof val === 'string') {
        errorMessages.push(`${field}: ${val}`);
      }
    }
    if (errorMessages.length > 0) {
      return errorMessages.join(' | ');
    }
  }
  return `Server error (${status})`;
}

export function getAccessToken() {
  return localStorage.getItem('fitnova_auth_token');
}

export function getRefreshToken() {
  return localStorage.getItem('fitnova_refresh_token');
}

export function setTokens(access, refresh = null) {
  if (access) {
    localStorage.setItem('fitnova_auth_token', access);
  }
  if (refresh) {
    localStorage.setItem('fitnova_refresh_token', refresh);
  }
  window.dispatchEvent(new Event('fitnova_auth_changed'));
}

export function clearAuth() {
  localStorage.removeItem('fitnova_auth_token');
  localStorage.removeItem('fitnova_refresh_token');
  localStorage.removeItem('fitnova_user');
  window.dispatchEvent(new Event('fitnova_auth_changed'));
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

// Queue for handling simultaneous requests during token refresh
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed(err) {
  refreshSubscribers.forEach((cb) => cb(null, err));
  refreshSubscribers = [];
}

/**
 * Shared API Client with automatic SimpleJWT token refresh and DRF error parsing
 */
export async function apiClient(endpoint, options = {}) {
  const token = getAccessToken();
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr) {
    throw new ApiError(`Network error: ${netErr.message || 'Unable to connect to server'}`, 0, null);
  }

  // Handle 401 Unauthorized with token refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/token/refresh')) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newAccess = refreshData.access;
            const newRefresh = refreshData.refresh || refreshToken;
            setTokens(newAccess, newRefresh);
            isRefreshing = false;
            onRefreshed(newAccess);

            // Retry original request with new token
            headers.Authorization = `Bearer ${newAccess}`;
            const retryRes = await fetch(url, { ...options, headers });
            if (!retryRes.ok) {
              const errBody = await retryRes.json().catch(() => null);
              throw new ApiError(parseDrfError(retryRes.status, errBody), retryRes.status, errBody);
            }
            if (retryRes.status === 204 || retryRes.status === 205) return null;
            return retryRes.json();
          } else {
            // Refresh token expired or blacklisted
            isRefreshing = false;
            clearAuth();
            const failBody = await refreshRes.json().catch(() => null);
            const err = new ApiError(parseDrfError(refreshRes.status, failBody), refreshRes.status, failBody);
            onRefreshFailed(err);
            throw err;
          }
        } catch (refreshErr) {
          isRefreshing = false;
          onRefreshFailed(refreshErr);
          throw refreshErr;
        }
      } else {
        // Wait for active refresh to finish
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (newToken, err) => {
            if (err || !newToken) {
              reject(err || new ApiError('Session expired. Please log in again.', 401));
              return;
            }
            try {
              headers.Authorization = `Bearer ${newToken}`;
              const retryRes = await fetch(url, { ...options, headers });
              if (!retryRes.ok) {
                const errBody = await retryRes.json().catch(() => null);
                reject(new ApiError(parseDrfError(retryRes.status, errBody), retryRes.status, errBody));
                return;
              }
              if (retryRes.status === 204 || retryRes.status === 205) resolve(null);
              else resolve(await retryRes.json());
            } catch (err2) {
              reject(err2);
            }
          });
        });
      }
    } else {
      clearAuth();
    }
  }

  if (!response.ok) {
    let errBody = null;
    try {
      errBody = await response.json();
    } catch {
      errBody = null;
    }
    const message = parseDrfError(response.status, errBody);
    throw new ApiError(message, response.status, errBody);
  }

  if (response.status === 204 || response.status === 205) {
    return null;
  }

  return response.json();
}

export default apiClient;
