# 05 — Testing Plan, Automated Test Results & Usability Evaluation Form

**Project:** Digital PC Builder: Virtual Compatibility & Simulation System  
**Testing Framework:** Vitest v2.1.9 + TypeScript Compiler (`tsc --noEmit`)

---

## 1. Test Plan Overview
The quality assurance strategy for the **Digital PC Builder** comprises three verification layers:
1. **Static Type Verification (`npm run lint`):** Ensures strict compile-time conformity across all 112 component definitions, rule evaluators, and React component props.
2. **Automated Domain Unit Testing (`npm test` via Vitest):** Executes 19 deterministic unit tests against `compatibilityEngine.ts`, `performanceEngine.ts`, and `recommendationEngine.ts`.
3. **Human-Centered Usability Testing (SUS-Style Instrument):** Structured evaluation protocol for MMSU CCIS students, IT faculty, and local computer hardware store staff.

---

## 2. Automated Unit Test Cases Table (`Vitest`)

| Test ID | Suite | Description | Input State / Parameters | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | `compatibilityEngine` | Validate complete AM5 1440p preset build | `PRESET_BUILDS['preset-1440p-am5']` (`R5 7600X` + `B650` + `RTX 4070S`) | `overallStatus: 'pass'`, `failureCount: 0`, `score: 100` | `overallStatus: 'pass'`, `failureCount: 0`, `score: 100` | **PASS** |
| **TC-02** | `compatibilityEngine` | Detect CPU vs. Motherboard socket mismatch | `Ryzen 7 7800X3D` (`AM5`) + `Z790 AORUS ELITE` (`LGA1700`) | `rule-cpu-mb-socket` returns `status: 'fail'` | `rule-cpu-mb-socket` returned `status: 'fail'` | **PASS** |
| **TC-03** | `compatibilityEngine` | Detect DDR4/DDR5 mismatch & DIMM slot overflow | `ASRock A620M-HDV` (`DDR5`, 2 slots) + `Corsair 32GB 4x8GB DDR4` (4 modules) | Both `rule-ram-type-mb` and `rule-ram-slots` return `'fail'` | Both rules returned `'fail'` | **PASS** |
| **TC-04** | `compatibilityEngine` | Detect RAM capacity exceeding motherboard limit | `MSI B650I EDGE` (96GB max) + `128GB DDR5` kit | `rule-ram-capacity` returns `status: 'fail'` | `rule-ram-capacity` returned `status: 'fail'` | **PASS** |
| **TC-05** | `compatibilityEngine` | Detect ATX motherboard in Micro-ATX case | `MSI B650 TOMAHAWK` (`ATX`) + `Tecware Flatline` (`mATX`/`ITX` only) | `rule-mb-case-ff` returns `status: 'fail'` | `rule-mb-case-ff` returned `status: 'fail'` | **PASS** |
| **TC-06** | `compatibilityEngine` | Detect GPU length exceeding case max GPU length | `ROG STRIX RTX 4090` (`358mm`) + `Meshify C` (`315mm` max) | `rule-gpu-case-length` returns `status: 'fail'` | `rule-gpu-case-length` returned `status: 'fail'` | **PASS** |
| **TC-07** | `compatibilityEngine` | Detect cooler socket mismatch, TDP under-sizing & side-panel height collision | `Core i9-14900K` (`LGA1700`, `253W`) + `NH-L9a-AM4` (`AM4`, `95W`); `NH-D15` (`165mm`) in `Fractal Terra` (`77mm` max) | `rule-cooler-socket`, `rule-cooler-tdp`, and `rule-cooler-case-height` all return `'fail'` | All 3 rules returned `'fail'` | **PASS** |
| **TC-08** | `compatibilityEngine` | Detect tall RGB RAM colliding with dual-tower air cooler fan overhang | `Corsair Dominator RGB` (`56mm` height) + `Noctua NH-D15` (`32mm` RAM clearance) | `rule-ram-cooler-clearance` returns `status: 'fail'` | `rule-ram-cooler-clearance` returned `status: 'fail'` | **PASS** |
| **TC-09** | `compatibilityEngine` | Detect PSU wattage overload & missing 16-pin GPU connector | `i7-14700K` + `RTX 4090` (`735W+` peak, needs `16-pin`) + `Corsair CV550` (`550W`, `0x 16-pin`) | `rule-psu-wattage` and `rule-psu-gpu-connectors` return `'fail'` | Both rules returned `'fail'` | **PASS** |
| **TC-10** | `compatibilityEngine` | Detect M.2 NVMe slot overflow & missing display output | `Core i3-12100F` (no iGPU, no GPU) + `H610M-E` (`1x M.2`) + `2x NVMe SSDs` | `rule-display-output` and `rule-storage-m2-slots` return `'fail'` | Both rules returned `'fail'` | **PASS** |
| **TC-11** | `compatibilityEngine` | Verify real-time candidate picker pre-check | Active `AM5` CPU; test candidate `LGA1700` board vs. `AM5` board | `LGA1700` candidate -> `compatible: false`; `AM5` candidate -> `compatible: true` | `compatible: false` and `compatible: true` as expected | **PASS** |
| **TC-12** | `compatibilityEngine` | Verify zero-wattage calculation on empty build | `EMPTY_BUILD` | `typicalLoadWatts: 0`, `recommendedPsuWatts: 0` | `typicalLoadWatts: 0`, `recommendedPsuWatts: 0` | **PASS** |
| **TC-13** | `performanceEngine` | Handle empty build gracefully in simulator | `EMPTY_BUILD` | `ready: false`, `fpsBenchmarks: []` | `ready: false`, `fpsBenchmarks: []` | **PASS** |
| **TC-14** | `performanceEngine` | Simulate balanced 1440p AM5 preset build | `PRESET_BUILDS['preset-1440p-am5']` | `ready: true`, `limitingComponent: 'Balanced'`, `fps1080p > 200` | `ready: true`, `limitingComponent: 'Balanced'`, `fps1080p: 299` | **PASS** |
| **TC-15** | `performanceEngine` | Detect severe CPU bottleneck | `Core i3-12100F` + `RTX 4090` | `limitingComponent: 'CPU'`, `severity: 'Severe Bottleneck'` | `limitingComponent: 'CPU'`, `severity: 'Severe Bottleneck'` | **PASS** |
| **TC-16** | `performanceEngine` | Detect GPU bottleneck | `Ryzen 7 7800X3D` + `Radeon RX 6600` | `limitingComponent: 'GPU'`, `bottleneckPercentage > 20` | `limitingComponent: 'GPU'`, `bottleneckPercentage: 36` | **PASS** |
| **TC-17** | `recommendationEngine` | Synthesize 100% compatible Budget Academic build | `budget: 25000`, `useCase: 'academic'`, `preferredFormFactor: 'Micro-ATX'` | `failureCount: 0`, complete XAI factor breakdown | `failureCount: 0`, 7 part explanations with factors | **PASS** |
| **TC-18** | `recommendationEngine` | Synthesize 100% compatible Mid-Range Gaming build | `budget: 65000`, `useCase: 'gaming'`, `preferredFormFactor: 'Any'` | `failureCount: 0`, discrete GPU included | `failureCount: 0`, discrete GPU included | **PASS** |
| **TC-19** | `recommendationEngine` | Synthesize 100% compatible High-End Mini-ITX Workstation | `budget: 160000`, `useCase: 'workstation'`, `preferredFormFactor: 'Mini-ITX'` | `failureCount: 0`, `motherboard.formFactor === 'Mini-ITX'` | `failureCount: 0`, `Mini-ITX` board selected | **PASS** |

### Vitest Execution Output Log
```text
> digital-pc-builder-mmsu@1.0.0 test
> vitest run

 RUN  v2.1.9
 ✓ src/engine/__tests__/performanceEngine.test.ts (4 tests) 6ms
 ✓ src/engine/__tests__/compatibilityEngine.test.ts (12 tests) 11ms
 ✓ src/engine/__tests__/recommendationEngine.test.ts (3 tests) 45ms

 Test Files  3 passed (3)
      Tests  19 passed (19)
```

---

## 3. Blank Usability Testing Form & Questionnaire (SUS-Style)

> **Instructions for Evaluators:** Please complete the following tasks in the **Digital PC Builder** web application and rate each statement below on a scale of **1 (Strongly Disagree)** to **5 (Strongly Agree)**.

### Participant Profile
- **Name (Optional):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  **Date:** \_\_\_\_\_\_\_\_\_\_\_\_
- **Evaluator Group (Check One):**
  - [ ] First-Time Builder / MMSU Student
  - [ ] Hobbyist / PC Gamer
  - [ ] Computer Hardware Store / Technician
  - [ ] MMSU CCIS IT / Computer Science Faculty

### Guided Evaluation Tasks
- [ ] **Task 1:** From the `Home` tab, load the **"⚠️ Educational Demo: Hidden Compatibility Traps"** preset and identify at least 3 physical or electrical conflicts in the `Builder` tab.
- [ ] **Task 2:** Toggle between the **3D Case View** and **2D Blueprint View**, then resolve the RAM-to-cooler height collision using the *"Hide Incompatible Parts"* filter.
- [ ] **Task 3:** Open the `XAI Recommender` tab, set a budget of `₱55,000` for `Gaming & Esports`, inspect the XAI factor scores, and load the recommended build.
- [ ] **Task 4:** View the simulated 1080p/1440p/4K FPS and bottleneck chart in `Simulation`, then copy a shareable link in `Build Summary`.

### System Usability Scale (SUS) & Domain Evaluation Matrix

| # | Evaluation Statement | 1 (Strongly Disagree) | 2 (Disagree) | 3 (Neutral) | 4 (Agree) | 5 (Strongly Agree) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| 1 | I think that I would like to use this Digital PC Builder system frequently when planning PC builds. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2 | I found the system unnecessarily complex. *(Reverse-scored)* | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3 | I thought the slot-based Builder and live compatibility badges were easy to use. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4 | I think that I would need the support of a technical person to be able to use this system. *(Reverse-scored)* | [ ] | [ ] | [ ] | [ ] | [ ] |
| 5 | I found the various functions (Builder, 3D/2D View, Simulation, XAI Recommender, Comparator) well integrated. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 6 | I thought there was too much inconsistency in this system. *(Reverse-scored)* | [ ] | [ ] | [ ] | [ ] | [ ] |
| 7 | I would imagine that most first-time builders or students would learn to use this system very quickly. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 8 | I found the system very cumbersome to use. *(Reverse-scored)* | [ ] | [ ] | [ ] | [ ] | [ ] |
| 9 | I felt very confident that my selected PC parts were physically and electrically compatible after checking the diagnostics panel. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 10 | I needed to learn a lot of things before I could get going with this system. *(Reverse-scored)* | [ ] | [ ] | [ ] | [ ] | [ ] |
| 11 | **Domain Specific:** The Explainable AI (XAI) factor breakdown helped me understand *why* each component was recommended for my budget. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 12 | **Domain Specific:** The 3D/2D case visualizer and millimeter clearance checks (GPU length, RAM height, cooler height) prevented mistakes I might have otherwise missed. | [ ] | [ ] | [ ] | [ ] | [ ] |

**Open-Ended Feedback / Suggestions for Improvement:**  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
