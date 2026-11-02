import { describe, it, expect } from 'vitest';
import { generateXAIRecommendation } from '../recommendationEngine';
import { evaluateCompatibility } from '../compatibilityEngine';

describe('Explainable AI (XAI) Recommendation Engine Tests', () => {
  it('1. Generates a 100% compatible Budget Academic build (₱25,000) with transparent XAI scores', () => {
    const rec = generateXAIRecommendation({
      budget: 25000,
      useCase: 'academic',
      preferredFormFactor: 'Micro-ATX',
    });

    const compat = evaluateCompatibility(rec.build);
    expect(compat.failureCount).toBe(0);
    expect(rec.partExplanations.length).toBeGreaterThanOrEqual(7);
    for (const exp of rec.partExplanations) {
      expect(exp.factors.length).toBeGreaterThanOrEqual(2);
      expect(exp.totalScore).toBeGreaterThan(0);
    }
  });

  it('2. Generates a 100% compatible Mid-Range Gaming build (₱65,000) with discrete GPU', () => {
    const rec = generateXAIRecommendation({
      budget: 65000,
      useCase: 'gaming',
      preferredFormFactor: 'Any',
    });

    const compat = evaluateCompatibility(rec.build);
    expect(compat.failureCount).toBe(0);
    expect(rec.build.gpu).not.toBeNull();
    expect(rec.totalPrice).toBeGreaterThan(35000);
  });

  it('3. Generates a 100% compatible High-End 3D Workstation build (₱160,000) with Mini-ITX constraint', () => {
    const rec = generateXAIRecommendation({
      budget: 160000,
      useCase: 'workstation',
      preferredFormFactor: 'Mini-ITX',
    });

    const compat = evaluateCompatibility(rec.build);
    expect(compat.failureCount).toBe(0);
    expect(rec.build.motherboard?.formFactor).toBe('Mini-ITX');
  });
});
