import React from 'react';
import {
  BookOpen,
  ShieldAlert,
  Wrench,
  Users,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import { HARDWARE_GLOSSARY, ACADEMIC_DISCLAIMER } from '../config/constants';

const TEAM_MEMBERS = [
  'Justine Dwight Acoba',
  'John Benedict Alberto',
  'Arom Sylon Apostle Alcausin',
  'Nythan Bagasani',
  'Karl Vincent Balcita',
  'Jonas Nathaniel Bonifacio',
  'Luis Bullanday',
  'Zeus Bumagat',
  'Mark Lorenz Datuin',
  'Micko Gabriel Permison',
  'Stephen Jay Polendey',
  'Rhed Luis Ratuita',
];

const ASSEMBLY_STEPS = [
  {
    step: 1,
    title: 'Prepare the Motherboard Outside the Case (Bench Prep)',
    detail:
      'Place the motherboard on its anti-static cardboard box. Unlock the CPU socket lever (AM4/AM5/LGA1700), align the golden triangle on the CPU corner with the socket triangle, and lower it gently with zero downward force before latching.',
  },
  {
    step: 2,
    title: 'Install M.2 NVMe SSDs & RAM Modules in Dual-Channel Slots',
    detail:
      'Insert M.2 2280 drives at a 30° angle into the primary CPU-attached M.2 slot and secure the standoff screw. For 2-stick RAM kits on a 4-slot board, populate slots A2 and B2 (2nd and 4th from CPU) until both latches click.',
  },
  {
    step: 3,
    title: 'Mount CPU Cooler Backplate & Thermal Paste',
    detail:
      'Apply a pea-sized drop (or X-pattern) of non-conductive thermal paste onto the CPU IHS. CRITICAL: Peel off the transparent protective plastic film from the bottom of the CPU cooler coldplate before tightening screws in a criss-cross pattern.',
  },
  {
    step: 4,
    title: 'Install Rear I/O Shield, Case Standoffs & Motherboard',
    detail:
      'Verify that the brass standoffs in the PC Case match your motherboard form factor (ATX, Micro-ATX, or Mini-ITX). Remove any extra unused standoffs underneath the PCB to prevent electrical short circuits.',
  },
  {
    step: 5,
    title: 'Mount Power Supply (PSU) & Route Core Power Cables',
    detail:
      'Install the PSU with its intake fan facing the perforated bottom/side mesh. Route the 24-pin ATX motherboard cable, 8-pin EPS CPU power cable (top-left of motherboard), and PCIe/12VHPWR GPU cables through the rear grommets.',
  },
  {
    step: 6,
    title: 'Seat the Graphics Card (GPU) & Verify Connector Latch',
    detail:
      'Remove the required PCIe rear expansion slot covers, unlock the top PCIe x16 retention clip, and press the GPU straight down until it clicks. Ensure 16-pin (12VHPWR) or 8-pin PCIe plugs are seated 100% flush with zero gap.',
  },
];

export const AssemblyGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* First-Time Builder Assembly Checklist */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Zero-Risk First-Time PC Assembly & Safety Protocol
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Step-by-step physical assembly sequence designed to eliminate bent socket pins, static discharge, and melted power connectors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ASSEMBLY_STEPS.map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Engineering Glossary */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-5 h-5 text-sky-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Interactive Hardware Compatibility Glossary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(HARDWARE_GLOSSARY).map(([key, term]) => (
            <div
              key={key}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800"
            >
              <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                {term.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                {term.definition}
              </p>
              <div className="text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg px-2.5 py-1.5">
                <strong>Pro Tip:</strong> {term.tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MMSU CCIS Capstone Project Credits */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-amber-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                Mariano Marcos State University (MMSU)
              </span>
              <h3 className="text-lg font-extrabold">
                College of Computing and Information Sciences (CCIS)
              </h3>
              <p className="text-xs text-slate-400">
                Capstone Project: Digital PC Builder — Virtual Compatibility & Simulation System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>12-Member Research & Engineering Team</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-5">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-800 text-xs font-medium text-slate-200"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{member}</span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{ACADEMIC_DISCLAIMER}</span>
        </div>
      </div>
    </div>
  );
};
