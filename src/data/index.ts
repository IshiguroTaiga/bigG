import { AnyComponent, PartCategory, PCBuildState } from '../types/pc';
import { CPUS } from './cpus';
import { MOTHERBOARDS } from './motherboards';
import { RAM_KITS } from './ram';
import { GPUS } from './gpus';
import { STORAGE_DRIVES } from './storage';
import { PSUS } from './psus';
import { CASES } from './cases';
import { COOLERS } from './coolers';
import { PRESET_BUILDS } from './presets';

export {
  CPUS,
  MOTHERBOARDS,
  RAM_KITS,
  GPUS,
  STORAGE_DRIVES,
  PSUS,
  CASES,
  COOLERS,
  PRESET_BUILDS,
};

export const ALL_PARTS_BY_CATEGORY: Record<PartCategory, AnyComponent[]> = {
  cpu: CPUS,
  motherboard: MOTHERBOARDS,
  ram: RAM_KITS,
  gpu: GPUS,
  storage: STORAGE_DRIVES,
  psu: PSUS,
  case: CASES,
  cooler: COOLERS,
};

export const ALL_PARTS_FLAT: AnyComponent[] = [
  ...CPUS,
  ...MOTHERBOARDS,
  ...RAM_KITS,
  ...GPUS,
  ...STORAGE_DRIVES,
  ...PSUS,
  ...CASES,
  ...COOLERS,
];

export function getComponentById(id: string): AnyComponent | undefined {
  return ALL_PARTS_FLAT.find((part) => part.id === id);
}

export const EMPTY_BUILD: PCBuildState = {
  cpu: null,
  motherboard: null,
  ram: null,
  gpu: null,
  storage: [],
  psu: null,
  case: null,
  cooler: null,
};

export function calculateBuildTotalCost(build: PCBuildState): number {
  let total = 0;
  if (build.cpu) total += build.cpu.price;
  if (build.motherboard) total += build.motherboard.price;
  if (build.ram) total += build.ram.price;
  if (build.gpu) total += build.gpu.price;
  if (build.psu) total += build.psu.price;
  if (build.case) total += build.case.price;
  if (build.cooler) total += build.cooler.price;
  for (const drive of build.storage) {
    total += drive.price;
  }
  return total;
}
