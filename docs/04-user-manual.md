# 04 — User Manual

**System:** Digital PC Builder: Virtual Compatibility & Simulation System  
**Audience:** First-Time Builders, Computing Students, Gamers, Hardware Retailers, and Academic Faculty

---

## 1. Quick-Start Guide for First-Time Builders (Under 2 Minutes)
If you have never built a PC before, follow these 4 simple steps:
1. **Start on the Home Page (`Home` tab):** Click **"Try XAI Auto-Recommender"** or load the **"MMSU CCIS Academic & Coding Starter"** preset card.
2. **Keep "Learn Mode" Enabled:** Make sure the **Learn Mode** button (graduation cap icon in the top navbar) is highlighted. Hover over dotted terms like **Socket**, **RAM Clearance**, or **PSU Headroom** to read beginner-friendly definitions and tips.
3. **Customize in the `Builder` Tab:** Click any component slot on the left. Check **"Hide Incompatible Parts"** so the catalog only shows parts guaranteed to fit your current selections.
4. **Verify & Export:** Check the top bar to ensure it says **Compatible (Green)**, preview your FPS in the **Simulation** tab, and print or download your parts list in the **Build Summary** tab!

---

## 2. Complete Feature-by-Feature Guide

### 2.1 Top Navigation & Global Status Bar
Across all pages, the sticky header displays:
- **8 Page Tabs:** `Home`, `Builder`, `Compare`, `Simulation`, `XAI Recommender`, `Build Summary`, `Saved Builds`, and `About / Help`.
- **Live Compatibility Badge:** Shows `Compatible (X Checks)` in green, `X Warnings` in amber, or `X Conflicts` in pulsing red. Clicking it jumps directly to the Builder diagnostics panel.
- **Live Wattage (`~XXXW / YYYW`):** Displays your typical system power draw vs. your selected PSU wattage.
- **Total Build Cost (`₱XX,XXX`):** Clicking the price badge opens the full itemized **Build Summary (BOM)**.
- **Quick Presets / Share Link / Learn Mode / Theme Toggle:** Instant utility buttons on the top right.

### 2.2 Interactive Builder (`Builder` Tab)
1. **1. Hardware Architecture Slots (Top-Left):** Displays the 8 categories (`Processor`, `Motherboard`, `CPU Cooler`, `Memory`, `Graphics Card`, `Storage`, `Power Supply`, `Chassis`). Storage supports up to **4 concurrent drives**. Click the trash icon on any slot to remove a part, or **Reset Build** to start from an empty chassis.
2. **2. Component Catalog Picker (Bottom-Left):**
   - **Search:** Type any keyword (e.g., `7800X3D`, `AM5`, `DDR5`, `ATX 3.0`, `White`).
   - **Brand Filter & Sort:** Filter by manufacturer or sort by `Price: Low to High`, `Price: High to Low`, `Performance / Capacity`, or `Alphabetical`.
   - **Live Incompatibility Reasons:** Even when *Hide Incompatible Parts* is unchecked, incompatible parts display a red warning banner explaining why they fail (e.g., *"Incompatible with current build: CPU & Motherboard Socket Mismatch"*). You can click **Test Anyway** to see the conflict highlighted in the 3D/2D case view.
3. **3. Interactive 3D & 2D Chassis Visualizer (Top-Right):**
   - **3D Case Mode:** Drag to rotate 360°, scroll to zoom, and click any 3D part inside the chassis to select its slot.
   - **2D Blueprint Mode:** Click **2D Blueprint** to switch to a technical cross-section showing exact GPU length, cooler height, and RAM slot population.
4. **4. Automated Compatibility Diagnostics (Middle-Right):**
   - Lists every evaluated rule (`Pass`, `Warn`, `Fail`) with a plain-English explanation, a green **Fix Recommendation**, and quick-jump category buttons.

### 2.3 Side-by-Side Component Comparator (`Compare` Tab)
- Click any category button (`CPU`, `Motherboard`, `RAM`, `GPU`, `Storage`, `PSU`, `Case`, `Cooler`) at the top right, or click the **Scale icon** on any part card in the Builder.
- Compare up to **4 components side-by-side** across price, derived **Price-to-Performance Value** (`pts / ₱10`), dual-channel memory support (`2-Channel DDR5`), physical dimensions, and power requirements.
- Click **Use in Build** on any column header to install that component immediately.

### 2.4 Performance, Bottleneck & PSU Simulator (`Simulation` Tab)
- **KPI Cards:** View your **Gaming Performance Index (0–100)**, **Workstation / CAD Index (0–100)**, **Estimated Full-Load Temperatures (°C)**, and **Acoustic Noise (dBA)**.
- **CPU vs. GPU Bottleneck Visualizer:** Shows the limiting component, severity rating, and horizontal load-share bars demonstrating how workload shifts from CPU to GPU across **1080p (FHD)**, **1440p (QHD)**, and **4K (UHD)**.
- **Simulated Multi-Resolution FPS Chart:** Interactive bar chart showing estimated FPS in *Valorant/CS2*, *Apex Legends/CoD*, *Baldur's Gate 3/GTA V*, and *Cyberpunk 2077/Black Myth: Wukong*.
- **PSU 80+ Efficiency Curve:** Area chart plotting AC-to-DC efficiency from 10% to 100% PSU load.

### 2.5 Explainable AI Recommender (`XAI Recommender` Tab)
- Adjust the **Target Budget Slider (`₱22,000` – `₱240,000`)**, select a **Primary Workload Profile** (`Gaming`, `Workstation`, `Academic`, `Streaming`), and choose a **Size / Form Factor Constraint** (`Any`, `ATX`, `Micro-ATX`, `Mini-ITX`).
- Inspect the **Explainable AI Decision Matrix** to review the exact weighted sub-scores for every recommended part, then click **Load Recommended Build**.

### 2.6 Build Summary (`Build Summary` Tab) & Saved Builds (`Saved Builds` Tab)
- **Build Summary:** Displays a print-ready Bill of Materials (BOM) table with full specifications, total cost, power summary, **Copy Shareable Build Link**, **Export .JSON**, and **Print / Save PDF**.
- **Saved Builds:** Load any of the 5 official MMSU presets, save your own custom builds to browser `localStorage`, or paste/download `.json` build configurations.
