import React, { useState } from 'react';
import {
  Home,
  Cpu,
  Gauge,
  Sparkles,
  Scale,
  FileText,
  FolderKanban,
  BookOpen,
  Share2,
  Sun,
  Moon,
  GraduationCap,
  Check,
  AlertTriangle,
  XCircle,
  Zap,
  ArrowLeftRight,
} from 'lucide-react';
import { useBuildStore, ActiveTab } from '../store/useBuildStore';
import { calculateBuildTotalCost } from '../data';
import { evaluateCompatibility } from '../engine/compatibilityEngine';
import { formatCurrency } from '../config/constants';

interface NavbarProps {
  onOpenSavedModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSavedModal }) => {
  const {
    projectEdition,
    setProjectEdition,
    currentBuild,
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    beginnerMode,
    toggleBeginnerMode,
    generateShareUrl,
    comparisonIds,
    savedBuilds,
  } = useBuildStore();

  const [copied, setCopied] = useState(false);

  const totalCost = calculateBuildTotalCost(currentBuild);
  const compat = evaluateCompatibility(currentBuild);

  const handleCopyShareLink = () => {
    const url = generateShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    window.history.replaceState({}, '', url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'builder', label: 'Builder', icon: <Cpu className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <Scale className="w-4 h-4" />, badge: comparisonIds.length },
    { id: 'simulation', label: 'Simulation', icon: <Gauge className="w-4 h-4" /> },
    { id: 'recommender', label: 'XAI Recommender', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'summary', label: 'Build Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'saved', label: 'Saved Builds', icon: <FolderKanban className="w-4 h-4" />, badge: savedBuilds.length },
    { id: 'guide', label: 'About / Help', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          {/* Brand Header */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-sky-200 font-black text-lg shadow-md border border-blue-400/30">
              PC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  Digital PC Builder
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-sky-300 border border-blue-500/30">
                  MMSU CCIS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Virtual Compatibility, 3D/2D Clearance & XAI Simulation System
              </p>
            </div>
          </div>

          {/* Live Metrics Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Project Switcher: bigG vs rcssln */}
            <div
              className="flex items-center bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold shadow-inner"
              title="Switch between bigG (React 3D/XAI Edition) and rcssln (HTML/JS Edition)"
            >
              <span className="hidden xl:flex items-center gap-1 px-2 text-[11px] text-slate-500 dark:text-slate-400">
                <ArrowLeftRight className="w-3 h-3" />
                <span>Edition:</span>
              </span>
              <button
                onClick={() => setProjectEdition('bigG')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  projectEdition === 'bigG'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                bigG
              </button>
              <button
                onClick={() => setProjectEdition('rcssln')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  projectEdition === 'rcssln'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                rcssln
              </button>
            </div>

            {projectEdition === 'bigG' && (
              <>
                {/* Compatibility Badge */}
                <button
                  onClick={() => setActiveTab('builder')}
                  className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    compat.overallStatus === 'pass'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : compat.overallStatus === 'warn'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300 animate-pulse'
                  }`}
                  title="Click to inspect compatibility checks"
                >
                  {compat.overallStatus === 'pass' && <Check className="w-4 h-4" />}
                  {compat.overallStatus === 'warn' && <AlertTriangle className="w-4 h-4" />}
                  {compat.overallStatus === 'fail' && <XCircle className="w-4 h-4" />}
                  <span>
                    {compat.failureCount > 0
                      ? `${compat.failureCount} Conflict${compat.failureCount > 1 ? 's' : ''}`
                      : compat.warningCount > 0
                      ? `${compat.warningCount} Warning${compat.warningCount > 1 ? 's' : ''}`
                      : `Compatible (${compat.passedCount} Checks)`}
                  </span>
                </button>

                {/* Power Draw */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    ~{compat.estimatedWattage.typicalLoadWatts}W
                    {currentBuild.psu ? ` / ${currentBuild.psu.wattage}W` : ''}
                  </span>
                </div>

                {/* Total Cost */}
                <button
                  onClick={() => setActiveTab('summary')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-sm transition"
                  title="View full Build Summary & BOM"
                >
                  {formatCurrency(totalCost)}
                </button>

                {/* Quick Presets Modal Button */}
                <button
                  onClick={onOpenSavedModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 transition"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
                  <span className="hidden md:inline">Quick Presets</span>
                </button>

                {/* Share URL Button */}
                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 transition"
                  title="Copy URL-encoded shareable build link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-sky-500" />
                      <span className="hidden md:inline">Share Link</span>
                    </>
                  )}
                </button>

                {/* Beginner Tooltips Toggle */}
                <button
                  onClick={toggleBeginnerMode}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                    beginnerMode
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-sky-300'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                  title="Toggle educational beginner tooltips"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden xl:inline">Learn Mode</span>
                </button>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition"
              title="Toggle Dark / Light Theme"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Shown in bigG mode) */}
        {projectEdition === 'bigG' && (
          <nav className="flex items-center gap-1 overflow-x-auto pb-2 pt-1 no-scrollbar" aria-label="Primary Navigation">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        active
                          ? 'bg-white text-blue-700'
                          : 'bg-blue-500/20 text-blue-600 dark:text-sky-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
