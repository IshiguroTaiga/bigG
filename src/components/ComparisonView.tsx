import React, { useState } from 'react';
import { Scale, Plus, Trash2, Check } from 'lucide-react';
import { useBuildStore } from '../store/useBuildStore';
import {
  ALL_PARTS_BY_CATEGORY,
  getComponentById,
} from '../data';
import { CATEGORY_METADATA, formatCurrency } from '../config/constants';
import {
  AnyComponent,
  PartCategory,
  CPU,
  Motherboard,
  RAM,
  GPU,
  Storage,
  PSU,
  PCCase,
  CPUCooler,
} from '../types/pc';

export const ComparisonView: React.FC = () => {
  const {
    comparisonIds,
    toggleComparisonPart,
    clearComparison,
    selectPart,
    currentBuild,
  } = useBuildStore();

  const comparedParts = comparisonIds
    .map((id) => getComponentById(id))
    .filter((p): p is AnyComponent => Boolean(p));

  const initialCat: PartCategory =
    comparedParts.length > 0 ? comparedParts[0].category : 'gpu';
  const [selectedCat, setSelectedCat] = useState<PartCategory>(initialCat);

  const handleSwitchCategory = (cat: PartCategory) => {
    setSelectedCat(cat);
    const defaults = ALL_PARTS_BY_CATEGORY[cat].slice(0, 3);
    clearComparison();
    defaults.forEach((d) => toggleComparisonPart(d.id));
  };

  const getSpecRows = (cat: PartCategory): { label: string; render: (p: AnyComponent) => string }[] => {
    switch (cat) {
      case 'cpu':
        return [
          { label: 'Socket Platform', render: (p) => (p as CPU).socket },
          { label: 'Cores / Threads', render: (p) => `${(p as CPU).cores}C / ${(p as CPU).threads}T` },
          { label: 'Base / Boost Clock', render: (p) => `${(p as CPU).baseClockGHz} / ${(p as CPU).boostClockGHz} GHz` },
          { label: 'TDP Thermal Rating', render: (p) => `${(p as CPU).tdpWatts}W` },
          { label: 'Memory Support', render: (p) => `${(p as CPU).memoryChannels}-Channel ${(p as CPU).supportedMemoryTypes.join(' / ')}` },
          { label: 'Integrated Graphics', render: (p) => ((p as CPU).integratedGraphics ? (p as CPU).igpuName || 'Yes' : 'None (Discrete GPU Req.)') },
          { label: 'Gaming Score (0-100)', render: (p) => `${(p as CPU).gamingScore}/100` },
          { label: 'Productivity Score', render: (p) => `${(p as CPU).productivityScore}/100` },
          { label: 'Synthetic Benchmark', render: (p) => (p as CPU).benchmarkScore.toLocaleString() },
        ];
      case 'motherboard':
        return [
          { label: 'Socket & Chipset', render: (p) => `${(p as Motherboard).socket} (${(p as Motherboard).chipset})` },
          { label: 'Form Factor', render: (p) => (p as Motherboard).formFactor },
          { label: 'Memory Standard', render: (p) => `${(p as Motherboard).ramSlots}x ${(p as Motherboard).ramType} (Max ${(p as Motherboard).maxRamGB}GB)` },
          { label: 'PCIe Generation', render: (p) => `PCIe ${(p as Motherboard).pcieVersion}` },
          { label: 'M.2 NVMe Slots', render: (p) => `${(p as Motherboard).m2Slots} Slots` },
          { label: 'SATA III Ports', render: (p) => `${(p as Motherboard).sataPorts} Ports` },
          { label: 'VRM Power Tier', render: (p) => (p as Motherboard).vrmTier },
          { label: 'Wireless Networking', render: (p) => ((p as Motherboard).wifi ? 'Onboard Wi-Fi + BT' : 'Ethernet Only') },
        ];
      case 'ram':
        return [
          { label: 'Memory Standard', render: (p) => (p as RAM).type },
          { label: 'Total Capacity', render: (p) => `${(p as RAM).capacityGB}GB (${(p as RAM).modules}x${(p as RAM).capacityGB / (p as RAM).modules}GB)` },
          { label: 'Data Rate Speed', render: (p) => `${(p as RAM).speedMHz} MT/s` },
          { label: 'CAS Latency', render: (p) => `CL${(p as RAM).casLatency}` },
          { label: 'Module Height (Clearance)', render: (p) => `${(p as RAM).heightMm} mm` },
          { label: 'RGB Lighting', render: (p) => ((p as RAM).rgb ? 'Yes (Addressable RGB)' : 'No (Stealth Profile)') },
        ];
      case 'gpu':
        return [
          { label: 'GPU Chipset', render: (p) => (p as GPU).chipset },
          { label: 'Video Memory (VRAM)', render: (p) => `${(p as GPU).vramGB} GB` },
          { label: 'Card Length (mm)', render: (p) => `${(p as GPU).lengthMm} mm` },
          { label: 'Slot Thickness', render: (p) => `${(p as GPU).slotWidth} Slots` },
          { label: 'TDP / Rec. PSU', render: (p) => `${(p as GPU).tdpWatts}W (Rec. ${(p as GPU).recommendedPsuWatts}W)` },
          { label: 'Power Connectors', render: (p) => ((p as GPU).pcieConnectors.sixteenPin > 0 ? `${(p as GPU).pcieConnectors.sixteenPin}x 16-Pin (12VHPWR)` : `${(p as GPU).pcieConnectors.eightPin}x 8-Pin PCIe`) },
          { label: '1080p Gaming Index', render: (p) => `${(p as GPU).gamingScore1080p}/100` },
          { label: '1440p Gaming Index', render: (p) => `${(p as GPU).gamingScore1440p}/100` },
          { label: '4K Gaming Index', render: (p) => `${(p as GPU).gamingScore4k}/100` },
        ];
      case 'storage':
        return [
          { label: 'Drive Type', render: (p) => (p as Storage).type },
          { label: 'Capacity', render: (p) => `${(p as Storage).capacityGB} GB` },
          { label: 'Form Factor', render: (p) => (p as Storage).formFactor },
          { label: 'Interface', render: (p) => (p as Storage).interface },
          { label: 'Sequential Read', render: (p) => `${(p as Storage).readSpeedMBps} MB/s` },
          { label: 'Sequential Write', render: (p) => `${(p as Storage).writeSpeedMBps} MB/s` },
        ];
      case 'psu':
        return [
          { label: 'Continuous Wattage', render: (p) => `${(p as PSU).wattage}W` },
          { label: '80+ Efficiency', render: (p) => (p as PSU).efficiencyRating },
          { label: 'Form Factor', render: (p) => (p as PSU).formFactor },
          { label: 'Cabling Modularity', render: (p) => (p as PSU).modular },
          { label: '8-Pin PCIe Connectors', render: (p) => `${(p as PSU).connectors.pcie8Pin}x` },
          { label: '16-Pin 12VHPWR Ports', render: (p) => `${(p as PSU).connectors.pcie16Pin}x` },
        ];
      case 'case':
        return [
          { label: 'Tower Classification', render: (p) => (p as PCCase).formFactor },
          { label: 'Motherboard Support', render: (p) => (p as PCCase).supportedMotherboards.join(', ') },
          { label: 'Max GPU Length', render: (p) => `${(p as PCCase).maxGpuLengthMm} mm` },
          { label: 'Max CPU Cooler Height', render: (p) => `${(p as PCCase).maxCoolerHeightMm} mm` },
          { label: 'Max AIO Radiator', render: (p) => `${(p as PCCase).maxRadiatorMm} mm` },
          { label: 'PSU Support', render: (p) => (p as PCCase).supportedPsuFormFactors.join(', ') },
          { label: 'Included Fans', render: (p) => `${(p as PCCase).includedFans} Fans (${(p as PCCase).airflowRating})` },
        ];
      case 'cooler':
        return [
          { label: 'Cooling Type', render: (p) => (p as CPUCooler).type },
          { label: 'Tower Height / Radiator', render: (p) => ((p as CPUCooler).radiatorSizeMm ? `${(p as CPUCooler).radiatorSizeMm}mm Radiator` : `${(p as CPUCooler).heightMm}mm Height`) },
          { label: 'TDP Thermal Rating', render: (p) => `${(p as CPUCooler).tdpRatingWatts}W` },
          { label: 'Max RAM Height Clearance', render: (p) => `≤${(p as CPUCooler).ramClearanceMm} mm` },
          { label: 'Supported Sockets', render: (p) => (p as CPUCooler).supportedSockets.join(', ') },
          { label: 'Acoustic Noise Level', render: (p) => `${(p as CPUCooler).noiseLevelDb} dBA` },
        ];
    }
  };

  const activeCategoryForMatrix: PartCategory =
    comparedParts.length > 0 ? comparedParts[0].category : selectedCat;
  const rows = getSpecRows(activeCategoryForMatrix);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-500">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Side-by-Side Component Specification Comparator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare up to 4 components within any hardware category across price, performance, and physical dimensions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_METADATA.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSwitchCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeCategoryForMatrix === c.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {c.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Add Part Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500">
            Quick Add {activeCategoryForMatrix.toUpperCase()}:
          </span>
          {ALL_PARTS_BY_CATEGORY[activeCategoryForMatrix].map((p) => {
            const active = comparisonIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleComparisonPart(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  active
                    ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {active ? '✓ ' : '+ '}
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Comparison Table */}
        {comparedParts.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            Click any component pill above to populate the comparison matrix.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3 w-48 text-slate-400 font-semibold">
                    Specification
                  </th>
                  {comparedParts.map((part) => (
                    <th
                      key={part.id}
                      className="py-3 px-4 min-w-[210px] bg-slate-50/70 dark:bg-slate-950/50 rounded-t-xl"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-500">
                            {part.brand} • {part.tier}
                          </span>
                          <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                            {part.name}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleComparisonPart(part.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(part.price)}
                        </span>
                        <button
                          onClick={() => selectPart(part)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                        >
                          {currentBuild[part.category as Exclude<PartCategory, 'storage'>]?.id ===
                          part.id ? (
                            <>
                              <Check className="w-3 h-3" /> Installed
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" /> Use in Build
                            </>
                          )}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="bg-emerald-500/5">
                  <td className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">
                    Price-to-Performance Value
                  </td>
                  {comparedParts.map((part) => {
                    const perf =
                      part.category === 'cpu'
                        ? (part as CPU).benchmarkScore
                        : part.category === 'gpu'
                        ? (part as GPU).benchmarkScore
                        : part.price;
                    const ratio = ((perf / part.price) * 10).toFixed(2);
                    return (
                      <td key={part.id} className="py-2.5 px-4 font-bold text-emerald-500">
                        {part.category === 'cpu' || part.category === 'gpu'
                          ? `${ratio} pts / ₱10`
                          : `${part.tier} Value`}
                      </td>
                    );
                  })}
                </tr>
                {rows.map((row) => (
                  <tr key={row.label} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                    <td className="py-2.5 px-3 font-medium text-slate-500 dark:text-slate-400">
                      {row.label}
                    </td>
                    {comparedParts.map((part) => (
                      <td
                        key={part.id}
                        className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {row.render(part)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
