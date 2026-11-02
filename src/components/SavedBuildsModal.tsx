import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  BookmarkPlus,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useBuildStore } from '../store/useBuildStore';
import { PRESET_BUILDS, calculateBuildTotalCost } from '../data';
import { formatCurrency } from '../config/constants';
import { evaluateCompatibility } from '../engine/compatibilityEngine';

interface SavedBuildsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SavedBuildsModal: React.FC<SavedBuildsModalProps> = ({ open, onClose }) => {
  const {
    savedBuilds,
    saveCurrentBuild,
    deleteSavedBuild,
    loadBuild,
    exportBuildToJson,
    importBuildFromJson,
  } = useBuildStore();

  const [buildName, setBuildName] = useState('');
  const [buildDesc, setBuildDesc] = useState('');
  const [importText, setImportText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCurrentBuild(
      buildName || `MMSU Custom Build (${new Date().toLocaleDateString()})`,
      buildDesc || 'Saved in browser localStorage'
    );
    setBuildName('');
    setBuildDesc('');
    setFeedback('Current build saved to browser localStorage!');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleImport = () => {
    const res = importBuildFromJson(importText);
    setFeedback(res.message);
    if (res.success) {
      setImportText('');
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1000);
    }
  };

  const handleExportDownload = () => {
    const json = exportBuildToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-pc-builder-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Curated Presets, Saved Builds & JSON Import/Export
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
          {/* Left: Curated Presets + User Saved Builds */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Curated MMSU Reference & Classroom Demo Presets
            </h3>
            <div className="space-y-2.5">
              {PRESET_BUILDS.map((preset) => {
                const cost = calculateBuildTotalCost(preset.build);
                const compat = evaluateCompatibility(preset.build);
                return (
                  <div
                    key={preset.id}
                    className={`p-3.5 rounded-xl border transition ${
                      compat.failureCount > 0
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {preset.name}
                          </h4>
                          {preset.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                compat.failureCount > 0
                                  ? 'bg-rose-500/20 text-rose-500'
                                  : 'bg-emerald-500/15 text-emerald-500'
                              }`}
                            >
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {preset.description}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          loadBuild(preset.build);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0"
                      >
                        Load ({formatCurrency(cost)})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* User Saved Builds */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-3">
              Your Saved Builds (localStorage: {savedBuilds.length})
            </h3>
            {savedBuilds.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
                No custom builds saved yet. Use the form on the right to save your current configuration.
              </div>
            ) : (
              <div className="space-y-2">
                {savedBuilds.map((saved) => {
                  const cost = calculateBuildTotalCost(saved.build);
                  const compat = evaluateCompatibility(saved.build);
                  return (
                    <div
                      key={saved.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {saved.name}
                          </span>
                          <span className="text-xs font-bold text-emerald-500">
                            {formatCurrency(cost)}
                          </span>
                          {compat.failureCount > 0 && (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{saved.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            loadBuild(saved.build);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-semibold"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSavedBuild(saved.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Save Current Build + JSON Import/Export */}
          <div className="lg:col-span-5 space-y-5">
            <form
              onSubmit={handleSave}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <BookmarkPlus className="w-4 h-4 text-emerald-500" />
                <span>Save Active Build to Browser</span>
              </h3>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="Build Name (e.g., My 1440p Capstone Rig)"
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={buildDesc}
                onChange={(e) => setBuildDesc(e.target.value)}
                placeholder="Notes or target workload..."
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Save Build to LocalStorage
              </button>
            </form>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-sky-500" />
                  <span>JSON Build Import / Export</span>
                </h3>
                <button
                  onClick={handleExportDownload}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .JSON</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste exported JSON build configuration here..."
                className="w-full p-2.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleImport}
                disabled={!importText.trim()}
                className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold transition"
              >
                Import JSON Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
