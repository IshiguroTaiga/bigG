import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AnyComponent,
  PartCategory,
  PCBuildState,
  SavedBuild,
  Storage,
} from '../types/pc';
import {
  EMPTY_BUILD,
  PRESET_BUILDS,
  getComponentById,
} from '../data';

export type ActiveTab =
  | 'home'
  | 'builder'
  | 'simulation'
  | 'recommender'
  | 'compare'
  | 'summary'
  | 'saved'
  | 'guide';

interface BuildStoreState {
  currentBuild: PCBuildState;
  activeCategory: PartCategory;
  activeTab: ActiveTab;
  visualizerMode: '3d' | '2d';
  darkMode: boolean;
  beginnerMode: boolean;
  savedBuilds: SavedBuild[];
  comparisonIds: string[];

  // Actions
  setActiveCategory: (category: PartCategory) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setVisualizerMode: (mode: '3d' | '2d') => void;
  toggleDarkMode: () => void;
  toggleBeginnerMode: () => void;
  selectPart: (part: AnyComponent) => void;
  removePart: (category: PartCategory, storageIndex?: number) => void;
  clearBuild: () => void;
  loadBuild: (build: PCBuildState) => void;
  saveCurrentBuild: (name: string, description: string) => void;
  deleteSavedBuild: (id: string) => void;
  importBuildFromJson: (jsonString: string) => { success: boolean; message: string };
  exportBuildToJson: () => string;
  generateShareUrl: () => string;
  loadFromUrlParams: () => boolean;
  toggleComparisonPart: (partId: string) => void;
  clearComparison: () => void;
}

interface CompactBuildPayload {
  c?: string;
  m?: string;
  r?: string;
  g?: string;
  s?: string[];
  p?: string;
  k?: string;
  l?: string;
}

export function serializeBuildToCode(build: PCBuildState): string {
  const payload: CompactBuildPayload = {
    c: build.cpu?.id,
    m: build.motherboard?.id,
    r: build.ram?.id,
    g: build.gpu?.id,
    s: build.storage.map((d) => d.id),
    p: build.psu?.id,
    k: build.case?.id,
    l: build.cooler?.id,
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function deserializeBuildFromCode(code: string): PCBuildState | null {
  try {
    const json = decodeURIComponent(atob(code));
    const payload = JSON.parse(json) as CompactBuildPayload;
    const next: PCBuildState = { ...EMPTY_BUILD, storage: [] };

    if (payload.c) next.cpu = (getComponentById(payload.c) as PCBuildState['cpu']) || null;
    if (payload.m)
      next.motherboard =
        (getComponentById(payload.m) as PCBuildState['motherboard']) || null;
    if (payload.r) next.ram = (getComponentById(payload.r) as PCBuildState['ram']) || null;
    if (payload.g) next.gpu = (getComponentById(payload.g) as PCBuildState['gpu']) || null;
    if (payload.p) next.psu = (getComponentById(payload.p) as PCBuildState['psu']) || null;
    if (payload.k) next.case = (getComponentById(payload.k) as PCBuildState['case']) || null;
    if (payload.l)
      next.cooler = (getComponentById(payload.l) as PCBuildState['cooler']) || null;
    if (Array.isArray(payload.s)) {
      next.storage = payload.s
        .map((id) => getComponentById(id) as Storage | undefined)
        .filter((item): item is Storage => Boolean(item && item.category === 'storage'));
    }
    return next;
  } catch {
    return null;
  }
}

export const useBuildStore = create<BuildStoreState>()(
  persist(
    (set, get) => ({
      currentBuild: PRESET_BUILDS[2].build,
      activeCategory: 'cpu',
      activeTab: 'home',
      visualizerMode: '3d',
      darkMode: true,
      beginnerMode: true,
      savedBuilds: [],
      comparisonIds: ['gpu-rtx-4060', 'gpu-rx-7700xt', 'gpu-rtx-4070-super'],

      setActiveCategory: (category) => set({ activeCategory: category }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setVisualizerMode: (mode) => set({ visualizerMode: mode }),
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next);
          }
          return { darkMode: next };
        }),
      toggleBeginnerMode: () =>
        set((state) => ({ beginnerMode: !state.beginnerMode })),

      selectPart: (part) =>
        set((state) => {
          const next = { ...state.currentBuild, storage: [...state.currentBuild.storage] };
          switch (part.category) {
            case 'cpu':
              next.cpu = part;
              break;
            case 'motherboard':
              next.motherboard = part;
              break;
            case 'ram':
              next.ram = part;
              break;
            case 'gpu':
              next.gpu = part;
              break;
            case 'psu':
              next.psu = part;
              break;
            case 'case':
              next.case = part;
              break;
            case 'cooler':
              next.cooler = part;
              break;
            case 'storage':
              if (next.storage.length < 4) {
                next.storage = [...next.storage, part];
              } else {
                next.storage[next.storage.length - 1] = part;
              }
              break;
          }
          return { currentBuild: next };
        }),

      removePart: (category, storageIndex) =>
        set((state) => {
          const next = { ...state.currentBuild, storage: [...state.currentBuild.storage] };
          if (category === 'storage') {
            if (typeof storageIndex === 'number') {
              next.storage.splice(storageIndex, 1);
            } else {
              next.storage = [];
            }
          } else {
            next[category] = null;
          }
          return { currentBuild: next };
        }),

      clearBuild: () =>
        set({
          currentBuild: { ...EMPTY_BUILD, storage: [] },
        }),

      loadBuild: (build) =>
        set({
          currentBuild: {
            ...build,
            storage: [...build.storage],
          },
        }),

      saveCurrentBuild: (name, description) =>
        set((state) => {
          const entry: SavedBuild = {
            id: `build-${Date.now()}`,
            name: name.trim() || 'Custom PC Configuration',
            description: description.trim() || 'User-saved configuration',
            createdAt: new Date().toISOString(),
            build: {
              ...state.currentBuild,
              storage: [...state.currentBuild.storage],
            },
          };
          return {
            savedBuilds: [entry, ...state.savedBuilds],
          };
        }),

      deleteSavedBuild: (id) =>
        set((state) => ({
          savedBuilds: state.savedBuilds.filter((b) => b.id !== id),
        })),

      exportBuildToJson: () => {
        const state = get();
        return JSON.stringify(
          {
            application: 'Digital PC Builder - MMSU CCIS',
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            partIds: {
              cpu: state.currentBuild.cpu?.id || null,
              motherboard: state.currentBuild.motherboard?.id || null,
              ram: state.currentBuild.ram?.id || null,
              gpu: state.currentBuild.gpu?.id || null,
              storage: state.currentBuild.storage.map((s) => s.id),
              psu: state.currentBuild.psu?.id || null,
              case: state.currentBuild.case?.id || null,
              cooler: state.currentBuild.cooler?.id || null,
            },
            fullSnapshot: state.currentBuild,
          },
          null,
          2
        );
      },

      importBuildFromJson: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (parsed && parsed.partIds) {
            const ids = parsed.partIds;
            const next: PCBuildState = { ...EMPTY_BUILD, storage: [] };
            if (ids.cpu) next.cpu = (getComponentById(ids.cpu) as PCBuildState['cpu']) || null;
            if (ids.motherboard)
              next.motherboard =
                (getComponentById(ids.motherboard) as PCBuildState['motherboard']) || null;
            if (ids.ram) next.ram = (getComponentById(ids.ram) as PCBuildState['ram']) || null;
            if (ids.gpu) next.gpu = (getComponentById(ids.gpu) as PCBuildState['gpu']) || null;
            if (ids.psu) next.psu = (getComponentById(ids.psu) as PCBuildState['psu']) || null;
            if (ids.case) next.case = (getComponentById(ids.case) as PCBuildState['case']) || null;
            if (ids.cooler)
              next.cooler = (getComponentById(ids.cooler) as PCBuildState['cooler']) || null;
            if (Array.isArray(ids.storage)) {
              next.storage = ids.storage
                .map((id: string) => getComponentById(id) as Storage | undefined)
                .filter((d: Storage | undefined): d is Storage => Boolean(d));
            }
            set({ currentBuild: next });
            return { success: true, message: 'Build configuration imported successfully!' };
          }
          if (parsed && 'cpu' in parsed && 'motherboard' in parsed) {
            set({ currentBuild: parsed as PCBuildState });
            return { success: true, message: 'Full snapshot imported successfully!' };
          }
          return { success: false, message: 'Invalid JSON build schema.' };
        } catch {
          return { success: false, message: 'Could not parse JSON string.' };
        }
      },

      generateShareUrl: () => {
        const code = serializeBuildToCode(get().currentBuild);
        if (typeof window === 'undefined') return `?build=${code}`;
        const url = new URL(window.location.href);
        url.searchParams.set('build', code);
        return url.toString();
      },

      loadFromUrlParams: () => {
        if (typeof window === 'undefined') return false;
        const params = new URLSearchParams(window.location.search);
        const code = params.get('build');
        if (!code) return false;
        const decoded = deserializeBuildFromCode(code);
        if (decoded) {
          set({ currentBuild: decoded, activeTab: 'builder' });
          return true;
        }
        return false;
      },

      toggleComparisonPart: (partId) =>
        set((state) => {
          const exists = state.comparisonIds.includes(partId);
          if (exists) {
            return {
              comparisonIds: state.comparisonIds.filter((id) => id !== partId),
            };
          }
          const part = getComponentById(partId);
          if (!part) return state;
          const sameCatIds = state.comparisonIds.filter((id) => {
            const p = getComponentById(id);
            return p && p.category === part.category;
          });
          const nextIds = [...sameCatIds, partId].slice(-4);
          return { comparisonIds: nextIds };
        }),

      clearComparison: () => set({ comparisonIds: [] }),
    }),
    {
      name: 'mmsu-digital-pc-builder-storage-v2',
      partialize: (state) => ({
        currentBuild: state.currentBuild,
        darkMode: state.darkMode,
        beginnerMode: state.beginnerMode,
        savedBuilds: state.savedBuilds,
        comparisonIds: state.comparisonIds,
      }),
    }
  )
);
