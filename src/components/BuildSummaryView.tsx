import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit3,
  Zap,
} from 'lucide-react';
import { useBuildStore } from '../store/useBuildStore';
import { calculateBuildTotalCost } from '../data';
import { CATEGORY_METADATA, formatCurrency } from '../config/constants';
import { evaluateCompatibility } from '../engine/compatibilityEngine';
import { simulatePerformance } from '../engine/performanceEngine';
import { PartCategory } from '../types/pc';

export const BuildSummaryView: React.FC = () => {
  const {
    currentBuild,
    setActiveTab,
    setActiveCategory,
    exportBuildToJson,
    generateShareUrl,
  } = useBuildStore();

  const [copied, setCopied] = useState(false);

  const totalCost = calculateBuildTotalCost(currentBuild);
  const compat = evaluateCompatibility(currentBuild);
  const sim = simulatePerformance(currentBuild);

  const handleCopyLink = () => {
    const url = generateShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    window.history.replaceState({}, '', url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const json = exportBuildToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mmsu-pc-build-summary-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJumpToSlot = (cat: PartCategory) => {
    setActiveCategory(cat);
    setActiveTab('builder');
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Complete Build Bill of Materials (BOM) & Verification Report
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Itemized hardware specification manifest, power profile, and compatibility audit for retail procurement or academic submission.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Share URL Copied!' : 'Copy Shareable Build Link'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .JSON</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Build Cost</span>
          <div className="text-2xl font-black text-blue-600 dark:text-sky-400 mt-1">
            {formatCurrency(totalCost)}
          </div>
          <span className="text-[11px] text-slate-400">Philippine Peso (PHP) Sample Pricing</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Compatibility Audit</span>
          <div className="text-lg font-black mt-1 flex items-center gap-1.5">
            {compat.overallStatus === 'pass' && (
              <span className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5" /> 100% Pass ({compat.passedCount} Checks)
              </span>
            )}
            {compat.overallStatus === 'warn' && (
              <span className="text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-5 h-5" /> {compat.warningCount} Warning(s)
              </span>
            )}
            {compat.overallStatus === 'fail' && (
              <span className="text-rose-500 flex items-center gap-1">
                <XCircle className="w-5 h-5" /> {compat.failureCount} Conflict(s)
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">Compatibility Score: {compat.score}/100</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Power & PSU Profile</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>
              {compat.estimatedWattage.typicalLoadWatts}W Typical /{' '}
              {compat.estimatedWattage.peakLoadWatts}W Peak
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Recommended PSU: {compat.estimatedWattage.recommendedPsuWatts}W+
          </span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Simulated Performance</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Gaming: {sim.overallGamingIndex}/100 • Work: {sim.overallWorkstationIndex}/100
          </div>
          <span className="text-[11px] text-slate-400">
            Bottleneck: {sim.bottleneck.severity}
          </span>
        </div>
      </div>

      {/* Itemized Bill of Materials Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[11px]">
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selected Component</th>
                <th className="py-3.5 px-4">Key Technical Specifications</th>
                <th className="py-3.5 px-4 text-right">Price (PHP)</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {CATEGORY_METADATA.map((meta) => {
                if (meta.id === 'storage') {
                  if (currentBuild.storage.length === 0) {
                    return (
                      <tr key="storage-empty">
                        <td className="py-3 px-4 font-bold text-slate-500">{meta.label}</td>
                        <td className="py-3 px-4 italic text-slate-400" colSpan={2}>
                          No storage drives selected
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">₱0</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleJumpToSlot('storage')}
                            className="text-blue-600 dark:text-sky-400 font-bold text-xs hover:underline"
                          >
                            + Add
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  return currentBuild.storage.map((drive, idx) => (
                    <tr key={`storage-${idx}`}>
                      <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300">
                        {meta.label} #{idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {drive.brand} {drive.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {drive.capacityGB}GB • {drive.type} ({drive.formFactor}) • {drive.interface} •{' '}
                        {drive.readSpeedMBps} MB/s Read
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(drive.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleJumpToSlot('storage')}
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-sky-400 font-bold text-xs hover:underline"
                        >
                          <Edit3 className="w-3 h-3" /> Change
                        </button>
                      </td>
                    </tr>
                  ));
                }

                const part = currentBuild[meta.id];
                let specSummary = '';
                if (part) {
                  if (part.category === 'cpu') {
                    specSummary = `Socket ${part.socket} • ${part.cores}C/${part.threads}T • ${part.boostClockGHz}GHz Boost • ${part.memoryChannels}-Channel ${part.supportedMemoryTypes.join('/')} • ${part.tdpWatts}W TDP`;
                  } else if (part.category === 'motherboard') {
                    specSummary = `Socket ${part.socket} (${part.chipset}) • ${part.formFactor} • ${part.ramSlots}x ${part.ramType} (Max ${part.maxRamGB}GB) • ${part.m2Slots}x M.2`;
                  } else if (part.category === 'ram') {
                    specSummary = `${part.capacityGB}GB (${part.modules}x${part.capacityGB / part.modules}GB) ${part.type}-${part.speedMHz} CL${part.casLatency} • Height: ${part.heightMm}mm`;
                  } else if (part.category === 'gpu') {
                    specSummary = `${part.chipset} • ${part.vramGB}GB VRAM • Length: ${part.lengthMm}mm • ${part.tdpWatts}W TDP`;
                  } else if (part.category === 'psu') {
                    specSummary = `${part.wattage}W ${part.efficiencyRating} • ${part.formFactor} (${part.modular}) • ${part.connectors.pcie8Pin}x 8-Pin, ${part.connectors.pcie16Pin}x 16-Pin`;
                  } else if (part.category === 'case') {
                    specSummary = `${part.formFactor} (${part.supportedMotherboards.join('/')}) • Max GPU: ${part.maxGpuLengthMm}mm • Max Cooler: ${part.maxCoolerHeightMm}mm`;
                  } else if (part.category === 'cooler') {
                    specSummary = `${part.type} Cooler • ${part.tdpRatingWatts}W TDP Rating • Height: ${part.heightMm}mm • RAM Clearance: ≤${part.ramClearanceMm}mm`;
                  }
                }

                return (
                  <tr key={meta.id}>
                    <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300">
                      {meta.label}
                    </td>
                    {part ? (
                      <>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {part.brand} {part.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {specSummary}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(part.price)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 italic text-slate-400" colSpan={2}>
                          Not selected
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">₱0</td>
                      </>
                    )}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleJumpToSlot(meta.id)}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-sky-400 font-bold text-xs hover:underline"
                      >
                        <Edit3 className="w-3 h-3" /> {part ? 'Change' : '+ Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-950 font-black text-sm">
                <td className="py-4 px-4" colSpan={3}>
                  Total Estimated System Cost
                </td>
                <td className="py-4 px-4 text-right text-blue-600 dark:text-sky-400 text-base">
                  {formatCurrency(totalCost)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
