import { PartCategory, UseCaseProfile } from '../types/pc';

export const CURRENCY_CONFIG = {
  code: 'PHP',
  symbol: '₱',
  locale: 'en-PH',
};

export function formatCurrency(amount: number): string {
  return `${CURRENCY_CONFIG.symbol}${amount.toLocaleString(CURRENCY_CONFIG.locale)}`;
}

export const ACADEMIC_DISCLAIMER =
  'ACADEMIC DEMONSTRATION DISCLAIMER: Component prices (in PHP), synthetic benchmark scores, and physical dimensions are curated sample datasets for the MMSU CCIS Capstone Project ("Digital PC Builder: Virtual Compatibility & Simulation System"). Verify manufacturer datasheets and current retail pricing prior to physical procurement.';

export const CATEGORY_METADATA: {
  id: PartCategory;
  label: string;
  shortLabel: string;
  description: string;
  required: boolean;
}[] = [
  {
    id: 'cpu',
    label: 'Processor (CPU)',
    shortLabel: 'CPU',
    description: 'The primary computation engine determining socket platform, core count, and instruction throughput.',
    required: true,
  },
  {
    id: 'motherboard',
    label: 'Motherboard',
    shortLabel: 'Motherboard',
    description: 'Main circuit board connecting CPU, RAM, PCIe graphics, and storage interfaces.',
    required: true,
  },
  {
    id: 'cooler',
    label: 'CPU Cooler',
    shortLabel: 'Cooler',
    description: 'Dissipates thermal output (TDP) from the processor via air heatsink tower or liquid AIO radiator.',
    required: true,
  },
  {
    id: 'ram',
    label: 'Memory (RAM)',
    shortLabel: 'RAM',
    description: 'High-speed volatile system memory (DDR4 or DDR5) for active workloads and multitasking.',
    required: true,
  },
  {
    id: 'gpu',
    label: 'Graphics Card (GPU)',
    shortLabel: 'GPU',
    description: 'Dedicated 3D rendering, gaming, and AI/compute accelerator (optional if CPU has integrated graphics).',
    required: false,
  },
  {
    id: 'storage',
    label: 'Storage Drive(s)',
    shortLabel: 'Storage',
    description: 'Non-volatile NVMe M.2 SSDs, SATA SSDs, or HDDs for operating system, applications, and datasets.',
    required: true,
  },
  {
    id: 'psu',
    label: 'Power Supply (PSU)',
    shortLabel: 'PSU',
    description: 'Converts AC wall power to regulated DC rails with sufficient wattage headroom and PCIe cables.',
    required: true,
  },
  {
    id: 'case',
    label: 'Chassis (Case)',
    shortLabel: 'Case',
    description: 'Physical enclosure dictating motherboard form factor support, GPU length, and cooler height limits.',
    required: true,
  },
];

export const HARDWARE_GLOSSARY: Record<string, { title: string; definition: string; tip: string }> = {
  socket: {
    title: 'CPU Socket (AM4, AM5, LGA1700)',
    definition: 'The physical pin array on the motherboard where the processor sits. A CPU and motherboard MUST have the exact same socket.',
    tip: 'AMD Ryzen 5000 uses AM4; Ryzen 7000/9000 uses AM5; Intel 12th–14th Gen uses LGA1700.',
  },
  tdp: {
    title: 'TDP (Thermal Design Power)',
    definition: 'Measured in Watts (W), TDP indicates the maximum heat a CPU or GPU generates under nominal load that the cooling system must dissipate.',
    tip: 'Always pick a CPU Cooler with a TDP rating at least 20–30% higher than your CPU TDP to avoid thermal throttling.',
  },
  ramClearance: {
    title: 'RAM Height vs. Cooler Clearance',
    definition: 'Large dual-tower air coolers often overhang the RAM slots. Tall RGB RAM modules (>42mm) can physically collide with the front cooler fan.',
    tip: 'Use low-profile RAM (≤35mm) with large air coolers, or choose an AIO liquid cooler which has unrestricted RAM clearance.',
  },
  psuHeadroom: {
    title: 'PSU Wattage Headroom & Transient Spikes',
    definition: 'Modern GPUs experience microsecond power spikes up to 1.5x–2x their rated TDP. Running a PSU near 95% capacity risks sudden shutdowns.',
    tip: 'Aim for 25%–35% wattage headroom above estimated peak system load for optimal 80+ efficiency and transient safety.',
  },
  pcie16Pin: {
    title: '12VHPWR / 16-Pin PCIe Connector',
    definition: 'High-power PCIe 5.0 connector capable of delivering up to 600W over a single cable, used by modern NVIDIA RTX 40-series GPUs.',
    tip: 'ATX 3.0 PSUs include a native 16-pin cable; older PSUs require multiple 8-pin connectors with an adapter.',
  },
  bottleneck: {
    title: 'System Performance Bottleneck',
    definition: 'Occurs when one component (CPU or GPU) reaches 100% utilization while the other waits idly, limiting maximum frame rate or render speed.',
    tip: 'At 1080p resolution, CPUs bottleneck more easily. At 1440p and 4K, the workload shifts heavily onto the GPU.',
  },
  formFactor: {
    title: 'Form Factor (ATX, Micro-ATX, Mini-ITX)',
    definition: 'Standardized physical dimensions and screw mounting layout for motherboards, cases, and power supplies.',
    tip: 'An ATX case typically fits ATX, Micro-ATX, and Mini-ITX boards, whereas a Mini-ITX case only fits Mini-ITX boards.',
  },
};

export const USE_CASE_PROFILES: Record<
  UseCaseProfile,
  {
    name: string;
    description: string;
    budgetSplit: Record<PartCategory, number>;
  }
> = {
  gaming: {
    name: 'Gaming & Esports',
    description: 'Prioritizes GPU rendering power (40%+ of budget) and high single-core CPU gaming performance.',
    budgetSplit: {
      gpu: 0.40,
      cpu: 0.21,
      motherboard: 0.11,
      ram: 0.08,
      storage: 0.06,
      psu: 0.06,
      case: 0.04,
      cooler: 0.04,
    },
  },
  workstation: {
    name: '3D Rendering, CAD & Data Science',
    description: 'Balances high multi-core CPU throughput, high-capacity RAM, fast NVMe storage, and GPU compute.',
    budgetSplit: {
      cpu: 0.28,
      gpu: 0.30,
      ram: 0.12,
      motherboard: 0.11,
      storage: 0.07,
      psu: 0.05,
      cooler: 0.04,
      case: 0.03,
    },
  },
  academic: {
    name: 'Academic, Programming & Office',
    description: 'Maximizes value, snappy multitasking CPU/RAM, reliable NVMe storage, and quiet thermal efficiency.',
    budgetSplit: {
      cpu: 0.30,
      motherboard: 0.16,
      ram: 0.14,
      storage: 0.13,
      gpu: 0.09,
      psu: 0.08,
      case: 0.05,
      cooler: 0.05,
    },
  },
  streaming: {
    name: 'Content Creation & Live Streaming',
    description: 'Combines high-thread CPU encoding resilience with strong GPU hardware encoders and 32GB+ RAM.',
    budgetSplit: {
      gpu: 0.35,
      cpu: 0.25,
      ram: 0.10,
      motherboard: 0.11,
      storage: 0.07,
      psu: 0.05,
      cooler: 0.04,
      case: 0.03,
    },
  },
};
