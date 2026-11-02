import { SavedBuild } from '../types/pc';
import { CPUS } from './cpus';
import { MOTHERBOARDS } from './motherboards';
import { RAM_KITS } from './ram';
import { GPUS } from './gpus';
import { STORAGE_DRIVES } from './storage';
import { PSUS } from './psus';
import { CASES } from './cases';
import { COOLERS } from './coolers';

const findById = <T extends { id: string }>(arr: T[], id: string): T => {
  const found = arr.find((item) => item.id === id);
  if (!found) throw new Error(`Preset reference error: ${id}`);
  return found;
};

export const PRESET_BUILDS: SavedBuild[] = [
  {
    id: 'preset-budget-academic',
    name: 'MMSU CCIS Academic & Coding Starter',
    description:
      'Ultra-reliable, quiet AM4 APU system with integrated Radeon Vega 7 graphics, 16GB DDR4, and 1TB NVMe SSD. Ideal for programming, web dev, and database labs.',
    createdAt: '2026-10-15T08:00:00Z',
    isPreset: true,
    badge: '₱23.1K • Zero Conflicts',
    build: {
      cpu: findById(CPUS, 'cpu-r5-5600g'),
      motherboard: findById(MOTHERBOARDS, 'mb-b550m-pro-vdh'),
      ram: findById(RAM_KITS, 'ram-lpx-16-d4-3200'),
      gpu: null,
      storage: [findById(STORAGE_DRIVES, 'sto-nv2-1tb')],
      psu: findById(PSUS, 'psu-mag-a550bn'),
      case: findById(CASES, 'case-tecware-flatline'),
      cooler: findById(COOLERS, 'cool-se-214-xt'),
    },
  },
  {
    id: 'preset-1080p-esports',
    name: '1080p High-Refresh Esports Champion',
    description:
      'Balanced Ryzen 5 5600 + Radeon RX 6600 8GB rig delivering 250+ FPS in Valorant/CS2 and smooth 1080p Ultra in modern AAA titles.',
    createdAt: '2026-10-16T08:00:00Z',
    isPreset: true,
    badge: '₱40.6K • Sweet Spot',
    build: {
      cpu: findById(CPUS, 'cpu-r5-5600'),
      motherboard: findById(MOTHERBOARDS, 'mb-b550m-pro-vdh'),
      ram: findById(RAM_KITS, 'ram-vulcan-32-d4-3200'),
      gpu: findById(GPUS, 'gpu-rx-6600'),
      storage: [findById(STORAGE_DRIVES, 'sto-sn580-1tb')],
      psu: findById(PSUS, 'psu-mag-a650bn'),
      case: findById(CASES, 'case-montech-air100'),
      cooler: findById(COOLERS, 'cool-ak400'),
    },
  },
  {
    id: 'preset-1440p-am5',
    name: 'AM5 1440p Ultra Gaming & Streaming Rig',
    description:
      'Future-proof AM5 DDR5-6000 CL30 platform pairing Ryzen 5 7600X with GeForce RTX 4070 SUPER 12GB and ATX 3.0 native 16-pin power.',
    createdAt: '2026-10-18T08:00:00Z',
    isPreset: true,
    badge: '₱93.6K • 1440p Ultra',
    build: {
      cpu: findById(CPUS, 'cpu-r5-7600x'),
      motherboard: findById(MOTHERBOARDS, 'mb-b650-tomahawk'),
      ram: findById(RAM_KITS, 'ram-flare-32-d5-6000'),
      gpu: findById(GPUS, 'gpu-rtx-4070-super'),
      storage: [findById(STORAGE_DRIVES, 'sto-sn850x-2tb')],
      psu: findById(PSUS, 'psu-mag-a750gl'),
      case: findById(CASES, 'case-4000d-airflow'),
      cooler: findById(COOLERS, 'cool-pa120-se'),
    },
  },
  {
    id: 'preset-ai-workstation',
    name: 'AI/ML & 3D Rendering Flagship Workstation',
    description:
      'Uncompromising 16-core Ryzen 9 7950X, 64GB DDR5-6000, RTX 4090 24GB VRAM, 4TB Gen4 NVMe, 360mm AIO, and 1200W Platinum ATX 3.0 PSU.',
    createdAt: '2026-10-20T08:00:00Z',
    isPreset: true,
    badge: '₱239.2K • Flagship',
    build: {
      cpu: findById(CPUS, 'cpu-r9-7950x'),
      motherboard: findById(MOTHERBOARDS, 'mb-x670e-hero'),
      ram: findById(RAM_KITS, 'ram-vengeance-64-d5-6000'),
      gpu: findById(GPUS, 'gpu-rtx-4090'),
      storage: [
        findById(STORAGE_DRIVES, 'sto-990pro-2tb'),
        findById(STORAGE_DRIVES, 'sto-990pro-2tb'),
      ],
      psu: findById(PSUS, 'psu-vertex-px-1200'),
      case: findById(CASES, 'case-7000d-airflow'),
      cooler: findById(COOLERS, 'cool-lf3-360'),
    },
  },
  {
    id: 'preset-trap-demo',
    name: '⚠️ Educational Demo: "Hidden Compatibility Traps"',
    description:
      'Intentional mistake showcase for classroom/defense demos! Socket matches (LGA1700), but triggers GPU length collision, RAM-cooler overhang collision, ATX board in mATX case, and PSU wattage/16-pin failure.',
    createdAt: '2026-10-22T08:00:00Z',
    isPreset: true,
    badge: '⚠️ 6 Critical Traps (Demo)',
    build: {
      cpu: findById(CPUS, 'cpu-i7-14700k'),
      motherboard: findById(MOTHERBOARDS, 'mb-z790-aorus-elite'), // ATX board
      ram: findById(RAM_KITS, 'ram-dominator-32-d5-6400'), // 56mm tall RAM
      gpu: findById(GPUS, 'gpu-rtx-4080-super'), // 342mm length, needs 16-pin
      storage: [findById(STORAGE_DRIVES, 'sto-sn850x-1tb')],
      psu: findById(PSUS, 'psu-cv550'), // Only 550W, no 16-pin
      case: findById(CASES, 'case-deepcool-macube110'), // mATX only, 320mm max GPU
      cooler: findById(COOLERS, 'cool-nh-d15'), // 32mm RAM limit vs 56mm RAM
    },
  },
];
