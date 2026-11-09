import React, { useState } from 'react';
import {
  Crown,
  ArrowRight,
  Play,
  Star,
  Check,
  X,
  TrendingUp,
  Moon,
  Trophy,
  Bot,
  Brain,
  BarChart3,
  UtensilsCrossed,
  Sparkles,
  User,
  Video,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function PremiumPage({ onNavigateToNutrition }) {
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeFeaturePreview, setActiveFeaturePreview] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual'); // 'annual' | 'monthly'

  const freeFeatures = [
    { text: 'Basic tracking (nutrition, workouts, water, sleep)', included: true },
    { text: 'Standard analytics', included: true },
    { text: 'Add meals manually', included: true },
    { text: 'Access to limited workout plans', included: true },
    { text: 'AI Coach', included: false },
    { text: 'Advanced analytics', included: false },
    { text: 'Personalized meal & workout plans', included: false },
    { text: 'Priority support', included: false },
  ];

  const premiumFeatures = [
    { text: 'Everything in Free', included: true },
    { text: 'AI-powered personal coach', included: true },
    { text: 'Personalized meal & workout plans', included: true },
    { text: 'Advanced progress analytics', included: true },
    { text: 'Custom goals and habit tracking', included: true },
    { text: 'Recipe suggestions & meal plans', included: true },
    { text: 'Sleep and recovery insights', included: true },
    { text: 'Priority support', included: true },
  ];

  const premiumPlusFeatures = [
    { text: 'Everything in Premium', included: true },
    { text: 'Advanced AI coaching (voice & chat)', included: true },
    { text: 'Customized training programs', included: true },
    { text: 'Detailed body composition analysis', included: true },
    { text: 'Performance insights & reports', included: true },
    { text: 'Access to premium workout library', included: true },
    { text: 'Export data & reports', included: true },
    { text: 'Dedicated priority support', included: true },
  ];

  return (
    <div className="w-full space-y-12">
      {/* 1. HERO BANNER SECTION */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#090D16] via-[#0D141C] to-[#090D16] border border-[#1E2D42] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
        {/* Background ambient lighting */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Crown Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B26] border border-[#1E2D42] text-emerald-400 text-xs font-semibold shadow-inner">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>FitNova Premium</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Take Your Fitness <br className="hidden sm:inline" />
              Journey to the <span className="text-[#35D440] drop-shadow-[0_0_35px_rgba(0,230,118,0.4)]">Next Level</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Unlock advanced features, personalized insights and AI-powered coaching to achieve your goals faster.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setSelectedPlanModal('Premium')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(43, 175, 52,0.35)] transition-all cursor-pointer"
              >
                <span>Upgrade to Premium</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-[#121B26] border border-transparent hover:border-[#1E2D42] transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full border border-slate-600 group-hover:border-emerald-400 flex items-center justify-center transition-colors">
                  <Play className="w-4 h-4 text-white group-hover:text-emerald-400 fill-white group-hover:fill-emerald-400 ml-0.5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block">Watch Video</span>
                  <span className="text-[11px] text-slate-400 block">See what's included</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToNutrition?.()}
                className="px-4 py-3 rounded-2xl border border-[#1E2D42] text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-[#121B26] text-sm font-semibold transition-all cursor-pointer"
              >
                Back to Nutrition
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#1E2D42]/70">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0D141C] object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="User 1"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0D141C] object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="User 2"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0D141C] object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="User 3"
                />
              </div>
              <span className="text-xs text-slate-300 font-medium">
                <span className="text-white font-bold">50K+</span> users already upgraded
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-[#1E2D42]">
                <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="text-xs font-bold text-white">4.8/5</span>
                <span className="text-[11px] text-slate-400">App Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Athlete & Badges */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            {/* Athlete Model Card Container */}
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-[#1E2D42] group ring-1 ring-white/10">
              <img
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
                alt="Fitness Athlete"
                className="w-full h-80 sm:h-96 object-cover object-top filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B111A] via-transparent to-transparent opacity-85" />
            </div>

            {/* Desktop & Tablet Floating Badges (sm and up) */}
            <div className="hidden sm:block">
              {/* Floating Card 1: Top Right - Progress +32% */}
              <div
                onClick={() => setActiveFeaturePreview('Advanced Analytics')}
                className="absolute top-4 -right-3 md:-right-5 lg:-right-4 bg-[#0D141C]/90 backdrop-blur-md border border-[#1E2D42] p-3 rounded-2xl shadow-xl z-20 flex items-center gap-3 cursor-pointer hover:border-emerald-400/60 hover:scale-105 transition-all group"
              >
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Progress</p>
                  <p className="text-sm font-extrabold text-emerald-400">+32%</p>
                </div>
                <div className="flex items-end gap-1 h-6 pl-1">
                  <span className="w-1 h-2 bg-emerald-500/40 rounded-full" />
                  <span className="w-1 h-3 bg-emerald-500/60 rounded-full" />
                  <span className="w-1 h-4 bg-emerald-500/80 rounded-full" />
                  <span className="w-1 h-6 bg-emerald-400 rounded-full shadow-[0_0_8px_#35D440]" />
                </div>
              </div>

              {/* Floating Card 2: Top Left - AI Coach */}
              <div
                onClick={() => setActiveFeaturePreview('AI Coach')}
                className="absolute top-12 -left-3 md:-left-6 lg:-left-6 bg-[#0D141C]/90 backdrop-blur-md border border-[#1E2D42] p-3 rounded-2xl shadow-xl z-20 flex items-center gap-3 cursor-pointer hover:border-emerald-400/60 hover:scale-105 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-white">AI Coach</p>
                  <p className="text-[10px] text-slate-300">Your personalized plan is ready!</p>
                </div>
              </div>

              {/* Floating Card 3: Mid-Left - Better Sleep */}
              <div
                onClick={() => setActiveFeaturePreview('Sleep & Recovery')}
                className="absolute bottom-16 -left-3 md:-left-6 lg:-left-6 bg-[#0D141C]/90 backdrop-blur-md border border-[#1E2D42] p-3 rounded-2xl shadow-xl z-20 flex items-center gap-3 cursor-pointer hover:border-purple-400/60 hover:scale-105 transition-all group"
              >
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Better Sleep</p>
                  <p className="text-xs font-extrabold text-white">8h 12m</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    <span className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span className="w-1.5 h-2 bg-purple-400 rounded-full" />
                    <span className="w-2 h-3 bg-purple-400 rounded-full" />
                    <span className="w-1.5 h-2 bg-purple-400 rounded-full" />
                    <span className="w-1 h-1 bg-purple-400 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating Card 4: Bottom Right - Target Achieved */}
              <div
                onClick={() => setActiveFeaturePreview('Personalized Plans')}
                className="absolute -bottom-2 -right-2 md:right-0 lg:right-2 bg-[#0D141C]/90 backdrop-blur-md border border-[#1E2D42] p-3 rounded-2xl shadow-xl z-20 flex items-center gap-3 cursor-pointer hover:border-amber-400/60 hover:scale-105 transition-all group"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Target Achieved</p>
                  <p className="text-xs font-extrabold text-emerald-400">-2.5 kg</p>
                </div>
                <svg className="w-12 h-5 text-emerald-400" viewBox="0 0 50 20" fill="none">
                  <path d="M2 18 L15 14 L25 10 L35 12 L48 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Mobile-Only Feature Cards (Screens < sm, e.g. 320px) - No Overlap or Clipping */}
            <div className="grid grid-cols-2 gap-2 mt-4 w-full sm:hidden">
              <div
                onClick={() => setActiveFeaturePreview('Advanced Analytics')}
                className="bg-[#0D141C] border border-[#1E2D42] p-2.5 rounded-2xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider truncate">Progress</p>
                  <p className="text-xs font-extrabold text-emerald-400">+32%</p>
                </div>
              </div>

              <div
                onClick={() => setActiveFeaturePreview('AI Coach')}
                className="bg-[#0D141C] border border-[#1E2D42] p-2.5 rounded-2xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider truncate">AI Coach</p>
                  <p className="text-xs font-extrabold text-white truncate">Ready</p>
                </div>
              </div>

              <div
                onClick={() => setActiveFeaturePreview('Sleep & Recovery')}
                className="bg-[#0D141C] border border-[#1E2D42] p-2.5 rounded-2xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 shrink-0">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider truncate">Sleep</p>
                  <p className="text-xs font-extrabold text-white">8h 12m</p>
                </div>
              </div>

              <div
                onClick={() => setActiveFeaturePreview('Personalized Plans')}
                className="bg-[#0D141C] border border-[#1E2D42] p-2.5 rounded-2xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider truncate">Target</p>
                  <p className="text-xs font-extrabold text-emerald-400">-2.5 kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRICING PLANS SECTION */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Choose Your Plan</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cancel or change your subscription anytime with zero penalty.
          </p>

          {/* Billing Cycle Switch */}
          <div className="inline-flex items-center bg-[#0D141C] border border-[#1E2D42] p-1 rounded-2xl mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-400 text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-emerald-400 text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[9px] font-extrabold bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded-full">
                -40%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
          {/* TIER 1: Free Plan */}
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#1E2D42] transition-all shadow-md">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Free</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Get started with the basics</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#121B26] border border-[#1E2D42] flex items-center justify-center text-slate-400">
                  <User className="w-5 h-5" />
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">₹0</span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Free forever with basic logs</p>
              </div>

              {/* Button: Current Plan */}
              <button
                onClick={() => alert("You are currently on the Free Plan as a Guest.")}
                className="w-full py-3 rounded-2xl bg-[#0B111A] border border-[#1E2D42] hover:bg-[#121B26] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Current Plan
              </button>

              {/* Features List */}
              <div className="mt-6 space-y-3">
                {freeFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    {feat.included ? (
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                        <X className="w-2.5 h-2.5 stroke-[2.5]" />
                      </div>
                    )}
                    <span className={feat.included ? 'text-slate-300 font-medium' : 'text-slate-500'}>
                      {feat.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TIER 2: Premium Plan (Most Popular Highlighted) */}
          <div className="relative bg-gradient-to-b from-[#121B26] to-[#0D141C] border-2 border-emerald-400 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_0_35px_rgba(43, 175, 52,0.2)] hover:shadow-[0_0_45px_rgba(43, 175, 52,0.3)] transition-all">
            {/* "Most Popular" Top Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-[11px] font-extrabold px-4 py-1 rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-500/30 uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>Most Popular</span>
            </div>

            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Premium</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Everything you need for real results</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Crown className="w-5 h-5 fill-amber-400" />
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {billingCycle === 'annual' ? '₹499' : '₹699'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-400">
                    {billingCycle === 'annual' ? 'Billed annually (₹5,988/year)' : 'Billed monthly'}
                  </span>
                  {billingCycle === 'annual' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Save 40%
                    </span>
                  )}
                </div>
              </div>

              {/* Button: Upgrade to Premium */}
              <button
                onClick={() => setSelectedPlanModal('Premium')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <span>Upgrade to Premium</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              {/* Features List */}
              <div className="mt-6 space-y-3">
                {premiumFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-slate-100 font-semibold">{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TIER 3: Premium+ Plan */}
          <div className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Premium+</h3>
                  <p className="text-xs text-slate-400 mt-0.5">For serious athletes and advanced users</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Crown className="w-5 h-5 fill-amber-400" />
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {billingCycle === 'annual' ? '₹799' : '₹999'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-400">
                    {billingCycle === 'annual' ? 'Billed annually (₹9,588/year)' : 'Billed monthly'}
                  </span>
                  {billingCycle === 'annual' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Save 45%
                    </span>
                  )}
                </div>
              </div>

              {/* Button: Upgrade to Premium+ */}
              <button
                onClick={() => setSelectedPlanModal('Premium+')}
                className="w-full py-3 rounded-2xl bg-[#0B111A] border border-amber-500/50 hover:bg-amber-500/15 text-amber-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>Upgrade to Premium+</span>
              </button>

              {/* Features List */}
              <div className="mt-6 space-y-3">
                {premiumPlusFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-slate-100 font-semibold">{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: PREMIUM FEATURES */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Premium Features</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              More tools. Deeper insights. Better results.
            </p>
          </div>
          <button
            onClick={() => setSelectedPlanModal('Premium')}
            className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>See All Features</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature Card 1: AI Coach */}
          <div
            onClick={() => setActiveFeaturePreview('AI Coach')}
            className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:-translate-y-1 transition-all group cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(43, 175, 52,0.15)]"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3.5 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white mb-1.5 group-hover:text-emerald-400 transition-colors">AI Coach</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Get personalized workout, nutrition and lifestyle recommendations.
              </p>
            </div>

            {/* Visual preview: Mobile chat mockup */}
            <div className="relative rounded-2xl bg-[#0B111A] border border-[#1E2D42] p-3 flex items-center justify-between overflow-hidden">
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="w-16 h-2 bg-[#121B26] rounded-full" />
                <div className="w-24 h-2 bg-[#1E2D42] rounded-full" />
                <div className="w-20 h-2 bg-[#121B26] rounded-full" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#121B26] flex items-center justify-center text-slate-300 group-hover:bg-emerald-400 group-hover:text-black transition-colors shrink-0 shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Feature Card 2: Advanced Analytics */}
          <div
            onClick={() => setActiveFeaturePreview('Advanced Analytics')}
            className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 hover:-translate-y-1 transition-all group cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3.5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white mb-1.5 group-hover:text-purple-400 transition-colors">Advanced Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Deep insights into your progress, trends and performance.
              </p>
            </div>

            {/* Visual preview: Mini graph */}
            <div className="relative rounded-2xl bg-[#0B111A] border border-[#1E2D42] p-3 flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                  +32%
                </span>
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1 h-2 bg-purple-500/40 rounded-full" />
                  <span className="w-1 h-3 bg-purple-500/60 rounded-full" />
                  <span className="w-1 h-4 bg-purple-500/80 rounded-full" />
                  <span className="w-1 h-5 bg-purple-400 rounded-full" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#121B26] flex items-center justify-center text-slate-300 group-hover:bg-purple-400 group-hover:text-black transition-colors shrink-0 shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Feature Card 3: Personalized Plans */}
          <div
            onClick={() => setActiveFeaturePreview('Personalized Plans')}
            className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/50 hover:-translate-y-1 transition-all group cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3.5 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white mb-1.5 group-hover:text-amber-400 transition-colors">Personalized Plans</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Custom meal & workout plans based on your goals and lifestyle.
              </p>
            </div>

            {/* Visual preview: Food bowl thumbnail */}
            <div className="relative rounded-2xl bg-[#0B111A] border border-[#1E2D42] p-2 flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Meal plan"
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-amber-500/30"
                />
                <span className="text-[11px] font-bold text-slate-200">Balanced Plan</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#121B26] flex items-center justify-center text-slate-300 group-hover:bg-amber-400 group-hover:text-black transition-colors shrink-0 shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Feature Card 4: Sleep & Recovery */}
          <div
            onClick={() => setActiveFeaturePreview('Sleep & Recovery')}
            className="bg-[#0D141C] border border-[#1E2D42] rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/50 hover:-translate-y-1 transition-all group cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3.5 group-hover:scale-110 transition-transform">
                <Moon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white mb-1.5 group-hover:text-indigo-400 transition-colors">Sleep & Recovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                AI-powered sleep insights and personalized recovery recommendations.
              </p>
            </div>

            {/* Visual preview: Sleeping person thumbnail */}
            <div className="relative rounded-2xl bg-[#0B111A] border border-[#1E2D42] p-2 flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Sleep insight"
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-indigo-500/30"
                />
                <span className="text-[11px] font-bold text-slate-200">Deep Rest</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#121B26] flex items-center justify-center text-slate-300 group-hover:bg-indigo-400 group-hover:text-black transition-colors shrink-0 shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Checkout Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0D141C] border border-[#1E2D42] w-full max-w-md rounded-2xl p-7 shadow-2xl relative text-center glow-emerald">
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#121B26] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-7 h-7 fill-emerald-400" />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-1">
              Unlock FitNova {selectedPlanModal}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mb-6">
              Start your 7-day free trial with full AI coaching, meal plans, and real-time macro analysis.
            </p>

            <div className="bg-[#0B111A] border border-[#1E2D42] rounded-2xl p-4 mb-6 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Selected Plan:</span>
                <span className="font-extrabold text-white">{selectedPlanModal}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pricing:</span>
                <span className="font-extrabold text-emerald-400">
                  {selectedPlanModal === 'Premium+' ? '₹799 / month' : '₹499 / month'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1E2D42]">
                <span className="text-slate-400">Trial Period:</span>
                <span className="text-emerald-400 font-bold">7 Days Free</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`🎉 Congratulations! You have activated FitNova ${selectedPlanModal}. Welcome aboard!`);
                setSelectedPlanModal(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-95 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Start 7-Day Free Trial</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0D141C] border border-[#1E2D42] w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2D42] mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Video className="w-4 h-4 text-emerald-400" />
                <span>FitNova Premium Overview</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121B26] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#1E2D42]">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
                alt="Gym Video preview"
                className="w-full h-full object-cover filter brightness-50"
              />
              <div className="absolute text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-400 text-black flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50">
                  <Play className="w-7 h-7 fill-black ml-1" />
                </div>
                <h4 className="text-white font-bold text-lg">Watch FitNova in Action</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Experience seamless AI coaching, smart nutrition logging, and personalized workout routines built to transform your health.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Details Modal */}
      {activeFeaturePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D141C] border border-[#1E2D42] w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2D42] mb-4">
              <h3 className="text-base font-bold text-white">{activeFeaturePreview}</h3>
              <button
                onClick={() => setActiveFeaturePreview(null)}
                className="p-1 rounded-lg hover:bg-[#121B26] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300 mb-4 leading-relaxed">
              {activeFeaturePreview === 'AI Coach' &&
                'FitNova AI Coach analyzes your daily food diary, sleep duration, and workout performance to tailor your daily targets and give real-time advice.'}
              {activeFeaturePreview === 'Advanced Analytics' &&
                'Track weekly and monthly calorie burn, micronutrient balance, body composition trends, and milestone achievements with interactive charts.'}
              {activeFeaturePreview === 'Personalized Plans' &&
                'Receive customized meal plans with exact grocery lists and targeted workout routines designed for your body type and fitness targets.'}
              {activeFeaturePreview === 'Sleep & Recovery' &&
                'Sync your recovery and sleep cycle data to avoid overtraining and optimize your muscle recovery rate.'}
            </p>
            <button
              onClick={() => {
                setActiveFeaturePreview(null);
                setSelectedPlanModal('Premium');
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-extrabold text-xs cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Unlock with Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
