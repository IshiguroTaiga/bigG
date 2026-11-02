import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Gauge,
  Flame,
  Zap,
  Volume2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { useBuildStore } from '../store/useBuildStore';
import { simulatePerformance } from '../engine/performanceEngine';
import { evaluateCompatibility } from '../engine/compatibilityEngine';
import { TooltipTerm } from './TooltipTerm';

export const SimulationView: React.FC = () => {
  const { currentBuild, setActiveTab } = useBuildStore();

  const sim = useMemo(() => simulatePerformance(currentBuild), [currentBuild]);
  const compat = useMemo(() => evaluateCompatibility(currentBuild), [currentBuild]);

  if (!sim.ready) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center max-w-xl mx-auto my-8">
        <Cpu className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Performance & Bottleneck Simulator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
          {sim.missingReason}
        </p>
        <button
          onClick={() => setActiveTab('builder')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
        >
          Go to Interactive Builder
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Gaming Performance Index</span>
            <Gauge className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {sim.overallGamingIndex}{' '}
            <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${sim.overallGamingIndex}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Workstation / CAD Index</span>
            <Cpu className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {sim.overallWorkstationIndex}{' '}
            <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full"
              style={{ width: `${sim.overallWorkstationIndex}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Est. Full-Load Temps</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            CPU: {sim.thermalAcoustics.estimatedCpuLoadTempC}°C • GPU:{' '}
            {sim.thermalAcoustics.estimatedGpuLoadTempC}°C
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">
            Status: {sim.thermalAcoustics.thermalRating}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Acoustics & Power Headroom</span>
            <Volume2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            ~{sim.thermalAcoustics.estimatedNoiseDb} dBA •{' '}
            {compat.estimatedWattage.typicalLoadWatts}W Load
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Peak Transient: {compat.estimatedWattage.peakLoadWatts}W (Rec.{' '}
            {compat.estimatedWattage.recommendedPsuWatts}W)
          </div>
        </div>
      </div>

      {/* Bottleneck Visualizer & Resolution Load Shift */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                <TooltipTerm termKey="bottleneck" label="CPU vs. GPU Bottleneck Analysis" />
              </h3>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  sim.bottleneck.severity === 'Optimal (Balanced)'
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : sim.bottleneck.severity === 'Mild Imbalance'
                    ? 'bg-sky-500/15 text-sky-500'
                    : sim.bottleneck.severity === 'Moderate Bottleneck'
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-rose-500/15 text-rose-500'
                }`}
              >
                {sim.bottleneck.severity} ({sim.bottleneck.bottleneckPercentage}%)
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {sim.bottleneck.explanation}
            </p>

            {/* Resolution Utilization Shift Bars */}
            <div className="space-y-3 mb-4">
              {(
                [
                  { label: '1080p (FHD)', data: sim.bottleneck.resolutionBalance.res1080p },
                  { label: '1440p (QHD)', data: sim.bottleneck.resolutionBalance.res1440p },
                  { label: '4K (UHD)', data: sim.bottleneck.resolutionBalance.res4k },
                ] as const
              ).map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-sky-500">CPU Load Share: {row.data.cpuShare}%</span>
                    <span className="text-slate-500">{row.label}</span>
                    <span className="text-emerald-500">
                      GPU Load Share: {row.data.gpuShare}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-sky-500 h-full"
                      style={{ width: `${row.data.cpuShare}%` }}
                    />
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${row.data.gpuShare}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-start gap-2">
              {sim.bottleneck.severity === 'Optimal (Balanced)' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block text-slate-900 dark:text-white mb-0.5">
                  Limiting Factor: {sim.bottleneck.limitingComponent}
                </strong>
                <span className="text-slate-600 dark:text-slate-400">
                  {sim.bottleneck.upgradeAdvice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Resolution FPS Bar Chart */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Simulated Multi-Resolution Gaming Frame Rates (FPS)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estimated average FPS across 1080p, 1440p, and 4K Ultra settings
              </p>
            </div>
          </div>

          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sim.fpsBenchmarks} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="game" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" fps" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="fps1080p" name="1080p FHD" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fps1440p" name="1440p QHD" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fps4k" name="4K UHD" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PSU Efficiency & Transient Load Curve */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>
                PSU Load Headroom & 80+ AC-DC Efficiency Curve (
                {currentBuild.psu
                  ? `${currentBuild.psu.brand} ${currentBuild.psu.name}`
                  : 'Reference 650W PSU'}
                )
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Power supplies reach peak efficiency between 40% and 60% load. Your typical load is{' '}
              <strong>{compat.estimatedWattage.typicalLoadWatts}W</strong> and peak transient load is{' '}
              <strong>{compat.estimatedWattage.peakLoadWatts}W</strong>.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('recommender')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Optimize Build with XAI Recommender</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sim.psuCurve} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="systemWatts"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                unit="W"
              />
              <YAxis
                domain={[78, 96]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="efficiencyPercent"
                name="80+ Conversion Efficiency (%)"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
