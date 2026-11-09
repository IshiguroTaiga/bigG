# Digital PC Builder: Presentation Script

**Total time:** about 11 minutes, plus 3–5 minutes of Q&A
**Website:** bigg-one.vercel.app

## Before you start

- Open bigg-one.vercel.app in a browser tab before the presentation and load the **₱96,690 1440p** preset from the Home page.
- Whoever shares the screen should be able to switch quickly between the slides and the browser (Alt + Tab).
- If the website doesn't load, stay on the slides. Slides 9–16 already show every feature.
- Cameras on, full names on profiles, and tell the instructor 15 minutes before your slot.

| # | Slide | Presenter | Time |
|---|---|---|---|
| 1 | Title | Luis Bullanday | 0:30 |
| 2 | Community concern | Justine Dwight Acoba | 0:40 |
| 3 | What We Found | John Benedict Alberto | 0:45 |
| 4 | Problem Statement | Arom Sylon Apostle Alcausin | 0:30 |
| 5 | Ideate | Arom Sylon Apostle Alcausin | 0:40 |
| 6 | Key Features | Nythan Bagasani | 0:45 |
| 7 | From User Needs to Features | Karl Vincent Balcita | 0:45 |
| 8 | Live Demo divider | Luis Bullanday | 0:10 |
| 9 | Build Status | Jonas Nathaniel Bonifacio | 0:35 |
| 10 | Hardware Slots | Zeus Bumagat | 0:35 |
| 11 | Part Browser | Mark Lorenz Datuin | 0:40 |
| 12 | Build Summary | Micko Gabriel Permison | 0:35 |
| 13 | Comparator | Stephen Jay Polendey | 0:40 |
| 14 | Simulation | Rhed Luis Ratuita | 0:35 |
| 15 | Bottleneck Analysis | Justine Dwight Acoba | 0:40 |
| 16 | Frame Rates & PSU | John Benedict Alberto | 0:35 |
| 17 | Thank You | Luis Bullanday | 0:15 |

---

## Part 1: Empathize & Define

### Slide 1: Title
**Luis Bullanday · 0:30**

> Good day, Ma'am/Sir, and to everyone here. We are the Digital PC Builder team from the College of Computing and Information Sciences.
>
> Our project is the Digital PC Builder, a website that helps first-time builders choose computer parts that actually work together, before they spend any money. It's live right now at bigg-one.vercel.app.
>
> We'll walk you through how we got here, from understanding the problem to the working website. Let's start with the problem.

### Slide 2: First-Time PC Builders Lose Money to Mistakes They Can't See
**Justine Dwight Acoba · 0:40**

> Many students, gamers and small offices around MMSU build their own PCs to save money.
>
> Matching the processor and the motherboard is the easy part. The costly mistakes are the ones people don't see:
> - RAM that's too tall for the CPU cooler,
> - a graphics card that's too long for the case,
> - a power supply that's too weak or doesn't have the right cable,
> - and a CPU and GPU that hold each other back.
>
> Buyers usually find out only after they've paid. The result is returns, wasted pesos and failed first builds.

### Slide 3: What We Found
**John Benedict Alberto · 0:45**

> To understand the problem better, we talked to first-time builders. Here's what they told us.
>
> They don't understand what a bottleneck is. They don't know which parts a PC actually needs. Many think the more expensive part is always better. They're afraid to buy because product listings don't explain what each part does. And they told us they want to compare parts and to know if a build will run smoothly before buying.
>
> We also reviewed five existing tools, like PCPartPicker. They don't check if the RAM hits the cooler, bottleneck calculators give a number without explaining why, most prices are in US dollars, and brand builders only let you pick from their own templates.

### Slide 4: Problem Statement
**Arom Sylon Apostle Alcausin · 0:30**

> From these findings, we defined our problem statement:
>
> *How might we help first-time PC builders choose parts that actually fit, work together and stay within their budget in pesos, before they buy?*
>
> Our users are MMSU students and other first-time builders. What they need is confidence that every part fits and works, not just the socket. And our key insight is that existing tools catch some mistakes but never explain why, so beginners can't learn from them.

---

## Part 2: Ideate & System Design

### Slide 5: Ideate: Ideas We Considered
**Arom Sylon Apostle Alcausin · 0:40**

> We then brainstormed different ways to solve this.
>
> A printable checklist is cheap, but it can't check sizes or power automatically. A chatbot advisor is friendly, but its answers aren't always consistent or easy to verify. And just recommending PCPartPicker still leaves the clearance traps, the dollar prices and the missing explanations.
>
> So we chose a web-based visual builder: it checks every part against clear rules, shows prices in pesos and explains each result in plain language.

### Slide 6: Key Features & Value Proposition
**Nythan Bagasani · 0:45**

> Our value proposition is simple: beginner-friendly, priced in pesos, and it explains *why* a part doesn't fit.
>
> It has six main features:
> - an **Interactive Builder** with eight slots, one for each required part;
> - a **Compatibility Engine** that runs 14 checks as you build;
> - a **Build Summarizer** that keeps the total price and power use in view;
> - a **Comparison Tool** for up to four parts side by side;
> - a **Performance Simulation** with estimated frame rates and temperatures;
> - and **Explainable Insights** that tell you in plain language if your CPU and GPU are well matched.

### Slide 7: From User Needs to Features
**Karl Vincent Balcita · 0:45**

> Every feature we built answers something users told us.
>
> They didn't understand bottlenecks, so the Simulation tab explains them. They didn't know which parts were needed, so the Builder lists all eight. They thought expensive meant better, so the Compare tab shows value for money. They were afraid to buy without descriptions, so every part in the Builder has a description and plain-language warnings. They wanted to compare parts, which is the Compare tab. And they wanted to know a build runs smoothly, which is the Simulation tab.
>
> To make sure these features work, we wrote 19 automatic checks that give the website common mistakes and confirm it catches them. All 19 passed.

---

## Part 3: System Prototype & Live Demo

### Slide 8: System Prototype & Live Demo
**Luis Bullanday · 0:10**

> Now let's show you the actual website.

**Action:** switch to the browser with bigg-one.vercel.app open and the ₱96,690 preset loaded. Each presenter below shows their part **live**. Use the slide only if the website doesn't load.

### Slide 9: Build Status Is Always Visible
**Jonas Nathaniel Bonifacio · 0:35**

**Show on site:** point to the top bar.

> This top bar stays visible while you build. The green badge says "Compatible, 14 checks", so every rule passed. Next to it is the estimated power use, about 386 watts out of a 750-watt power supply, and the total price, ₱96,690. Both update the moment you change a part. Below are the tabs: Home, Builder, Compare and Simulation.

### Slide 10: Interactive Builder: Hardware Slots
**Zeus Bumagat · 0:35**

**Show on site:** click the **Builder** tab.

> In the Builder, there's one card for each part a PC needs: processor, motherboard, CPU cooler, memory, graphics card, storage, power supply and case. This answers the "which parts do I need?" problem. Each slot shows the chosen part and its price in pesos. If you hover over terms like "Socket" or "RAM Clearance", the website explains what they mean.

### Slide 11: Part Browser: Filter, Validate, Test Anyway
**Mark Lorenz Datuin · 0:40**

**Show on site:** click the **Processor (CPU)** slot to open the part list.

> When you click a slot, you see every available part. You can search, filter by brand and sort by price. Each part has a short description and its key specs.
>
> If a part won't work with your build, it shows a red warning that explains why. For example, this Intel processor says "socket mismatch" because our motherboard is for AMD. Beginners can tick "Hide Incompatible Parts", or click "Test Anyway" to see what would happen.

### Slide 12: Build Summary: Itemized Cost and Power
**Micko Gabriel Permison · 0:35**

**Show on site:** click the **Build Summary** tab.

> The Build Summary lists every part with its price, so you know exactly where your money goes. This build costs ₱96,690 in total, uses about 386 out of 750 watts, and passes all 14 compatibility checks. You can bring this list to a computer shop or share it with a friend for advice.

### Slide 13: Side-by-Side Component Comparator
**Stephen Jay Polendey · 0:40**

**Show on site:** click the **Compare** tab, then **GPU**.

> Users told us they want to compare parts and that they think expensive is always better. In Compare, you can put up to four parts side by side.
>
> Look at the price-to-performance value: the cheaper RTX 4060 scores 10.13 points per ten pesos, while the more expensive RX 7700 XT scores 9.59. So the expensive card isn't always the better deal. It also shows size, power needs and gaming scores, and "Use in Build" sends your pick straight to the Builder.

### Slide 14: Simulation: Performance Before You Buy
**Rhed Luis Ratuita · 0:35**

**Show on site:** click the **Simulation** tab and point to the top cards.

> Users wanted to know if a build will run smoothly before buying. The Simulation tab estimates that. This build scores 89 out of 100 for gaming and 71 for workstation tasks like CAD. The CPU and GPU are expected to stay around 67 and 69 degrees under full load, so the website marks it as cool and quiet.

### Slide 15: Explainable Bottleneck Analysis
**Justine Dwight Acoba · 0:40**

**Show on site:** scroll to the **CPU vs. GPU Bottleneck Analysis** card.

> This answers the first thing users told us: they don't understand bottlenecks. A bottleneck is when one part is too slow and holds the other back.
>
> Instead of just giving a number, the website explains it in plain words. Here it says the Ryzen 5 7600X and RTX 4070 SUPER are well matched, so no changes are needed. The bars show how the work shifts from the CPU to the GPU as the resolution goes up from 1080p to 4K.

### Slide 16: Frame Rates and PSU Efficiency
**John Benedict Alberto · 0:35**

**Show on site:** scroll down to the FPS chart and the PSU curve.

> Further down, you can see estimated frame rates for different games. For example, a heavy game like Cyberpunk runs at about 105 FPS at 1080p and 44 at 4K.
>
> The power supply chart shows this 750-watt unit is most efficient between 40 and 60 percent load, and this build sits right in that range.
>
> One note: these numbers come from sample data we prepared for this academic project, not live benchmarks.

**Action:** switch back to the slides and go to slide 17.

---

## Closing

### Slide 17: Thank You
**Luis Bullanday · 0:15**

> To summarize: we listened to first-time builders, defined their problem, chose a solution and built a working website that answers each need they told us about.
>
> Thank you for listening. You can try it yourself at bigg-one.vercel.app. We're happy to answer your questions.

---

## Q&A prep

Agree on these answers as a group before presenting.

| Likely question | Suggested answer |
|---|---|
| How many users did you talk to, and how? | *[Fill in the real number and method, e.g. "We interviewed __ CCIS students."]* |
| Where do the prices and benchmarks come from? | Curated sample data prepared for this academic project. Users should check current store prices before buying. |
| How is this different from PCPartPicker? | Prices in pesos, it checks RAM height against the cooler, and it explains *why* a part doesn't fit in plain language. |
| How does the compatibility check work? | It compares each part's specs, like socket, memory type, size in millimeters and wattage, against fixed rules. 14 rules run every time you change a part. |
| Is the "XAI" real AI? | The analysis is rule-based. "Explainable" means every result comes with a plain-language reason, so users can see why. |
| How did you test it? | 19 automatic checks feed the website common mistakes, like a wrong socket or too-tall RAM, and confirm it catches them. All 19 passed. |
| Does it work on phones? | Yes. The layout works on phones, and our screenshots were taken on one. |
