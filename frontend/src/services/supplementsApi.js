// FitNova Supplements API Service
import apiClient, { isAuthenticated } from './api';
import {
  SUPPLEMENT_CATEGORIES,
  CATEGORY_CARDS,
  FEATURED_SUPPLEMENTS,
  INITIAL_USER_STACK,
  SUPPLEMENT_OVERVIEW,
  SUPPLEMENT_GOALS,
  INITIAL_REMINDERS,
  ARTICLES_AND_TIPS,
} from './supplementsData';

import wheyImg from '../assets/images/product-whey.jpg';
import creatineImg from '../assets/images/product-creatine.jpg';
import c4Img from '../assets/images/product-c4.jpg';
import viteImg from '../assets/images/product-vite.jpg';
import bcaaImg from '../assets/images/product-bcaa.svg';
import omegaImg from '../assets/images/product-omega.svg';

const IMAGE_MAP = {
  protein: wheyImg,
  creatine: creatineImg,
  'pre-workout': c4Img,
  vitamins: viteImg,
  'amino-acids': bcaaImg,
  'fat-burners': c4Img,
  'post-workout': wheyImg,
  misc: omegaImg,
};

export function resolveProductImage(item) {
  if (item.image && typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('/'))) {
    return item.image;
  }
  if (item.image_url && typeof item.image_url === 'string' && (item.image_url.startsWith('http') || item.image_url.startsWith('/'))) {
    return item.image_url;
  }

  const slug = (item.category_slug || item.category || '').toLowerCase();
  for (const [k, img] of Object.entries(IMAGE_MAP)) {
    if (slug.includes(k) || k.includes(slug)) return img;
  }
  const name = (item.name || '').toLowerCase();
  if (name.includes('creatine')) return creatineImg;
  if (name.includes('vite') || name.includes('vitamin')) return viteImg;
  if (name.includes('c4') || name.includes('pre')) return c4Img;
  if (name.includes('bcaa') || name.includes('amino')) return bcaaImg;
  if (name.includes('omega') || name.includes('fish')) return omegaImg;
  return wheyImg;
}

/**
 * Fetch product categories from backend
 */
export async function fetchCategories() {
  const data = await apiClient('/supplements/categories/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Fetch products catalogue from backend with optional category & search filter
 */
export async function fetchProducts(category = null, search = null) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search && search.trim()) params.append('search', search.trim());

  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiClient(`/supplements/products/${query}`);
  const list = Array.isArray(data) ? data : (data.results || []);

  return list.map((item) => ({
    ...item,
    image: resolveProductImage(item),
    originalPrice: item.originalPrice || item.original_price,
    reviewsCount: item.reviewsCount || item.reviews_count,
  }));
}

/**
 * Fetch overview statistics for authenticated user
 */
export async function fetchOverview() {
  if (!isAuthenticated()) {
    return {
      overview: { activeCount: 0, completedCount: 0, streakDays: 0, remindersCount: 0 },
      goals: [],
    };
  }
  return await apiClient('/supplements/overview/');
}

/**
 * Fetch user's personal stack
 */
export async function fetchUserStack(statusFilter = null) {
  if (!isAuthenticated()) return [];
  const query = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
  const data = await apiClient(`/supplements/stack/${query}`);
  const list = Array.isArray(data) ? data : (data.results || []);

  return list.map((item) => ({
    ...item,
    startDate: item.startDate || item.start_date,
    image: resolveProductImage(item),
  }));
}

/**
 * Add a supplement to personal stack
 */
export async function addUserStack(itemData) {
  return await apiClient('/supplements/stack/', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
}

/**
 * Update supplement in personal stack
 */
export async function updateUserStack(id, itemData) {
  return await apiClient(`/supplements/stack/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(itemData),
  });
}

/**
 * Delete supplement from personal stack
 */
export async function deleteUserStack(id) {
  return await apiClient(`/supplements/stack/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * Fetch reminders for authenticated user
 */
export async function fetchReminders() {
  if (!isAuthenticated()) return [];
  const data = await apiClient('/supplements/reminders/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Create a new supplement reminder
 */
export async function createReminder(reminderData) {
  return await apiClient('/supplements/reminders/', {
    method: 'POST',
    body: JSON.stringify(reminderData),
  });
}

/**
 * Toggle a reminder enabled/disabled
 */
export async function toggleReminder(id) {
  return await apiClient(`/supplements/reminders/${id}/toggle/`, {
    method: 'POST',
  });
}

/**
 * Delete a reminder
 */
export async function deleteReminder(id) {
  return await apiClient(`/supplements/reminders/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * Fetch user's wishlist
 */
export async function fetchWishlist() {
  if (!isAuthenticated()) return [];
  const data = await apiClient('/supplements/wishlist/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId) {
  return await apiClient('/supplements/wishlist/', {
    method: 'POST',
    body: JSON.stringify({ product: productId }),
  });
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId) {
  return await apiClient(`/supplements/wishlist/remove_by_product/?product=${productId}`, {
    method: 'DELETE',
  });
}

/**
 * Fetch shopping cart
 */
export async function fetchCart() {
  if (!isAuthenticated()) return [];
  const data = await apiClient('/supplements/cart/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Add product to cart
 */
export async function addToCartApi(productId, quantity = 1) {
  return await apiClient('/supplements/cart/', {
    method: 'POST',
    body: JSON.stringify({ product: productId, quantity }),
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItemApi(cartItemId, quantity) {
  return await apiClient(`/supplements/cart/${cartItemId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

/**
 * Remove item from cart
 */
export async function removeFromCartApi(cartItemId) {
  return await apiClient(`/supplements/cart/${cartItemId}/`, {
    method: 'DELETE',
  });
}

/**
 * Clear shopping cart
 */
export async function clearCartApi() {
  return await apiClient('/supplements/cart/clear/', {
    method: 'DELETE',
  });
}

/**
 * Fetch daily supplement logs
 */
export async function fetchDailyLogs() {
  if (!isAuthenticated()) return [];
  const data = await apiClient('/supplements/logs/');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Log supplement intake (mark as taken or untaken)
 */
export async function logSupplementIntake(stackItemId, date = null, isTaken = true) {
  return await apiClient('/supplements/logs/', {
    method: 'POST',
    body: JSON.stringify({
      stack_item: stackItemId,
      date: date || new Date().toISOString().split('T')[0],
      is_taken: isTaken,
    }),
  });
}

/**
 * Fetch supplement educational articles
 */
export async function fetchArticles() {
  const data = await apiClient('/supplements/articles/');
  const list = Array.isArray(data) ? data : (data.results || []);
  if (list.length > 0) return list;
  return ARTICLES_AND_TIPS;
}

/**
 * Development-only fallback dataset (when user explicitly requests demo mode)
 */
export function getDemoSupplementsDataset() {
  return {
    categories: SUPPLEMENT_CATEGORIES,
    categoryCards: CATEGORY_CARDS,
    products: FEATURED_SUPPLEMENTS,
    stack: INITIAL_USER_STACK,
    overview: SUPPLEMENT_OVERVIEW,
    goals: SUPPLEMENT_GOALS,
    reminders: INITIAL_REMINDERS,
    articles: ARTICLES_AND_TIPS,
  };
}
