import React from 'react';
import { PartCategory, PCBuildState } from '../types/pc';
import { evaluateCompatibility } from '../engine/compatibilityEngine';

interface CaseVisualizer2DProps {
  build: PCBuildState;
  activeCategory: PartCategory;
  onSelectCategory: (cat: PartCategory) => void;
}

export const CaseVisualizer2D: React.FC<CaseVisualizer2DProps> = ({
  build,
  activeCategory,
  onSelectCategory,
}) => {
  const compat = evaluateCompatibility(build);

  const hasConflict = (cat: PartCategory) =>
    compat.results.some((r) => r.status === 'fail' && r.affectedCategories.includes(cat));
  const hasWarning = (cat: PartCategory) =>
    compat.results.some((r) => r.status === 'warn' && r.affectedCategories.includes(cat));

  const getStrokeColor = (cat: PartCategory, isPresent: boolean) => {
    if (hasConflict(cat)) return '#f43f5e'; // rose-500
    if (hasWarning(cat)) return '#f59e0b'; // amber-500
    if (activeCategory === cat) return '#38bdf8'; // sky-400
    if (isPresent) return '#10b981'; // emerald-500
    return '#475569'; // slate-600
  };

  // Dynamic GPU width scaling based on actual mm vs max case mm
  const maxCaseGpuMm = build.case ? build.case.maxGpuLengthMm : 360;
  const gpuMm = build.gpu ? build.gpu.lengthMm : 0;
  const gpuPixelWidth = build.gpu
    ? Math.min(285, Math.max(110, Math.round((gpuMm / maxCaseGpuMm) * 245)))
    : 190;
  const gpuOverflow = build.gpu && build.case && gpuMm > maxCaseGpuMm;

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox="0 0 520 400"
        className="w-full max-w-[520px] h-auto rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner select-none"
      >
        <defs>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(148, 163, 184, 0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width="520" height="400" fill="url(#blueprint-grid)" />

        {/* Outer Chassis Frame (Case) */}
        <g
          onClick={() => onSelectCategory('case')}
          className="cursor-pointer transition-opacity hover:opacity-90"
        >
          <rect
            x="30"
            y="24"
            width="460"
            height="352"
            rx="14"
            fill="rgba(15, 23, 42, 0.75)"
            stroke={getStrokeColor('case', Boolean(build.case))}
            strokeWidth="3"
          />
          <text x="45" y="46" fill="#94a3b8" fontSize="11" fontWeight="bold">
            CHASSIS: {build.case ? `${build.case.brand} ${build.case.name}` : 'None Selected (Click to Pick)'}
          </text>
          {build.case && (
            <text x="45" y="61" fill="#64748b" fontSize="10">
              Max GPU: {build.case.maxGpuLengthMm}mm | Max Cooler: {build.case.maxCoolerHeightMm}mm | Form: {build.case.supportedMotherboards.join('/')}
            </text>
          )}
        </g>

        {/* Top AIO Radiator Bay (if AIO Cooler selected) */}
        {build.cooler?.type === 'AIO' && (
          <g onClick={() => onSelectCategory('cooler')} className="cursor-pointer">
            <rect
              x="110"
              y="32"
              width={build.cooler.radiatorSizeMm === 360 ? 270 : 190}
              height="24"
              rx="4"
              fill="rgba(14, 165, 233, 0.2)"
              stroke={getStrokeColor('cooler', true)}
              strokeWidth="2"
            />
            <text x="120" y="48" fill="#38bdf8" fontSize="10" fontWeight="bold">
              AIO RADIATOR ({build.cooler.radiatorSizeMm}mm)
            </text>
          </g>
        )}

        {/* Motherboard Tray */}
        <g
          onClick={() => onSelectCategory('motherboard')}
          className="cursor-pointer transition-opacity hover:opacity-95"
        >
          <rect
            x="55"
            y="72"
            width={
              build.motherboard?.formFactor === 'Mini-ITX'
                ? 185
                : build.motherboard?.formFactor === 'Micro-ATX'
                ? 225
                : 250
            }
            height={
              build.motherboard?.formFactor === 'Mini-ITX'
                ? 155
                : build.motherboard?.formFactor === 'Micro-ATX'
                ? 190
                : 215
            }
            rx="8"
            fill="rgba(30, 41, 59, 0.9)"
            stroke={getStrokeColor('motherboard', Boolean(build.motherboard))}
            strokeWidth="2.5"
            strokeDasharray={build.motherboard ? '0' : '5,5'}
          />
          <text x="67" y="92" fill="#e2e8f0" fontSize="10" fontWeight="bold">
            MOTHERBOARD ({build.motherboard ? build.motherboard.formFactor : 'Empty Slot'})
          </text>
          <text x="67" y="106" fill="#94a3b8" fontSize="9.5">
            {build.motherboard
              ? `${build.motherboard.name} [${build.motherboard.socket} • ${build.motherboard.ramType}]`
              : 'Click to select motherboard'}
          </text>
        </g>

        {/* CPU Socket Slot */}
        <g
          onClick={() => onSelectCategory('cpu')}
          className="cursor-pointer transition-transform"
        >
          <rect
            x="105"
            y="120"
            width="76"
            height="68"
            rx="6"
            fill={build.cpu ? 'rgba(16, 185, 129, 0.2)' : 'rgba(51, 65, 85, 0.5)'}
            stroke={getStrokeColor('cpu', Boolean(build.cpu))}
            strokeWidth="2.5"
          />
          <text x="143" y="146" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
            CPU
          </text>
          <text x="143" y="160" textAnchor="middle" fill="#cbd5e1" fontSize="8.5">
            {build.cpu ? build.cpu.name : 'Empty'}
          </text>
          {build.cpu && (
            <text x="143" y="174" textAnchor="middle" fill="#34d399" fontSize="8">
              {build.cpu.socket} • {build.cpu.tdpWatts}W
            </text>
          )}
        </g>

        {/* CPU Cooler Overlay Badge */}
        <g
          onClick={() => onSelectCategory('cooler')}
          className="cursor-pointer"
        >
          <circle
            cx="143"
            cy="154"
            r="41"
            fill="none"
            stroke={getStrokeColor('cooler', Boolean(build.cooler))}
            strokeWidth="2"
            strokeDasharray="4,3"
          />
          <rect
            x="86"
            y="192"
            width="114"
            height="19"
            rx="4"
            fill="rgba(15, 23, 42, 0.9)"
            stroke={getStrokeColor('cooler', Boolean(build.cooler))}
            strokeWidth="1.5"
          />
          <text x="143" y="205" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="bold">
            {build.cooler
              ? `COOLER: ${build.cooler.type} (${build.cooler.heightMm}mm)`
              : 'COOLER: None'}
          </text>
        </g>

        {/* RAM DIMM Slots */}
        <g onClick={() => onSelectCategory('ram')} className="cursor-pointer">
          <rect
            x="212"
            y="116"
            width="62"
            height="76"
            rx="5"
            fill={build.ram ? 'rgba(139, 92, 246, 0.2)' : 'rgba(51, 65, 85, 0.4)'}
            stroke={getStrokeColor('ram', Boolean(build.ram))}
            strokeWidth="2"
          />
          {[0, 1, 2, 3].map((slotIdx) => {
            const maxSlots = build.motherboard ? build.motherboard.ramSlots : 4;
            const populated = build.ram ? slotIdx < build.ram.modules : false;
            if (slotIdx >= maxSlots) return null;
            return (
              <rect
                key={slotIdx}
                x={220 + slotIdx * 12}
                y="124"
                width="7"
                height="46"
                rx="1.5"
                fill={populated ? '#a78bfa' : '#334155'}
              />
            );
          })}
          <text x="243" y="184" textAnchor="middle" fill="#e2e8f0" fontSize="8.5" fontWeight="bold">
            {build.ram ? `${build.ram.capacityGB}GB ${build.ram.type}` : 'RAM Slots'}
          </text>
        </g>

        {/* PCIe GPU Slot + Length Ruler */}
        <g onClick={() => onSelectCategory('gpu')} className="cursor-pointer">
          {/* Max GPU Length Guideline */}
          <line
            x1="68"
            y1="264"
            x2="313"
            y2="264"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <rect
            x="68"
            y="222"
            width={gpuPixelWidth}
            height="38"
            rx="6"
            fill={
              gpuOverflow
                ? 'rgba(244, 63, 94, 0.3)'
                : build.gpu
                ? 'rgba(16, 185, 129, 0.22)'
                : 'rgba(51, 65, 85, 0.4)'
            }
            stroke={getStrokeColor('gpu', Boolean(build.gpu))}
            strokeWidth="2.5"
          />
          <text x="78" y="239" fill="#f8fafc" fontSize="9.5" fontWeight="bold">
            {build.gpu
              ? `GPU: ${build.gpu.name}`
              : build.cpu?.integratedGraphics
              ? `Onboard iGPU (${build.cpu.igpuName}) - Click to Add GPU`
              : 'PCIe x16 GPU Slot (Empty)'}
          </text>
          <text x="78" y="252" fill="#cbd5e1" fontSize="8.5">
            {build.gpu
              ? `${build.gpu.lengthMm}mm Length • ${build.gpu.vramGB}GB VRAM • ${build.gpu.tdpWatts}W TDP`
              : 'Click to select dedicated graphics card'}
          </text>
        </g>

        {/* Storage Bay (M.2 + Drive Cage) */}
        <g onClick={() => onSelectCategory('storage')} className="cursor-pointer">
          <rect
            x="335"
            y="72"
            width="135"
            height="120"
            rx="8"
            fill={build.storage.length > 0 ? 'rgba(14, 165, 233, 0.16)' : 'rgba(30, 41, 59, 0.7)'}
            stroke={getStrokeColor('storage', build.storage.length > 0)}
            strokeWidth="2"
          />
          <text x="347" y="92" fill="#e2e8f0" fontSize="10" fontWeight="bold">
            STORAGE ({build.storage.length} Drive{build.storage.length === 1 ? '' : 's'})
          </text>
          {build.storage.length === 0 ? (
            <text x="347" y="112" fill="#94a3b8" fontSize="9">
              Click to add NVMe / SSD
            </text>
          ) : (
            build.storage.slice(0, 3).map((d, i) => (
              <text key={i} x="347" y={112 + i * 18} fill="#bae6fd" fontSize="8.5">
                • {d.type}: {d.capacityGB >= 1000 ? `${d.capacityGB / 1000}TB` : `${d.capacityGB}GB`} ({d.formFactor})
              </text>
            ))
          )}
        </g>

        {/* PSU Shroud (Bottom Chamber) */}
        <g onClick={() => onSelectCategory('psu')} className="cursor-pointer">
          <rect
            x="55"
            y="302"
            width="235"
            height="56"
            rx="8"
            fill={build.psu ? 'rgba(245, 158, 11, 0.18)' : 'rgba(30, 41, 59, 0.8)'}
            stroke={getStrokeColor('psu', Boolean(build.psu))}
            strokeWidth="2.5"
          />
          <text x="68" y="324" fill="#f8fafc" fontSize="10" fontWeight="bold">
            PSU: {build.psu ? `${build.psu.brand} ${build.psu.name}` : 'None Selected (Click to Pick)'}
          </text>
          <text x="68" y="341" fill="#cbd5e1" fontSize="9">
            {build.psu
              ? `${build.psu.wattage}W ${build.psu.efficiencyRating} (${build.psu.formFactor}) • Est. Peak Load: ${compat.estimatedWattage.peakLoadWatts}W`
              : `Est. System Peak Load: ${compat.estimatedWattage.peakLoadWatts}W`}
          </text>
        </g>

        {/* Front Intake Fans Indicator */}
        <g>
          {[0, 1, 2].map((idx) => (
            <rect
              key={idx}
              x="466"
              y={88 + idx * 82}
              width="12"
              height="66"
              rx="4"
              fill="rgba(56, 189, 248, 0.25)"
              stroke="#0284c7"
              strokeWidth="1.5"
            />
          ))}
          <text
            x="456"
            y="215"
            fill="#38bdf8"
            fontSize="8.5"
            textAnchor="end"
            fontWeight="bold"
          >
            FRONT AIRFLOW
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2.5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Installed & Valid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Active Slot
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Clearance Warning
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Physical/Power Conflict
        </span>
      </div>
    </div>
  );
};
