/**
 * Core Domain Types for Digital PC Builder: Virtual Compatibility & Simulation System
 * College of Computing and Information Sciences - Mariano Marcos State University (MMSU)
 */

export type PartCategory =
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooler';

export type CPUSocket = 'AM4' | 'AM5' | 'LGA1700';
export type RAMType = 'DDR4' | 'DDR5';
export type FormFactor = 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';
export type PSUFormFactor = 'ATX' | 'SFX';

export interface BaseComponent {
  id: string;
  category: PartCategory;
  brand: string;
  name: string;
  price: number; // In configured currency (default PHP)
  tier: 'Budget' | 'Mid-Range' | 'High-End' | 'Enthusiast';
  summary: string;
}

export interface CPU extends BaseComponent {
  category: 'cpu';
  socket: CPUSocket;
  cores: number;
  threads: number;
  baseClockGHz: number;
  boostClockGHz: number;
  tdpWatts: number;
  integratedGraphics: boolean;
  igpuName?: string;
  supportedMemoryTypes: RAMType[];
  memoryChannels: number;
  benchmarkScore: number; // Combined synthetic index (e.g., 10000 - 45000)
  gamingScore: number; // 1-100 normalized gaming capability
  productivityScore: number; // 1-100 normalized workstation capability
}

export interface Motherboard extends BaseComponent {
  category: 'motherboard';
  socket: CPUSocket;
  chipset: string;
  formFactor: FormFactor;
  ramType: RAMType;
  ramSlots: number;
  maxRamGB: number;
  pcieVersion: '3.0' | '4.0' | '5.0';
  m2Slots: number;
  sataPorts: number;
  wifi: boolean;
  vrmTier: 'Entry' | 'Solid' | 'Robust' | 'Flagship';
}

export interface RAM extends BaseComponent {
  category: 'ram';
  type: RAMType;
  capacityGB: number; // Total kit capacity
  speedMHz: number;
  modules: number; // e.g., 2 for 2x16GB
  casLatency: number;
  heightMm: number; // Physical height in mm (crucial for air cooler clearance)
  rgb: boolean;
}

export interface GPU extends BaseComponent {
  category: 'gpu';
  chipset: string;
  vramGB: number;
  lengthMm: number;
  tdpWatts: number;
  recommendedPsuWatts: number;
  pcieConnectors: {
    eightPin: number; // Standard 8-pin PCIe count
    sixteenPin: number; // 12VHPWR / 12V-2x6 count
  };
  slotWidth: number; // e.g. 2, 2.5, 3, 3.5
  benchmarkScore: number; // Combined synthetic graphic score (e.g., 5000 - 42000)
  gamingScore1080p: number; // 1-100
  gamingScore1440p: number; // 1-100
  gamingScore4k: number; // 1-100
}

export interface Storage extends BaseComponent {
  category: 'storage';
  type: 'NVMe' | 'SATA SSD' | 'HDD';
  capacityGB: number;
  interface: string; // e.g., PCIe 4.0 x4, SATA III
  readSpeedMBps: number;
  writeSpeedMBps: number;
  formFactor: 'M.2 2280' | '2.5-inch' | '3.5-inch';
}

export interface PSU extends BaseComponent {
  category: 'psu';
  wattage: number;
  efficiencyRating: '80+ Bronze' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
  formFactor: PSUFormFactor;
  modular: 'Non-Modular' | 'Semi-Modular' | 'Fully Modular';
  connectors: {
    pcie8Pin: number;
    pcie16Pin: number; // Native 12VHPWR
    sata: number;
    eps8Pin: number;
  };
}

export interface PCCase extends BaseComponent {
  category: 'case';
  formFactor: 'Full Tower' | 'Mid Tower' | 'Mini Tower' | 'Small Form Factor';
  supportedMotherboards: FormFactor[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  supportedPsuFormFactors: PSUFormFactor[];
  maxRadiatorMm: 120 | 240 | 280 | 360;
  driveBays25: number;
  driveBays35: number;
  includedFans: number;
  airflowRating: 'Standard' | 'High Airflow' | 'Mesh Performance';
}

export interface CPUCooler extends BaseComponent {
  category: 'cooler';
  type: 'Air' | 'AIO';
  supportedSockets: CPUSocket[];
  heightMm: number; // Air cooler tower height (or pump block height for AIO)
  radiatorSizeMm?: 120 | 240 | 280 | 360; // Only for AIO
  tdpRatingWatts: number;
  ramClearanceMm: number; // Max RAM height allowed before overhang collision
  noiseLevelDb: number;
}

export type AnyComponent =
  | CPU
  | Motherboard
  | RAM
  | GPU
  | Storage
  | PSU
  | PCCase
  | CPUCooler;

export interface PCBuildState {
  cpu: CPU | null;
  motherboard: Motherboard | null;
  ram: RAM | null;
  gpu: GPU | null;
  storage: Storage[]; // Supports multiple drives to test M.2 / SATA limits
  psu: PSU | null;
  case: PCCase | null;
  cooler: CPUCooler | null;
}

export type CompatibilityStatus = 'pass' | 'warn' | 'fail';

export interface CompatibilityIssue {
  id: string;
  ruleCategory:
    | 'Socket & Platform'
    | 'Memory (RAM)'
    | 'Physical Clearance'
    | 'Thermal & Cooling'
    | 'Power Delivery (PSU)'
    | 'Storage & Expansion'
    | 'System Completeness';
  status: CompatibilityStatus;
  title: string;
  explanation: string;
  recommendation?: string;
  affectedCategories: PartCategory[];
}

export interface CompatibilityReport {
  overallStatus: CompatibilityStatus;
  score: number; // 0 to 100
  estimatedWattage: {
    idleWatts: number;
    typicalLoadWatts: number;
    peakLoadWatts: number;
    recommendedPsuWatts: number;
    psuHeadroomPercent: number | null;
  };
  results: CompatibilityIssue[];
  passedCount: number;
  warningCount: number;
  failureCount: number;
}

export type UseCaseProfile =
  | 'gaming'
  | 'workstation'
  | 'academic'
  | 'streaming';

export interface XAIScoreFactor {
  factor: string;
  weightPercent: number;
  rawScore: number; // 0-100
  weightedContribution: number;
  explanation: string;
}

export interface XAIRecommendationResult {
  build: PCBuildState;
  totalPrice: number;
  targetBudget: number;
  useCase: UseCaseProfile;
  overallMatchScore: number;
  partExplanations: {
    category: PartCategory;
    partName: string;
    price: number;
    totalScore: number;
    summaryReason: string;
    factors: XAIScoreFactor[];
  }[];
}

export interface SavedBuild {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  build: PCBuildState;
  isPreset?: boolean;
  badge?: string;
}
