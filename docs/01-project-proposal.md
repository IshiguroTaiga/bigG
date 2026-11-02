# 01 — Project Proposal

**Project Title:** Digital PC Builder: Virtual Compatibility & Simulation System  
**Institution:** College of Computing and Information Sciences (CCIS), Mariano Marcos State University (MMSU)  
**Proponents:** Justine Dwight Acoba, John Benedict Alberto, Arom Sylon Apostle Alcausin, Nythan Bagasani, Karl Vincent Balcita, Jonas Nathaniel Bonifacio, Luis Bullanday, Zeus Bumagat, Mark Lorenz Datuin, Micko Gabriel Permison, Stephen Jay Polendey, Rhed Luis Ratuita.

---

## 1. Background of the Study
Custom personal computer (PC) configuration has become a foundational technical skill for computing students, digital content creators, gamers, and small-to-medium enterprises in the Philippines. Designing a custom desktop enables users to optimize hardware investments toward specific computational workloads—such as software compilation, 3D rendering, machine learning experimentation, or high-refresh esports—while preserving modular upgrade paths.

However, the contemporary desktop hardware landscape is characterized by high combinatorial complexity across three concurrent processor sockets (`AM4`, `AM5`, `LGA1700`), two memory standards (`DDR4`, `DDR5` dual-channel architectures), evolving power delivery specifications (`ATX 2.x` 8-pin PCIe versus `ATX 3.0` 16-pin `12VHPWR`), and non-standardized mechanical dimensions for triple-fan graphics cards and dual-tower CPU air coolers. Novice builders and students frequently encounter costly compatibility traps that simple socket-matching spreadsheets fail to detect.

---

## 2. Problem Statement
1. **Hidden Physical, Thermal, and Electrical Compatibility Traps:** While matching a CPU socket (`AM5` or `LGA1700`) to a motherboard is straightforward, buyers routinely miss physical clearance collisions (e.g., 56mm tall RGB RAM colliding with a dual-tower air cooler's 32mm front fan overhang, 342mm–358mm GPUs exceeding mid-tower chassis limits, or ATX motherboards selected for Micro-ATX cases), thermal mismatches (pairing a 95W TDP cooler with a 253W TDP processor), and power delivery deficits (insufficient transient wattage headroom or missing 16-pin GPU cables).
2. **Costly Performance Bottlenecks:** Buyers often pair flagship GPUs with entry-level CPUs (or vice versa), resulting in severe frame-pacing stutter at 1080p or wasted budget across 1440p and 4K resolutions.
3. **First-Time Assembly Anxiety:** Fear of damaging delicate socket pins, misapplying thermal paste, or misrouting power connectors intimidates first-time builders and students.
4. **Retailer Burden from Customer Returns (RMAs):** Local computer retailers and custom builder shops absorb significant support overhead and restocking losses due to customer ordering mistakes.

---

## 3. Rationale
Existing web utilities either provide partial compatibility checks without performance simulation (e.g., PCPartPicker, which explicitly disclaims checking RAM-to-cooler overhang clearances) or act as opaque "black-box" bottleneck calculators without explaining *why* components are recommended. By developing a client-side, deterministic web platform that integrates **millimeter-accurate rule validation**, **3D WebGL + 2D Blueprint spatial visualization**, **multi-resolution performance simulation**, and **Explainable AI (XAI) multi-criteria recommendations**, this project bridges the gap between theoretical computer architecture education and practical, error-free PC procurement.

---

## 4. Objectives of the Study

### 4.1 General Objective
To design, develop, test, and document the **Digital PC Builder: Virtual Compatibility & Simulation System**, a user-centered web platform for configuring custom computers with intelligent Explainable AI (XAI) recommendations, automated multi-dimensional compatibility checking, and zero-risk performance simulation prior to physical purchase or assembly.

### 4.2 Specific Objectives
1. **To construct a realistic, extensible hardware dataset** (`src/data/`) with 14 components per category across 8 categories (112 total items) localized in Philippine Pesos (`PHP`), accurately encoding dual-channel (`2-Channel`) memory controllers, physical dimensions in millimeters, TDP ratings, and power connector counts.
2. **To engineer a deterministic, rule-based Compatibility Engine** (`src/engine/compatibilityEngine.ts`) that validates sockets, DDR4/DDR5 standards, DIMM slot counts and max capacities, motherboard/PSU form factors, GPU length vs. case clearance, cooler height/socket/TDP rating, RAM height vs. cooler overhang clearance, PSU wattage headroom, GPU PCIe power connectors, and M.2/SATA storage slots.
3. **To build an interactive Builder and Hybrid 3D/2D Case Visualizer** (`CaseVisualizer3D.tsx`, `CaseVisualizer2D.tsx`) that renders live component slot placement and visually flags incompatible parts.
4. **To implement a Performance, Bottleneck, and PSU Simulation Engine** (`src/engine/performanceEngine.ts`) that models 1080p, 1440p, and 4K frame rates, CPU/GPU load balance, thermal/acoustic output, and 80+ PSU efficiency curves.
5. **To develop an Explainable AI (XAI) Multi-Criteria Recommendation Engine** (`src/engine/recommendationEngine.ts`) that suggests optimal builds for user budgets and workloads while displaying transparent factor weights and scores.
6. **To validate system correctness** through automated `Vitest` unit tests, strict TypeScript compilation, and structured usability evaluation instruments.

---

## 5. Scope and Limitations

### Scope
- **8 Component Categories (112 Items):** CPU, Motherboard, RAM, GPU, Storage, PSU, Case, and CPU Cooler.
- **Platforms Covered:** Mainstream desktop AMD (`AM4` DDR4, `AM5` dual-channel DDR5) and Intel (`LGA1700` dual-channel DDR4/DDR5).
- **Features Included:** Interactive Builder, 3D WebGL + 2D SVG Case Visualizer, Compatibility Inspector, Multi-Resolution FPS & Bottleneck Simulator, XAI Auto-Recommender, 4-Way Component Comparator, Complete Build Summary BOM, `localStorage` Saved Builds Gallery, `.JSON` Import/Export, URL-Encoded Share Links, Beginner Learn Mode Tooltips, and Dark/Light Mode.

### Limitations
- **Sample Dataset Pricing:** Prices (in `PHP`) and synthetic benchmark scores are curated offline sample datasets for academic demonstration; live e-commerce scraping is intentionally excluded to ensure deterministic, zero-API-key execution.
- **Mainstream Desktop Focus:** Server/HEDT multi-socket platforms (e.g., AMD Threadripper `sTR5`, Intel Xeon) and custom open-loop hardline water cooling are outside the scope of the dimensional rule engine.

---

## 6. Significance & Intended Beneficiaries
- **First-Time Builders & Consumers:** Prevents costly purchasing mistakes and builds confidence before physical assembly.
- **Hobbyists & Gamers:** Optimizes frame-per-peso efficiency and eliminates CPU/GPU bottlenecks across target monitor resolutions.
- **Hardware Retailers & Builder Shops:** Streamlines customer consultations and reduces return authorizations (RMAs) via verified JSON/URL build manifests.
- **Academic Organizations (MMSU CCIS):** Provides an interactive virtual laboratory for teaching Computer Architecture, Hardware Fundamentals, and Systems Integration.
