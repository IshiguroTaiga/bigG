# 09 — 10-Minute Live Capstone Defense Presentation Script

**Project:** Digital PC Builder: Virtual Compatibility & Simulation System  
**Institution:** MMSU College of Computing and Information Sciences (CCIS)  
**Total Duration:** 10 Minutes (With Exact Click Path & Talking Points)

---

## Segment 1: Landing Page, Problem & Vision (0:00 – 1:30)

**Exact Click Path:**
1. Open the app (`http://localhost:5173`). It starts on the **Home** landing page.
2. Point to the hero banner and the 4 KPI counters (`112 Curated Hardware Parts`, `10+ Deterministic Clearance & Power Rules`, `3D + 2D Case View`, `XAI Scoring`).
3. Scroll slightly to the **"Instant One-Click Defense Demo Builds"** section showing the 3 featured cards (`MMSU CCIS Academic Starter`, `AM5 1440p Ultra Gaming`, and `⚠️ Educational Demo: Hidden Compatibility Traps`).

**Speaker Talking Points:**
> "Good day, members of the defense panel. We are the MMSU CCIS Capstone Team presenting **Digital PC Builder: Virtual Compatibility & Simulation System**.
>
> Matching a CPU socket to a motherboard is easy. Yet first-time builders, students, and local PC shops routinely lose thousands of pesos to **hidden compatibility traps**: a 56mm tall RGB RAM stick colliding with a dual-tower air cooler fan, a 342mm triple-fan GPU hitting the front mesh of a compact case, an older PSU lacking a native 16-pin connector for an RTX 40-series card, or pairing an unbalanced CPU and GPU that bottlenecks at 1080p.
>
> Our platform eliminates these risks before a single part is purchased—combining a **millimeter-accurate rule engine**, **hybrid 3D WebGL and 2D Blueprint case visualization**, **Explainable AI (XAI) recommendations**, and **multi-resolution bottleneck simulation**."

---

## Segment 2: Live Demo of the "Hidden Compatibility Traps" Build (1:30 – 4:15)

**Exact Click Path:**
1. On the **Home** page, click the red **"Load & Inspect 5 Conflicts in Builder"** button on the 3rd preset card (`⚠️ Educational Demo: "Hidden Compatibility Traps"`).
2. The app switches to the **Builder** tab. Point to the top navbar pulsing red badge (`5 Conflicts`) and the **3D Case View** on the right where conflicting slots glow crimson red.
3. Drag with the mouse to rotate the 3D chassis, then click **2D Blueprint** at the top-right of the visualizer to show the schematic cross-section and millimeter clearance rulers (`GPU: 342mm / 320mm`, `Cooler: 165mm / 165mm`, `RAM: 56mm / ≤32mm`).
4. Scroll down the right column to **Automated Compatibility Diagnostics** and click the **Issues** filter button.
5. On the *"RAM Module Height Collides with Air Cooler Fan (56mm > 32mm)"* diagnostic card, click the **`ram`** quick-jump button.
6. In the left picker (`2. Select Memory (RAM)`), check the **"Hide Incompatible Parts"** checkbox, then click **Select** on `Corsair Vengeance 64GB DDR5-6000 (Height: 35mm)` or `G.Skill Flare X5 32GB (Height: 33mm)`.

**Speaker Talking Points:**
> "Watch what happens when we load our **Hidden Compatibility Traps** demo build. Even though the Intel Core i7-14700K and Z790 motherboard share the exact same LGA1700 socket, our engine immediately flags **5 critical failures** and highlights them in red inside both our **3D WebGL Chassis** and our **2D Technical Blueprint**:
> 1. **Motherboard vs. Case:** A full ATX Z790 board inside a Micro-ATX-only DeepCool MACUBE 110 case.
> 2. **GPU Length Collision:** A 342mm RTX 4080 SUPER exceeding the case's 320mm limit by 22mm.
> 3. **RAM Height vs. Cooler Overhang:** 56mm Corsair Dominator RGB RAM colliding with the Noctua NH-D15's 32mm front fan clearance.
> 4. **PSU Wattage Overload & Missing 16-Pin Cable:** 735W peak transient load on a 550W Bronze PSU with zero 16-pin `12VHPWR` ports.
>
> To fix the RAM collision, I click the `ram` quick-jump button on the diagnostic card, check **'Hide Incompatible Parts'**, and select the 33mm low-profile **G.Skill Flare X5 DDR5**. The RAM-to-cooler conflict resolves in real time!"

---

## Segment 3: Explainable AI (XAI) Auto-Recommender (4:15 – 6:15)

**Exact Click Path:**
1. Click the **"XAI Recommender"** tab in the top navigation bar.
2. Drag the **Target Budget (PHP)** slider to **`₱75,000`**.
3. Toggle between **`Gaming & Esports`** and **`3D Rendering, CAD & Data Science`** under Primary Workload Profile.
4. Scroll down to **"Why Were These Parts Chosen? (Explainable AI Decision Matrix)"** and point to the weighted progress bars under CPU, GPU, RAM, and Cooler.
5. Scroll back up and click **"Load Recommended Build"**.

**Speaker Talking Points:**
> "Next, let's open our **XAI Recommender**. Traditional auto-builders are opaque black boxes. Here, when a student or customer sets a **₱75,000** budget and chooses **Gaming** or **3D Rendering & Data Science**, our Multi-Criteria Decision Analysis engine partitions the budget, pre-verifies all physical clearances, and displays an **Explainable AI Decision Matrix**.
>
> Every single recommended component shows its exact factor weights—50% Workload Throughput, 35% Budget Fit, and 15% Thermal/Clearance Safety—along with raw scores and plain-English reasoning. Clicking **Load Recommended Build** sends this 100%-compatible configuration straight into our Builder."

---

## Segment 4: Performance, Bottleneck & PSU Simulation (6:15 – 8:15)

**Exact Click Path:**
1. Click the **"Simulation"** tab in the top navigation bar.
2. Point to the 4 top KPI cards (**Gaming Performance Index**, **Workstation / CAD Index**, **Est. Full-Load Temps**, and **Acoustics & Power Headroom**).
3. Point to the **CPU vs. GPU Bottleneck Analysis** card on the left, highlighting the **1080p**, **1440p**, and **4K** load-share bars.
4. Hover over the **Simulated Multi-Resolution Gaming Frame Rates (FPS)** bar chart on the right (*Valorant/CS2*, *Apex Legends*, *Baldur's Gate 3*, *Cyberpunk 2077*).
5. Scroll down to the **PSU Load Headroom & 80+ AC-DC Efficiency Curve**.

**Speaker Talking Points:**
> "In the **Simulation** tab, our `performanceEngine` models 1080p, 1440p, and 4K frame rates across four game genres using a weighted harmonic mean of CPU and GPU capabilities.
>
> On the left, our **Bottleneck Visualizer** demonstrates how CPU load share is highest at 1080p, while 1440p and 4K shift the workload onto the GPU. Below, our **PSU Efficiency Curve** plots the power supply's 80+ AC-to-DC efficiency across load percentages, confirming our build operates near the 50% efficiency sweet spot with safe headroom for transient spikes."

---

## Segment 5: Comparator, Build Summary, Saved Gallery & Wrap-Up (8:15 – 10:00)

**Exact Click Path:**
1. Click the **"Compare"** tab to show side-by-side GPU/CPU comparison with derived `pts / ₱10` Price-to-Performance metrics and dataset-derived `2-Channel DDR5` accuracy.
2. Click the **"Build Summary"** tab to show the print-ready Bill of Materials (BOM) table, then click **"Copy Shareable Build Link"**.
3. Click the **"Saved Builds"** tab to show the `localStorage` gallery and `.JSON` import/export panel.
4. Click the **"About / Help"** tab to show the 6-step First-Time Assembly Safety Protocol, Interactive Glossary, and MMSU CCIS 12-member team credits.

**Speaker Talking Points:**
> "Finally, users can compare up to 4 parts side-by-side in **Compare**, generate a print-ready Bill of Materials or URL-encoded **Share Link** in **Build Summary**, manage their `localStorage` gallery and `.JSON` files in **Saved Builds**, and follow our 6-step physical assembly safety checklist in **About / Help**.
>
> All engines are strictly typed in TypeScript and verified by 19 automated Vitest unit tests. Thank you, and we are ready for your questions!"
