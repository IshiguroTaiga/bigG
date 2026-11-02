# 06 — Competitive Analysis

**Project:** Digital PC Builder: Virtual Compatibility & Simulation System  
**Benchmarked Platforms:** PCPartPicker, Newegg PC Builder, NZXT BLD, Logical Increments, UserBenchmark

---

## 1. Executive Comparison Matrix

| Evaluation Dimension | PCPartPicker | Newegg PC Builder | NZXT BLD | Logical Increments | UserBenchmark | **Digital PC Builder (MMSU CCIS)** |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Component Selection** | Huge crowd-sourced catalog; overwhelming for beginners | Limited to current Newegg in-stock retail SKUs | Restricted to proprietary NZXT cases/coolers and select partners | Static tier table; no interactive slot swapping | Component dropdowns for benchmarking only (missing coolers/cases/PSUs) | **Curated 112-item catalog across all 8 categories with beginner Learn Mode & live candidate pre-check** |
| **2. Compatibility Checking** | Checks sockets & GPU length; **explicitly skips RAM height vs. air cooler overhang** | Basic socket & RAM type filtering; weak physical clearance checks | Pre-validated closed templates only; user cannot test arbitrary combinations | Manual human-curated rows; zero custom rule engine | None (allows pairing any CPU with any RAM/GPU) | **Full deterministic rule engine checking sockets, RAM height vs. cooler overhang, GPU length, cooler height/TDP, 16-pin PSU cables & M.2/SATA slots** |
| **3. Performance Simulation** | ❌ None | ⚠️ Basic FPS estimate on select pre-builts only | ✅ Shows estimated 1080p/1440p FPS for NZXT pre-builts | ⚠️ General text descriptions per tier | ⚠️ Synthetic scores with controversial weighting; no PSU or thermal sim | **✅ Full 1080p/1440p/4K FPS chart, directional CPU/GPU bottleneck index, thermal/acoustic estimate & 80+ PSU efficiency curve** |
| **4. Price Comparison & Value** | Multi-retailer US/EU scraping; limited Philippine (`PHP`) support | Single US retailer pricing | High pre-built assembly markup | Static USD price brackets | Displays Amazon affiliate links | **Localized in Philippine Pesos (`PHP`), derived `pts / ₱10` value ratios in 4-way comparator & XAI budget optimizer** |
| **5. Build Summary & Visuals** | Text table & basic wattage bar; no 3D/2D spatial case view | Shopping cart list | 2D static marketing renders | None | Summary page without case/PSU/cooler | **Interactive 3D WebGL (`@react-three/fiber`) + 2D SVG Technical Blueprint + Print-Ready BOM Summary** |
| **6. Community Sharing & Export** | Permalink URLs & forum BBCode/Markdown | Cart share link | Checkout link only | None | Permalink URL | **Zero-backend URL Base64 share link (`?build=...`), browser `localStorage` gallery & `.JSON` file import/export** |

---

## 2. Detailed Competitor Analysis

### 2.1 PCPartPicker
- **Strengths:** Massive historical database of components and community build logs.
- **Weaknesses Solved by Our System:** PCPartPicker appends a famous footnote to nearly every air-cooled build: *"Some physical dimension constraints are currently not checked, such as CPU coolers and RAM clearance."* Furthermore, it provides no gaming FPS simulation, no CPU/GPU bottleneck calculator, no Explainable AI recommender, and no 3D/2D interactive chassis blueprint.

### 2.2 Newegg PC Builder
- **Strengths:** Direct e-commerce checkout integration for North American shoppers.
- **Weaknesses Solved by Our System:** Tied to a single commercial inventory, lacks millimeter-level RAM-to-cooler overhang validation, and does not provide an educational mode or transparent XAI factor breakdown for students.

### 2.3 NZXT BLD
- **Strengths:** Polished UI that shows estimated game frame rates for NZXT turnkey systems.
- **Weaknesses Solved by Our System:** Vendor lock-in (users cannot test third-party cases, air coolers, or custom combinations) and no educational diagnostics explaining *why* parts conflict.

### 2.4 Logical Increments
- **Strengths:** Well-respected static tier chart for quick reference ("Destitute" to "Monstrous" tiers).
- **Weaknesses Solved by Our System:** It is a static reading guide rather than an interactive configurator; users cannot swap individual parts, verify case clearances, or export a custom Bill of Materials.

### 2.5 UserBenchmark
- **Strengths:** Quick side-by-side synthetic speed comparisons for CPUs and GPUs.
- **Weaknesses Solved by Our System:** Ignores motherboards, cases, CPU coolers, RAM physical height, and power supplies entirely, and does not validate physical or electrical compatibility.
