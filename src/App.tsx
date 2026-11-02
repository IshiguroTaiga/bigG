import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { BuilderView } from './components/BuilderView';
import { SimulationView } from './components/SimulationView';
import { RecommendationView } from './components/RecommendationView';
import { ComparisonView } from './components/ComparisonView';
import { BuildSummaryView } from './components/BuildSummaryView';
import { SavedBuildsView } from './components/SavedBuildsView';
import { AssemblyGuideView } from './components/AssemblyGuideView';
import { SavedBuildsModal } from './components/SavedBuildsModal';
import { useBuildStore } from './store/useBuildStore';
import { ACADEMIC_DISCLAIMER } from './config/constants';
import { Info } from 'lucide-react';

export const App: React.FC = () => {
  const { projectEdition, activeTab, darkMode, loadFromUrlParams } = useBuildStore();
  const [savedModalOpen, setSavedModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    loadFromUrlParams();
  }, [loadFromUrlParams]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onOpenSavedModal={() => setSavedModalOpen(true)} />

      {projectEdition === 'rcssln' ? (
        <main className="flex-1 w-full flex flex-col">
          <iframe
            src="./rcssln/index.html"
            title="rcssln Digital PC Builder Edition"
            className="w-full flex-1 min-h-[calc(100vh-68px)] border-0 bg-slate-950"
          />
        </main>
      ) : (
        <>
          <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'builder' && <BuilderView />}
            {activeTab === 'simulation' && <SimulationView />}
            {activeTab === 'recommender' && <RecommendationView />}
            {activeTab === 'compare' && <ComparisonView />}
            {activeTab === 'summary' && <BuildSummaryView />}
            {activeTab === 'saved' && <SavedBuildsView />}
            {activeTab === 'guide' && <AssemblyGuideView />}
          </main>

          {/* Persistent Academic & Sample Data Footer Disclaimer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 py-4 px-4 sm:px-6 mt-10">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-start sm:items-center gap-2">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                <span>{ACADEMIC_DISCLAIMER}</span>
              </div>
              <div className="shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                MMSU CCIS Capstone Project • 2026
              </div>
            </div>
          </footer>
        </>
      )}

      <SavedBuildsModal
        open={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
      />
    </div>
  );
};

export default App;
