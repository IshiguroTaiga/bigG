import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Plus,
  Check,
  AlertTriangle,
  XCircle,
  Scale,
  Box,
  Layers,
  RotateCcw,
  Download,
} from 'lucide-react';
import { useBuildStore } from '../store/useBuildStore';
import {
  ALL_PARTS_BY_CATEGORY,
  calculateBuildTotalCost,
} from '../data';
import {
  CATEGORY_METADATA,
  formatCurrency,
} from '../config/constants';
import {
  evaluateCompatibility,
  checkCandidatePartCompatibility,
} from '../engine/compatibilityEngine';
import {
  AnyComponent,
  CPU,
  Motherboard,
  RAM,
  GPU,
  Storage,
  PSU,
  PCCase,
  CPUCooler,
} from '../types/pc';
import { CaseVisualizer3D } from './CaseVisualizer3D';
import { CaseVisualizer2D } from './CaseVisualizer2D';
import { CompatibilityPanel } from './CompatibilityPanel';
import { TooltipTerm } from './TooltipTerm';

export const BuilderView: React.FC = () => {
  const {
    currentBuild,
    activeCategory,
    setActiveCategory,
    visualizerMode,
    setVisualizerMode,
    selectPart,
    removePart,
    clearBuild,
    exportBuildToJson,
    comparisonIds,
    toggleComparisonPart,
    setActiveTab,
  } = useBuildStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [onlyCompatible, setOnlyCompatible] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name' | 'perf-desc'>('price-asc');

  const compatReport = useMemo(
    () => evaluateCompatibility(currentBuild),
    [currentBuild]
  );
  const totalCost = useMemo(
    () => calculateBuildTotalCost(currentBuild),
    [currentBuild]
  );

  const categoryParts = ALL_PARTS_BY_CATEGORY[activeCategory];

  const availableBrands = useMemo(() => {
    const brands = Array.from(new Set(categoryParts.map((p) => p.brand)));
    return ['ALL', ...brands];
  }, [categoryParts]);

  const enrichedParts = useMemo(() => {
    return categoryParts
      .map((part) => {
        const candidateCheck = checkCandidatePartCompatibility(currentBuild, part);
        return { part, candidateCheck };
      })
      .filter(({ part, candidateCheck }) => {
        if (brandFilter !== 'ALL' && part.brand !== brandFilter) return false;
        if (onlyCompatible && !candidateCheck.compatible) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = `${part.brand} ${part.name} ${part.summary}`.toLowerCase().includes(q);
          if (!matchName) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.part.price - b.part.price;
        if (sortBy === 'price-desc') return b.part.price - a.part.price;
        if (sortBy === 'name') return a.part.name.localeCompare(b.part.name);
        // Performance or wattage sort
        const getPerf = (p: AnyComponent) => {
          if (p.category === 'cpu') return p.benchmarkScore;
          if (p.category === 'gpu') return p.benchmarkScore;
          if (p.category === 'ram') return p.capacityGB * p.speedMHz;
          if (p.category === 'storage') return p.readSpeedMBps;
          if (p.category === 'psu') return p.wattage;
          if (p.category === 'cooler') return p.tdpRatingWatts;
          return p.price;
        };
        return getPerf(b.part) - getPerf(a.part);
      });
  }, [categoryParts, currentBuild, brandFilter, onlyCompatible, searchQuery, sortBy]);

  const handleDownloadJson = () => {
    const json = exportBuildToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mmsu-pc-build-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderPartBadges = (part: AnyComponent) => {
    switch (part.category) {
      case 'cpu': {
        const c = part as CPU;
        return (
          <>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">
              {c.socket}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {c.cores}C / {c.threads}T
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {c.boostClockGHz} GHz
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {c.tdpWatts}W TDP
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {c.memoryChannels}-Ch {c.supportedMemoryTypes.join('/')}
            </span>
            {c.integratedGraphics && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                iGPU: {c.igpuName}
              </span>
            )}
          </>
        );
      }
      case 'motherboard': {
        const m = part as Motherboard;
        return (
          <>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">
              {m.socket} • {m.chipset}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {m.formFactor}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {m.ramSlots}x {m.ramType} (Max {m.maxRamGB}GB)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {m.m2Slots}x M.2 • {m.sataPorts}x SATA
            </span>
          </>
        );
      }
      case 'ram': {
        const r = part as RAM;
        return (
          <>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">
              {r.type}-{r.speedMHz}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {r.capacityGB}GB ({r.modules}x{r.capacityGB / r.modules}GB)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              CL{r.casLatency}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              Height: {r.heightMm}mm
            </span>
          </>
        );
      }
      case 'gpu': {
        const g = part as GPU;
        return (
          <>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">
              {g.vramGB}GB VRAM
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              Length: {g.lengthMm}mm
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {g.tdpWatts}W TDP (Rec. {g.recommendedPsuWatts}W)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {g.pcieConnectors.sixteenPin > 0
                ? `${g.pcieConnectors.sixteenPin}x 16-Pin`
                : `${g.pcieConnectors.eightPin}x 8-Pin`}
            </span>
          </>
        );
      }
      case 'storage': {
        const s = part as Storage;
        return (
          <>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">
              {s.type} ({s.formFactor})
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {s.capacityGB >= 1000 ? `${s.capacityGB / 1000}TB` : `${s.capacityGB}GB`}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              Read: {s.readSpeedMBps} MB/s
            </span>
          </>
        );
      }
      case 'psu': {
        const p = part as PSU;
        return (
          <>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">
              {p.wattage}W {p.efficiencyRating}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {p.formFactor} • {p.modular}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              {p.connectors.pcie8Pin}x 8-Pin • {p.connectors.pcie16Pin}x 16-Pin
            </span>
          </>
        );
      }
      case 'case': {
        const c = part as PCCase;
        return (
          <>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">
              {c.supportedMotherboards.join('/')}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              Max GPU: {c.maxGpuLengthMm}mm
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              Max Cooler: {c.maxCoolerHeightMm}mm
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              Max Rad: {c.maxRadiatorMm}mm
            </span>
          </>
        );
      }
      case 'cooler': {
        const col = part as CPUCooler;
        return (
          <>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">
              {col.type} {col.radiatorSizeMm ? `${col.radiatorSizeMm}mm` : `${col.heightMm}mm`}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              TDP Rating: {col.tdpRatingWatts}W
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              RAM Clearance: ≤{col.ramClearanceMm}mm
            </span>
          </>
        );
      }
    }
  };

  const isPartSelected = (part: AnyComponent): boolean => {
    if (part.category === 'storage') {
      return currentBuild.storage.some((d) => d.id === part.id);
    }
    return currentBuild[part.category]?.id === part.id;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN (5 cols): Slot List + Component Picker */}
      <div className="lg:col-span-7 space-y-6">
        {/* Component Slots Bar */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                1. Hardware Architecture Slots
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any slot below to browse, filter, and validate parts. Hover over{' '}
                <TooltipTerm termKey="socket" label="Socket" />,{' '}
                <TooltipTerm termKey="ramClearance" label="RAM Clearance" />, or{' '}
                <TooltipTerm termKey="psuHeadroom" label="PSU Headroom" /> for guidance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                title="Export build to JSON file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={clearBuild}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Build</span>
              </button>
            </div>
          </div>

          {/* 8 Category Slot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CATEGORY_METADATA.map((meta) => {
              const isSelectedSlot = activeCategory === meta.id;
              const hasFail = compatReport.results.some(
                (r) => r.status === 'fail' && r.affectedCategories.includes(meta.id)
              );
              const hasWarn = compatReport.results.some(
                (r) => r.status === 'warn' && r.affectedCategories.includes(meta.id)
              );

              if (meta.id === 'storage') {
                const drives = currentBuild.storage;
                return (
                  <div
                    key={meta.id}
                    onClick={() => setActiveCategory('storage')}
                    className={`cursor-pointer p-3 rounded-xl border transition flex flex-col justify-between ${
                      isSelectedSlot
                        ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                        : hasFail
                        ? 'border-rose-500/50 bg-rose-500/5'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {meta.label} ({drives.length}/4)
                      </span>
                      {drives.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePart('storage');
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Clear all storage drives"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {drives.length === 0 ? (
                      <div className="mt-1.5 text-xs text-slate-400 italic">
                        + Click to add NVMe / SSD / HDD
                      </div>
                    ) : (
                      <div className="mt-1.5 space-y-1">
                        {drives.map((d, idx) => (
                          <div
                            key={`${d.id}-${idx}`}
                            className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800"
                          >
                            <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                              {d.brand} {d.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                {formatCurrency(d.price)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePart('storage', idx);
                                }}
                                className="text-slate-400 hover:text-rose-500"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const installed = currentBuild[meta.id] as AnyComponent | null;
              return (
                <div
                  key={meta.id}
                  onClick={() => setActiveCategory(meta.id)}
                  className={`cursor-pointer p-3 rounded-xl border transition flex flex-col justify-between ${
                    isSelectedSlot
                      ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                      : hasFail
                      ? 'border-rose-500/50 bg-rose-500/5'
                      : hasWarn
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-950/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {meta.label}
                      </span>
                      {hasFail && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      {!hasFail && hasWarn && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    {installed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePart(meta.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                        title={`Remove ${meta.shortLabel}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {installed ? (
                    <div className="mt-1.5 flex items-baseline justify-between gap-2">
                      <div className="truncate font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {installed.brand} {installed.name}
                      </div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {formatCurrency(installed.price)}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1.5 text-xs text-slate-400 italic">
                      + Select {meta.shortLabel}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Component Catalog Picker */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                2. Select{' '}
                {CATEGORY_METADATA.find((c) => c.id === activeCategory)?.label} (
                {enrichedParts.length} Available)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {CATEGORY_METADATA.find((c) => c.id === activeCategory)?.description}
              </p>
            </div>

            {/* Compatible Only Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              <input
                type="checkbox"
                checked={onlyCompatible}
                onChange={(e) => setOnlyCompatible(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Hide Incompatible Parts</span>
            </label>
          </div>

          {/* Search, Brand Filter, and Sort Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search model, socket, specs..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full py-2 px-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b === 'ALL' ? 'All Brands' : b}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full py-2 px-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="perf-desc">Performance / Capacity</option>
                <option value="name">Alphabetical (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Part Cards List */}
          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {enrichedParts.map(({ part, candidateCheck }) => {
              const selected = isPartSelected(part);
              const inCompare = comparisonIds.includes(part.id);

              return (
                <div
                  key={part.id}
                  className={`p-3.5 rounded-xl border transition ${
                    selected
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : !candidateCheck.compatible
                      ? 'border-rose-500/40 bg-rose-500/5 opacity-85'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          {part.brand}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {part.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-500">
                          {part.tier}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {part.summary}
                      </p>

                      {/* Technical Spec Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 pt-0.5">
                        {renderPartBadges(part)}
                      </div>

                      {/* Live Candidate Compatibility Reasons */}
                      {candidateCheck.reasons.length > 0 && (
                        <div
                          className={`mt-1.5 flex items-start gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg ${
                            candidateCheck.status === 'fail'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {candidateCheck.status === 'fail' ? (
                            <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          )}
                          <span>
                            {candidateCheck.status === 'fail'
                              ? 'Incompatible with current build: '
                              : 'Note: '}
                            {candidateCheck.reasons.join(' • ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(part.price)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleComparisonPart(part.id)}
                          className={`p-2 rounded-lg border text-xs transition ${
                            inCompare
                              ? 'bg-sky-500 text-white border-sky-500'
                              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sky-500'
                          }`}
                          title="Add/Remove from Side-by-Side Comparator"
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => selectPart(part)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                            selected && part.category !== 'storage'
                              ? 'bg-emerald-600 text-white'
                              : !candidateCheck.compatible
                              ? 'bg-rose-600/90 hover:bg-rose-600 text-white'
                              : 'bg-slate-900 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {selected && part.category !== 'storage' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Installed</span>
                            </>
                          ) : part.category === 'storage' ? (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Drive</span>
                            </>
                          ) : !candidateCheck.compatible ? (
                            <span>Test Anyway</span>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Select</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (5 cols): 3D/2D Case Visualizer + Live Compatibility & Power Summary */}
      <div className="lg:col-span-5 space-y-6">
        {/* Visualizer Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Interactive Chassis & Slot Placement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time spatial clearance & slot population preview
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setVisualizerMode('3d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
                  visualizerMode === '3d'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Case</span>
              </button>
              <button
                onClick={() => setVisualizerMode('2d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
                  visualizerMode === '2d'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2D Blueprint</span>
              </button>
            </div>
          </div>

          {visualizerMode === '3d' ? (
            <CaseVisualizer3D
              build={currentBuild}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          ) : (
            <CaseVisualizer2D
              build={currentBuild}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          )}

          {/* Quick Dimensional Clearance Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                GPU Length vs Case
              </div>
              <div className="text-xs font-bold mt-0.5 text-slate-800 dark:text-slate-200">
                {currentBuild.gpu ? `${currentBuild.gpu.lengthMm}mm` : '—'} /{' '}
                {currentBuild.case ? `${currentBuild.case.maxGpuLengthMm}mm` : '—'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                Cooler Height vs Case
              </div>
              <div className="text-xs font-bold mt-0.5 text-slate-800 dark:text-slate-200">
                {currentBuild.cooler ? `${currentBuild.cooler.heightMm}mm` : '—'} /{' '}
                {currentBuild.case ? `${currentBuild.case.maxCoolerHeightMm}mm` : '—'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                RAM Height vs Cooler
              </div>
              <div className="text-xs font-bold mt-0.5 text-slate-800 dark:text-slate-200">
                {currentBuild.ram ? `${currentBuild.ram.heightMm}mm` : '—'} /{' '}
                {currentBuild.cooler ? `≤${currentBuild.cooler.ramClearanceMm}mm` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility Diagnostic Panel */}
        <CompatibilityPanel
          report={compatReport}
          onSelectCategory={setActiveCategory}
        />

        {/* Power & Financial Summary Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                Estimated Build Summary
              </span>
              <div className="text-2xl font-black mt-0.5">
                {formatCurrency(totalCost)}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('simulation')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold transition shadow"
            >
              Simulate FPS & Bottleneck →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs border-t border-slate-800 pt-3">
            <div>
              <span className="text-slate-400 block">Typical Load</span>
              <strong className="text-amber-400 text-sm">
                {compatReport.estimatedWattage.typicalLoadWatts}W
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Peak Transient</span>
              <strong className="text-rose-400 text-sm">
                {compatReport.estimatedWattage.peakLoadWatts}W
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Rec. PSU</span>
              <strong className="text-emerald-400 text-sm">
                {compatReport.estimatedWattage.recommendedPsuWatts}W+
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
