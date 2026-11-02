import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useBuildStore } from '../store/useBuildStore';
import { UseCaseProfile } from '../types/pc';
import { USE_CASE_PROFILES, formatCurrency } from '../config/constants';
import { generateXAIRecommendation } from '../engine/recommendationEngine';
import { evaluateCompatibility } from '../engine/compatibilityEngine';

export const RecommendationView: React.FC = () => {
  const { loadBuild, setActiveTab } = useBuildStore();

  const [budget, setBudget] = useState<number>(65000);
  const [useCase, setUseCase] = useState<UseCaseProfile>('gaming');
  const [formFactor, setFormFactor] = useState<'Any' | 'ATX' | 'Micro-ATX' | 'Mini-ITX'>('Any');
  const [appliedBanner, setAppliedBanner] = useState(false);

  const recommendation = useMemo(
    () =>
      generateXAIRecommendation({
        budget,
        useCase,
        preferredFormFactor: formFactor,
      }),
    [budget, useCase, formFactor]
  );

  const compat = useMemo(
    () => evaluateCompatibility(recommendation.build),
    [recommendation.build]
  );

  const handleApplyRecommendation = () => {
    loadBuild(recommendation.build);
    setAppliedBanner(true);
    setTimeout(() => {
      setAppliedBanner(false);
      setActiveTab('builder');
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Explainable AI (XAI) Multi-Criteria Recommendation Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Transparent Multi-Criteria Decision Analysis (MCDA) showing the exact weights, scores, and clearance validations behind every suggested part.
              </p>
            </div>
          </div>

          <button
            onClick={handleApplyRecommendation}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition"
          >
            {appliedBanner ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Loaded into Builder!</span>
              </>
            ) : (
              <>
                <span>Load Recommended Build ({formatCurrency(recommendation.totalPrice)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2 border-t border-slate-200 dark:border-slate-800">
          {/* Budget Slider */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                <span>Target Budget (PHP)</span>
              </label>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(budget)}
              </span>
            </div>
            <input
              type="range"
              min={22000}
              max={240000}
              step={2000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₱22K (APU Starter)</span>
              <span>₱65K (Mid-Range)</span>
              <span>₱140K (High-End)</span>
              <span>₱240K (Flagship)</span>
            </div>
          </div>

          {/* Primary Workload Profile */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Primary Workload Profile
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(USE_CASE_PROFILES) as UseCaseProfile[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setUseCase(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition ${
                    useCase === key
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'
                  }`}
                >
                  {USE_CASE_PROFILES[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Factor Preference */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Size / Form Factor Constraint
            </label>
            <select
              value={formFactor}
              onChange={(e) => setFormFactor(e.target.value as typeof formFactor)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Any">Any Size (Best Value & Airflow)</option>
              <option value="ATX">Full / Mid Tower (ATX)</option>
              <option value="Micro-ATX">Compact Mini Tower (Micro-ATX)</option>
              <option value="Mini-ITX">Small Form Factor (Mini-ITX)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              {USE_CASE_PROFILES[useCase].description}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Recommended Total Cost
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(recommendation.totalPrice)}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold">
            Target: {formatCurrency(recommendation.targetBudget)}
          </span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            XAI Multi-Factor Confidence Score
          </span>
          <div className="text-2xl font-black text-emerald-500 mt-0.5">
            {recommendation.overallMatchScore} / 100
          </div>
          <span className="text-[11px] text-slate-400">
            Weighted across performance, budget & thermal fit
          </span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pre-Verified Compatibility Status
          </span>
          <div className="text-lg font-black text-emerald-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>
              {compat.failureCount === 0
                ? `100% Compatible (${compat.passedCount} Checks Passed)`
                : `${compat.failureCount} Issue(s)`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Est. Load: {compat.estimatedWattage.typicalLoadWatts}W (Peak{' '}
            {compat.estimatedWattage.peakLoadWatts}W)
          </span>
        </div>
      </div>

      {/* Explainable AI Per-Component Factor Breakdown */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Why Were These Parts Chosen? (Explainable AI Decision Matrix)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendation.partExplanations.map((item) => (
            <div
              key={item.category}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {item.partName}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(item.price)}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-500">
                      XAI Score: {item.totalScore}/100
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  {item.summaryReason}
                </p>
              </div>

              {/* Factor Bars */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                {item.factors.map((f) => (
                  <div key={f.factor} className="text-[11px]">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                      <span>
                        {f.factor}{' '}
                        <span className="text-slate-400 font-normal">
                          (Weight {f.weightPercent}%)
                        </span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{f.weightedContribution} pts ({f.rawScore}/100)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${f.rawScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {f.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
