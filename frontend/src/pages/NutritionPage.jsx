import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  BicepsFlexed,
  Wheat,
  Droplet,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Sun,
  Coffee,
  Moon,
  GlassWater,
  ExternalLink,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X
} from 'lucide-react';
import MacrosDonut from '../components/MacrosDonut';
import AddMealModal from '../components/AddMealModal';

export default function NutritionPage({ onNavigateToPremium }) {
  const dates = ['08 June 2025', '09 June 2025', '10 June 2025', '11 June 2025', '12 June 2025'];
  const [dateIndex, setDateIndex] = useState(2); // '10 June 2025'
  const [activeTab, setActiveTab] = useState('Food Diary');
  const [activeTimeRange, setActiveTimeRange] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [waterCupsFilled, setWaterCupsFilled] = useState(5); // 5 of 8 = 2.6L
  const [toastMessage, setToastMessage] = useState(null);
  const [activeItemMenu, setActiveItemMenu] = useState(null);
  const [showMacroDetails, setShowMacroDetails] = useState(false);
  const [showNutrientDetails, setShowNutrientDetails] = useState(false);

  const topMenuRef = useRef(null);
  const filterMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (topMenuRef.current && !topMenuRef.current.contains(e.target)) {
        setShowTopMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Collapsible meal groups state
  const [collapsedMeals, setCollapsedMeals] = useState({});

  const toggleMealCollapse = (category) => {
    setCollapsedMeals((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrevDate = () => {
    if (dateIndex > 0) setDateIndex(dateIndex - 1);
  };

  const handleNextDate = () => {
    if (dateIndex < dates.length - 1) setDateIndex(dateIndex + 1);
  };

  // Initial meal data exactly from design
  const [meals, setMeals] = useState({
    Breakfast: {
      time: '08:00 AM',
      icon: Sun,
      iconColor: 'text-amber-400',
      items: [
        {
          id: 'b1',
          name: '3 Whole Eggs',
          qty: '1 serving',
          calories: 210,
          protein: 18,
          carbs: 1,
          fats: 15,
          image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'b2',
          name: 'Oats',
          qty: '50 g',
          calories: 190,
          protein: 6,
          carbs: 33,
          fats: 4,
          image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'b3',
          name: 'Banana',
          qty: '1 medium',
          calories: 105,
          protein: 1,
          carbs: 27,
          fats: 0,
          image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'b4',
          name: 'Black Coffee',
          qty: '1 cup',
          calories: 5,
          protein: 0,
          carbs: 1,
          fats: 0,
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=100&h=100&q=80'
        }
      ]
    },
    Lunch: {
      time: '01:00 PM',
      icon: Sun,
      iconColor: 'text-amber-500',
      items: [
        {
          id: 'l1',
          name: 'Grilled Chicken',
          qty: '150 g',
          calories: 248,
          protein: 46,
          carbs: 0,
          fats: 5,
          image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'l2',
          name: 'Brown Rice',
          qty: '200 g',
          calories: 220,
          protein: 5,
          carbs: 45,
          fats: 2,
          image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'l3',
          name: 'Mixed Vegetables',
          qty: '1 cup',
          calories: 80,
          protein: 3,
          carbs: 12,
          fats: 2,
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'l4',
          name: 'Olive Oil (cooking)',
          qty: '1 tbsp',
          calories: 120,
          protein: 0,
          carbs: 0,
          fats: 14,
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=100&h=100&q=80'
        }
      ]
    },
    'Evening Snack': {
      time: '05:30 PM',
      icon: Coffee,
      iconColor: 'text-amber-300',
      items: [
        {
          id: 'e1',
          name: 'Whey Protein Shake',
          qty: '1 scoop',
          calories: 120,
          protein: 24,
          carbs: 3,
          fats: 1,
          image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'e2',
          name: 'Apple',
          qty: '1 medium',
          calories: 95,
          protein: 0,
          carbs: 25,
          fats: 0,
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'e3',
          name: 'Almonds',
          qty: '10 pieces',
          calories: 70,
          protein: 3,
          carbs: 3,
          fats: 6,
          image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=100&h=100&q=80'
        }
      ]
    },
    Dinner: {
      time: '08:00 PM',
      icon: Moon,
      iconColor: 'text-purple-400',
      items: [
        {
          id: 'd1',
          name: 'Paneer Stir Fry',
          qty: '150 g',
          calories: 265,
          protein: 28,
          carbs: 8,
          fats: 14,
          image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'd2',
          name: 'Roti (Whole Wheat)',
          qty: '2 medium',
          calories: 160,
          protein: 6,
          carbs: 30,
          fats: 2,
          image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=100&h=100&q=80'
        },
        {
          id: 'd3',
          name: 'Salad',
          qty: '1 bowl',
          calories: 50,
          protein: 2,
          carbs: 8,
          fats: 1,
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&h=100&q=80'
        }
      ]
    }
  });

  const handleAddMealItem = ({ mealCategory, food }) => {
    setMeals((prev) => {
      const category = prev[mealCategory] ? mealCategory : 'Breakfast';
      return {
        ...prev,
        [category]: {
          ...prev[category],
          items: [
            ...prev[category].items,
            {
              id: Date.now().toString(),
              ...food
            }
          ]
        }
      };
    });
    showToast(`Added ${food.name} to ${mealCategory}!`);
  };

  const handleDeleteItem = (category, itemId, itemName) => {
    setMeals((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        items: prev[category].items.filter((item) => item.id !== itemId)
      }
    }));
    setActiveItemMenu(null);
    showToast(`Removed ${itemName}`);
  };

  const handleQuickAdd = (preset) => {
    handleAddMealItem({
      mealCategory: 'Evening Snack',
      food: preset
    });
  };

  // Compute live totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  Object.values(meals).forEach((category) => {
    category.items.forEach((item) => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFats += item.fats;
    });
  });

  const quickAddFoods = [
    {
      name: 'Banana',
      calories: 105,
      protein: 1,
      carbs: 27,
      fats: 0,
      qty: '1 medium',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=100&h=100&q=80'
    },
    {
      name: 'Apple',
      calories: 95,
      protein: 0,
      carbs: 25,
      fats: 0,
      qty: '1 medium',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=100&h=100&q=80'
    },
    {
      name: 'Peanut Butter',
      calories: 190,
      protein: 8,
      carbs: 7,
      fats: 16,
      qty: '2 tbsp',
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=100&h=100&q=80'
    },
    {
      name: 'Whey Protein',
      calories: 120,
      protein: 24,
      carbs: 3,
      fats: 1,
      qty: '1 scoop',
      image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=100&h=100&q=80'
    },
    {
      name: 'Oats',
      calories: 150,
      protein: 5,
      carbs: 27,
      fats: 3,
      qty: '40 g',
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=100&h=100&q=80'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#0D141C] border border-emerald-500/50 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fade-in glow-emerald max-w-[calc(100vw-32px)]">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span>Nutrition</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live
            </span>
          </h1>
          <p className="page-subtitle">
            Track your daily nutrition and hit your goals
          </p>
        </div>

        {/* Date Selector & Action Buttons - Responsive without orphan icons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Interactive Date Picker Bar */}
          <div className="flex items-center justify-between bg-[#0D141C] border border-[#1E2D42] rounded-xl p-1 shadow-sm flex-1 sm:flex-initial min-w-[180px]">
            <button
              onClick={handlePrevDate}
              disabled={dateIndex === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121B26] disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 text-xs font-semibold text-slate-200 select-none">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dates[dateIndex]}</span>
              <ChevronRight className="w-3 h-3 text-slate-500 rotate-90" />
            </div>
            <button
              onClick={handleNextDate}
              disabled={dateIndex === dates.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121B26] disabled:opacity-30 transition-colors cursor-pointer"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Add Meal Button */}
            <button
              onClick={() => setIsAddMealOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(43, 175, 52,0.3)] active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Meal</span>
            </button>

            {/* More options menu */}
            <div className="relative" ref={topMenuRef}>
              <button
                onClick={() => setShowTopMenu(!showTopMenu)}
                className="p-2 rounded-xl bg-[#0D141C] border border-[#1E2D42] text-slate-400 hover:text-white hover:bg-[#121B26] transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showTopMenu && (
                <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-32px)] bg-[#0D141C] border border-[#1E2D42] rounded-2xl shadow-2xl p-1.5 z-50 text-xs animate-fade-in">
                  <button
                    onClick={() => {
                      setIsAddMealOpen(true);
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#121B26] text-slate-200 font-medium cursor-pointer"
                  >
                    Log Custom Food
                  </button>
                  <button
                    onClick={() => {
                      setWaterCupsFilled(8);
                      showToast("Hydration completed (4.0L)!");
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#121B26] text-cyan-400 font-medium cursor-pointer"
                  >
                    Quick Fill Water (4L)
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToPremium();
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#121B26] text-emerald-400 font-medium cursor-pointer flex items-center justify-between"
                  >
                    <span>Export Macro Report</span>
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Daily Target KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Calories Card */}
        <div className="bg-[#0D141C] border border-[#1E2D42] hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-105 transition-transform shrink-0">
                <Flame className="w-5 h-5 fill-orange-500/20" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Calories</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{totalCalories}</span>
                  <span className="text-xs text-slate-400">/ 2200 kcal</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {Math.round((totalCalories / 2200) * 100)}%
            </span>
          </div>
          <div className="mt-3.5 sm:mt-4">
            <div className="w-full h-2 bg-[#121B26] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 shadow-[0_0_8px_#2BAF34]"
                style={{ width: `${Math.min(100, Math.round((totalCalories / 2200) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
              <span>{Math.round((totalCalories / 2200) * 100)}% of daily goal</span>
              <span className="text-slate-500">220 kcal left</span>
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-[#0D141C] border border-[#1E2D42] hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                <BicepsFlexed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Protein</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{totalProtein}</span>
                  <span className="text-xs text-slate-400">/ 150 g</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {Math.round((totalProtein / 150) * 100)}%
            </span>
          </div>
          <div className="mt-3.5 sm:mt-4">
            <div className="w-full h-2 bg-[#121B26] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700 shadow-[0_0_8px_#F59E0B]"
                style={{ width: `${Math.min(100, Math.round((totalProtein / 150) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
              <span>{Math.round((totalProtein / 150) * 100)}% of daily goal</span>
              <span className="text-slate-500">8g left</span>
            </div>
          </div>
        </div>

        {/* Carbs Card */}
        <div className="bg-[#0D141C] border border-[#1E2D42] hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Carbs</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{totalCarbs}</span>
                  <span className="text-xs text-slate-400">/ 275 g</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {Math.round((totalCarbs / 275) * 100)}%
            </span>
          </div>
          <div className="mt-3.5 sm:mt-4">
            <div className="w-full h-2 bg-[#121B26] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-700 shadow-[0_0_8px_#06B6D4]"
                style={{ width: `${Math.min(100, Math.round((totalCarbs / 275) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
              <span>{Math.round((totalCarbs / 275) * 100)}% of daily goal</span>
              <span className="text-slate-500">52g left</span>
            </div>
          </div>
        </div>

        {/* Fats Card */}
        <div className="bg-[#0D141C] border border-[#1E2D42] hover:border-purple-500/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-all shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                <Droplet className="w-5 h-5 fill-purple-500/20" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Fats</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{totalFats}</span>
                  <span className="text-xs text-slate-400">/ 70 g</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              {Math.round((totalFats / 70) * 100)}%
            </span>
          </div>
          <div className="mt-3.5 sm:mt-4">
            <div className="w-full h-2 bg-[#121B26] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full transition-all duration-700 shadow-[0_0_8px_#A78BFA]"
                style={{ width: `${Math.min(100, Math.round((totalFats / 70) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
              <span>{Math.round((totalFats / 70) * 100)}% of daily goal</span>
              <span className="text-slate-500">13g left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Food Diary on Left & Widgets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Section (Cols 1 to 8): Food Diary */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub Navigation Bar & Search/Filter Controls */}
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['Food Diary', 'Nutrients', 'Meal Plan', 'Recipe Ideas'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_12px_rgba(43, 175, 52,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121B26]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search, Filter, Time Range */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Search */}
              <div className="relative flex-1 sm:w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search food, meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Filter */}
              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-colors border cursor-pointer ${
                    filterType !== 'All'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-[#0B111A] border-[#1E2D42] text-slate-300 hover:text-white hover:bg-[#121B26]'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  <span>{filterType === 'All' ? 'Filter' : filterType}</span>
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-36 max-w-[calc(100vw-32px)] bg-[#0D141C] border border-[#1E2D42] rounded-2xl shadow-xl p-1 z-50 text-xs animate-fade-in">
                    {['All', 'High Protein', 'Low Carb'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setFilterType(type);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                          filterType === type
                            ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                            : 'text-slate-300 hover:bg-[#121B26]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Range Toggle: Today | Week | Month */}
              <div className="flex items-center bg-[#0B111A] border border-[#1E2D42] p-0.5 rounded-xl text-xs">
                {['Today', 'Week', 'Month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setActiveTimeRange(range)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeTimeRange === range
                        ? 'bg-emerald-400 text-black font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Meals Container */}
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-3.5 sm:p-5 space-y-5 sm:space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2D42]/60">
              <h2 className="text-base font-extrabold text-white tracking-tight">Today's Meals</h2>
              <span className="text-xs text-slate-400 font-medium">
                {Object.values(meals).reduce((acc, cat) => acc + cat.items.length, 0)} logged items
              </span>
            </div>

            {/* Render Each Meal Group */}
            {Object.entries(meals).map(([category, data]) => {
              const Icon = data.icon;
              const isCollapsed = collapsedMeals[category];
              let filteredItems = data.items.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filterType === 'High Protein') {
                filteredItems = filteredItems.filter((item) => item.protein >= 15);
              } else if (filterType === 'Low Carb') {
                filteredItems = filteredItems.filter((item) => item.carbs <= 10);
              }

              return (
                <div key={category} className="space-y-2.5 sm:space-y-3 bg-[#0B111A]/60 p-3 sm:p-4 rounded-2xl border border-[#1E2D42]/50">
                  {/* Category Header */}
                  <div
                    onClick={() => toggleMealCollapse(category)}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-xl bg-[#121B26] ${data.iconColor} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{data.time}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Desktop column headers */}
                      <div className="hidden md:flex items-center text-[11px] font-semibold text-slate-400 gap-6 pr-4">
                        <span className="w-16 text-right">Qty</span>
                        <span className="w-16 text-right">Calories</span>
                        <span className="w-14 text-right">Protein</span>
                        <span className="w-14 text-right">Carbs</span>
                        <span className="w-14 text-right">Fats</span>
                      </div>
                      <div className="text-slate-400 group-hover:text-white transition-colors p-1">
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Food Items Rows - Responsive Clean Layout (NO Staircase Wrapping!) */}
                  {!isCollapsed && (
                    <div className="space-y-2 pt-2 border-t border-[#1E2D42]/40">
                      {filteredItems.length === 0 ? (
                        <div className="text-center py-3 text-xs text-slate-500 italic">
                          No food items match filter
                        </div>
                      ) : (
                        filteredItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-[#0D141C]/70 hover:bg-[#121B26] transition-colors border border-transparent hover:border-[#1E2D42] group relative space-y-2 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4"
                          >
                            {/* Top row on mobile / Left section on desktop */}
                            <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#1E2D42] shadow-sm group-hover:scale-105 transition-transform shrink-0"
                                />
                                <span className="text-xs font-bold text-white tracking-wide">
                                  {item.name}
                                </span>
                              </div>

                              {/* Mobile-only action button */}
                              <div className="md:hidden relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveItemMenu(activeItemMenu === item.id ? null : item.id);
                                  }}
                                  className="text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-[#121B26]"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                                {activeItemMenu === item.id && (
                                  <div className="absolute right-0 mt-1 w-28 bg-[#0D141C] border border-[#1E2D42] rounded-xl shadow-2xl p-1 z-50 text-xs animate-fade-in">
                                    <button
                                      onClick={() => handleDeleteItem(category, item.id, item.name)}
                                      className="w-full text-left px-2 py-1 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 font-medium"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Bottom row on mobile / Columns on desktop: All fitting cleanly on 1 line! */}
                            <div className="flex items-center justify-between md:justify-end text-xs gap-2 md:gap-6 w-full md:w-auto pt-1.5 md:pt-0 border-t border-[#1E2D42]/30 md:border-t-0">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-[11px]">{item.qty}</span>
                                <span className="text-slate-600 hidden sm:inline">•</span>
                                <span className="font-extrabold text-white text-xs">
                                  {item.calories} <span className="text-[10px] text-slate-400 font-normal">kcal</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] border border-emerald-500/20 whitespace-nowrap">
                                  {item.protein}g P
                                </span>
                                <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] border border-cyan-500/20 whitespace-nowrap">
                                  {item.carbs}g C
                                </span>
                                <span className="text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] border border-purple-500/20 whitespace-nowrap">
                                  {item.fats}g F
                                </span>

                                {/* Desktop-only action button */}
                                <div className="hidden md:block relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveItemMenu(activeItemMenu === item.id ? null : item.id);
                                    }}
                                    className="text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-[#121B26] transition-colors cursor-pointer"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>

                                  {activeItemMenu === item.id && (
                                    <div className="absolute right-0 mt-1 w-32 bg-[#0D141C] border border-[#1E2D42] rounded-xl shadow-2xl p-1 z-50 text-xs animate-fade-in">
                                      <button
                                        onClick={() => handleDeleteItem(category, item.id, item.name)}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer font-medium"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>Delete item</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Total Bottom Bar */}
            <div className="pt-4 border-t border-[#1E2D42] flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-[#0B111A] via-[#121B26] to-[#0B111A] p-3.5 sm:p-4 rounded-2xl border border-[#1E2D42]">
              <span className="text-xs font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>TOTAL</span>
              </span>
              <div className="flex items-center gap-3 sm:gap-5 text-xs font-bold flex-wrap">
                <span className="text-white text-sm font-extrabold">{totalCalories} kcal</span>
                <span className="text-emerald-400 font-bold">P: {totalProtein}g</span>
                <span className="text-cyan-400 font-bold">C: {totalCarbs}g</span>
                <span className="text-purple-400 font-bold">F: {totalFats}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section (Cols 9 to 12): Widgets Stack */}
        <div className="lg:col-span-4 space-y-5">
          {/* Widget 1: Macros Overview */}
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-5 space-y-4 shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">Macros Overview</h3>
              <button
                onClick={() => setShowMacroDetails(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Donut Chart */}
            <div className="py-2">
              <MacrosDonut
                calories={totalCalories}
                proteinPct={29}
                carbsPct={37}
                fatsPct={24}
              />
            </div>

            {/* Legend with mini progress bars */}
            <div className="space-y-2.5 pt-3 border-t border-[#1E2D42] text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#2BAF34]" />
                    <span className="text-slate-300 font-medium">Protein</span>
                  </div>
                  <span className="text-slate-300 font-bold">29% <span className="text-slate-500 font-normal">({totalProtein}g)</span></span>
                </div>
                <div className="w-full h-1 bg-[#121B26] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[29%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
                    <span className="text-slate-300 font-medium">Carbs</span>
                  </div>
                  <span className="text-slate-300 font-bold">37% <span className="text-slate-500 font-normal">({totalCarbs}g)</span></span>
                </div>
                <div className="w-full h-1 bg-[#121B26] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[37%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#A78BFA]" />
                    <span className="text-slate-300 font-medium">Fats</span>
                  </div>
                  <span className="text-slate-300 font-bold">24% <span className="text-slate-500 font-normal">({totalFats}g)</span></span>
                </div>
                <div className="w-full h-1 bg-[#121B26] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full w-[24%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Nutrient Breakdown */}
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-5 space-y-4 shadow-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">Nutrient Breakdown</h3>
              <button
                onClick={() => setShowNutrientDetails(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Fiber */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Fiber</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">18g / 30g</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">60%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#121B26] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[60%]" />
                </div>
              </div>

              {/* Sugar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Sugar</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">28g / 50g</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">56%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#121B26] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[56%]" />
                </div>
              </div>

              {/* Sodium */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Sodium</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">1800mg / 2300mg</span>
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded">78%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#121B26] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[78%]" />
                </div>
              </div>

              {/* Cholesterol */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Cholesterol</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">220mg / 300mg</span>
                    <span className="text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.2 rounded">73%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#121B26] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[73%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Water Intake */}
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-5 space-y-4 shadow-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white">Water Intake</h3>
                <p className="text-[10px] text-slate-400">Target: 4.0 Liters</p>
              </div>
              <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                {(waterCupsFilled * 0.5).toFixed(1)} L / 4.0 L
              </span>
            </div>

            {/* 8 Water Glasses */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-1.5 py-1">
              {Array.from({ length: 8 }).map((_, index) => {
                const isFilled = index < waterCupsFilled;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setWaterCupsFilled(index + 1);
                      showToast(`Hydration set to ${((index + 1) * 0.5).toFixed(1)}L`);
                    }}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isFilled
                        ? 'bg-cyan-500/20 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:scale-105'
                        : 'bg-[#0B111A] border border-[#1E2D42] opacity-50 hover:opacity-100 hover:border-cyan-500/40'
                    }`}
                    title={`Glass ${index + 1} (${((index + 1) * 0.5).toFixed(1)} L)`}
                  >
                    <GlassWater
                      className={`w-4 h-4 ${isFilled ? 'text-cyan-300 fill-cyan-400/40' : 'text-slate-500'}`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Add Water Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  if (waterCupsFilled < 8) {
                    setWaterCupsFilled((prev) => prev + 1);
                    showToast(`+0.5L Water added! (${((waterCupsFilled + 1) * 0.5).toFixed(1)}L total)`);
                  } else {
                    showToast("Daily water goal achieved! 💧");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Glass (+250ml)</span>
              </button>

              <button
                onClick={() => {
                  setWaterCupsFilled(8);
                  showToast("Hydration goal maxed! 💧");
                }}
                className="px-3 py-2.5 rounded-xl bg-[#0B111A] border border-[#1E2D42] hover:bg-[#121B26] text-slate-300 text-xs font-semibold cursor-pointer"
                title="Fill to 4L"
              >
                Max
              </button>
            </div>
          </div>

          {/* Widget 4: Quick Add Food */}
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-5 space-y-4 shadow-sm hover:border-emerald-500/30 transition-all">
            <h3 className="text-sm font-extrabold text-white">Quick Add Food</h3>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food to add..."
                className="w-full bg-[#0B111A] border border-[#1E2D42] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleQuickAdd({
                      name: e.target.value.trim(),
                      calories: 120,
                      protein: 8,
                      carbs: 15,
                      fats: 2,
                      qty: '1 serving',
                      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100&h=100&q=80'
                    });
                    e.target.value = '';
                  }
                }}
              />
            </div>

            {/* Food items row */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1">
              {quickAddFoods.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAdd(item)}
                  className="flex flex-col items-center p-2 rounded-2xl bg-[#0B111A] hover:bg-[#121B26] hover:-translate-y-1 active:scale-95 border border-[#1E2D42] hover:border-emerald-500/40 transition-all min-w-[58px] group cursor-pointer shadow-sm"
                  title={`Click to add ${item.name}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 rounded-full object-cover mb-1.5 group-hover:scale-110 transition-transform ring-1 ring-emerald-500/30"
                  />
                  <span className="text-[10px] text-slate-300 font-semibold truncate max-w-[54px]">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        onAddMeal={handleAddMealItem}
      />

      {/* Macro Details Modal */}
      {showMacroDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D141C] border border-[#1E2D42] w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2D42] mb-4">
              <h3 className="text-base font-bold text-white">Macronutrient Breakdown</h3>
              <button
                onClick={() => setShowMacroDetails(false)}
                className="p-1 rounded-lg hover:bg-[#121B26] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#0B111A] border border-[#1E2D42] flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold block">Protein</span>
                  <span className="text-[11px] text-slate-400">4 kcal per gram</span>
                </div>
                <span className="text-white font-extrabold text-sm">{totalProtein}g <span className="text-slate-400 text-xs font-normal">/ 150g</span></span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0B111A] border border-[#1E2D42] flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold block">Carbohydrates</span>
                  <span className="text-[11px] text-slate-400">4 kcal per gram</span>
                </div>
                <span className="text-white font-extrabold text-sm">{totalCarbs}g <span className="text-slate-400 text-xs font-normal">/ 275g</span></span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0B111A] border border-[#1E2D42] flex items-center justify-between">
                <div>
                  <span className="text-purple-400 font-bold block">Dietary Fats</span>
                  <span className="text-[11px] text-slate-400">9 kcal per gram</span>
                </div>
                <span className="text-white font-extrabold text-sm">{totalFats}g <span className="text-slate-400 text-xs font-normal">/ 70g</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrient Details Modal */}
      {showNutrientDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D141C] border border-[#1E2D42] w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2D42] mb-4">
              <h3 className="text-base font-bold text-white">Micronutrients & Minerals</h3>
              <button
                onClick={() => setShowNutrientDetails(false)}
                className="p-1 rounded-lg hover:bg-[#121B26] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-2.5 rounded-xl bg-[#0B111A] border border-[#1E2D42]">
                <span className="text-slate-300 font-medium">Dietary Fiber</span>
                <span className="text-emerald-400 font-bold">18g (60% DV)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#0B111A] border border-[#1E2D42]">
                <span className="text-slate-300 font-medium">Added Sugars</span>
                <span className="text-emerald-400 font-bold">28g (56% Max)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#0B111A] border border-[#1E2D42]">
                <span className="text-slate-300 font-medium">Sodium</span>
                <span className="text-amber-400 font-bold">1800mg (78% Max)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#0B111A] border border-[#1E2D42]">
                <span className="text-slate-300 font-medium">Cholesterol</span>
                <span className="text-cyan-400 font-bold">220mg (73% Max)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
