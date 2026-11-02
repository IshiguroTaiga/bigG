import { PCBuildState } from '../types/pc';
import { calculateSystemPower } from './compatibilityEngine';

export interface GameFPSBenchmark {
  game: string;
  genre: string;
  fps1080p: number;
  fps1440p: number;
  fps4k: number;
  onePercentLow1080p: number;
}

export interface BottleneckAnalysis {
  bottleneckPercentage: number; // 0 to 100
  limitingComponent: 'CPU' | 'GPU' | 'Balanced' | 'No GPU (iGPU Bound)';
  severity: 'Optimal (Balanced)' | 'Mild Imbalance' | 'Moderate Bottleneck' | 'Severe Bottleneck';
  explanation: string;
  upgradeAdvice: string;
  resolutionBalance: {
    res1080p: { cpuShare: number; gpuShare: number };
    res1440p: { cpuShare: number; gpuShare: number };
    res4k: { cpuShare: number; gpuShare: number };
  };
}

export interface PSUEfficiencyPoint {
  loadPercent: number;
  systemWatts: number;
  efficiencyPercent: number;
  wallDrawWatts: number;
  isCurrentOperatingPoint?: boolean;
}

export interface PerformanceSimulationReport {
  ready: boolean;
  missingReason?: string;
  overallGamingIndex: number; // 0 - 100
  overallWorkstationIndex: number; // 0 - 100
  bottleneck: BottleneckAnalysis;
  fpsBenchmarks: GameFPSBenchmark[];
  psuCurve: PSUEfficiencyPoint[];
  thermalAcoustics: {
    estimatedCpuLoadTempC: number;
    estimatedGpuLoadTempC: number;
    estimatedNoiseDb: number;
    thermalRating: 'Cool & Quiet' | 'Nominal' | 'Warm / Audible' | 'Thermal Throttling Risk';
  };
}

/**
 * Simulates gaming FPS, workstation scores, CPU/GPU bottleneck attribution,
 * thermal/acoustic output, and PSU efficiency curve for a given PC build.
 */
export function simulatePerformance(build: PCBuildState): PerformanceSimulationReport {
  const { cpu, gpu, ram, storage, psu, cooler, case: pcCase } = build;

  if (!cpu) {
    return {
      ready: false,
      missingReason: 'Select at least a Processor (CPU) to run the performance and bottleneck simulator.',
      overallGamingIndex: 0,
      overallWorkstationIndex: 0,
      bottleneck: {
        bottleneckPercentage: 0,
        limitingComponent: 'Balanced',
        severity: 'Optimal (Balanced)',
        explanation: 'No CPU selected.',
        upgradeAdvice: 'Select a CPU in the Builder tab.',
        resolutionBalance: {
          res1080p: { cpuShare: 50, gpuShare: 50 },
          res1440p: { cpuShare: 40, gpuShare: 60 },
          res4k: { cpuShare: 25, gpuShare: 75 },
        },
      },
      fpsBenchmarks: [],
      psuCurve: [],
      thermalAcoustics: {
        estimatedCpuLoadTempC: 35,
        estimatedGpuLoadTempC: 35,
        estimatedNoiseDb: 25,
        thermalRating: 'Nominal',
      },
    };
  }

  // Memory speed & capacity multiplier (1.00 baseline, up to 1.07 for fast 32GB+ DDR5)
  const ramMultiplier = ram
    ? (ram.type === 'DDR5' ? 1.04 : 1.0) * (ram.capacityGB >= 32 ? 1.02 : 0.98)
    : 0.92;

  // Storage speed multiplier for workstation tasks
  const hasNvme = storage.some((s) => s.type === 'NVMe');
  const storageMultiplier = hasNvme ? 1.04 : 0.94;

  // Effective GPU gaming scores (if no discrete GPU, use iGPU baseline if available)
  const gpu1080 = gpu ? gpu.gamingScore1080p : cpu.integratedGraphics ? 22 : 0;
  const gpu1440 = gpu ? gpu.gamingScore1440p : cpu.integratedGraphics ? 12 : 0;
  const gpu4k = gpu ? gpu.gamingScore4k : cpu.integratedGraphics ? 5 : 0;

  const cpuGaming = cpu.gamingScore * ramMultiplier;

  // Bottleneck calculation at 1440p reference
  let bottleneck: BottleneckAnalysis;
  if (!gpu) {
    bottleneck = {
      bottleneckPercentage: cpu.integratedGraphics ? 68 : 100,
      limitingComponent: 'No GPU (iGPU Bound)',
      severity: 'Severe Bottleneck',
      explanation: cpu.integratedGraphics
        ? `${cpu.name} is relying on onboard ${cpu.igpuName || 'integrated graphics'}. While great for coding, office work, and light esports, 3D rendering is heavily GPU-bound.`
        : `${cpu.name} has no integrated graphics and no dedicated GPU is installed.`,
      upgradeAdvice: 'Add a dedicated GPU (such as RX 6600, RTX 4060, or RX 7800 XT) to unlock 3D gaming and GPU acceleration.',
      resolutionBalance: {
        res1080p: { cpuShare: 15, gpuShare: 85 },
        res1440p: { cpuShare: 10, gpuShare: 90 },
        res4k: { cpuShare: 5, gpuShare: 95 },
      },
    };
  } else {
    // Compare normalized CPU gaming capability against GPU 1440p capability
    const diff = cpuGaming - gpu1440;
    const rawImbalance = Math.min(65, Math.round(Math.abs(diff) * 0.85));

    let limitingComponent: BottleneckAnalysis['limitingComponent'] = 'Balanced';
    let severity: BottleneckAnalysis['severity'] = 'Optimal (Balanced)';
    let explanation = '';
    let upgradeAdvice = '';

    if (rawImbalance <= 10) {
      limitingComponent = 'Balanced';
      severity = 'Optimal (Balanced)';
      explanation = `${cpu.name} (Gaming Index ${cpu.gamingScore}) and ${gpu.name} (1440p Index ${gpu1440}) are well-matched, allowing the GPU to reach 97–100% utilization without CPU frame-pacing stutter.`;
      upgradeAdvice = 'No immediate hardware changes needed—this CPU and GPU pairing is in the sweet spot.';
    } else if (diff < -10) {
      // CPU is weaker than GPU
      limitingComponent = 'CPU';
      severity = rawImbalance > 26 ? 'Severe Bottleneck' : rawImbalance > 16 ? 'Moderate Bottleneck' : 'Mild Imbalance';
      explanation = `${gpu.name} is significantly faster than ${cpu.name} can feed draw calls at 1080p/1440p, leaving roughly ${rawImbalance}% of GPU rendering potential unused in CPU-heavy games.`;
      upgradeAdvice = `Upgrade the CPU (e.g., Ryzen 7 5700X3D / 7800X3D or Core i5-13600K) or play at higher 1440p/4K resolutions to shift load onto ${gpu.name}.`;
    } else {
      // GPU is weaker than CPU
      limitingComponent = 'GPU';
      severity = rawImbalance > 28 ? 'Severe Bottleneck' : rawImbalance > 17 ? 'Moderate Bottleneck' : 'Mild Imbalance';
      explanation = `${cpu.name} has ample headroom while ${gpu.name} runs at 100% capacity. This is safe for workstation/coding builds, but gaming FPS is strictly limited by the GPU (${rawImbalance}% imbalance).`;
      upgradeAdvice = `If gaming is your primary goal, allocate more budget toward a higher-tier GPU (e.g., RTX 4070 SUPER or RX 7800 XT).`;
    }

    bottleneck = {
      bottleneckPercentage: rawImbalance,
      limitingComponent,
      severity,
      explanation,
      upgradeAdvice,
      resolutionBalance: {
        res1080p: {
          cpuShare: Math.min(75, Math.max(25, Math.round(50 - diff * 0.45))),
          gpuShare: Math.min(75, Math.max(25, Math.round(50 + diff * 0.45))),
        },
        res1440p: {
          cpuShare: Math.min(70, Math.max(20, Math.round(38 - diff * 0.4))),
          gpuShare: Math.min(80, Math.max(30, Math.round(62 + diff * 0.4))),
        },
        res4k: {
          cpuShare: Math.min(55, Math.max(12, Math.round(22 - diff * 0.3))),
          gpuShare: Math.min(88, Math.max(45, Math.round(78 + diff * 0.3))),
        },
      },
    };
  }

  // Calculate synthetic FPS across 4 representative titles
  const computeFps = (baseMultiplier: number, cpuWeight: number, resScore: number) => {
    if (resScore === 0) return 0;
    const harmonic =
      1 /
      (cpuWeight / Math.max(10, cpuGaming) +
        (1 - cpuWeight) / Math.max(5, resScore));
    return Math.round(harmonic * baseMultiplier);
  };

  const fpsBenchmarks: GameFPSBenchmark[] = [
    {
      game: 'Valorant / CS2 (Esports)',
      genre: 'Competitive Tactical Shooter',
      fps1080p: computeFps(4.3, 0.55, gpu1080),
      fps1440p: computeFps(3.4, 0.42, gpu1440),
      fps4k: computeFps(2.2, 0.25, gpu4k),
      onePercentLow1080p: Math.round(computeFps(4.3, 0.55, gpu1080) * 0.74),
    },
    {
      game: 'Apex Legends / Call of Duty',
      genre: 'Fast-Paced Battle Royale',
      fps1080p: computeFps(2.25, 0.38, gpu1080),
      fps1440p: computeFps(1.78, 0.28, gpu1440),
      fps4k: computeFps(1.18, 0.18, gpu4k),
      onePercentLow1080p: Math.round(computeFps(2.25, 0.38, gpu1080) * 0.76),
    },
    {
      game: 'Baldur’s Gate 3 / GTA V Enhanced',
      genre: 'CPU + GPU Open World RPG',
      fps1080p: computeFps(1.65, 0.42, gpu1080),
      fps1440p: computeFps(1.35, 0.30, gpu1440),
      fps4k: computeFps(0.92, 0.20, gpu4k),
      onePercentLow1080p: Math.round(computeFps(1.65, 0.42, gpu1080) * 0.72),
    },
    {
      game: 'Cyberpunk 2077 / Black Myth: Wukong',
      genre: 'Heavy AAA Ray-Tracing / UE5',
      fps1080p: computeFps(1.15, 0.25, gpu1080),
      fps1440p: computeFps(0.92, 0.18, gpu1440),
      fps4k: computeFps(0.64, 0.12, gpu4k),
      onePercentLow1080p: Math.round(computeFps(1.15, 0.25, gpu1080) * 0.78),
    },
  ];

  const overallGamingIndex =
    gpu1080 === 0
      ? 0
      : Math.min(100, Math.round((cpuGaming * 0.32 + gpu1080 * 0.34 + gpu1440 * 0.34)));

  const gpuComputeScore = gpu ? Math.min(100, Math.round(gpu.benchmarkScore / 450)) : 20;
  const overallWorkstationIndex = Math.min(
    100,
    Math.round(
      (cpu.productivityScore * 0.55 + gpuComputeScore * 0.3 + (ram ? Math.min(100, ram.capacityGB * 1.5) : 30) * 0.15) *
        storageMultiplier
    )
  );

  // Thermal & Acoustic simulation
  const coolerTdp = cooler ? cooler.tdpRatingWatts : 95;
  const thermalRatio = cpu.tdpWatts / coolerTdp;
  const caseAirflowBonus =
    pcCase?.airflowRating === 'Mesh Performance'
      ? -4
      : pcCase?.airflowRating === 'High Airflow'
      ? -2
      : 3;

  const estimatedCpuLoadTempC = Math.min(
    100,
    Math.max(52, Math.round(54 + thermalRatio * 34 + caseAirflowBonus))
  );
  const estimatedGpuLoadTempC = gpu
    ? Math.min(88, Math.max(55, Math.round(62 + (gpu.tdpWatts / 350) * 14 + caseAirflowBonus)))
    : 40;
  const estimatedNoiseDb = Math.round(
    (cooler ? cooler.noiseLevelDb : 31) + (thermalRatio > 0.85 ? 5 : 0) + (gpu && gpu.tdpWatts > 260 ? 3 : 0)
  );

  let thermalRating: PerformanceSimulationReport['thermalAcoustics']['thermalRating'] = 'Nominal';
  if (estimatedCpuLoadTempC >= 90) {
    thermalRating = 'Thermal Throttling Risk';
  } else if (estimatedCpuLoadTempC >= 80 || estimatedNoiseDb >= 35) {
    thermalRating = 'Warm / Audible';
  } else if (estimatedCpuLoadTempC <= 70 && estimatedNoiseDb <= 29) {
    thermalRating = 'Cool & Quiet';
  }

  // PSU Efficiency Curve
  const power = calculateSystemPower(build);
  const psuWattage = psu ? psu.wattage : Math.max(550, power.recommendedPsuWatts || 650);
  const baseEff =
    psu?.efficiencyRating === '80+ Titanium'
      ? 94
      : psu?.efficiencyRating === '80+ Platinum'
      ? 92
      : psu?.efficiencyRating === '80+ Gold'
      ? 90
      : 85;

  const loadPoints = [10, 20, 35, 50, 65, 80, 90, 100];
  const currentLoadPct = Math.min(100, Math.round((power.typicalLoadWatts / psuWattage) * 100));

  const psuCurve: PSUEfficiencyPoint[] = loadPoints.map((pct) => {
    // 80+ efficiency peaks around 50% load
    const distFromPeak = Math.abs(pct - 50);
    const eff = Number((baseEff - (distFromPeak * distFromPeak) / 420).toFixed(1));
    const sysWatts = Math.round((psuWattage * pct) / 100);
    const wallDrawWatts = Math.round(sysWatts / (eff / 100));
    return {
      loadPercent: pct,
      systemWatts: sysWatts,
      efficiencyPercent: eff,
      wallDrawWatts,
      isCurrentOperatingPoint: Math.abs(pct - currentLoadPct) <= 8,
    };
  });

  return {
    ready: true,
    overallGamingIndex,
    overallWorkstationIndex,
    bottleneck,
    fpsBenchmarks,
    psuCurve,
    thermalAcoustics: {
      estimatedCpuLoadTempC,
      estimatedGpuLoadTempC,
      estimatedNoiseDb,
      thermalRating,
    },
  };
}
