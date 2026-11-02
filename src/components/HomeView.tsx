import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Gauge,
  Sparkles,
  ArrowRight,
  Layers,
  Scale,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useBuildStore } from '../store/useBuildStore';
import { PRESET_BUILDS, calculateBuildTotalCost, ALL_PARTS_FLAT } from '../data';
import { formatCurrency } from '../config/constants';
import { evaluateCompatibility } from '../engine/compatibilityEngine';

export const HomeView: React.FC = () => {
  const { setActiveTab, loadBuild } = useBuildStore();

  const handleLoadPreset = (index: number) => {
    loadBuild(PRESET_BUILDS[index].build);
    setActiveTab('builder');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-500/30 p-6 sm:p-10 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <span>Mariano Marcos State University • CCIS Capstone System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Digital PC Builder: Virtual Compatibility & Simulation System
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Design custom desktop computers with millimeter-accurate physical clearance checks,
            deterministic power & socket validation, Explainable AI (XAI) component recommendations,
            and multi-resolution bottleneck simulation—before purchasing a single part.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('builder')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Interactive Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('recommender')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-sm transition"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Try XAI Auto-Recommender</span>
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span>Run FPS & Bottleneck Sim</span>
            </button>
          </div>
        </div>

        {/* Right KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-blue-400/20">
          <div>
            <div className="text-2xl font-black text-sky-400">{ALL_PARTS_FLAT.length}</div>
            <div className="text-xs text-slate-300">Curated Hardware Parts (8 Categories)</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">10+</div>
            <div className="text-xs text-slate-300">Deterministic Clearance & Power Rules</div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">3D + 2D</div>
            <div className="text-xs text-slate-300">Interactive WebGL & Blueprint Case View</div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-400">XAI</div>
            <div className="text-xs text-slate-300">Transparent Multi-Factor Scoring</div>
          </div>
        </div>
      </div>

      {/* Instant Thesis Defense Demo Presets */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Instant One-Click Defense Demo Builds
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Load a pre-configured budget build, a balanced 1440p gaming rig, or an intentional "Compatibility Trap" build to demonstrate live error detection.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('saved')}
            className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
          >
            View All Presets & Saved Gallery →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[PRESET_BUILDS[0], PRESET_BUILDS[2], PRESET_BUILDS[4]].map((preset) => {
            const realIdx = PRESET_BUILDS.findIndex((p) => p.id === preset.id);
            const cost = calculateBuildTotalCost(preset.build);
            const compat = evaluateCompatibility(preset.build);
            const isTrap = compat.failureCount > 0;

            return (
              <div
                key={preset.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  isTrap
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isTrap
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isTrap ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {preset.badge}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrency(cost)}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <button
                  onClick={() => handleLoadPreset(realIdx)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                    isTrap
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isTrap ? 'Load & Inspect 5 Conflicts in Builder' : 'Load Build in Builder'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('builder')}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition shadow-sm"
        >
          <ShieldCheck className="w-6 h-6 text-blue-500 mb-2.5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            1. Multi-Rule Compatibility Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Validates CPU/MB sockets, DDR4/DDR5 dual-channel memory, GPU length, cooler height, RAM overhang clearance, and 16-pin PSU cables.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('simulation')}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition shadow-sm"
        >
          <Gauge className="w-6 h-6 text-emerald-500 mb-2.5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            2. FPS, Bottleneck & PSU Simulator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Models 1080p/1440p/4K frame rates, directional CPU/GPU bottleneck percentages, and 80+ PSU efficiency curves.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('recommender')}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition shadow-sm"
        >
          <Sparkles className="w-6 h-6 text-amber-500 mb-2.5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            3. Explainable AI (XAI) Recommender
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Synthesizes 100% compatible builds for your budget while exposing transparent factor weights and scores.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('compare')}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition shadow-sm"
        >
          <Scale className="w-6 h-6 text-sky-500 mb-2.5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            4. Side-by-Side Comparator & Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare up to 4 components per category, inspect price-to-performance metrics, and export build manifests.
          </p>
        </div>
      </div>
    </div>
  );
};
