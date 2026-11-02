import { describe, it, expect } from 'vitest';
import { simulatePerformance } from '../performanceEngine';
import { CPUS, GPUS, EMPTY_BUILD, PRESET_BUILDS } from '../../data';
import { PCBuildState } from '../../types/pc';

describe('Performance & Bottleneck Simulation Engine Tests', () => {
  it('1. Handles empty build state gracefully', () => {
    const res = simulatePerformance(EMPTY_BUILD);
    expect(res.ready).toBe(false);
    expect(res.fpsBenchmarks).toHaveLength(0);
  });

  it('2. Simulates balanced 1440p AM5 build with strong FPS and Optimal bottleneck status', () => {
    const preset = PRESET_BUILDS.find((p) => p.id === 'preset-1440p-am5')!;
    const res = simulatePerformance(preset.build);

    expect(res.ready).toBe(true);
    expect(res.overallGamingIndex).toBeGreaterThan(75);
    expect(res.fpsBenchmarks).toHaveLength(4);
    expect(res.fpsBenchmarks[0].fps1080p).toBeGreaterThan(200);
    expect(res.bottleneck.limitingComponent).toBe('Balanced');
    expect(res.psuCurve.length).toBeGreaterThan(5);
  });

  it('3. Detects Severe CPU Bottleneck when pairing Core i3-12100F with Flagship RTX 4090', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      cpu: CPUS.find((c) => c.id === 'cpu-i3-12100f')!,
      gpu: GPUS.find((g) => g.id === 'gpu-rtx-4090')!,
    };
    const res = simulatePerformance(build);

    expect(res.bottleneck.limitingComponent).toBe('CPU');
    expect(res.bottleneck.bottleneckPercentage).toBeGreaterThan(25);
    expect(res.bottleneck.severity).toBe('Severe Bottleneck');
  });

  it('4. Detects GPU Bottleneck when pairing Ryzen 7 7800X3D with Budget RX 6600', () => {
    const build: PCBuildState = {
      ...EMPTY_BUILD,
      cpu: CPUS.find((c) => c.id === 'cpu-r7-7800x3d')!,
      gpu: GPUS.find((g) => g.id === 'gpu-rx-6600')!,
    };
    const res = simulatePerformance(build);

    expect(res.bottleneck.limitingComponent).toBe('GPU');
    expect(res.bottleneck.bottleneckPercentage).toBeGreaterThan(20);
  });
});
