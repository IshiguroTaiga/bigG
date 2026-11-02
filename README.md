# Digital PC Builder: Virtual Compatibility & Simulation System

> **SUKATAN U CONTENTS:**

---

## 1. Overview
**Digital PC Builder: Virtual Compatibility & Simulation System** is a user-centered, zero-risk web platform engineered to assist first-time PC builders, computing students, gamers, and hardware retailers in designing custom desktop computers. Beyond matching CPU sockets, the system performs **deterministic millimeter-level physical clearance checks**, **electrical transient & connector verification**, **Explainable AI (XAI) multi-criteria recommendations**, and **multi-resolution gaming/workstation performance simulations** before any physical purchase or assembly.

---

## 2. Core Features
1. **Interactive Slot-Based Builder (`src/components/BuilderView.tsx`):** Browse, search, filter, sort, and select across 112 realistic hardware components in 8 categories (`CPU`, `Motherboard`, `RAM`, `GPU`, `Storage`, `PSU`, `Case`, `CPU Cooler`). Incompatible parts in the picker are flagged in real time with exact reasons.
2. **Rule-Based Compatibility Engine (`src/engine/compatibilityEngine.ts`):** Fully unit-tested module validating CPU/motherboard sockets, VRM thermal tiers, DDR4/DDR5 dual-channel memory standards, DIMM slot & capacity limits, case form factors, GPU length clearances, air cooler height/TDP/socket rules, RAM-to-cooler overhang clearance, PSU transient wattage headroom, 16-pin (`12VHPWR`)/8-pin PCIe cables, and M.2/SATA slot allocations.
3. **Hybrid 3D WebGL & 2D Blueprint Case Visualizer (`CaseVisualizer3D.tsx`, `CaseVisualizer2D.tsx`):** Interactive Three.js (`@react-three/fiber`) 3D chassis view with automatic fallback and instant toggle to a 2D SVG technical blueprint with millimeter clearance indicators.
4. **Performance, Bottleneck & PSU Simulation (`src/engine/performanceEngine.ts`, `SimulationView.tsx`):** Estimates 1080p, 1440p, and 4K FPS across 4 game archetypes, calculates directional CPU/GPU bottleneck percentages, and plots an 80+ PSU efficiency curve (`Recharts`).
5. **Explainable AI (XAI) Recommendation Engine (`src/engine/recommendationEngine.ts`, `RecommendationView.tsx`):** Multi-Criteria Decision Analysis (MCDA) recommender that generates 100% compatible builds from user budget (`PHP`) and workload profile while showing transparent factor weights and scores.
6. **Side-by-Side Component Comparator (`ComparisonView.tsx`):** Compares up to 4 components simultaneously with derived price-to-performance metrics and dataset-backed technical attributes (including dual-channel `2-Channel DDR5` accuracy for AM5/LGA1700 CPUs).
7. **Complete Build Summary, Presets & Sharing (`BuildSummaryView.tsx`, `SavedBuildsView.tsx`):** Itemized Bill of Materials (BOM), 5 instant demo presets (including an intentional *Hidden Compatibility Traps* build), `localStorage` gallery, `.JSON` export/import, and URL-encoded share links (`?build=...`).

---

## 3. Tech Stack
- **Frontend:** React 18 + Vite + TypeScript (Strict Mode), Tailwind CSS (Dark/Light Mode)
- **State & Persistence:** Zustand (`useBuildStore.ts`) + `localStorage` + URL Base64 query serialization
- **3D & 2D Visualization:** Three.js via `@react-three/fiber` & `@react-three/drei` + Interactive SVG Technical Blueprint
- **Charts & Analytics:** Recharts
- **Testing:** Vitest (19 automated unit tests across Compatibility, Performance, and XAI Recommendation engines)

---

## 4. Installation & Run Steps

### Prerequisites
- **Node.js** v18+ and **npm** v9+

### Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in any modern browser. No backend server, database setup, or external API key is required.

### Quality Assurance Commands
```bash
npm test          # Run Vitest unit test suite (19 tests)
npm run lint      # Run TypeScript strict type-checking (tsc --noEmit)
npm run build     # Build production bundle into /dist
```

---

## 5. Project Structure
```text
bigG/
├── docs/                                   # Full Academic Capstone Documentation (01 to 09)
│   ├── 01-project-proposal.md
│   ├── 02-requirements-specification.md
│   ├── 03-system-design.md
│   ├── 04-user-manual.md
│   ├── 05-testing.md
│   ├── 06-competitive-analysis.md
│   ├── 07-limitations-and-future-work.md
│   ├── 08-defense-qa.md
│   └── 09-presentation-script.md
├── src/
│   ├── config/constants.ts                 # Currency (PHP), disclaimers, glossary, workload profiles
│   ├── types/pc.ts                         # Strict TypeScript interfaces for parts, rules, XAI & sim
│   ├── data/                               # 112 realistic hardware items + 5 demo presets
│   ├── engine/                             # Pure domain engines + __tests__/ Vitest suite
│   ├── store/useBuildStore.ts              # Zustand store + localStorage + URL share encoding
│   └── components/                         # Home, Builder, 3D/2D Views, Sim, XAI, Compare, Summary
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 6. Screenshots Placeholders (For Final Manuscript Binding)
- `[Figure 1.1: Home Landing Page & Instant Defense Demo Presets]` — *Capture `Home` tab*
- `[Figure 1.2: Interactive Builder with 3D WebGL Case View & Compatibility Diagnostics]` — *Capture `Builder` tab*
- `[Figure 1.3: 2D SVG Technical Blueprint Showing Millimeter Clearance Rulers]` — *Capture `Builder` tab in 2D mode*
- `[Figure 1.4: Multi-Resolution Gaming FPS, Bottleneck & PSU Efficiency Curve]` — *Capture `Simulation` tab*
- `[Figure 1.5: Explainable AI (XAI) Decision Matrix with Weighted Factor Scores]` — *Capture `XAI Recommender` tab*
- `[Figure 1.6: Side-by-Side 4-Component Technical Comparator & Build Summary BOM]` — *Capture `Compare` and `Build Summary` tabs*

---

## 7. Peoples
- **Justine Dwight Acoba**
- **John Benedict Alberto**
- **Arom Sylon Apostle Alcausin**
- **Nythan Bagasani**
- **Karl Vincent Balcita**
- **Jonas Nathaniel Bonifacio**
- **Luis Bullanday**
- **Zeus Bumagat**
- **Mark Lorenz Datuin**
- **Micko Gabriel Permison**
- **Stephen Jay Polendey**
- **Rhed Luis Ratuita**

---

> **Disclaimer:** Component prices (in PHP), synthetic benchmark scores, and physical dimensions are curated sample datasets for educational and capstone demonstration purposes. Verify official manufacturer datasheets and retail pricing before physical purchase.
