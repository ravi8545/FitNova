import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  ChevronDown,
  Flame,
  Dumbbell,
  Droplets,
  Award,
  CheckCircle2,
  AlertCircle,
  Moon,
  Utensils,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Check,
  RefreshCw,
  Activity,
  Layers,
} from 'lucide-react';
import {
  REPORT_TABS,
  TIME_PERIODS,
} from '../services/reportsData';
import {
  fetchAnalyticsReport,
  resolveImprovement,
  getDemoReportsDataset,
} from '../services/reportsApi';
import InteractiveBarChart from '../components/charts/InteractiveBarChart';
import MacronutrientDonut from '../components/charts/MacronutrientDonut';
import WeightProgressChart from '../components/charts/WeightProgressChart';
import BodyCompositionChart from '../components/charts/BodyCompositionChart';
import Sparkline from '../components/charts/Sparkline';
import heroBg from '../assets/images/reports-hero.svg';
import { useAppNav } from '../context/NavContext';

export default function ReportsPage() {
  const navigate = useAppNav();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedDateRange, setSelectedDateRange] = useState('Loading date range...');
  const [summaryFilter, setSummaryFilter] = useState('This Week');

  // API Status: 'loading' | 'live' | 'demo' | 'error'
  const [apiStatus, setApiStatus] = useState('loading');
  const [apiError, setApiError] = useState(null);

  // Report metrics state (starts empty, populated strictly by API)
  const [kpiMetrics, setKpiMetrics] = useState([]);
  const [calorieData, setCalorieData] = useState([]);
  const [macroData, setMacroData] = useState({
    totalCalories: '0',
    items: [
      { name: 'Carbohydrates', percentage: 0, amount: '0g', color: '#2BAF34' },
      { name: 'Protein', percentage: 0, amount: '0g', color: '#F59E0B' },
      { name: 'Fats', percentage: 0, amount: '0g', color: '#3B82F6' },
    ],
  });
  const [weightProgress, setWeightProgress] = useState({ currentWeight: null, change: '0 kg', comparison: '', data: [] });
  const [bodyComposition, setBodyComposition] = useState([]);
  const [topPerformingDays, setTopPerformingDays] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [reportSummary, setReportSummary] = useState([]);
  const [reportGoals, setReportGoals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const applyReportData = (result) => {
    if (result.dateRange) setSelectedDateRange(result.dateRange);
    setAiInsight(result.aiInsight || null);
    setKpiMetrics(result.kpiMetrics || []);
    setCalorieData(result.calorieIntakeVsBurn || result.calorieData || []);
    setMacroData(result.macronutrientDistribution || result.macroData || {
      totalCalories: '0',
      items: [
        { name: 'Carbohydrates', percentage: 0, amount: '0g', color: '#2BAF34' },
        { name: 'Protein', percentage: 0, amount: '0g', color: '#F59E0B' },
        { name: 'Fats', percentage: 0, amount: '0g', color: '#3B82F6' },
      ],
    });
    setWeightProgress(result.weightProgress || { currentWeight: null, change: '0 kg', comparison: '', data: [] });
    setBodyComposition(result.bodyComposition || []);
    setTopPerformingDays(result.topPerformingDays || []);
    setImprovements(result.areasForImprovement || result.improvements || []);
    setReportSummary(result.reportSummary || result.summary || []);
    setReportGoals(result.reportGoals || result.goals || []);
    setRecentActivity(result.recentActivity || []);
  };

  // Fetch report data on mount and whenever selectedPeriod or activeTab changes
  const loadReport = useCallback(async () => {
    setApiStatus('loading');
    setApiError(null);
    const result = await fetchAnalyticsReport(selectedPeriod, activeTab);

    if (result.isLive) {
      setApiStatus('live');
      applyReportData(result);
    } else {
      setApiStatus('error');
      setApiError(result.error);
      applyReportData(result);
    }
  }, [selectedPeriod, activeTab]);

  useEffect(() => {
    let cancelled = false;
    loadReport();
    return () => {
      cancelled = true;
    };
  }, [loadReport]);

  const handleSwitchToDemo = () => {
    const demo = getDemoReportsDataset();
    setApiStatus('demo');
    setApiError(null);
    applyReportData(demo);
    showToast('Loaded demo dataset preview');
  };

  const handleResolveImprovement = async (id) => {
    const ok = await resolveImprovement(id);
    if (ok) {
      setImprovements((prev) => prev.filter((item) => item.id !== id));
      showToast('Area marked as resolved in backend!');
    } else {
      showToast('Could not resolve area on server.');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D141C] border border-[#2BAF34] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-[#2BAF34]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2BAF34] bg-[#2BAF34]/10 border border-[#2BAF34]/20 px-2 py-0.5 rounded-md inline-block">
              Analytics
            </span>

            {/* Live API Status Indicator */}
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
                Demo Preview Mode
              </span>
            )}
            {apiStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">
                <AlertCircle className="w-2.5 h-2.5" />
                API Error
              </span>
            )}
          </div>

          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            Get detailed insights into your fitness journey and track your progress over time.
          </p>
        </div>

        {/* Date Range & Duration Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Read-Only Date Range Pill */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D141C] border border-[#1E2D42] rounded-xl text-xs font-semibold text-white select-none">
            <Calendar className="w-3.5 h-3.5 text-[#2BAF34]" />
            <span>{selectedDateRange}</span>
          </div>

          {/* Duration Pills: 7D, 30D, 3M, 1Y */}
          <div className="flex items-center p-1 bg-[#0D141C] border border-[#162230] rounded-xl">
            {TIME_PERIODS.map((period) => {
              const isActive = selectedPeriod === period.id;
              return (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2BAF34] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              );
            })}
          </div>

          {/* Refresh / Retry Button */}
          <button
            onClick={loadReport}
            title="Refresh Data"
            className="p-2 bg-[#0D141C] border border-[#162230] rounded-xl text-slate-400 hover:text-white hover:border-[#2BAF34] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${apiStatus === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#162230]/70">
        {REPORT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#2BAF34] text-black font-bold shadow-md shadow-[#2BAF34]/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D141C]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* API Error Banner if failed */}
      {apiStatus === 'error' && (
        <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Could not reach Django Backend API</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">{apiError || 'Check that backend server is running on port 8000.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadReport}
              className="px-3 py-1.5 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Retry Connection
            </button>
            <button
              onClick={handleSwitchToDemo}
              className="px-3 py-1.5 bg-[#121B26] hover:bg-[#1E2D42] text-slate-300 font-semibold text-xs rounded-xl cursor-pointer border border-[#1E2D42]"
            >
              Preview Demo Dataset
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner with Motivational Glow */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1E2D42] bg-gradient-to-r from-[#090D16] via-[#0B111A] to-[#090D16] min-h-[140px] flex items-center p-6 shadow-xl">
        <div className="absolute inset-0 pointer-events-none opacity-85">
          <img
            src={heroBg}
            alt="Reports Hero Banner"
            className="w-full h-full object-cover object-right"
          />
        </div>

        <div className="relative z-10 max-w-md space-y-1">
          <div className="flex items-center gap-1.5 text-[#2BAF34] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiInsight?.title || 'AI Performance Insights'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {aiInsight?.headline || (apiStatus === 'live' && kpiMetrics.length > 0 ? 'Tracking Your Daily Consistency' : 'Log Daily Activity to Unlock Insights')}
          </h3>
          <p className="text-xs text-slate-300">
            {aiInsight?.description || 'Your analytics are computed directly from real health logs. Add daily nutrition, workouts, and water records to see complete metrics.'}
          </p>
        </div>
      </div>

      {/* KPI Metric Cards with Sparklines */}
      {kpiMetrics.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0D141C] border border-[#162230] text-center text-xs text-slate-400">
          No KPI metrics available for {activeTab}. Log your activity to generate performance metrics.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiMetrics.map((kpi) => {
            let IconComponent = Flame;
            let iconColor = 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';

            if (kpi.type === 'protein') {
              IconComponent = Dumbbell;
              iconColor = 'text-[#2BAF34] bg-[#2BAF34]/10 border-[#2BAF34]/20';
            } else if (kpi.type === 'water') {
              IconComponent = Droplets;
              iconColor = 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20';
            } else if (kpi.type === 'workouts') {
              IconComponent = Dumbbell;
              iconColor = 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20';
            } else if (kpi.type === 'sleep') {
              IconComponent = Moon;
              iconColor = 'text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/20';
            } else if (kpi.type === 'supplements') {
              IconComponent = Award;
              iconColor = 'text-[#2BAF34] bg-[#2BAF34]/10 border-[#2BAF34]/20';
            }

            return (
              <div
                key={kpi.id}
                className="bg-[#0D141C] border border-[#162230] rounded-2xl p-4 flex flex-col justify-between hover:border-[#2BAF34]/40 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">{kpi.title}</span>
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${iconColor}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1 mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {kpi.value}
                    </span>
                    {kpi.target && <span className="text-xs text-slate-400 font-medium">/ {kpi.target}</span>}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {kpi.change ? (
                      kpi.isPositive ? (
                        <span className="flex items-center text-[#2BAF34]">
                          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                          {kpi.change}
                        </span>
                      ) : (
                        <span className="flex items-center text-[#EF4444]">
                          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                          {kpi.change}
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium bg-[#121B26] px-1.5 py-0.5 rounded border border-[#1E2D42]">
                        {kpi.comparisonText || 'No prior data'}
                      </span>
                    )}
                    {kpi.change && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {kpi.comparisonText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Sparkline data={kpi.sparklineData || []} isPositive={kpi.isPositive} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Grid: Left Charts (8 cols) + Right Summary Panel (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left / Center Charts Section */}
        <div className="xl:col-span-8 space-y-6">
          {/* Top Charts Row: Calorie Intake vs Burn + Macronutrient Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveBarChart data={calorieData} title="Calorie Intake vs Burn" />
            <MacronutrientDonut distribution={macroData} />
          </div>

          {/* Bottom Charts Row: Weight Progress + Body Composition Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeightProgressChart weightData={weightProgress} />
            <BodyCompositionChart data={bodyComposition} />
          </div>

          {/* Bottom Highlight Cards Row: Top Performing Days + Areas for Improvement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Days */}
            <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Top Performing Days</h3>
                  <p className="text-[11px] text-slate-400">Your best days based on goals completion</p>
                </div>
                <button
                  onClick={() => navigate('calendar')}
                  className="text-xs font-semibold text-[#2BAF34] hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              {topPerformingDays.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#121B26] border border-[#1E2D42] text-center text-xs text-slate-400">
                  No workout or calorie logs recorded for this period.
                </div>
              ) : (
                <div className="space-y-3">
                  {topPerformingDays.map((day) => (
                    <div
                      key={day.date}
                      className="p-3 rounded-xl bg-[#121B26] border border-[#1E2D42] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#2BAF34]/15 border-2 border-[#2BAF34] flex items-center justify-center font-black text-xs text-[#2BAF34]">
                          {day.percentage}%
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{day.date}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-[#F59E0B]" />
                              {day.calories}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Dumbbell className="w-3 h-3 text-[#2BAF34]" />
                              {day.protein}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-slate-300 bg-[#162230] px-2 py-1 rounded-md border border-white/5">
                        {day.extra}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Areas for Improvement */}
            <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Areas for Improvement</h3>
                <button
                  onClick={() => navigate('progress')}
                  className="text-xs font-semibold text-[#2BAF34] hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              {improvements.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#121B26] border border-[#1E2D42] text-center text-xs text-slate-400">
                  Great job! No unresolved areas for improvement.
                </div>
              ) : (
                <div className="space-y-3">
                  {improvements.map((area) => {
                    let Icon = Droplets;
                    let iconColor = 'text-[#3B82F6] bg-[#3B82F6]/15';
                    if (area.icon === 'sleep') {
                      Icon = Moon;
                      iconColor = 'text-[#8B5CF6] bg-[#8B5CF6]/15';
                    } else if (area.icon === 'strength') {
                      Icon = Dumbbell;
                      iconColor = 'text-[#F59E0B] bg-[#F59E0B]/15';
                    }

                    return (
                      <div
                        key={area.id}
                        className="p-3 rounded-xl bg-[#121B26] border border-[#1E2D42] flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${iconColor}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{area.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                              {area.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleResolveImprovement(area.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#2BAF34]/15 hover:bg-[#2BAF34] text-[#2BAF34] hover:text-black font-bold text-[10px] transition-all cursor-pointer whitespace-nowrap"
                          title="Mark as resolved"
                        >
                          Resolve
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Panel */}
        <div className="xl:col-span-4 space-y-6">
          {/* Report Summary */}
          <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Report Summary</h3>
              <div className="relative">
                <select
                  value={summaryFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSummaryFilter(val);
                    if (val === 'This Month') setSelectedPeriod('30d');
                    else if (val === 'This Week' || val === 'Last Week') setSelectedPeriod('7d');
                  }}
                  className="bg-[#121B26] border border-[#1E2D42] text-xs text-slate-300 rounded-lg px-2.5 py-1.5 pr-6 appearance-none focus:outline-none focus:border-[#2BAF34] cursor-pointer"
                >
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {reportSummary.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#121B26] text-center text-xs text-slate-400">
                No summary metrics recorded for this period.
              </div>
            ) : (
              <div className="space-y-3">
                {reportSummary.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#121B26] border border-[#1E2D42]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#121B26] flex items-center justify-center text-slate-300">
                        {item.label.includes('Calories') && <Flame className="w-4 h-4 text-[#F59E0B]" />}
                        {item.label.includes('Protein') && <Dumbbell className="w-4 h-4 text-[#2BAF34]" />}
                        {item.label.includes('Water') && <Droplets className="w-4 h-4 text-[#3B82F6]" />}
                        {item.label.includes('Workouts') && <Award className="w-4 h-4 text-[#8B5CF6]" />}
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">{item.label}</span>
                        <span className="text-xs font-bold text-white">{item.value}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold flex items-center ${
                        item.positive ? 'text-[#2BAF34]' : 'text-[#EF4444]'
                      }`}
                    >
                      {item.positive ? '+' : ''}
                      {item.change}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal Progress */}
          <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Goal Progress</h3>
              <button
                onClick={() => navigate('goals')}
                className="text-xs font-semibold text-[#2BAF34] hover:underline cursor-pointer"
              >
                View Goals &rarr;
              </button>
            </div>

            {reportGoals.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#121B26] text-center text-xs text-slate-400">
                No goals configured.
              </div>
            ) : (
              <div className="space-y-4">
                {reportGoals.map((goal) => (
                  <div key={goal.title || goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{goal.title}</span>
                      <span className="text-slate-400 font-medium">
                        <span className="text-white font-bold">{goal.current}</span> / {goal.target}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-[#162230] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${goal.percentage}%`,
                            backgroundColor: goal.color || '#2BAF34',
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-8 text-right">
                        {goal.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0D141C] border border-[#162230] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <button
                onClick={() => navigate('dashboard')}
                className="text-xs font-semibold text-[#2BAF34] hover:underline cursor-pointer"
              >
                View All &rarr;
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#121B26] text-center text-xs text-slate-400">
                No recent activity recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((act) => {
                  let Icon = Dumbbell;
                  let iconColor = 'text-[#3B82F6] bg-[#3B82F6]/10';

                  if (act.icon === 'water') {
                    Icon = Droplets;
                    iconColor = 'text-[#06B6D4] bg-[#06B6D4]/10';
                  } else if (act.icon === 'food') {
                    Icon = Utensils;
                    iconColor = 'text-[#F59E0B] bg-[#F59E0B]/10';
                  }

                  return (
                    <div
                      key={act.title || act.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#121B26] border border-[#1E2D42]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{act.title}</h4>
                          <span className="text-[10px] text-slate-400">{act.meta}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{act.date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
