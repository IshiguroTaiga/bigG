import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { HARDWARE_GLOSSARY } from '../config/constants';
import { useBuildStore } from '../store/useBuildStore';

interface TooltipTermProps {
  termKey: keyof typeof HARDWARE_GLOSSARY;
  label?: string;
}

export const TooltipTerm: React.FC<TooltipTermProps> = ({ termKey, label }) => {
  const [open, setOpen] = useState(false);
  const beginnerMode = useBuildStore((s) => s.beginnerMode);
  const entry = HARDWARE_GLOSSARY[termKey];

  if (!entry) return <span>{label || termKey}</span>;
  if (!beginnerMode) return <span>{label || entry.title}</span>;

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help border-b border-dotted border-emerald-500/70 text-emerald-600 dark:text-emerald-400 font-medium"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      <span>{label || entry.title}</span>
      <HelpCircle className="w-3.5 h-3.5 inline shrink-0" />
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-xl bg-slate-900 text-slate-100 border border-emerald-500/40 shadow-2xl z-50 text-xs leading-relaxed pointer-events-none">
          <strong className="block text-emerald-400 font-semibold mb-1">
            {entry.title}
          </strong>
          <span className="block text-slate-300 mb-1.5">{entry.definition}</span>
          <span className="block text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
            💡 Tip: {entry.tip}
          </span>
        </span>
      )}
    </span>
  );
};
