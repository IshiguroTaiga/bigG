import { describe, it, expect } from 'vitest';
import {
  evaluateCompatibility,
  checkCandidatePartCompatibility,
  calculateSystemPower,
} from '../compatibilityEngine';
import {
  CPUS,
  MOTHERBOARDS,
  RAM_KITS,
  GPUS,
  STORAGE_DRIVES,
  PSUS,
  CASES,
  COOLERS,
  EMPTY_BUILD,
  PRESET_BUILDS,
} from '../../data';
import { PCBuildState } from '../../types/pc';

const findPart = <T extends { id: string }>(arr: T[], id: string): T => {
  const item = arr.find((p) => p.id === id);
  if (!item) throw new Error(`Missing test part: ${id}`);
  return item;
};

describe('Compatibility Engine Unit Tests', () => {
  it('1. Validates a fully compatible AM5 1440p preset build with zero failures or warnings', () => {
    const preset = PRESET_BUILDS.find((p) => p.id === 'preset-1440p-am5')!;
    const report = evaluateCompatibility(preset.build);

    expect(report.overallStatus).toBe('pass');
    expect(report.failureCount).toBe(0);
    expect(report.score).toBe(100);
    expect(report.estimatedWattage.typicalLoadWatts).toBeGreaterThan(300);
  });

  it('2. Detects CPU socket vs Motherboard socket mismatch (AM5 CPU on LGA1700 Motherboard)', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      cpu: findPart(CPUS, 'cpu-r7-7800x3d'), // AM5
      motherboard: findPart(MOTHERBOARDS, 'mb-z790-aorus-elite'), // LGA1700
    };
    const report = evaluateCompatibility(build);

    expect(report.overallStatus).toBe('fail');
    const socketIssue = report.results.find((r) => r.id === 'rule-cpu-mb-socket');
    expect(socketIssue?.status).toBe('fail');
    expect(socketIssue?.title).toContain('Mismatch');
  });

  it('3. Detects DDR4 vs DDR5 RAM generation mismatch and DIMM slot count overflow', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      motherboard: findPart(MOTHERBOARDS, 'mb-a620m-hdv'), // DDR5, 2 slots
      ram: findPart(RAM_KITS, 'ram-vengeance-rgb-32-d4-4x8'), // DDR4, 4 modules
    };
    const report = evaluateCompatibility(build);

    const typeIssue = report.results.find((r) => r.id === 'rule-ram-type-mb');
    const slotIssue = report.results.find((r) => r.id === 'rule-ram-slots');
    expect(typeIssue?.status).toBe('fail');
    expect(slotIssue?.status).toBe('fail');
  });

  it('4. Detects RAM capacity exceeding motherboard max capacity (128GB on 96GB max board)', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      motherboard: findPart(MOTHERBOARDS, 'mb-b650i-edge'), // 2 slots, 96GB max
      ram: {
        ...findPart(RAM_KITS, 'ram-vengeance-128-d5-5600'),
        modules: 2, // Force 2 modules to specifically test capacity rule
      },
    };
    const report = evaluateCompatibility(build);
    const capIssue = report.results.find((r) => r.id === 'rule-ram-capacity');
    expect(capIssue?.status).toBe('fail');
  });

  it('5. Detects ATX Motherboard inside a Micro-ATX / Mini-ITX Case', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      motherboard: findPart(MOTHERBOARDS, 'mb-b650-tomahawk'), // ATX
      case: findPart(CASES, 'case-tecware-flatline'), // Supports mATX, Mini-ITX only
    };
    const report = evaluateCompatibility(build);
    const ffIssue = report.results.find((r) => r.id === 'rule-mb-case-ff');
    expect(ffIssue?.status).toBe('fail');
  });

  it('6. Detects GPU length exceeding Case max GPU clearance (358mm RTX 4090 in 315mm Meshify C)', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      gpu: findPart(GPUS, 'gpu-rtx-4090'), // 358mm
      case: findPart(CASES, 'case-meshify-c'), // 315mm max
    };
    const report = evaluateCompatibility(build);
    const gpuLenIssue = report.results.find((r) => r.id === 'rule-gpu-case-length');
    expect(gpuLenIssue?.status).toBe('fail');
  });

  it('7. Detects CPU Cooler height collision, socket mismatch, and insufficient TDP rating', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      cpu: findPart(CPUS, 'cpu-i9-14900k'), // LGA1700, 253W TDP
      cooler: findPart(COOLERS, 'cool-nh-l9a-am4'), // AM4 only, 95W TDP
      case: findPart(CASES, 'case-terra-itx'), // 77mm max cooler
    };
    const report = evaluateCompatibility(build);
    expect(report.results.find((r) => r.id === 'rule-cooler-socket')?.status).toBe('fail');
    expect(report.results.find((r) => r.id === 'rule-cooler-tdp')?.status).toBe('fail');

    // Now test tall 165mm NH-D15 inside 77mm Fractal Terra
    const buildTallCooler: PCBuildState = {
      ...EMPTY_BUILD,
      cooler: findPart(COOLERS, 'cool-nh-d15'), // 165mm
      case: findPart(CASES, 'case-terra-itx'), // 77mm max
    };
    const report2 = evaluateCompatibility(buildTallCooler);
    expect(report2.results.find((r) => r.id === 'rule-cooler-case-height')?.status).toBe('fail');
  });

  it('8. Detects tall RGB RAM (56mm) colliding with dual-tower Air Cooler overhang (32mm limit)', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      ram: findPart(RAM_KITS, 'ram-dominator-32-d5-6400'), // 56mm height
      cooler: findPart(COOLERS, 'cool-nh-d15'), // 32mm RAM clearance
    };
    const report = evaluateCompatibility(build);
    const ramCoolerIssue = report.results.find(
      (r) => r.id === 'rule-ram-cooler-clearance'
    );
    expect(ramCoolerIssue?.status).toBe('fail');
  });

  it('9. Detects PSU wattage overload and missing 16-pin / 8-pin GPU power connectors', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      cpu: findPart(CPUS, 'cpu-i7-14700k'), // 253W
      gpu: findPart(GPUS, 'gpu-rtx-4090'), // 450W, needs 16-pin
      psu: findPart(PSUS, 'psu-cv550'), // 550W, only 2x 8-pin, 0x 16-pin
    };
    const report = evaluateCompatibility(build);
    expect(report.results.find((r) => r.id === 'rule-psu-wattage')?.status).toBe('fail');
    expect(report.results.find((r) => r.id === 'rule-psu-gpu-connectors')?.status).toBe('fail');
  });

  it('10. Detects M.2 NVMe slot overflow and missing display output on F-series CPU without GPU', () => {
    const drive = findPart(STORAGE_DRIVES, 'sto-nv2-1tb');
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      cpu: findPart(CPUS, 'cpu-i3-12100f'), // No iGPU
      motherboard: findPart(MOTHERBOARDS, 'mb-h610m-e-d4'), // Only 1 M.2 slot
      storage: [drive, drive], // 2 M.2 drives
    };
    const report = evaluateCompatibility(build);
    expect(report.results.find((r) => r.id === 'rule-display-output')?.status).toBe('fail');
    expect(report.results.find((r) => r.id === 'rule-storage-m2-slots')?.status).toBe('fail');
  });

  it('11. Candidate Part Compatibility Helper flags incompatible picker parts in real-time', () => {
    const baseBuild: PCBuildState = {
      ...EMPTY_BUILD,
      cpu: findPart(CPUS, 'cpu-r7-7800x3d'), // AM5
    };
    const lgaBoard = findPart(MOTHERBOARDS, 'mb-z790-aorus-elite');
    const am5Board = findPart(MOTHERBOARDS, 'mb-b650-tomahawk');

    const badCheck = checkCandidatePartCompatibility(baseBuild, lgaBoard);
    const goodCheck = checkCandidatePartCompatibility(baseBuild, am5Board);

    expect(badCheck.compatible).toBe(false);
    expect(badCheck.status).toBe('fail');
    expect(goodCheck.compatible).toBe(true);
    expect(goodCheck.status).toBe('pass');
  });

  it('12. Calculates system power accurately when components are added', () => {
    const emptyPower = calculateSystemPower(EMPTY_BUILD);
    expect(emptyPower.typicalLoadWatts).toBe(0);
    expect(emptyPower.recommendedPsuWatts).toBe(0);
  });
});
