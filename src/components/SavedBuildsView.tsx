import React, { useState } from 'react';
import {
  FolderKanban,
  BookmarkPlus,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useBuildStore } from '../store/useBuildStore';
import { PRESET_BUILDS, calculateBuildTotalCost } from '../data';
import { formatCurrency } from '../config/constants';
import { evaluateCompatibility } from '../engine/compatibilityEngine';

export const SavedBuildsView: React.FC = () => {
  const {
    savedBuilds,
    saveCurrentBuild,
    deleteSavedBuild,
    loadBuild,
    setActiveTab,
    exportBuildToJson,
    importBuildFromJson,
  } = useBuildStore();

  const [buildName, setBuildName] = useState('');
  const [buildDesc, setBuildDesc] = useState('');
  const [importText, setImportText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCurrentBuild(
      buildName || `MMSU Custom Build (${new Date().toLocaleDateString()})`,
      buildDesc || 'Saved in browser localStorage'
    );
    setBuildName('');
    setBuildDesc('');
    setFeedback('Active build saved to your browser localStorage gallery!');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleImport = () => {
    const res = importBuildFromJson(importText);
    setFeedback(res.message);
    if (res.success) {
      setImportText('');
      setTimeout(() => {
        setFeedback(null);
        setActiveTab('builder');
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
    <div className="space-y-6">
      {feedback && (
        <div className="p-3.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-sky-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Presets & Saved Gallery */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <FolderKanban className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Official MMSU Reference & Classroom Demo Presets (5)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pre-configured builds including budget academic, balanced 1080p/1440p gaming, AI workstation, and an intentional compatibility trap build.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {PRESET_BUILDS.map((preset) => {
                const cost = calculateBuildTotalCost(preset.build);
                const compat = evaluateCompatibility(preset.build);
                const isTrap = compat.failureCount > 0;
                return (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-xl border transition ${
                      isTrap
                        ? 'border-rose-500/40 bg-rose-500/5'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {preset.name}
                          </h3>
                          {preset.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isTrap
                                  ? 'bg-rose-500/20 text-rose-500'
                                  : 'bg-blue-500/15 text-blue-600 dark:text-sky-400'
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
                          setActiveTab('builder');
                        }}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5"
                      >
                        <span>Load ({formatCurrency(cost)})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">
              Saved Builds Gallery (localStorage: {savedBuilds.length})
            </h3>
            {savedBuilds.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
                No custom builds saved yet. Use the form on the right to save your active configuration to browser storage.
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedBuilds.map((saved) => {
                  const cost = calculateBuildTotalCost(saved.build);
                  const compat = evaluateCompatibility(saved.build);
                  return (
                    <div
                      key={saved.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {saved.name}
                          </span>
                          <span className="text-xs font-bold text-blue-600 dark:text-sky-400">
                            {formatCurrency(cost)}
                          </span>
                          {compat.failureCount > 0 && (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{saved.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            loadBuild(saved.build);
                            setActiveTab('builder');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                        >
                          Load in Builder
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
        </div>

        {/* Right: Save & JSON Import/Export */}
        <div className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleSave}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-blue-500" />
              <span>Save Active Build to Gallery</span>
            </h3>
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              placeholder="Build Name (e.g., My 1440p Capstone Rig)"
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={buildDesc}
              onChange={(e) => setBuildDesc(e.target.value)}
              placeholder="Notes or target workload..."
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
            >
              Save Build to LocalStorage
            </button>
          </form>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-500" />
                <span>JSON Build Import / Export</span>
              </h3>
              <button
                onClick={handleExportDownload}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .JSON</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste exported JSON build configuration here..."
              className="w-full p-3 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={!importText.trim()}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold transition"
            >
              Import JSON Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
