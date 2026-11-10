# 09 — Final Presentation Script

**Project:** Digital PC Builder: Virtual Compatibility & Simulation System
**Institution:** MMSU College of Computing and Information Sciences (CCIS)
**Deck:** [`docs/assets/Digital-PC-Builder-Final.pptx`](assets/Digital-PC-Builder-Final.pptx) (19 slides)
**Live site:** https://bigg-one.vercel.app (demo on the live site, **not** `localhost`)
**Total time:** 10–12 minutes of presentation, then 3–5 minutes of Q&A. All 12 members speak.

> **Backup plan:** if the site or the connection drops at any point, switch back to the deck and continue on the screenshot slides (slides 10–17 show every demo step).

---

## Running order

| Part | Slides | Presenter(s) | Time |
|---|---|---|---|
| **Empathize & Define** (~3 min) | 1–5 | Luis → Justine → John → Arom | 0:00 – 3:15 |
| **Ideate & System Design** (~2 min) | 6–8 | Arom → Nythan → Karl | 3:15 – 5:20 |
| **Live demo** (~3.5 min) | 9–17 | Luis, then demo steps 1–8 | 5:20 – 9:00 |
| **Test** | 18 | Karl | 9:00 – 9:50 |
| **Thank you + Q&A** | 19 | Luis | 9:50 – 10:05, then 3–5 min Q&A |

| # | Slide | Presenter | Time |
|---|---|---|---|
| 1 | Title | Luis Bullanday | 0:00 – 0:30 |
| 2 | Our Design Thinking Journey | Luis Bullanday | 0:30 – 1:15 |
| 3 | Community concern | Justine Dwight Acoba | 1:15 – 1:55 |
| 4 | What We Found (user research) | John Benedict Alberto | 1:55 – 2:40 |
| 5 | Problem Statement | Arom Sylon Apostle Alcausin | 2:40 – 3:15 |
| 6 | Ideate: Ideas We Considered | Arom Sylon Apostle Alcausin | 3:15 – 3:50 |
| 7 | Key Features & Value Proposition | Nythan Bagasani | 3:50 – 4:35 |
| 8 | From User Needs to Features | Karl Vincent Balcita | 4:35 – 5:20 |
| 9 | System Prototype & Live Demo (opens site) | Luis Bullanday | 5:20 – 5:40 |
| 10 | Demo 1: Header & build status | Jonas Nathaniel Bonifacio | 5:40 – 6:05 |
| 11 | Demo 2: Builder slots | Zeus Bumagat | 6:05 – 6:30 |
| 12 | Demo 3: Part browser + socket warning | Mark Lorenz Datuin | 6:30 – 6:55 |
| 13 | Demo 4: Build summary | Micko Gabriel Permison | 6:55 – 7:20 |
| 14 | Demo 5: Compare | Stephen Jay Polendey | 7:20 – 7:45 |
| 15 | Demo 6: Simulation | Rhed Luis Ratuita | 7:45 – 8:10 |
| 16 | Demo 7: Bottleneck analysis | Justine Dwight Acoba | 8:10 – 8:35 |
| 17 | Demo 8: FPS & PSU curve | John Benedict Alberto | 8:35 – 9:00 |
| 18 | Test: Checking That It Works for Users | Karl Vincent Balcita | 9:00 – 9:50 |
| 19 | Thank You / Q&A | Luis Bullanday | 9:50 – 10:05 |

The timings add up to about 10 minutes, which leaves up to 2 minutes of slack inside the 10–12 minute slot.

---

## Before you start (screen sharer)

1. Open **https://bigg-one.vercel.app** in a **new incognito/private window**. The app remembers the last build and comparison in the browser, so a fresh window guarantees the demo state below.
2. Confirm the header shows **`Compatible (14 Checks)`**, **`~386W / 750W`** and **`₱96,690`** (Ryzen 5 7600X + RTX 4070 SUPER build).
   - If it doesn't: **Home** tab → card **"AM5 1440p Ultra Gaming & Streaming Rig"** → **Load Build in Builder**.
   - Note: that Home card's badge still reads "₱93.6K" (outdated preset label). Read prices from the header, not the card.
3. Open the **Compare** tab once and confirm it shows **RTX 4060, RX 7700 XT and RTX 4070 SUPER**. Then go back to **Home**.
4. Keep the deck and the browser one Alt + Tab apart. Cameras on, full names on profiles.

---

## Part 1: Empathize & Define (~3 min)

### Slide 1: Title
**Luis Bullanday · 0:00 – 0:30**

> Good morning, Ma'am/Sir, and everyone. We are the Digital PC Builder team from MMSU CCIS. Our project helps first-time PC builders choose parts that fit and work together, priced in pesos, before they spend any money. It's live right now at bigg-one.vercel.app.

### Slide 2: Our Design Thinking Journey
**Luis Bullanday · 0:30 – 1:15**

> This is our design thinking journey. Each stage's output became the next stage's input: the pain points we heard became our problem statement, the problem statement shaped our features, the features became the prototype, and the prototype is what we test. What we learn in testing goes back into Define and Prototype. Justine will start with the community concern.

### Slide 3: First-Time PC Builders Lose Money to Mistakes They Can't See
**Justine Dwight Acoba · 1:15 – 1:55** · *Community concern*

> Students, gamers and small offices around MMSU build their own PCs to save money. Matching the processor and motherboard is the easy part. The costly mistakes are the ones people don't see: RAM that's too tall for the CPU cooler, a graphics card that's too long for the case, a power supply that's too weak or lacks the right cable, and a CPU and GPU that hold each other back. Buyers usually find out after they've paid. The result is returns, wasted pesos and failed first builds. John will share what we found.

### Slide 4: What We Found
**John Benedict Alberto · 1:55 – 2:40** · *User research insights*

> On the left are the six things first-time builders told us: they don't understand bottlenecks, they don't know which parts are needed, they think expensive means better, they're afraid to buy because listings don't explain the parts, they want to compare parts, and they want to know a build will run smoothly before buying.
>
> On the right is what current tools miss. PCPartPicker checks sockets and GPU length, but not RAM height against the cooler. Bottleneck calculators give a percentage with no explanation. Most tools price in US dollars, not pesos. And brand builders like NZXT BLD only let you pick from their own templates. Arom will turn this into our problem statement.

### Slide 5: Problem Statement
**Arom Sylon Apostle Alcausin · 2:40 – 3:15**

> *How might we help first-time PC builders choose parts that actually fit, work together and stay within their budget in pesos, before they buy?*
>
> Our **user** is MMSU students and other first-time builders. Their **need** is confidence that every part fits and works, not just the socket. Our **insight** is that existing tools catch some mistakes but never explain why, so beginners can't learn from them.

---

## Part 2: Ideate & System Design (~2 min)

### Slide 6: Ideate: Ideas We Considered
**Arom Sylon Apostle Alcausin · 3:15 – 3:50**

> We considered four ideas. A printable checklist or spreadsheet is cheap, but it can't check sizes or power automatically. A chatbot advisor is friendly, but its answers aren't consistent or explainable. Recommending PCPartPicker as-is still misses the clearance traps, the dollar prices and the explanations. So we chose a **web-based visual builder**: a rule-based compatibility engine, prices in pesos and plain-language explanations. Nythan will present the features.

### Slide 7: Key Features & Value Proposition
**Nythan Bagasani · 3:50 – 4:35**

> Our value proposition: beginner-friendly, priced in pesos, and it explains **why** a part doesn't fit. There are six features:
> - an **Interactive Builder** with eight hardware slots;
> - a **Compatibility Engine** with 14 live checks and a header badge;
> - a **Build Summarizer** that keeps the total price and power estimate in view;
> - a **Comparison Tool** for up to four parts per category on price-to-performance;
> - a **Performance Simulation** with gaming and workstation indexes, temperatures, noise and FPS estimates;
> - and **Explainable Insights**: plain-language CPU vs GPU bottleneck analysis and PSU headroom guidance.
>
> Karl will show how each feature connects to a user need.

### Slide 8: From User Needs to Features
**Karl Vincent Balcita · 4:35 – 5:20** · *Traceability*

> Every feature traces back to one of the six user needs. For example: users didn't understand bottlenecks, so the Simulation tab has an explainable bottleneck analysis. They didn't know which parts were needed, so the Builder lists all eight slots. They found it hard to judge value for money, so Compare shows a price-to-performance score. Luis will now open the live system.

---

## Part 3: Live Demo on bigg-one.vercel.app (~3.5 min)

### Slide 9: System Prototype & Live Demo
**Luis Bullanday · 5:20 – 5:40**

**Click path:** Alt + Tab to the browser with **https://bigg-one.vercel.app** already open (see *Before you start*).

> We'll now switch to the live website. Each of us will drive one step. Jonas, over to you.

> **Backup plan:** if the site or the connection drops, stay on the deck. Slides 10–17 are screenshots of the same eight steps. Each presenter reads their slide instead.

### Demo 1: Header & build status (slide 10)
**Jonas Nathaniel Bonifacio · 5:40 – 6:05**

**Click path:** no clicks. Point at the top bar.

> This top bar stays visible while you build. The green badge says **Compatible (14 Checks)**, so every rule passed. Next to it is the power estimate, about **386 watts of a 750-watt** supply, and the running total, **₱96,690**. Both update the moment you change a part. Below are the tabs: Home, Builder, Compare, Simulation and more.

### Demo 2: Builder slots (slide 11)
**Zeus Bumagat · 6:05 – 6:30**

**Click path:** click the **Builder** tab → point down the eight slot cards → hover a hint such as **RAM Clearance** or **Socket**.

> The Builder has one card for every part a PC needs: processor, motherboard, CPU cooler, memory, graphics card, storage, power supply and case. Each slot shows the chosen part and its price in pesos. Hovering a hint like RAM Clearance explains the rule behind the check.

### Demo 3: Part browser + socket warning (slide 12)
**Mark Lorenz Datuin · 6:30 – 6:55**

**Click path:** in the Builder, click the **Processor (CPU)** slot → scroll the list to an Intel CPU such as **Core i7-14700K** → point at the red warning on its card → tick **Hide Incompatible Parts**.

> **Do not press the red "Test Anyway" button.** It installs the Intel CPU and turns the header red for the rest of the demo. If it happens, click **Select** on **Ryzen 5 7600X** to restore the build.

> When you open a slot, you can search, filter by brand and sort by price, and every card shows key specs. If a part won't work with your build, it shows a red warning that explains why. This Intel CPU says **"CPU & Motherboard Socket Mismatch (LGA1700 vs AM5)"** because our motherboard is AM5. Beginners can tick **Hide Incompatible Parts** to keep the list clean, or use Test Anyway to see what a risky pick would do.

### Demo 4: Build summary (slide 13)
**Micko Gabriel Permison · 6:55 – 7:20**

**Click path:** click the **Build Summary** tab, or click the blue **₱96,690** total in the header (it opens the same page). On a narrow window, scroll the tab row to the right to find Build Summary.

> The Build Summary lists every part with its price, so you know exactly where your money goes. It adds up to **₱96,690**, draws about **386 of 750 watts**, and passes **14 of 14** compatibility checks. You can bring this list to a computer shop or share it with a friend.

### Demo 5: Compare (slide 14)
**Stephen Jay Polendey · 7:20 – 7:45**

**Click path:** click the **Compare** tab. The GPU table with **RTX 4060, RX 7700 XT and RTX 4070 SUPER** is already open → point at the **Price-to-Performance Value** row → point at **Use in Build**.

> **Do not click the "GPU" category chip.** It resets the table to the first three GPUs in the catalog and these numbers disappear. If the table is wrong, use **Quick Add** to add RTX 4060, RX 7700 XT and RTX 4070 SUPER.

> Users told us they think expensive is always better. Compare puts up to four parts side by side. Look at the value row: the cheaper **RTX 4060 scores 10.13 points per ₱10**, while the more expensive **RX 7700 XT scores 9.59**. So the expensive card isn't always the better deal. **Use in Build** sends your pick straight to the Builder.

### Demo 6: Simulation (slide 15)
**Rhed Luis Ratuita · 7:45 – 8:10**

**Click path:** click the **Simulation** tab → point at the four top cards (**Gaming Performance Index**, **Workstation / CAD Index**, **Est. Full-Load Temps**, **Acoustics & Power Headroom**).

> Users wanted to know if a build runs smoothly before buying. This build scores **89 out of 100 for gaming** and **71 for workstation** tasks like CAD. The CPU should stay around **67°C** and the GPU around **69°C** under full load, at about 26 dBA, so it's rated Cool & Quiet.

### Demo 7: Bottleneck analysis (slide 16)
**Justine Dwight Acoba · 8:10 – 8:35**

**Click path:** on the Simulation tab, point at the **CPU vs. GPU Bottleneck Analysis** card and its 1080p / 1440p / 4K bars.

> This answers the first thing users told us: they don't understand bottlenecks. Instead of only a number, the site explains it in plain words. It says **Balanced, 0%**: the Ryzen 5 7600X and RTX 4070 SUPER are well matched, so the GPU reaches 97–100% use without CPU stutter. The bars show the load shifting to the GPU as resolution goes up to 4K.

### Demo 8: FPS & PSU curve (slide 17)
**John Benedict Alberto · 8:35 – 9:00**

**Click path:** scroll down to **Simulated Multi-Resolution Gaming Frame Rates (FPS)** → hover the **Cyberpunk 2077 / Black Myth: Wukong** bars → scroll to **PSU Load Headroom & 80+ AC-DC Efficiency Curve**. Then Alt + Tab back to the deck, slide 18.

> The FPS chart estimates frame rates per resolution. A heavy game like Cyberpunk runs at about **105 FPS at 1080p, 81 at 1440p and 44 at 4K**. The PSU curve shows this 750-watt Gold unit is most efficient around 40–60% load, and this build sits at about 50%. These numbers come from curated sample data for this academic project, not live benchmarks. Back to Karl for testing.

---

## Part 4: Test

### Slide 18: Test: Checking That It Works for Users
**Karl Vincent Balcita · 9:00 – 9:50**

> All **19 of 19** automated unit tests pass in Vitest. They cover the exact traps from our empathy stage: an AM5 CPU on an LGA1700 board, 56 mm RAM under a cooler with 32 mm clearance, a 358 mm GPU in a 315 mm case, a 550 W PSU with no 16-pin cable for an RTX 4090, and a Core i3 with an RTX 4090 flagged as a CPU bottleneck.
>
> Next is usability testing with MMSU students, gamers, hardware store staff and IT faculty. They will load the Hidden Traps build and find the conflicts, fix the RAM-vs-cooler clash, get a recommended build for ₱55,000, and read the FPS chart and share the build. Then they'll rate the system on a 12-item System Usability Scale form. What we learn feeds back into Define and Prototype, which closes the design thinking loop.

---

## Closing

### Slide 19: Thank You / Q&A
**Luis Bullanday · 9:50 – 10:05, then 3–5 min Q&A**

> Thank you for listening. You can try it yourself at bigg-one.vercel.app, and the source code is on GitHub at IshiguroTaiga/bigG. We're happy to answer your questions.

**Q&A hand-off (Luis moderates):**
- Technical / engine questions → the developers
- Research questions → Justine, John
- Design questions → Arom, Nythan
- Testing questions → Karl

---

## If the panel asks to see a failing build

**Click path:** **Home** tab → card **⚠️ Educational Demo: "Hidden Compatibility Traps"** → **Load & Inspect 5 Conflicts in Builder**. The header badge turns red with **5 Conflicts** (ATX board in a Micro-ATX case, 342 mm GPU in a 320 mm case, 56 mm RAM vs a 32 mm cooler limit, 550 W PSU under a 727 W peak, missing 16-pin cable). Reload the ₱96,690 build afterward (Home → AM5 1440p card → Load Build in Builder).

For prepared answers to common panel questions, see [08-defense-qa.md](08-defense-qa.md).
