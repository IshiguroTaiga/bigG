# 08 — Capstone Defense Q&A Preparation (28 Likely Panel Questions & Strong Answers)

**Project:** Digital PC Builder: Virtual Compatibility & Simulation System  
**Institution:** MMSU College of Computing and Information Sciences (CCIS)

---

## Part A: Problem Statement, Novelty & Competitive Edge

### Q1: How is your system fundamentally different from PCPartPicker or local PC shop builders?
**Answer:**  
Existing tools like PCPartPicker or local retail cart builders focus primarily on electronic socket matching and nominal wattage, displaying a generic disclaimer that physical clearances between CPU coolers, RAM modules, and cases are not verified. Our system addresses three critical gaps:
1. **Millimeter-Level Physical Clearance Validation:** Our `compatibilityEngine` deterministically checks RAM height against dual-tower air cooler fan overhang (`ram.heightMm <= cooler.ramClearanceMm`), GPU length against chassis depth (`gpu.lengthMm <= case.maxGpuLengthMm`), air cooler tower height against side-panel clearance, and AIO radiator size against case mounts.
2. **Pre-Purchase Performance & Bottleneck Simulation:** We integrate a multi-resolution (1080p/1440p/4K) FPS and directional CPU/GPU bottleneck simulator alongside an 80+ PSU efficiency curve.
3. **Explainable AI (XAI) Recommendations:** Instead of a black-box auto-builder, our recommender exposes the exact Multi-Criteria Decision Analysis (MCDA) factor weights and scores for every chosen component.

### Q2: Why did you focus on physical clearances like RAM height and GPU length? How common are those mistakes in real life?
**Answer:**  
They are among the top causes of hardware returns for first-time builders. Modern dual-tower air coolers (like the Noctua NH-D15 or Thermalright Peerless Assassin) overhang the motherboard's DIMM slots, leaving only 32mm–42mm of vertical clearance, whereas popular RGB RAM kits (like Corsair Dominator at 56mm or Vengeance RGB Pro at 51mm) are much taller. Similarly, modern triple-fan GPUs reach 320mm–358mm, which physically cannot enter compact mid-towers like the Fractal Meshify C (315mm limit). Catching this virtually saves weeks of RMA shipping.

### Q3: Who are your primary target users at MMSU and in the local community?
**Answer:**  
We serve four primary groups:
1. **First-time builders and students** who fear damaging parts or buying incompatible components.
2. **Gamers and hobbyists** optimizing frame-per-peso performance and avoiding CPU/GPU bottlenecks.
3. **Local hardware retailers and builder shops** in Ilocos Norte who want to co-design verified builds with customers and reduce return authorizations (RMAs).
4. **MMSU CCIS instructors and academic organizations** teaching Computer Architecture and Hardware Fundamentals.

### Q4: How does your system help reduce the "fear of damaging parts during first-time assembly"?
**Answer:**  
First, the **3D WebGL and 2D Blueprint Case Visualizer** shows the exact spatial layout where each component sits inside the chassis before the user touches a screwdriver. Second, our **Learn Mode** tooltips explain critical safety concepts like socket pin alignment, TDP thermal paste requirements, and 16-pin `12VHPWR` connector seating. Third, the **About / Help** tab includes a 6-step physical assembly safety protocol covering bench prep, standoff verification, and connector latching.

---

## Part B: Technical Accuracy & Hardware Engineering

### Q5: How many memory channels do mainstream AMD Ryzen 7000 (AM5) and Intel 12th–14th Gen (LGA1700) CPUs support?
**Answer:**  
All mainstream desktop AM4, AM5 (Ryzen 7000 series), and LGA1700 processors support **dual-channel (2-channel)** memory architectures (`memoryChannels: 2` in our `src/data/cpus.ts` dataset)—even when a motherboard has 4 physical DIMM slots (which operates as 2 DIMMs per channel, or 2DPC). While DDR5 splits each 64-bit module into two independent 32-bit sub-channels on the DIMM itself, the CPU's integrated memory controller remains dual-channel at the motherboard level. Our UI derives `2-Channel DDR5` directly from `cpu.memoryChannels` and `cpu.supportedMemoryTypes` in the dataset.

### Q6: What happens if a user selects a 4-stick RAM kit (4x8GB or 4x32GB) on a Mini-ITX or budget Micro-ATX motherboard?
**Answer:**  
Mini-ITX boards (like the `MSI MPG B650I EDGE WIFI`) and entry-level mATX boards (like the `ASRock A620M-HDV/M.2+`) only have `ramSlots: 2`. Our `rule-ram-slots` check compares `ram.modules > motherboard.ramSlots` and immediately flags a critical `fail` diagnostic: *"Insufficient RAM Slots (4 Modules vs 2 Slots)"*, advising the user to pick a 2-module kit or a 4-slot motherboard.

### Q7: What is the difference between an Intel "F" or AMD non-G AM4 processor and an APU/iGPU processor in your compatibility engine?
**Answer:**  
Processors like the `Intel Core i3-12100F`, `AMD Ryzen 5 5600`, or `Ryzen 5 7500F` have `integratedGraphics: false`. If the user does not select a discrete Graphics Card (`gpu === null`), `rule-display-output` triggers a critical `fail`: *"No Display Output Available (Missing GPU & No iGPU)"*, because the motherboard's HDMI/DisplayPort outputs will be dead. Conversely, if they pick a `Ryzen 5 5600G` (`Radeon Vega 7`) or `Ryzen 5 7600X` (`RDNA2 2CU`), the rule passes and confirms video output via the onboard iGPU.

### Q8: How does your engine handle the new 16-pin (`12VHPWR` / `12V-2x6`) GPU power connector vs. traditional 8-pin PCIe connectors?
**Answer:**  
Each GPU in `src/data/gpus.ts` defines `pcieConnectors: { eightPin, sixteenPin }`, and each PSU in `src/data/psus.ts` defines `connectors: { pcie8Pin, pcie16Pin, sata, eps8Pin }`. When an NVIDIA RTX 4070 SUPER / 4080 SUPER / 4090 (`sixteenPin: 1`) is selected:
- If the PSU has `pcie16Pin >= 1` (ATX 3.0 PSUs like `MSI MAG A750GL` or `Corsair RM850x SHIFT`), it returns **Pass** (*"Native 16-Pin GPU Cable Included"*).
- If the PSU has `pcie16Pin === 0` but has `pcie8Pin >= 3` (older ATX 2.x Gold units), it returns **Warn** (*"GPU Requires 16-Pin Adapter"*).
- If the PSU has fewer than 3x 8-pin cables and 0x 16-pin ports, it returns **Fail** (*"Missing Required GPU Power Connectors"*).

### Q9: How do you calculate Typical Load, Peak Transient Load, and Recommended PSU Wattage?
**Answer:**  
In `calculateSystemPower()` (`compatibilityEngine.ts`):
- **Base Peripheral Power ($W_{\text{base}}$):** Motherboard (35W) + RAM (`modules * 4W`) + Storage (`6W` per SSD, `9W` per HDD) + Cooler (`6W` Air, `15W` AIO) + Case Fans (`includedFans * 3W`).
- **Typical Load ($W_{\text{typ}}$):** `cpu.tdpWatts + gpu.tdpWatts + basePeripheralWatts`.
- **Peak Transient Load ($W_{\text{peak}}$):** `round(cpu.tdpWatts * 1.15 + gpu.tdpWatts * 1.18 + basePeripheralWatts)` to account for CPU boost power (PL2/PPT) and GPU microsecond transient spikes.
- **Recommended PSU ($W_{\text{rec}}$):** `max(ceil((peakLoadWatts * 1.25) / 50) * 50, gpu.recommendedPsuWatts)`.

### Q10: Does your engine check VRM thermal compatibility between high-wattage CPUs and budget motherboards?
**Answer:**  
Yes. Each motherboard has a `vrmTier` (`Entry`, `Solid`, `Robust`, `Flagship`). If a user pairs a high-TDP processor (`cpu.tdpWatts >= 170W`, such as a `Ryzen 9 7950X` at 170W or `Core i9-14900K` at 253W) with an `Entry` VRM motherboard (such as an `A620M` or `H610M`), `rule-mb-vrm-thermal` emits a **Warning** explaining that sustained all-core workloads may cause VRM MOSFET thermal throttling.

### Q11: How does your engine validate storage drives when a user selects multiple SSDs and HDDs?
**Answer:**  
Users can add up to 4 drives in `build.storage`. The engine partitions them by `formFactor`:
- `M.2 2280` drives are counted against `motherboard.m2Slots`.
- `2.5-inch` and `3.5-inch` SATA drives are counted against `motherboard.sataPorts` as well as `case.driveBays25` and `case.driveBays35`.
- Additionally, `rule-storage-boot-hdd` warns the user if they only selected a mechanical HDD without any SSD for the operating system boot drive.

### Q12: How does your engine validate Small Form Factor (SFF / Mini-ITX) builds?
**Answer:**  
SFF cases like the `Cooler Master NR200P` or `Fractal Design Terra` have strict constraints: `supportedMotherboards: ['Mini-ITX']`, `supportedPsuFormFactors: ['SFX']`, and low cooler height limits (`77mm` on the Terra). Our engine simultaneously validates `rule-mb-case-ff` (must be Mini-ITX), `rule-psu-case-ff` (must be an SFX PSU like the `Corsair SF750`), and `rule-cooler-case-height` (must be a low-profile cooler like the `65mm Noctua NH-L9x65`).

---

## Part C: Explainable AI (XAI) & Performance Simulation Algorithms

### Q13: Why is your recommendation engine considered "Explainable AI (XAI)"?
**Answer:**  
In AI and decision-support systems, **symbolic Multi-Criteria Decision Analysis (MCDA)** is a classic white-box XAI paradigm. Unlike black-box neural networks or generative LLMs that can hallucinate incompatible hardware specs, our `recommendationEngine.ts` uses explicit domain rules to prune invalid parts and evaluates every candidate across weighted criteria (*Workload Throughput*, *Budget Allocation Fit*, *Thermal & Clearance Safety*). It outputs the exact factor weights, raw scores (0–100), weighted point contributions, and human-readable justifications in the UI.

### Q14: How does the XAI Recommender allocate budget differently between Gaming, Workstation, Academic, and Streaming profiles?
**Answer:**  
In `USE_CASE_PROFILES` (`src/config/constants.ts`), each workload defines a proportional budget vector $\vec{\lambda}_U$:
- **Gaming:** Allocates `40%` to GPU and `21%` to CPU.
- **Workstation (3D/CAD/Data Science):** Balances CPU (`28%`), GPU (`30%`), and high-capacity RAM (`12%`).
- **Academic / Office:** Prioritizes CPU (`30%`), Motherboard (`16%`), RAM (`14%`), and fast NVMe Storage (`13%`), automatically selecting an integrated-graphics APU build when the budget is under `₱35,000`.
- **Streaming:** Combines GPU hardware encoding (`35%`) with multi-thread CPU resilience (`25%`) and 32GB+ RAM (`10%`).

### Q15: Can the XAI Recommender ever suggest an incompatible build?
**Answer:**  
No. Each step of the sequential MCDA pipeline filters candidates against upstream selections using hard compatibility predicates (matching `socket`, `ramType`, `formFactor`, `maxGpuLengthMm`, `ramClearanceMm`, `tdpRatingWatts`, and `recommendedPsuWatts`). We also verify this with automated unit tests (`recommendationEngine.test.ts`) across multiple budgets and form factors, asserting `compat.failureCount === 0`.

### Q16: How does the Performance Simulator calculate FPS across 1080p, 1440p, and 4K?
**Answer:**  
In `performanceEngine.ts`, each game archetype specifies a resolution scaling multiplier and a CPU dependency weight $w \in [0.12, 0.55]$. Frame rate is computed via the **weighted harmonic mean** of RAM-adjusted CPU gaming score and resolution-specific GPU score (`gamingScore1080p`, `gamingScore1440p`, `gamingScore4k`):
$$\text{FPS} = \text{round}\left( \beta \cdot \left[ \frac{w}{C_{\text{eff}}} + \frac{1 - w}{G_{\text{res}}} \right]^{-1} \right)$$
A harmonic mean is mathematically appropriate for pipelined rates (frames per second, where frame time $T = 1/\text{FPS}$) because a slow stage cannot be averaged away by a fast stage.

### Q17: How does the Bottleneck Visualizer determine whether the CPU or GPU is the bottleneck?
**Answer:**  
It compares the RAM-adjusted CPU gaming index against the GPU's 1440p index ($\Delta = C_{\text{eff}} - G_{1440\text{p}}$). If $|\Delta| \le 10$, the pairing is marked **Optimal (Balanced)**. If $\Delta < -10$, the CPU is significantly slower than the GPU (**CPU Bottleneck**), meaning the GPU waits idly for draw calls at 1080p/1440p. If $\Delta > 10$, the GPU is saturated at 100% while the CPU has spare capacity (**GPU Bottleneck**).

### Q18: Why does the PSU Efficiency Curve peak around 50% load in your Simulation tab?
**Answer:**  
Switching mode power supplies (SMPS) certified under the 80 PLUS standard (Bronze, Gold, Platinum, Titanium) experience fixed switching losses at very low loads (10%–20%) and resistive ($I^2R$) thermal losses at high loads (80%–100%). Consequently, AC-to-DC conversion efficiency peaks between **40% and 60% load**, which our `psuCurve` generator models using a parabolic efficiency curve anchored to the PSU's 80+ rating.

### Q19: How are CPU and GPU load temperatures and acoustic noise (dBA) estimated?
**Answer:**  
`performanceEngine.ts` computes the thermal load ratio $\text{cpu.tdpWatts} / \text{cooler.tdpRatingWatts}$ and applies an airflow modifier based on `case.airflowRating` (`Mesh Performance` reduces temps by 4°C compared to closed-front `Standard` cases). Acoustic noise combines the cooler's rated `noiseLevelDb` with thermal load penalties when the cooler is pushed above 85% capacity.

---

## Part D: Software Architecture, Persistence & Testing

### Q20: Why did you choose a zero-backend React + TypeScript architecture with local datasets?
**Answer:**  
1. **Zero Latency:** Every filter, candidate pre-check, 3D update, and XAI calculation executes in under 15 milliseconds in browser memory.
2. **Academic Reproducibility:** Panelists, students, and future researchers can clone the project and run `npm install && npm run dev` on any laboratory PC without setting up PostgreSQL, Docker, or paid cloud API keys.
3. **Privacy & Resilience:** Works 100% offline during internet outages.

### Q21: How does the Shareable Build Link (`?build=...`) work without a backend database?
**Answer:**  
In `serializeBuildToCode()` (`src/store/useBuildStore.ts`), we extract a compact JSON map of the 8 selected part IDs (`{ c, m, r, g, s, p, k, l }`), URI-encode it, and encode it into a Base64 string (`btoa`) appended to the URL (`?build=...`). When any user opens that URL, `loadFromUrlParams()` decodes the Base64 payload and hydrates the full component objects from `src/data/`.

### Q22: What happens if a user imports a corrupted or invalid JSON file in Saved Builds?
**Answer:**  
`importBuildFromJson()` wraps `JSON.parse()` in a `try/catch` block and validates schema keys (`partIds` or component objects) against `getComponentById()`. If the JSON is malformed or missing required fields, it safely aborts state mutation and displays a clear error banner (`"Could not parse JSON string"` or `"Invalid JSON build schema"`).

### Q23: How did you ensure the 3D Case View (`@react-three/fiber`) won't crash on older laptops without dedicated GPUs?
**Answer:**  
First, our 3D scene uses lightweight parametric `RoundedBox` primitives rather than heavy 50MB polygon meshes. Second, we wrapped the WebGL `<Canvas>` inside a React class error boundary (`ThreeErrorBoundary` in `CaseVisualizer3D.tsx`). If WebGL fails to initialize, it automatically renders `CaseVisualizer2D.tsx` (our interactive SVG blueprint). Users can also toggle between 3D and 2D manually at any time.

### Q24: How does your automated test suite (`Vitest`) protect against regressions?
**Answer:**  
We wrote 19 unit tests across 3 test files (`compatibilityEngine.test.ts`, `performanceEngine.test.ts`, `recommendationEngine.test.ts`). Whenever any rule or dataset item is modified, running `npm test` verifies all 19 scenarios in ~60ms, ensuring that socket checks, clearance checks, bottleneck detection, and XAI recommendations remain 100% accurate.

### Q25: How is currency configured, and can this system be adapted to USD or EUR?
**Answer:**  
Yes. Currency formatting is centralized in a single configuration object (`CURRENCY_CONFIG` in `src/config/constants.ts`) alongside `formatCurrency()`. Changing `code`, `symbol`, and `locale` in that single constant updates every price display across the entire application.

### Q26: How does the Part Comparator normalize different component categories?
**Answer:**  
In `ComparisonView.tsx`, selecting a part automatically filters the comparison list to the same `PartCategory` (up to 4 items) and dynamically switches the specification rows (`getSpecRows(category)`) so that CPUs compare cores/clocks/sockets/memory-channels, GPUs compare VRAM/length/TDP/FPS-scores, and Coolers compare height/radiator/TDP/RAM-clearance.

### Q27: What are the honest limitations of your current prototype?
**Answer:**  
1. Sample prices and synthetic benchmark scores are static local datasets rather than live real-time e-commerce scrapes.
2. The 3D view uses scaled parametric bounding boxes rather than photorealistic CAD meshes.
3. Secondary motherboard headers (like 5V ARGB fan hub counts and front-panel USB-C Key-A headers) are planned for Phase 2 of our roadmap.

### Q28: How could MMSU CCIS use this software in future semesters?
**Answer:**  
Instructors in *Introduction to Computing*, *Computer Architecture*, and *PC Troubleshooting* can use the **Presets** and **Share Link** features to assign laboratory exercises—for example, giving students a broken build link with 5 compatibility conflicts and a `₱45,000` budget ceiling, and grading them on submitting a repaired, zero-conflict `.JSON` build manifest.
