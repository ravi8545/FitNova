import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Flame,
  Dumbbell,
  Heart,
  ArrowRight,
  ShoppingCart,
  ShoppingBag,
  Star,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Check,
  ChevronRight,
  ShieldCheck,
  Layers,
  Sparkles,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  CATEGORY_CARDS,
  ARTICLES_AND_TIPS,
} from '../services/supplementsData';
import {
  fetchCategories,
  fetchProducts,
  fetchOverview,
  fetchUserStack,
  addUserStack,
  updateUserStack,
  deleteUserStack,
  fetchReminders,
  createReminder,
  toggleReminder as apiToggleReminder,
  deleteReminder as apiDeleteReminder,
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
  fetchDailyLogs,
  logSupplementIntake,
  fetchArticles,
  resolveProductImage,
  getDemoSupplementsDataset,
} from '../services/supplementsApi';
import { isAuthenticated } from '../services/api';
import heroBg from '../assets/images/supplements-hero.jpg';
import AddSupplementModal from '../components/common/AddSupplementModal';

export default function SupplementsPage({
  searchQuery = '',
  isAddModalOpen = false,
  setIsAddModalOpen = null,
  onOpenAddModal = null,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [overviewData, setOverviewData] = useState({
    activeCount: 0,
    completedCount: 0,
    streakDays: 0,
    remindersCount: 0,
  });
  const [goalsList, setGoalsList] = useState([]);
  const [articlesList, setArticlesList] = useState([]);
  const [userStack, setUserStack] = useState([]);
  const [stackStatusFilter, setStackStatusFilter] = useState('all'); // 'all' | 'Active' | 'Paused' | 'Completed'
  const [reminders, setReminders] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [selectedArticleModal, setSelectedArticleModal] = useState(null);
  const [productSortBy, setProductSortBy] = useState('featured');
  const [modalCartQty, setModalCartQty] = useState(1);

  // API Status: 'loading' | 'live' | 'demo' | 'error'
  const [apiStatus, setApiStatus] = useState('loading');
  const [apiError, setApiError] = useState(null);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('fitnova_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = Boolean(isAddModalOpen || internalModalOpen);
  const [editingStackItem, setEditingStackItem] = useState(null);
  const [deletingStackItem, setDeletingStackItem] = useState(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [newReminderData, setNewReminderData] = useState({ name: '', dose: '1 Scoop', time: '08:00 AM' });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenModal = (item = null) => {
    setEditingStackItem(item || null);
    setInternalModalOpen(true);
    if (typeof setIsAddModalOpen === 'function') {
      setIsAddModalOpen(true);
    }
    if (typeof onOpenAddModal === 'function') {
      onOpenAddModal();
    }
  };

  const handleCloseModal = () => {
    setInternalModalOpen(false);
    if (typeof setIsAddModalOpen === 'function') {
      setIsAddModalOpen(false);
    }
    setEditingStackItem(null);
  };

  // Listen to external modal opening events (e.g. from navbar)
  useEffect(() => {
    const handleOpenAddModalEvent = () => handleOpenModal();
    window.addEventListener('fitnova_open_add_supplement_modal', handleOpenAddModalEvent);
    return () => window.removeEventListener('fitnova_open_add_supplement_modal', handleOpenAddModalEvent);
  }, []);

  // Listen to external cart opening events (e.g. from navbar)
  useEffect(() => {
    const handleOpenCartEvent = () => setIsCartOpen(true);
    window.addEventListener('fitnova_open_cart', handleOpenCartEvent);
    return () => window.removeEventListener('fitnova_open_cart', handleOpenCartEvent);
  }, []);

  // Sync cart helper
  const syncCartState = (newCart) => {
    setCartItems(newCart);
    try {
      localStorage.setItem('fitnova_cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('fitnova_cart_updated'));
    } catch {}
  };

  const normalizeBackendCart = (rawCart) => {
    return rawCart.map((item) => ({
      id: item.product,
      cartItemId: item.id,
      name: item.product_details?.name || 'Supplement',
      brand: item.product_details?.brand || 'FitNova',
      price: item.product_details?.price || 0,
      image: resolveProductImage(item.product_details || item),
      quantity: item.quantity || 1,
    }));
  };

  // Section-specific loading indicators to avoid full-page flickering
  const [productsLoading, setProductsLoading] = useState(false);
  const [stackLoading, setStackLoading] = useState(false);

  // Initial Data Fetch on mount using Promise.allSettled
  const loadData = useCallback(async () => {
    setApiStatus('loading');
    setApiError(null);

    const results = await Promise.allSettled([
      fetchCategories(),
      fetchProducts('all', ''),
      fetchOverview(),
      fetchUserStack('all'),
      fetchReminders(),
      fetchArticles(),
      fetchWishlist(),
      fetchCart(),
      fetchDailyLogs(),
    ]);

    const [catsRes, prodsRes, ovrRes, stackRes, remsRes, artsRes, wishRes, cartRes, logsRes] = results;

    let successCount = 0;

    if (catsRes.status === 'fulfilled') {
      const cats = catsRes.value;
      if (Array.isArray(cats) && cats.length > 0) {
        setCategoriesList([
          { id: 'all', label: 'All Supplements' },
          ...cats.map((c) => ({ id: c.slug || c.id, label: c.name })),
        ]);
      }
      successCount++;
    }

    if (prodsRes.status === 'fulfilled') {
      setProductsList(prodsRes.value || []);
      successCount++;
    }

    if (ovrRes.status === 'fulfilled') {
      if (ovrRes.value?.overview) setOverviewData(ovrRes.value.overview);
      if (ovrRes.value?.goals) setGoalsList(ovrRes.value.goals);
      successCount++;
    }

    if (stackRes.status === 'fulfilled') {
      setUserStack(stackRes.value || []);
      successCount++;
    }

    if (remsRes.status === 'fulfilled') {
      setReminders(
        (remsRes.value || []).map((r) => ({
          ...r,
          enabled: r.is_enabled,
        }))
      );
      successCount++;
    }

    if (artsRes.status === 'fulfilled') {
      setArticlesList(artsRes.value || ARTICLES_AND_TIPS);
      successCount++;
    }

    if (wishRes.status === 'fulfilled') {
      setWishlistProductIds((wishRes.value || []).map((w) => w.product));
      successCount++;
    }

    if (cartRes.status === 'fulfilled' && isAuthenticated()) {
      const backendCart = cartRes.value || [];
      syncCartState(normalizeBackendCart(backendCart));
      successCount++;
    }

    if (logsRes.status === 'fulfilled') {
      setDailyLogs(logsRes.value || []);
      successCount++;
    }

    if (successCount >= 2) {
      setApiStatus('live');
    } else {
      setApiStatus('error');
      setApiError('Unable to connect to supplements backend.');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Re-fetch products with cancellation when category or search query changes
  useEffect(() => {
    let isCancelled = false;
    setProductsLoading(true);
    fetchProducts(selectedCategory, searchQuery)
      .then((prods) => {
        if (!isCancelled && prods) {
          setProductsList(prods);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Products fetch error:', err.message);
        }
      })
      .finally(() => {
        if (!isCancelled) setProductsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, searchQuery]);

  // Re-fetch user stack with cancellation when stack filter changes
  useEffect(() => {
    let isCancelled = false;
    setStackLoading(true);
    fetchUserStack(stackStatusFilter)
      .then((stack) => {
        if (!isCancelled && stack) {
          setUserStack(stack);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Stack fetch error:', err.message);
        }
      })
      .finally(() => {
        if (!isCancelled) setStackLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [stackStatusFilter]);

  const handleSwitchToDemo = () => {
    const demo = getDemoSupplementsDataset();
    setApiStatus('demo');
    setApiError(null);
    setCategoriesList(demo.categories);
    setProductsList(demo.products);
    setUserStack(demo.stack);
    setOverviewData(demo.overview);
    setGoalsList(demo.goals);
    setReminders(demo.reminders);
    setArticlesList(demo.articles);
    showToast('Loaded demo dataset preview');
  };

  // Wishlist toggle with optimistic update and ROLLBACK on failure
  const toggleWishlist = async (productId) => {
    const isWished = wishlistProductIds.includes(productId);
    const previousWishlist = [...wishlistProductIds];

    if (isWished) {
      setWishlistProductIds((prev) => prev.filter((id) => id !== productId));
      try {
        await removeFromWishlist(productId);
        showToast('Removed from wishlist');
      } catch (err) {
        setWishlistProductIds(previousWishlist);
        showToast(`Could not remove from wishlist: ${err.message}`);
      }
    } else {
      setWishlistProductIds((prev) => [...prev, productId]);
      try {
        await addToWishlist(productId);
        showToast('Added to wishlist');
      } catch (err) {
        setWishlistProductIds(previousWishlist);
        showToast(`Could not add to wishlist: ${err.message}`);
      }
    }
  };

  // Cart operations with rollback on API failure
  const addToCart = async (product) => {
    const previousCart = [...cartItems];
    const existingIndex = cartItems.findIndex((item) => item.id === product.id);
    let newCart;

    if (existingIndex > -1) {
      const existing = cartItems[existingIndex];
      const nextQty = (existing.quantity || 1) + 1;
      newCart = cartItems.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: nextQty } : item
      );
      syncCartState(newCart);

      if (isAuthenticated() && existing.cartItemId) {
        try {
          await updateCartItemApi(existing.cartItemId, nextQty);
        } catch (err) {
          syncCartState(previousCart);
          showToast(`Cart update failed: ${err.message}`);
          return;
        }
      }
    } else {
      const newItem = {
        ...product,
        quantity: 1,
      };
      newCart = [newItem, ...cartItems];
      syncCartState(newCart);

      if (isAuthenticated()) {
        try {
          const res = await addToCartApi(product.id, 1);
          if (res?.id) {
            newItem.cartItemId = res.id;
            syncCartState([newItem, ...cartItems]);
          }
        } catch (err) {
          syncCartState(previousCart);
          showToast(`Could not add to cart on server: ${err.message}`);
          return;
        }
      }
    }
    const totalQty = newCart.reduce((sum, i) => sum + (i.quantity || 1), 0);
    showToast(`Added ${product.name.split(' ')[0]} to cart! (${totalQty} in cart)`);
  };

  const updateCartQty = async (id, delta) => {
    const previousCart = [...cartItems];
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = (item.quantity || 1) + delta;

    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }

    const newCart = cartItems.map((i) => (i.id === id ? { ...i, quantity: newQty } : i));
    syncCartState(newCart);

    if (isAuthenticated() && item.cartItemId) {
      try {
        await updateCartItemApi(item.cartItemId, newQty);
      } catch (err) {
        syncCartState(previousCart);
        showToast(`Quantity update failed: ${err.message}`);
      }
    }
  };

  const removeFromCart = async (id) => {
    const previousCart = [...cartItems];
    const item = cartItems.find((i) => i.id === id);
    const newCart = cartItems.filter((i) => i.id !== id);
    syncCartState(newCart);
    showToast('Item removed from cart');

    if (isAuthenticated() && item?.cartItemId) {
      try {
        await removeFromCartApi(item.cartItemId);
      } catch (err) {
        syncCartState(previousCart);
        showToast(`Failed to remove from server cart: ${err.message}`);
      }
    }
  };

  const clearCart = async () => {
    const previousCart = [...cartItems];
    syncCartState([]);
    showToast('Cart cleared');

    if (isAuthenticated()) {
      try {
        await clearCartApi();
      } catch (err) {
        syncCartState(previousCart);
        showToast(`Failed to clear cart on server: ${err.message}`);
      }
    }
  };

  // Stack Operations
  const handleAddSupplement = async (newSupp) => {
    try {
      const created = await addUserStack(newSupp);
      setUserStack((prev) => [created, ...prev]);
      fetchOverview().then((ovr) => {
        if (ovr?.overview) setOverviewData(ovr.overview);
      });
      showToast(`${newSupp.name} added to your stack!`);
    } catch (err) {
      showToast(`Could not add supplement: ${err.message}`);
    }
  };

  const handleUpdateSupplement = async (id, updates) => {
    try {
      const updated = await updateUserStack(id, updates);
      setUserStack((prev) => prev.map((item) => (item.id === id ? updated : item)));
      fetchOverview().then((ovr) => {
        if (ovr?.overview) setOverviewData(ovr.overview);
      });
      showToast(`${updated.name} updated successfully!`);
      setEditingStackItem(null);
    } catch (err) {
      showToast(`Could not update supplement: ${err.message}`);
    }
  };

  const confirmDeleteStackItem = async () => {
    if (!deletingStackItem) return;
    try {
      await deleteUserStack(deletingStackItem.id);
      setUserStack((prev) => prev.filter((s) => s.id !== deletingStackItem.id));
      fetchOverview().then((ovr) => {
        if (ovr?.overview) setOverviewData(ovr.overview);
      });
      showToast('Supplement removed from stack');
      setDeletingStackItem(null);
    } catch (err) {
      showToast(`Could not delete supplement: ${err.message}`);
    }
  };

  // Daily Log Intake Toggle (with corrected argument order)
  const todayStr = new Date().toISOString().split('T')[0];
  const isLoggedToday = (stackItemId) => {
    return dailyLogs.some(
      (log) => String(log.stack_item) === String(stackItemId) && log.date === todayStr && log.is_taken
    );
  };

  const handleToggleIntake = async (stackItemId) => {
    const currentlyTaken = isLoggedToday(stackItemId);
    const nextTaken = !currentlyTaken;

    try {
      await logSupplementIntake(stackItemId, todayStr, nextTaken);
      const updatedLogs = await fetchDailyLogs();
      setDailyLogs(updatedLogs);
      const ovr = await fetchOverview();
      if (ovr?.overview) setOverviewData(ovr.overview);
      showToast(nextTaken ? 'Marked as taken for today! 🎯' : 'Marked as not taken');
    } catch (err) {
      showToast(`Could not save intake log: ${err.message}`);
    }
  };

  // Reminders Operations with rollback
  const toggleReminder = async (id) => {
    const previousReminders = [...reminders];
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );

    try {
      await apiToggleReminder(id);
      fetchOverview().then((ovr) => {
        if (ovr?.overview) setOverviewData(ovr.overview);
      });
      showToast('Reminder toggled');
    } catch (err) {
      setReminders(previousReminders);
      showToast(`Failed to toggle reminder: ${err.message}`);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!newReminderData.name.trim() || !newReminderData.time.trim()) {
      showToast('Please enter reminder name and time');
      return;
    }
    try {
      const created = await createReminder({
        ...newReminderData,
        is_enabled: true,
      });
      setReminders((prev) => [{ ...created, enabled: created.is_enabled }, ...prev]);
      setIsReminderModalOpen(false);
      setNewReminderData({ name: '', dose: '1 Scoop', time: '08:00 AM' });
      fetchOverview().then((ovr) => {
        if (ovr?.overview) setOverviewData(ovr.overview);
      });
      showToast('Reminder created successfully!');
    } catch (err) {
      showToast(`Failed to create reminder: ${err.message}`);
    }
  };

  const handleDeleteReminder = async (id) => {
    const previousReminders = [...reminders];
    setReminders((prev) => prev.filter((r) => r.id !== id));

    try {
      await apiDeleteReminder(id);
      fetchOverview().then((ovr) => {
        if (ovr?.overview) setOverviewData(ovr.overview);
      });
      showToast('Reminder removed');
    } catch (err) {
      setReminders(previousReminders);
      showToast(`Failed to remove reminder: ${err.message}`);
    }
  };

  // Filter and sort products by search, category and selected order
  const filteredProducts = productsList
    .filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory || item.category_slug === selectedCategory;
      const matchesQuery =
        searchQuery.trim() === '' ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    })
    .sort((a, b) => {
      if (productSortBy === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
      if (productSortBy === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
      if (productSortBy === 'rating_desc') return Number(b.rating || 0) - Number(a.rating || 0);
      if (productSortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      return 0; // default featured / server order
    });

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D141C] border border-[#2BAF34] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-[#2BAF34]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page Layout: Two Columns (Main Feed + Right Panel) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left / Center Main Content (8 cols on XL) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Header Title & Cart Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2BAF34] bg-[#2BAF34]/10 border border-[#2BAF34]/20 px-2 py-0.5 rounded-md inline-block">
                  Supplements Module
                </span>

                {apiStatus === 'live' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#2BAF34]/15 border border-[#2BAF34]/30 text-[#2BAF34]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2BAF34] animate-ping" />
                    Live API
                  </span>
                )}
                {apiStatus === 'loading' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6]">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Connecting...
                  </span>
                )}
                {apiStatus === 'demo' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B]">
                    <Layers className="w-2.5 h-2.5" />
                    Demo Fallback Mode
                  </span>
                )}
                {apiStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">
                    <AlertCircle className="w-2.5 h-2.5" />
                    API Error
                  </span>
                )}
              </div>

              <h1 className="page-title">Supplements</h1>
              <p className="page-subtitle">Support your fitness journey with trusted supplements.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                title="Refresh supplements catalogue & stack"
                className="p-2 rounded-xl bg-[#0D141C] border border-[#162230] text-slate-400 hover:text-white hover:border-[#2BAF34] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${apiStatus === 'loading' ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0D141C] border border-[#162230] hover:border-[#2BAF34] transition-all group cursor-pointer shadow-lg"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-[#2BAF34] group-hover:scale-110 transition-transform" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#2BAF34] text-black font-extrabold text-[9px] flex items-center justify-center animate-bounce">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-white">
                  View Cart {totalCartCount > 0 ? `(${totalCartCount})` : ''}
                </span>
              </button>
            </div>
          </div>

          {/* API Error State Banner */}
          {apiStatus === 'error' && (
            <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Could not connect to Django API</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">{apiError || 'Ensure backend is running at http://127.0.0.1:8000'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  className="px-3 py-1.5 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Retry
                </button>
                <button
                  onClick={handleSwitchToDemo}
                  className="px-3 py-1.5 bg-[#121B26] hover:bg-[#1E2D42] text-slate-300 font-semibold text-xs rounded-xl cursor-pointer border border-[#1E2D42]"
                >
                  Load Demo Data
                </button>
              </div>
            </div>
          )}

          {/* Hero Banner with Glow Aesthetic */}
          <div className="relative overflow-hidden rounded-2xl border border-[#1E2D42] bg-[#090D16] shadow-2xl p-6 sm:p-8 min-h-[220px] flex items-center">
            <div className="absolute inset-0 pointer-events-none opacity-30 sm:opacity-75 lg:opacity-90">
              <img
                src={heroBg}
                alt="FitNova Supplements Banner"
                className="w-full h-full object-cover object-right"
              />
            </div>

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#090D16] via-[#090D16]/90 to-[#090D16]/40 sm:via-[#090D16]/65 sm:to-transparent" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#090D16]/80 via-transparent to-transparent sm:hidden" />

            <div className="relative z-10 max-w-lg space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2BAF34]/20 border border-[#2BAF34]/40 text-[#2BAF34] text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-xs">
                <Sparkles className="w-3 h-3" />
                Support Your Goals
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                Better Supplements. <br />
                <span className="text-[#2BAF34] drop-shadow-md">Better Results.</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 sm:text-slate-300 leading-relaxed max-w-sm drop-shadow-sm font-medium">
                High quality supplements to boost performance, recovery and overall health.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    const el = document.getElementById('featured-supplements');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black font-bold text-xs tracking-wide shadow-lg shadow-[#2BAF34]/25 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#121B26]/80 hover:bg-[#1E2D42] text-white border border-[#2BAF34]/50 hover:border-[#2BAF34] font-bold text-xs tracking-wide transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#2BAF34]" />
                  <span>+ Add Supplement</span>
                </button>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] text-slate-200 sm:text-slate-300 font-medium">
                <div className="flex items-center gap-1.5 bg-[#0D141C]/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-[#1E2D42]/60 sm:border-0 backdrop-blur-xs">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>More Energy</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0D141C]/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-[#1E2D42]/60 sm:border-0 backdrop-blur-xs">
                  <Dumbbell className="w-3.5 h-3.5 text-[#2BAF34]" />
                  <span>Faster Recovery</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0D141C]/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-[#1E2D42]/60 sm:border-0 backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Better Performance</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0D141C]/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-[#1E2D42]/60 sm:border-0 backdrop-blur-xs">
                  <Heart className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Overall Wellness</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#2BAF34] text-black shadow-md shadow-[#2BAF34]/20'
                      : 'bg-[#0D141C] text-slate-400 hover:text-white border border-[#162230]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Featured Supplements Section */}
          <div id="featured-supplements" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Featured Supplements</h3>
                <span className="text-[11px] font-semibold text-slate-400 bg-[#121B26] border border-[#1E2D42] px-2 py-0.5 rounded-full">
                  {filteredProducts.length} items
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={productSortBy}
                  onChange={(e) => setProductSortBy(e.target.value)}
                  className="bg-[#0D141C] border border-[#162230] text-xs font-semibold text-slate-300 rounded-xl px-2.5 py-1.5 focus:border-[#2BAF34] focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setProductSortBy('featured');
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#2BAF34] hover:underline cursor-pointer"
                >
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0D141C] border border-[#162230] text-center space-y-3">
                <p className="text-slate-400 text-xs">No supplements found matching your search or category filter.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setProductSortBy('featured');
                  }}
                  className="px-4 py-2 bg-[#121B26] hover:bg-[#1E2D42] text-[#2BAF34] border border-[#2BAF34]/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {filteredProducts.map((product) => {
                  const isWished = wishlistProductIds.includes(product.id);
                  const inCartItem = cartItems.find((i) => i.id === product.id);
                  const discountPct = product.discount_percent || product.discountPercent;
                  return (
                    <div
                      key={product.id}
                      className="bg-[#0D141C] border border-[#162230] hover:border-[#2BAF34]/50 rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-black/60 group relative"
                    >
                      {/* Top Tag, Discount & Wishlist */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          {product.badge ? (
                            <span className={`text-[9px] px-2 py-0.5 rounded-md ${product.badge.color}`}>
                              {product.badge.text}
                            </span>
                          ) : null}
                          {discountPct > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#EF4444]/20 text-[#EF4444] font-bold border border-[#EF4444]/30">
                              -{discountPct}%
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWished ? 'text-red-500 fill-red-500' : 'text-slate-500'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Image - Click to view detail */}
                      <div
                        onClick={() => {
                          setSelectedProductModal(product);
                          setModalCartQty(1);
                        }}
                        className="w-full h-24 flex items-center justify-center my-1 group-hover:scale-105 transition-transform duration-300 overflow-hidden cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain rounded-xl filter drop-shadow-md"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{product.brand}</p>
                        <h4
                          onClick={() => {
                            setSelectedProductModal(product);
                            setModalCartQty(1);
                          }}
                          className="text-xs font-bold text-white line-clamp-2 leading-tight cursor-pointer hover:text-[#2BAF34] transition-colors"
                        >
                          {product.name}
                        </h4>

                        {/* Ratings */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                          <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                          <span className="font-bold text-white">{product.rating}</span>
                          <span>({product.reviewsCount || product.reviews_count || '0'})</span>
                        </div>

                        {/* Price & Cart Button */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-extrabold text-white">
                              ₹{Number(product.price || 0).toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[10px] text-slate-500 line-through">
                                ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                              inCartItem
                                ? 'bg-[#2BAF34] text-black font-bold shadow-md shadow-[#2BAF34]/30'
                                : 'bg-[#121B26] hover:bg-[#2BAF34] text-slate-300 hover:text-black'
                            }`}
                            aria-label="Add to cart"
                            title={inCartItem ? `${inCartItem.quantity} in cart` : 'Add to cart'}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {inCartItem && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-[#2BAF34] text-[9px] font-black flex items-center justify-center border border-[#2BAF34]">
                                {inCartItem.quantity}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Categories Grid */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-white tracking-tight">Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORY_CARDS.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    const normCat = cat.name.toLowerCase().replace(/[\s-_]+/g, '');
                    const match = categoriesList.find((c) => {
                      const normId = (c.id || '').toLowerCase().replace(/[\s-_]+/g, '');
                      const normLabel = (c.label || '').toLowerCase().replace(/[\s-_]+/g, '');
                      return normCat.includes(normId) || normId.includes(normCat) || normCat === normLabel;
                    });
                    if (match) setSelectedCategory(match.id);
                  }}
                  className="bg-[#0D141C] border border-[#162230] hover:border-[#2BAF34]/40 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer group transition-all duration-200 hover:bg-[#121B26]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#121B26] p-1.5 flex items-center justify-center border border-[#1E2D42]">
                      <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#2BAF34] transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{cat.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#2BAF34] group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* My Supplement Stack Section */}
          <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">My Supplement Stack</h3>
                <p className="text-xs text-slate-400">
                  Track and manage the supplements you are currently using.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Pills */}
                <div className="flex items-center p-1 bg-[#121B26] border border-[#1E2D42] rounded-xl text-xs">
                  {['all', 'Active', 'Paused', 'Completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStackStatusFilter(tab)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        stackStatusFilter === tab
                          ? 'bg-[#2BAF34] text-black shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab === 'all' ? 'All' : tab}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black font-bold text-xs transition-all duration-200 active:scale-95 shadow-md shadow-[#2BAF34]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Stack</span>
                </button>
              </div>
            </div>

            {/* Stack Table */}
            {userStack.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#121B26] border border-[#1E2D42] text-center text-slate-400 text-xs space-y-2">
                <p>No supplements in this category.</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="text-xs text-[#2BAF34] font-bold hover:underline cursor-pointer"
                >
                  + Add a supplement to start tracking
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#162230] text-slate-400 text-[11px] font-semibold">
                      <th className="py-3 px-3">Today</th>
                      <th className="py-3 px-3">Supplement</th>
                      <th className="py-3 px-3">Dosage</th>
                      <th className="py-3 px-3">Timing</th>
                      <th className="py-3 px-3">Start Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162230]/60">
                    {userStack.map((item) => {
                      const takenToday = isLoggedToday(item.id);
                      return (
                        <tr key={item.id} className="hover:bg-[#121B26] transition-colors group">
                          {/* Daily Intake Checkbox */}
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleIntake(item.id)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                takenToday
                                  ? 'bg-[#2BAF34] text-black shadow-md shadow-[#2BAF34]/30'
                                  : 'bg-[#121B26] border border-[#1E2D42] text-slate-500 hover:border-[#2BAF34]'
                              }`}
                              title={takenToday ? 'Taken today! Click to undo' : 'Click to mark as taken today'}
                            >
                              {takenToday ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Circle className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#121B26] p-1 flex items-center justify-center border border-[#1E2D42]">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{item.name}</span>
                                {item.notes && (
                                  <span className="text-[10px] text-slate-400 italic block">{item.notes}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{item.dosage}</td>
                          <td className="py-3 px-3 text-slate-300">{item.timing}</td>
                          <td className="py-3 px-3 text-slate-400">{item.startDate}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.status === 'Active'
                                  ? 'bg-[#2BAF34]/15 text-[#2BAF34] border-[#2BAF34]/30'
                                  : item.status === 'Completed'
                                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingStackItem(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Panel (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Supplement Overview Card */}
          <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">My Supplement Overview</h3>
              <span className="text-[10px] font-bold text-[#2BAF34] bg-[#2BAF34]/10 px-2 py-0.5 rounded-md">
                Live Overview
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Active */}
              <div className="p-3.5 rounded-xl bg-[#121B26] border border-[#1E2D42] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2BAF34]/15 border border-[#2BAF34]/30 flex items-center justify-center text-[#2BAF34]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xl font-black text-white block leading-none">
                    {overviewData.activeCount ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Active Supplements</span>
                </div>
              </div>

              {/* Completed */}
              <div className="p-3.5 rounded-xl bg-[#121B26] border border-[#1E2D42] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2BAF34]/15 border border-[#2BAF34]/30 flex items-center justify-center text-[#2BAF34]">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xl font-black text-white block leading-none">
                    {overviewData.completedCount ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                </div>
              </div>

              {/* Streak */}
              <div className="p-3.5 rounded-xl bg-[#121B26] border border-[#1E2D42] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                  <Flame className="w-4 h-4 fill-[#F59E0B]" />
                </div>
                <div>
                  <span className="text-xl font-black text-white block leading-none">
                    {overviewData.streakDays ?? 0} days
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Current Streak</span>
                </div>
              </div>

              {/* Reminders */}
              <div className="p-3.5 rounded-xl bg-[#121B26] border border-[#1E2D42] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2BAF34]/15 border border-[#2BAF34]/30 flex items-center justify-center text-[#2BAF34]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xl font-black text-white block leading-none">
                    {overviewData.remindersCount ?? reminders.filter((r) => r.enabled).length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Reminders Set</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplement Goals */}
          <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Supplement Goals</h3>
            </div>

            {goalsList.length === 0 ? (
              <p className="text-xs text-slate-400">No supplement goals configured.</p>
            ) : (
              <div className="space-y-3.5">
                {goalsList.map((goal) => (
                  <div key={goal.title || goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{goal.title}</span>
                      <span className="font-bold text-white">{goal.percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#162230] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2BAF34] shadow-glow-subtle transition-all duration-500"
                        style={{ width: `${goal.percentage}%`, backgroundColor: goal.color || '#2BAF34' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supplement Reminders */}
          <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Supplement Reminders</h3>
              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[#2BAF34] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {reminders.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#121B26] text-center text-xs text-slate-400">
                No reminders scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#121B26] border border-[#1E2D42] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#121B26] p-1 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-[#2BAF34]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{rem.name}</h4>
                        <p className="text-[10px] text-slate-400">
                          {rem.dose} • <span className="text-[#2BAF34]">{rem.time}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => toggleReminder(rem.id)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                          rem.enabled ? 'bg-[#2BAF34]' : 'bg-[#1E293B]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                            rem.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Articles & Tips */}
          <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Articles & Tips</h3>
            </div>

            <div className="space-y-3">
              {articlesList.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleModal(art)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#121B26] cursor-pointer group transition-colors border border-transparent hover:border-[#1E2D42]"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#121B26] p-0.5 flex-shrink-0 border border-[#1E2D42] overflow-hidden flex items-center justify-center">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#2BAF34] transition-colors leading-snug line-clamp-1">
                      {art.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{art.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                      <span>{art.date}</span>
                      {art.readTime && <span>• {art.readTime}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Supplement Modal */}
      <AddSupplementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddSupplement={handleAddSupplement}
        editItem={editingStackItem}
        onUpdateSupplement={handleUpdateSupplement}
      />

      {/* Delete Confirmation Modal */}
      {deletingStackItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-sm font-bold text-white">Delete Supplement?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <span className="font-bold text-white">{deletingStackItem.name}</span> from your personal stack?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#162230]">
              <button
                onClick={() => setDeletingStackItem(null)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStackItem}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162230]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2BAF34]" />
                <h3 className="text-sm font-bold text-white">Set Supplement Reminder</h3>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reminder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creatine Post-Workout"
                  value={newReminderData.name}
                  onChange={(e) => setNewReminderData({ ...newReminderData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white focus:outline-none focus:border-[#2BAF34]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dose</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5g (1 Scoop)"
                    value={newReminderData.dose}
                    onChange={(e) => setNewReminderData({ ...newReminderData, dose: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white focus:outline-none focus:border-[#2BAF34]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 AM"
                    value={newReminderData.time}
                    onChange={(e) => setNewReminderData({ ...newReminderData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090D16] border border-[#1E2D42] rounded-xl text-white focus:outline-none focus:border-[#2BAF34]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#162230]">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black font-bold shadow-md cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProductModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-[#121B26] hover:bg-[#1E2D42] border border-[#1E2D42] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Badge & Brand */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2BAF34] bg-[#2BAF34]/15 border border-[#2BAF34]/30 px-2.5 py-1 rounded-md">
                {selectedProductModal.brand || 'FitNova'}
              </span>
              {selectedProductModal.badge && (
                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold ${selectedProductModal.badge.color}`}>
                  {selectedProductModal.badge.text}
                </span>
              )}
              {selectedProductModal.in_stock !== false ? (
                <span className="text-[10px] font-bold text-[#2BAF34] flex items-center gap-1 ml-auto mr-10">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#EF4444] flex items-center gap-1 ml-auto mr-10">
                  <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              )}
            </div>

            {/* Product Title & Rating */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {selectedProductModal.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  <Star className="w-4 h-4 fill-[#F59E0B]" />
                  <span className="font-bold text-white">{selectedProductModal.rating || '4.8'}</span>
                </div>
                <span>•</span>
                <span>{selectedProductModal.reviewsCount || selectedProductModal.reviews_count || '120+'} customer reviews</span>
              </div>
            </div>

            {/* Product Image & Pricing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center bg-[#121B26] border border-[#1E2D42] rounded-2xl p-5">
              <div className="w-full h-44 flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={selectedProductModal.image}
                  alt={selectedProductModal.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-xl"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Price</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-white">
                      ₹{Number(selectedProductModal.price || 0).toLocaleString('en-IN')}
                    </span>
                    {selectedProductModal.originalPrice && Number(selectedProductModal.originalPrice) > Number(selectedProductModal.price) && (
                      <span className="text-sm text-slate-500 line-through">
                        ₹{Number(selectedProductModal.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                    {(selectedProductModal.discount_percent > 0 || selectedProductModal.discountPercent > 0) && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#EF4444]/20 text-[#EF4444] font-extrabold border border-[#EF4444]/30">
                        Save {selectedProductModal.discount_percent || selectedProductModal.discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2BAF34]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-semibold">100% Authentic & Lab Tested</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Complies with FSSAI & GMP standards. Free shipping on orders over ₹999.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedProductModal.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedProductModal.description}
                </p>
              </div>
            )}

            {/* Key Benefits */}
            {selectedProductModal.benefits && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Benefits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProductModal.benefits.split('\n').filter(Boolean).map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-[#121B26] p-2.5 rounded-xl border border-[#1E2D42]">
                      <Check className="w-4 h-4 text-[#2BAF34] flex-shrink-0 mt-0.5" />
                      <span>{benefit.replace(/^[-•*]\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-[#1E2D42] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => toggleWishlist(selectedProductModal.id)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#1E2D42] hover:border-red-500/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlistProductIds.includes(selectedProductModal.id) ? 'text-red-500 fill-red-500' : ''
                  }`}
                />
                <span className="text-xs font-semibold">
                  {wishlistProductIds.includes(selectedProductModal.id) ? 'Saved' : 'Wishlist'}
                </span>
              </button>

              <button
                onClick={() => {
                  const prod = selectedProductModal;
                  setSelectedProductModal(null);
                  handleOpenModal({
                    name: prod.name,
                    category: prod.category || prod.category_slug || 'Protein',
                    dosage: '1 Scoop (30g)',
                    timing: 'Post Workout',
                    status: 'Active',
                    product: prod.id,
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#121B26] hover:bg-[#1E2D42] border border-[#2BAF34]/50 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-[#2BAF34]" />
                <span>Add to My Stack</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#121B26] border border-[#1E2D42] rounded-xl px-2 py-1">
                  <button
                    onClick={() => setModalCartQty((q) => Math.max(1, q - 1))}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-white px-2.5 min-w-[24px] text-center">
                    {modalCartQty}
                  </span>
                  <button
                    onClick={() => setModalCartQty((q) => q + 1)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    for (let i = 0; i < modalCartQty; i++) {
                      addToCart(selectedProductModal);
                    }
                    setSelectedProductModal(null);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black font-extrabold text-xs shadow-lg shadow-[#2BAF34]/25 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart (₹{(Number(selectedProductModal.price || 0) * modalCartQty).toLocaleString('en-IN')})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Detail / Reader Modal */}
      {selectedArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedArticleModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-[#121B26] hover:bg-[#1E2D42] border border-[#1E2D42] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedArticleModal.image && (
              <div className="w-full h-56 rounded-2xl overflow-hidden border border-[#1E2D42] bg-[#121B26]">
                <img
                  src={selectedArticleModal.image}
                  alt={selectedArticleModal.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-[#2BAF34]/15 border border-[#2BAF34]/30 text-[#2BAF34] font-bold">
                {selectedArticleModal.category || 'Guide'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedArticleModal.readTime || '4 min read'}
              </span>
              {selectedArticleModal.date && (
                <>
                  <span>•</span>
                  <span>{selectedArticleModal.date}</span>
                </>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {selectedArticleModal.title}
              </h2>
              {selectedArticleModal.subtitle && (
                <p className="text-sm text-slate-400 mt-1">{selectedArticleModal.subtitle}</p>
              )}
            </div>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 pt-3 border-t border-[#1E2D42] whitespace-pre-line">
              {selectedArticleModal.content || 'Detailed guide coming soon.'}
            </div>

            <div className="pt-3 border-t border-[#1E2D42] flex justify-end">
              <button
                onClick={() => setSelectedArticleModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#121B26] hover:bg-[#1E2D42] border border-[#1E2D42] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer / Slide-Over Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#090D16] border-l border-[#162230] z-50 flex flex-col h-full shadow-2xl p-6 overflow-hidden animate-slide-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#162230]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2BAF34]/15 border border-[#2BAF34]/30 flex items-center justify-center text-[#2BAF34]">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your Cart</h3>
                  <p className="text-[11px] text-slate-400">
                    {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in your bag
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#121B26] transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-thin">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#121B26] border border-[#1E2D42] flex items-center justify-center text-slate-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Your cart is empty</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      Add products from featured supplements to build your stack!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      document.getElementById('featured-supplements')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black font-bold text-xs shadow-md shadow-[#2BAF34]/20 transition-all cursor-pointer"
                  >
                    Browse Supplements
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0D141C] border border-[#162230] rounded-xl p-3 flex items-center gap-3 group hover:border-[#2BAF34]/30 transition-all"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-[#121B26] p-1 flex-shrink-0 border border-[#1E2D42] flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                        {item.brand}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate leading-tight">{item.name}</h4>
                      <p className="text-xs font-black text-[#2BAF34] mt-1">
                        ₹{Number(item.price || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-[#121B26] border border-[#1E2D42] rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[14px] text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-[#162230] space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery</span>
                    <span className="text-[#2BAF34] font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#162230]">
                    <span>Total Amount</span>
                    <span className="text-[#2BAF34]">₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={clearCart}
                    className="py-2.5 px-3 rounded-xl border border-[#1E2D42] text-slate-400 hover:text-white hover:bg-[#121B26] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => {
                      clearCart();
                      setIsCartOpen(false);
                      showToast('🎉 Order placed successfully! Thank you for ordering.');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#2BAF34] hover:bg-[#35D440] text-black font-extrabold text-xs shadow-lg shadow-[#2BAF34]/25 transition-all duration-200 active:scale-95 cursor-pointer text-center"
                  >
                    Proceed to Checkout (₹{cartSubtotal.toLocaleString()})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
