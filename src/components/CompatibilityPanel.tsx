import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Wrench,
  Filter,
} from 'lucide-react';
import { CompatibilityReport, PartCategory } from '../types/pc';

interface CompatibilityPanelProps {
  report: CompatibilityReport;
  onSelectCategory: (cat: PartCategory) => void;
}

export const CompatibilityPanel: React.FC<CompatibilityPanelProps> = ({
  report,
  onSelectCategory,
}) => {
  const [filter, setFilter] = useState<'all' | 'issues' | 'passed'>('all');

  const filteredResults = report.results.filter((item) => {
    if (filter === 'issues') return item.status === 'fail' || item.status === 'warn';
    if (filter === 'passed') return item.status === 'pass';
    return true;
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${
              report.overallStatus === 'pass'
                ? 'bg-emerald-500/15 text-emerald-500'
                : report.overallStatus === 'warn'
                ? 'bg-amber-500/15 text-amber-500'
                : 'bg-rose-500/15 text-rose-500'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Automated Compatibility Diagnostics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compatibility Score: <strong>{report.score}/100</strong> •{' '}
              {report.failureCount} Failures • {report.warningCount} Warnings •{' '}
              {report.passedCount} Passed
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <Filter className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({report.results.length})
          </button>
          <button
            onClick={() => setFilter('issues')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              filter === 'issues'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Issues ({report.failureCount + report.warningCount})
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              filter === 'passed'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Passed ({report.passedCount})
          </button>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          {report.results.length === 0
            ? 'Select at least two components to run multi-constraint compatibility verification.'
            : 'No diagnostics match the selected filter.'}
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredResults.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 rounded-xl border text-xs transition ${
                issue.status === 'fail'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
                  : issue.status === 'warn'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {issue.status === 'fail' && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  {issue.status === 'warn' && (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  {issue.status === 'pass' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{issue.title}</span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {issue.ruleCategory}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {issue.explanation}
                    </p>
                    {issue.recommendation && (
                      <div className="mt-2 flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                        <Wrench className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Fix: {issue.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Jump Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {issue.affectedCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => onSelectCategory(cat)}
                      className="px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-emerald-500 hover:text-white border border-slate-300 dark:border-slate-700 text-[10px] uppercase font-bold transition"
                      title={`Jump to ${cat.toUpperCase()} picker`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
