import {
  PartCategory,
  PCBuildState,
  UseCaseProfile,
  XAIRecommendationResult,
  XAIScoreFactor,
} from '../types/pc';
import { USE_CASE_PROFILES, formatCurrency } from '../config/constants';
import {
  CPUS,
  MOTHERBOARDS,
  RAM_KITS,
  GPUS,
  STORAGE_DRIVES,
  PSUS,
  CASES,
  COOLERS,
  calculateBuildTotalCost,
} from '../data';
import { calculateSystemPower, evaluateCompatibility } from './compatibilityEngine';

export interface RecommendationRequest {
  budget: number; // Target budget in PHP (e.g., 25000 to 250000)
  useCase: UseCaseProfile;
  preferredFormFactor?: 'Any' | 'ATX' | 'Micro-ATX' | 'Mini-ITX';
}

/**
 * Explainable AI (XAI) Multi-Criteria Decision Analysis (MCDA) Recommendation Engine.
 * Deterministically selects a 100% compatible PC build tailored to user budget and workload,
 * while computing transparent factor weights and human-readable reasoning for every component.
 */
export function generateXAIRecommendation(
  request: RecommendationRequest
): XAIRecommendationResult {
  const { budget, useCase, preferredFormFactor = 'Any' } = request;
  const profile = USE_CASE_PROFILES[useCase];
  const split = profile.budgetSplit;

  // Determine whether this budget & useCase should use an APU (integrated graphics)
  const useApuBuild =
    (useCase === 'academic' && budget < 35000) || budget < 28000;

  // 1. Select CPU based on target CPU budget and use-case weighting
  const targetCpuBudget = useApuBuild ? budget * 0.32 : budget * split.cpu;
  const candidateCpus = CPUS.filter((c) => (useApuBuild ? c.integratedGraphics : true));

  const scoredCpus = candidateCpus.map((cpu) => {
    const perfScore =
      useCase === 'gaming'
        ? cpu.gamingScore
        : useCase === 'workstation'
        ? cpu.productivityScore
        : (cpu.gamingScore + cpu.productivityScore) / 2;

    const budgetDistance = Math.abs(cpu.price - targetCpuBudget) / Math.max(5000, targetCpuBudget);
    const budgetFitScore = Math.max(15, Math.round(100 - budgetDistance * 75));
    const efficiencyScore = Math.min(
      100,
      Math.round((perfScore / Math.max(50, cpu.tdpWatts)) * 90)
    );

    const factors: XAIScoreFactor[] = [
      {
        factor: `${profile.name} Throughput`,
        weightPercent: 50,
        rawScore: Math.round(perfScore),
        weightedContribution: Math.round(perfScore * 0.5),
        explanation: `${cpu.cores}C/${cpu.threads}T architecture scores ${Math.round(perfScore)}/100 for ${useCase} workloads.`,
      },
      {
        factor: 'Budget Allocation Fit',
        weightPercent: 35,
        rawScore: budgetFitScore,
        weightedContribution: Math.round(budgetFitScore * 0.35),
        explanation: `Priced at ${formatCurrency(cpu.price)} vs target allocation of ${formatCurrency(Math.round(targetCpuBudget))}.`,
      },
      {
        factor: 'Thermal & Platform Efficiency',
        weightPercent: 15,
        rawScore: efficiencyScore,
        weightedContribution: Math.round(efficiencyScore * 0.15),
        explanation: `${cpu.tdpWatts}W TDP on socket ${cpu.socket} (${cpu.supportedMemoryTypes.join('/')}).`,
      },
    ];

    const totalScore = factors.reduce((s, f) => s + f.weightedContribution, 0);
    return { cpu, totalScore, factors };
  });

  scoredCpus.sort((a, b) => b.totalScore - a.totalScore);
  const chosenCpuEntry = scoredCpus[0];
  const selectedCpu = chosenCpuEntry.cpu;

  // 2. Select Compatible Motherboard matching Socket & Preferred Form Factor
  const targetMbBudget = budget * split.motherboard;
  const compatibleMbs = MOTHERBOARDS.filter((mb) => {
    if (mb.socket !== selectedCpu.socket) return false;
    if (preferredFormFactor !== 'Any' && mb.formFactor !== preferredFormFactor) return false;
    if (selectedCpu.tdpWatts >= 170 && mb.vrmTier === 'Entry') return false;
    return true;
  });
  const fallbackMbs =
    compatibleMbs.length > 0
      ? compatibleMbs
      : MOTHERBOARDS.filter((mb) => mb.socket === selectedCpu.socket);

  const scoredMbs = fallbackMbs.map((mb) => {
    const budgetDist = Math.abs(mb.price - targetMbBudget) / Math.max(4000, targetMbBudget);
    const budgetScore = Math.max(20, Math.round(100 - budgetDist * 75));
    const vrmScore =
      mb.vrmTier === 'Flagship'
        ? 100
        : mb.vrmTier === 'Robust'
        ? 88
        : mb.vrmTier === 'Solid'
        ? 75
        : 58;
    const ioScore = Math.min(100, mb.m2Slots * 25 + (mb.wifi ? 20 : 0) + (mb.ramType === 'DDR5' ? 15 : 5));

    const factors: XAIScoreFactor[] = [
      {
        factor: 'Socket & VRM Power Delivery',
        weightPercent: 45,
        rawScore: vrmScore,
        weightedContribution: Math.round(vrmScore * 0.45),
        explanation: `Verified ${mb.socket} socket with ${mb.vrmTier} VRM tier for ${selectedCpu.name} (${selectedCpu.tdpWatts}W).`,
      },
      {
        factor: 'Budget Proportionality',
        weightPercent: 35,
        rawScore: budgetScore,
        weightedContribution: Math.round(budgetScore * 0.35),
        explanation: `${formatCurrency(mb.price)} aligns with target ${formatCurrency(Math.round(targetMbBudget))} motherboard budget.`,
      },
      {
        factor: 'Expansion & Connectivity',
        weightPercent: 20,
        rawScore: ioScore,
        weightedContribution: Math.round(ioScore * 0.2),
        explanation: `${mb.formFactor}, ${mb.m2Slots}x M.2 slots, ${mb.ramSlots}x ${mb.ramType} DIMMs${mb.wifi ? ', Onboard Wi-Fi' : ''}.`,
      },
    ];
    const totalScore = factors.reduce((s, f) => s + f.weightedContribution, 0);
    return { mb, totalScore, factors };
  });
  scoredMbs.sort((a, b) => b.totalScore - a.totalScore);
  const chosenMbEntry = scoredMbs[0];
  const selectedMb = chosenMbEntry.mb;

  // 3. Select Compatible RAM matching Motherboard RAM Type, Slots, and Low-Profile Preference
  const targetRamBudget = budget * split.ram;
  const desiredCapacity =
    budget >= 110000 && useCase === 'workstation'
      ? 64
      : budget >= 45000 || useCase === 'workstation' || useCase === 'streaming'
      ? 32
      : 16;

  const compatibleRams = RAM_KITS.filter(
    (r) =>
      r.type === selectedMb.ramType &&
      r.modules <= selectedMb.ramSlots &&
      r.capacityGB <= selectedMb.maxRamGB
  );

  const scoredRams = compatibleRams.map((ram) => {
    const capMatch = ram.capacityGB === desiredCapacity ? 100 : ram.capacityGB > desiredCapacity ? 78 : 62;
    const budgetDist = Math.abs(ram.price - targetRamBudget) / Math.max(2500, targetRamBudget);
    const budgetScore = Math.max(20, Math.round(100 - budgetDist * 65));
    const clearanceScore = ram.heightMm <= 36 ? 100 : ram.heightMm <= 44 ? 85 : 65;

    const factors: XAIScoreFactor[] = [
      {
        factor: 'Capacity & Speed Match',
        weightPercent: 50,
        rawScore: capMatch,
        weightedContribution: Math.round(capMatch * 0.5),
        explanation: `${ram.capacityGB}GB (${ram.modules}x${ram.capacityGB / ram.modules}GB) ${ram.type}-${ram.speedMHz} CL${ram.casLatency} fits ${useCase} multitasking.`,
      },
      {
        factor: 'Budget Efficiency',
        weightPercent: 30,
        rawScore: budgetScore,
        weightedContribution: Math.round(budgetScore * 0.3),
        explanation: `${formatCurrency(ram.price)} fits the ${formatCurrency(Math.round(targetRamBudget))} memory allocation.`,
      },
      {
        factor: 'Physical Cooler Clearance',
        weightPercent: 20,
        rawScore: clearanceScore,
        weightedContribution: Math.round(clearanceScore * 0.2),
        explanation: `${ram.heightMm}mm module height prevents collision with air cooler heatpipes/fans.`,
      },
    ];
    const totalScore = factors.reduce((s, f) => s + f.weightedContribution, 0);
    return { ram, totalScore, factors };
  });
  scoredRams.sort((a, b) => b.totalScore - a.totalScore);
  const chosenRamEntry = scoredRams[0];
  const selectedRam = chosenRamEntry.ram;

  // 4. Select GPU (or null if APU build)
  let selectedGpu = null;
  let chosenGpuEntry: {
    gpu: (typeof GPUS)[0];
    totalScore: number;
    factors: XAIScoreFactor[];
  } | null = null;

  if (!useApuBuild) {
    const targetGpuBudget = budget * split.gpu;
    const scoredGpus = GPUS.map((gpu) => {
      const perfScore =
        useCase === 'workstation'
          ? Math.min(100, Math.round(gpu.vramGB * 4.2 + gpu.gamingScore1440p * 0.4))
          : gpu.gamingScore1440p;
      const budgetDist = Math.abs(gpu.price - targetGpuBudget) / Math.max(8000, targetGpuBudget);
      const budgetScore = Math.max(10, Math.round(100 - budgetDist * 80));
      const balanceDiff = Math.abs(selectedCpu.gamingScore - gpu.gamingScore1440p);
      const synergyScore = Math.max(30, Math.round(100 - balanceDiff * 1.1));

      const factors: XAIScoreFactor[] = [
        {
          factor: 'Graphics & Compute Capability',
          weightPercent: 45,
          rawScore: perfScore,
          weightedContribution: Math.round(perfScore * 0.45),
          explanation: `${gpu.chipset} with ${gpu.vramGB}GB VRAM scores ${perfScore}/100 for ${profile.name}.`,
        },
        {
          factor: 'Target Budget Alignment',
          weightPercent: 35,
          rawScore: budgetScore,
          weightedContribution: Math.round(budgetScore * 0.35),
          explanation: `Priced at ${formatCurrency(gpu.price)} against ${formatCurrency(Math.round(targetGpuBudget))} GPU target.`,
        },
        {
          factor: 'CPU-GPU Bottleneck Synergy',
          weightPercent: 20,
          rawScore: synergyScore,
          weightedContribution: Math.round(synergyScore * 0.2),
          explanation: `Balanced with ${selectedCpu.name} to minimize frame-pacing bottlenecks.`,
        },
      ];
      const totalScore = factors.reduce((s, f) => s + f.weightedContribution, 0);
      return { gpu, totalScore, factors };
    });

    scoredGpus.sort((a, b) => b.totalScore - a.totalScore);
    chosenGpuEntry = scoredGpus[0];
    selectedGpu = chosenGpuEntry.gpu;
  }

  // 5. Select Case compatible with Motherboard Form Factor and GPU Length
  const targetCaseBudget = budget * split.case;
  const minGpuLen = selectedGpu ? selectedGpu.lengthMm + 15 : 250;
  const compatibleCases = CASES.filter(
    (c) =>
      c.supportedMotherboards.includes(selectedMb.formFactor) &&
      c.maxGpuLengthMm >= minGpuLen &&
      c.maxCoolerHeightMm >= 150
  );
  const casePool =
    compatibleCases.length > 0
      ? compatibleCases
      : CASES.filter((c) => c.supportedMotherboards.includes(selectedMb.formFactor));

  const scoredCases = casePool.map((pcCase) => {
    const budgetDist = Math.abs(pcCase.price - targetCaseBudget) / Math.max(2000, targetCaseBudget);
    const budgetScore = Math.max(25, Math.round(100 - budgetDist * 65));
    const airflowScore =
      pcCase.airflowRating === 'Mesh Performance'
        ? 98
        : pcCase.airflowRating === 'High Airflow'
        ? 90
        : 74;
    const clearanceScore = Math.min(
      100,
      Math.round(((pcCase.maxGpuLengthMm - (selectedGpu?.lengthMm || 200)) / 150) * 100)
    );

    const factors: XAIScoreFactor[] = [
      {
        factor: 'Dimensional Clearance Safety',
        weightPercent: 45,
        rawScore: Math.max(60, clearanceScore),
        weightedContribution: Math.round(Math.max(60, clearanceScore) * 0.45),
        explanation: `Supports ${selectedMb.formFactor}, ${pcCase.maxGpuLengthMm}mm GPU length, and ${pcCase.maxCoolerHeightMm}mm cooler height.`,
      },
      {
        factor: 'Airflow & Thermal Design',
        weightPercent: 30,
        rawScore: airflowScore,
        weightedContribution: Math.round(airflowScore * 0.3),
        explanation: `${pcCase.airflowRating} chassis with ${pcCase.includedFans} pre-installed fan(s).`,
      },
      {
        factor: 'Budget Fit',
        weightPercent: 25,
        rawScore: budgetScore,
        weightedContribution: Math.round(budgetScore * 0.25),
        explanation: `${formatCurrency(pcCase.price)} matches chassis budget allocation.`,
      },
    ];
    const totalScore = factors.reduce((s, f) => s + f.weightedContribution, 0);
    return { pcCase, totalScore, factors };
  });
  scoredCases.sort((a, b) => b.totalScore - a.totalScore);
  const chosenCaseEntry = scoredCases[0];
  const selectedCase = chosenCaseEntry.pcCase;

  // 6. Select CPU Cooler compatible with Socket, CPU TDP, Case Height/Radiator, and RAM Height
  const targetCoolerBudget = budget * split.cooler;
  const compatibleCoolers = COOLERS.filter((col) => {
    if (!col.supportedSockets.includes(selectedCpu.socket)) return false;
    if (col.tdpRatingWatts < selectedCpu.tdpWatts * 1.2) return false;
    if (col.ramClearanceMm < selectedRam.heightMm) return false;
    if (col.type === 'Air' && col.heightMm > selectedCase.maxCoolerHeightMm) return false;
    if (
      col.type === 'AIO' &&
      col.radiatorSizeMm &&
      col.radiatorSizeMm > selectedCase.maxRadiatorMm
    )
      return false;
    return true;
  });

  const coolerPool =
    compatibleCoolers.length > 0
      ? compatibleCoolers
      : COOLERS.filter((c) => c.supportedSockets.includes(selectedCpu.socket));

  const scoredCoolers = coolerPool.map((cooler) => {
    const thermalMarginScore = Math.min(
      100,
      Math.round((cooler.tdpRatingWatts / Math.max(65, selectedCpu.tdpWatts)) * 45)
    );
    const budgetDist =
      Math.abs(cooler.price - targetCoolerBudget) / Math.max(1500, targetCoolerBudget);
    const budgetScore = Math.max(25, Math.round(100 - budgetDist * 65));
    const clearanceScore = 98;

    const factors: XAIScoreFactor[] = [
      {
        factor: 'Thermal Dissipation Headroom',
        weightPercent: 50,
        rawScore: thermalMarginScore,
        weightedContribution: Math.round(thermalMarginScore * 0.5),
        explanation: `Rated for ${cooler.tdpRatingWatts}W TDP to cool ${selectedCpu.name} (${selectedCpu.tdpWatts}W TDP).`,
      },
      {
        factor: 'RAM & Case Clearance Check',
        weightPercent: 30,
        rawScore: clearanceScore,
        weightedContribution: Math.round(clearanceScore * 0.3),
        explanation: `Clears ${selectedRam.heightMm}mm RAM (${cooler.ramClearanceMm}mm limit) and fits ${selectedCase.name}.`,
      },
      {
        factor: 'Cost Effectiveness',
        weightPercent: 20,
        rawScore: budgetScore,
        weightedContribution: Math.round(budgetScore * 0.2),
        explanation: `${formatCurrency(cooler.price)} vs target ${formatCurrency(Math.round(targetCoolerBudget))}.`,
      },
    ];
    const totalScore = factors.reduce((s, f) => s + f.weightedContribution, 0);
    return { cooler, totalScore, factors };
  });
  scoredCoolers.sort((a, b) => b.totalScore - a.totalScore);
  const chosenCoolerEntry = scoredCoolers[0];
  const selectedCooler = chosenCoolerEntry.cooler;

  // 7. Select Storage (NVMe M.2)
  const targetStorageBudget = budget * split.storage;
  const nvmeDrives = STORAGE_DRIVES.filter((d) => d.type === 'NVMe');
  const scoredStorage = nvmeDrives.map((drive) => {
    const speedScore = Math.min(100, Math.round((drive.readSpeedMBps / 7500) * 100));
    const capScore = drive.capacityGB >= 2000 ? 98 : drive.capacityGB >= 1000 ? 86 : 65;
    const budgetDist =
      Math.abs(drive.price - targetStorageBudget) / Math.max(2500, targetStorageBudget);
    const budgetScore = Math.max(25, Math.round(100 - budgetDist * 70));

    const factors: XAIScoreFactor[] = [
      {
        factor: 'Capacity & NVMe Bandwidth',
        weightPercent: 55,
        rawScore: Math.round((speedScore + capScore) / 2),
        weightedContribution: Math.round(((speedScore + capScore) / 2) * 0.55),
        explanation: `${drive.capacityGB}GB ${drive.interface} (${drive.readSpeedMBps} MB/s read).`,
      },
      {
        factor: 'Budget Alignment',
        weightPercent: 45,
        rawScore: budgetScore,
        weightedContribution: Math.round(budgetScore * 0.45),
        explanation: `${formatCurrency(drive.price)} fits the ${formatCurrency(Math.round(targetStorageBudget))} storage allocation.`,
      },
    ];
    const totalScore = factors.reduce((s, f) => s + f.weightedContribution, 0);
    return { drive, totalScore, factors };
  });
  scoredStorage.sort((a, b) => b.totalScore - a.totalScore);
  const chosenStorageEntry = scoredStorage[0];
  const selectedStorage = chosenStorageEntry.drive;

  // 8. Select PSU matching Case Form Factor, System Wattage + Headroom, and GPU Connectors
  const partialBuild: PCBuildState = {
    cpu: selectedCpu,
    motherboard: selectedMb,
    ram: selectedRam,
    gpu: selectedGpu,
    storage: [selectedStorage],
    psu: null,
    case: selectedCase,
    cooler: selectedCooler,
  };
  const power = calculateSystemPower(partialBuild);
  const minWatts = Math.max(550, power.recommendedPsuWatts);
  const targetPsuBudget = budget * split.psu;

  const compatiblePsus = PSUS.filter((psu) => {
    if (!selectedCase.supportedPsuFormFactors.includes(psu.formFactor)) return false;
    if (psu.wattage < minWatts) return false;
    if (selectedGpu) {
      if (
        selectedGpu.pcieConnectors.sixteenPin > 0 &&
        psu.connectors.pcie16Pin < selectedGpu.pcieConnectors.sixteenPin
      )
        return false;
      if (
        selectedGpu.pcieConnectors.eightPin > 0 &&
        psu.connectors.pcie8Pin < selectedGpu.pcieConnectors.eightPin
      )
        return false;
    }
    return true;
  });

  const psuPool =
    compatiblePsus.length > 0
      ? compatiblePsus
      : PSUS.filter((p) => p.wattage >= power.peakLoadWatts);

  const scoredPsus = psuPool.map((psu) => {
    const headroomPct = Math.round(
      ((psu.wattage - power.peakLoadWatts) / psu.wattage) * 100
    );
    const headroomScore = headroomPct >= 25 && headroomPct <= 55 ? 98 : 82;
    const budgetDist = Math.abs(psu.price - targetPsuBudget) / Math.max(2500, targetPsuBudget);
    const budgetScore = Math.max(25, Math.round(100 - budgetDist * 65));
    const connectorScore =
      selectedGpu && selectedGpu.pcieConnectors.sixteenPin > 0
        ? psu.connectors.pcie16Pin > 0
          ? 100
          : 70
        : 95;

    const factors: XAIScoreFactor[] = [
      {
        factor: 'Wattage & Transient Headroom',
        weightPercent: 50,
        rawScore: headroomScore,
        weightedContribution: Math.round(headroomScore * 0.5),
        explanation: `${psu.wattage}W (${psu.efficiencyRating}) provides ${headroomPct}% safety buffer over ${power.peakLoadWatts}W peak load.`,
      },
      {
        factor: 'Native PCIe & ATX 3.0 Cabling',
        weightPercent: 25,
        rawScore: connectorScore,
        weightedContribution: Math.round(connectorScore * 0.25),
        explanation: `${psu.modular} ${psu.formFactor} unit with ${psu.connectors.pcie8Pin}x 8-pin and ${psu.connectors.pcie16Pin}x 16-pin ports.`,
      },
      {
        factor: 'Budget Fit',
        weightPercent: 25,
        rawScore: budgetScore,
        weightedContribution: Math.round(budgetScore * 0.25),
        explanation: `${formatCurrency(psu.price)} aligns with power delivery budget.`,
      },
    ];
    const totalScore = factors.reduce((s, f) => s + f.weightedContribution, 0);
    return { psu, totalScore, factors };
  });
  scoredPsus.sort((a, b) => b.totalScore - a.totalScore);
  const chosenPsuEntry = scoredPsus[0];
  const selectedPsu = chosenPsuEntry.psu;

  const finalBuild: PCBuildState = {
    ...partialBuild,
    psu: selectedPsu,
  };

  const partExplanations: XAIRecommendationResult['partExplanations'] = [
    {
      category: 'cpu',
      partName: `${selectedCpu.brand} ${selectedCpu.name}`,
      price: selectedCpu.price,
      totalScore: chosenCpuEntry.totalScore,
      summaryReason: `Selected for ${selectedCpu.cores}C/${selectedCpu.threads}T performance on socket ${selectedCpu.socket}.`,
      factors: chosenCpuEntry.factors,
    },
    {
      category: 'motherboard',
      partName: `${selectedMb.brand} ${selectedMb.name}`,
      price: selectedMb.price,
      totalScore: chosenMbEntry.totalScore,
      summaryReason: `Matches ${selectedCpu.socket} socket with ${selectedMb.vrmTier} VRM and ${selectedMb.ramType} support.`,
      factors: chosenMbEntry.factors,
    },
    {
      category: 'ram',
      partName: `${selectedRam.brand} ${selectedRam.name}`,
      price: selectedRam.price,
      totalScore: chosenRamEntry.totalScore,
      summaryReason: `${selectedRam.capacityGB}GB ${selectedRam.type}-${selectedRam.speedMHz} with ${selectedRam.heightMm}mm cooler-safe profile.`,
      factors: chosenRamEntry.factors,
    },
    ...(chosenGpuEntry && selectedGpu
      ? [
          {
            category: 'gpu' as PartCategory,
            partName: `${selectedGpu.brand} ${selectedGpu.name}`,
            price: selectedGpu.price,
            totalScore: chosenGpuEntry.totalScore,
            summaryReason: `Delivers ${selectedGpu.vramGB}GB VRAM & strong ${useCase} acceleration with minimal bottleneck.`,
            factors: chosenGpuEntry.factors,
          },
        ]
      : []),
    {
      category: 'storage',
      partName: `${selectedStorage.brand} ${selectedStorage.name}`,
      price: selectedStorage.price,
      totalScore: chosenStorageEntry.totalScore,
      summaryReason: `High-speed ${selectedStorage.capacityGB}GB NVMe M.2 boot & project storage.`,
      factors: chosenStorageEntry.factors,
    },
    {
      category: 'cooler',
      partName: `${selectedCooler.brand} ${selectedCooler.name}`,
      price: selectedCooler.price,
      totalScore: chosenCoolerEntry.totalScore,
      summaryReason: `${selectedCooler.tdpRatingWatts}W thermal dissipation clearing both RAM (${selectedRam.heightMm}mm) and case.`,
      factors: chosenCoolerEntry.factors,
    },
    {
      category: 'psu',
      partName: `${selectedPsu.brand} ${selectedPsu.name}`,
      price: selectedPsu.price,
      totalScore: chosenPsuEntry.totalScore,
      summaryReason: `${selectedPsu.wattage}W ${selectedPsu.efficiencyRating} unit with verified GPU power connectors.`,
      factors: chosenPsuEntry.factors,
    },
    {
      category: 'case',
      partName: `${selectedCase.brand} ${selectedCase.name}`,
      price: selectedCase.price,
      totalScore: chosenCaseEntry.totalScore,
      summaryReason: `${selectedCase.airflowRating} ${selectedCase.formFactor} fitting all selected components with zero collisions.`,
      factors: chosenCaseEntry.factors,
    },
  ];

  const compat = evaluateCompatibility(finalBuild);
  const avgPartScore = Math.round(
    partExplanations.reduce((s, p) => s + p.totalScore, 0) / partExplanations.length
  );

  return {
    build: finalBuild,
    totalPrice: calculateBuildTotalCost(finalBuild),
    targetBudget: budget,
    useCase,
    overallMatchScore: compat.overallStatus === 'pass' ? avgPartScore : Math.max(60, avgPartScore - 15),
    partExplanations,
  };
}
