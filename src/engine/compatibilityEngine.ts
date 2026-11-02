import {
  AnyComponent,
  CompatibilityIssue,
  CompatibilityReport,
  CompatibilityStatus,
  PCBuildState,
} from '../types/pc';

/**
 * Calculates estimated system power draw across idle, typical workload, and peak transient states.
 */
export function calculateSystemPower(build: PCBuildState) {
  const cpuTdp = build.cpu ? build.cpu.tdpWatts : 0;
  const gpuTdp = build.gpu ? build.gpu.tdpWatts : 0;
  const motherboardWatts = build.motherboard ? 35 : 0;
  const ramWatts = build.ram ? build.ram.modules * 4 : 0;
  const storageWatts = build.storage.reduce(
    (sum, drive) => sum + (drive.type === 'HDD' ? 9 : 6),
    0
  );
  const coolerWatts = build.cooler
    ? build.cooler.type === 'AIO'
      ? 15
      : 6
    : 0;
  const caseFansWatts = build.case ? build.case.includedFans * 3 : 0;

  const basePeripheralWatts =
    motherboardWatts + ramWatts + storageWatts + coolerWatts + caseFansWatts;

  const typicalLoadWatts = Math.round(cpuTdp + gpuTdp + basePeripheralWatts);
  const idleWatts = Math.round(
    (build.cpu ? 18 : 0) +
      (build.gpu ? 15 : 0) +
      Math.round(basePeripheralWatts * 0.5)
  );
  // Peak load accounts for CPU boost power & GPU microsecond transient spikes (~15% buffer)
  const peakLoadWatts = Math.round(
    cpuTdp * 1.15 + gpuTdp * 1.18 + basePeripheralWatts
  );

  // Recommended PSU is max of (Peak Load * 1.25 rounded to nearest 50W) or GPU manufacturer recommendation
  const calculatedRecommended =
    typicalLoadWatts > 0 ? Math.ceil((peakLoadWatts * 1.25) / 50) * 50 : 0;
  const gpuRecommended = build.gpu ? build.gpu.recommendedPsuWatts : 0;
  const recommendedPsuWatts = Math.max(calculatedRecommended, gpuRecommended);

  const psuHeadroomPercent =
    build.psu && peakLoadWatts > 0
      ? Math.round(((build.psu.wattage - peakLoadWatts) / build.psu.wattage) * 100)
      : null;

  return {
    idleWatts,
    typicalLoadWatts,
    peakLoadWatts,
    recommendedPsuWatts,
    psuHeadroomPercent,
  };
}

/**
 * Rule-based Compatibility Engine for Digital PC Builder.
 * Evaluates socket, memory, physical clearances, thermals, power delivery, and storage slots.
 */
export function evaluateCompatibility(build: PCBuildState): CompatibilityReport {
  const results: CompatibilityIssue[] = [];
  const power = calculateSystemPower(build);

  const { cpu, motherboard, ram, gpu, storage, psu, case: pcCase, cooler } = build;

  // 1. CPU Socket vs Motherboard Socket
  if (cpu && motherboard) {
    if (cpu.socket === motherboard.socket) {
      results.push({
        id: 'rule-cpu-mb-socket',
        ruleCategory: 'Socket & Platform',
        status: 'pass',
        title: `Socket Match (${cpu.socket})`,
        explanation: `${cpu.brand} ${cpu.name} (${cpu.socket}) is physically and electrically compatible with ${motherboard.brand} ${motherboard.name} (${motherboard.socket}).`,
        affectedCategories: ['cpu', 'motherboard'],
      });
    } else {
      results.push({
        id: 'rule-cpu-mb-socket',
        ruleCategory: 'Socket & Platform',
        status: 'fail',
        title: `CPU & Motherboard Socket Mismatch (${cpu.socket} vs ${motherboard.socket})`,
        explanation: `${cpu.name} requires a ${cpu.socket} socket, but ${motherboard.name} uses a ${motherboard.socket} socket. These parts cannot physically fit together.`,
        recommendation: `Select a motherboard with socket ${cpu.socket}, or switch to a ${motherboard.socket} processor.`,
        affectedCategories: ['cpu', 'motherboard'],
      });
    }

    // Check VRM tier vs high TDP CPU
    if (cpu.tdpWatts >= 170 && motherboard.vrmTier === 'Entry') {
      results.push({
        id: 'rule-mb-vrm-thermal',
        ruleCategory: 'Socket & Platform',
        status: 'warn',
        title: 'Entry-Level Motherboard VRM with High-TDP Processor',
        explanation: `${cpu.name} draws ${cpu.tdpWatts}W TDP, which may cause VRM thermal throttling on the entry-level ${motherboard.name} power delivery stages under sustained all-core load.`,
        recommendation: 'Upgrade to a B650/B760/Z790/X670 motherboard with Solid or Robust VRM heatsinks.',
        affectedCategories: ['cpu', 'motherboard'],
      });
    }
  }

  // 2. Display Output Verification (Discrete GPU or Integrated Graphics)
  if (cpu) {
    if (!gpu && !cpu.integratedGraphics) {
      results.push({
        id: 'rule-display-output',
        ruleCategory: 'System Completeness',
        status: 'fail',
        title: 'No Display Output Available (Missing GPU & No iGPU)',
        explanation: `${cpu.name} does not contain integrated graphics (indicated by F/X/non-G suffix) and no discrete Graphics Card (GPU) is selected. The system will not output video to a monitor.`,
        recommendation: 'Add a dedicated Graphics Card (GPU) or switch to a CPU with integrated graphics (e.g., Ryzen 5 5600G, Ryzen 7000 series, or non-F Intel Core).',
        affectedCategories: ['cpu', 'gpu'],
      });
    } else if (!gpu && cpu.integratedGraphics) {
      results.push({
        id: 'rule-display-output',
        ruleCategory: 'System Completeness',
        status: 'pass',
        title: `Integrated Graphics Active (${cpu.igpuName || 'Onboard iGPU'})`,
        explanation: `${cpu.name} includes onboard graphics (${cpu.igpuName || 'iGPU'}), allowing monitor output via the motherboard without a discrete GPU.`,
        affectedCategories: ['cpu', 'gpu'],
      });
    } else if (gpu) {
      results.push({
        id: 'rule-display-output',
        ruleCategory: 'System Completeness',
        status: 'pass',
        title: `Dedicated Graphics Output Ready (${gpu.chipset})`,
        explanation: `Video signal will be driven by the discrete ${gpu.brand} ${gpu.name}. Connect your display cable directly to the GPU ports.`,
        affectedCategories: ['gpu'],
      });
    }
  }

  // 3. RAM Type (DDR4/DDR5) vs Motherboard & CPU, Slot Count, and Max Capacity
  if (ram && motherboard) {
    if (ram.type !== motherboard.ramType) {
      results.push({
        id: 'rule-ram-type-mb',
        ruleCategory: 'Memory (RAM)',
        status: 'fail',
        title: `RAM Generation Mismatch (${ram.type} vs ${motherboard.ramType})`,
        explanation: `${ram.name} is ${ram.type}, whereas ${motherboard.name} only accepts ${motherboard.ramType} DIMMs. DDR4 and DDR5 have different key notches and voltages.`,
        recommendation: `Select a ${motherboard.ramType} memory kit or change the motherboard to a ${ram.type} model.`,
        affectedCategories: ['ram', 'motherboard'],
      });
    } else {
      results.push({
        id: 'rule-ram-type-mb',
        ruleCategory: 'Memory (RAM)',
        status: 'pass',
        title: `Memory Standard Match (${ram.type})`,
        explanation: `${ram.name} (${ram.type}) matches the memory standard of ${motherboard.name}.`,
        affectedCategories: ['ram', 'motherboard'],
      });
    }

    if (ram.modules > motherboard.ramSlots) {
      results.push({
        id: 'rule-ram-slots',
        ruleCategory: 'Memory (RAM)',
        status: 'fail',
        title: `Insufficient RAM Slots (${ram.modules} Modules vs ${motherboard.ramSlots} Slots)`,
        explanation: `${ram.name} contains ${ram.modules} memory sticks, but ${motherboard.name} only has ${motherboard.ramSlots} physical DIMM slots.`,
        recommendation: `Choose a 2-module (2x${ram.capacityGB / 2}GB) RAM kit or select a 4-slot motherboard.`,
        affectedCategories: ['ram', 'motherboard'],
      });
    } else if (ram.capacityGB > motherboard.maxRamGB) {
      results.push({
        id: 'rule-ram-capacity',
        ruleCategory: 'Memory (RAM)',
        status: 'fail',
        title: `RAM Capacity Exceeds Motherboard Maximum (${ram.capacityGB}GB > ${motherboard.maxRamGB}GB)`,
        explanation: `${ram.name} has a total capacity of ${ram.capacityGB}GB, exceeding the ${motherboard.maxRamGB}GB maximum supported by ${motherboard.name}.`,
        recommendation: `Select a memory kit up to ${motherboard.maxRamGB}GB.`,
        affectedCategories: ['ram', 'motherboard'],
      });
    } else {
      results.push({
        id: 'rule-ram-slots',
        ruleCategory: 'Memory (RAM)',
        status: 'pass',
        title: `DIMM Slot & Capacity Check (${ram.modules}/${motherboard.ramSlots} Slots, ${ram.capacityGB}GB)`,
        explanation: `${ram.modules} DIMM module(s) totaling ${ram.capacityGB}GB fit within ${motherboard.name}'s ${motherboard.ramSlots} slots (Max ${motherboard.maxRamGB}GB).`,
        affectedCategories: ['ram', 'motherboard'],
      });
    }
  }

  if (ram && cpu && !cpu.supportedMemoryTypes.includes(ram.type)) {
    results.push({
      id: 'rule-ram-cpu-imc',
      ruleCategory: 'Memory (RAM)',
      status: 'fail',
      title: `CPU Memory Controller Incompatible with ${ram.type}`,
      explanation: `${cpu.name}'s integrated memory controller only supports ${cpu.supportedMemoryTypes.join('/')} memory, not ${ram.type}.`,
      recommendation: `Switch to a ${cpu.supportedMemoryTypes[0]} memory kit.`,
      affectedCategories: ['cpu', 'ram'],
    });
  }

  // 4. Motherboard Form Factor vs Case Support
  if (motherboard && pcCase) {
    if (pcCase.supportedMotherboards.includes(motherboard.formFactor)) {
      results.push({
        id: 'rule-mb-case-ff',
        ruleCategory: 'Physical Clearance',
        status: 'pass',
        title: `Motherboard Form Factor Fits Case (${motherboard.formFactor})`,
        explanation: `${pcCase.name} (${pcCase.formFactor}) includes standoffs for ${motherboard.formFactor} motherboards.`,
        affectedCategories: ['motherboard', 'case'],
      });
    } else {
      results.push({
        id: 'rule-mb-case-ff',
        ruleCategory: 'Physical Clearance',
        status: 'fail',
        title: `Motherboard Too Large for Case (${motherboard.formFactor} in ${pcCase.formFactor})`,
        explanation: `${motherboard.name} is an ${motherboard.formFactor} board, but ${pcCase.name} only supports [${pcCase.supportedMotherboards.join(', ')}].`,
        recommendation: `Select a case that supports ${motherboard.formFactor} or choose a smaller ${pcCase.supportedMotherboards[0]} motherboard.`,
        affectedCategories: ['motherboard', 'case'],
      });
    }
  }

  // 5. GPU Length vs Case Max GPU Length
  if (gpu && pcCase) {
    const margin = pcCase.maxGpuLengthMm - gpu.lengthMm;
    if (margin < 0) {
      results.push({
        id: 'rule-gpu-case-length',
        ruleCategory: 'Physical Clearance',
        status: 'fail',
        title: `GPU Exceeds Case Length Limit (${gpu.lengthMm}mm > ${pcCase.maxGpuLengthMm}mm)`,
        explanation: `${gpu.name} is ${gpu.lengthMm}mm long, colliding with the front panel/fans of ${pcCase.name} (max ${pcCase.maxGpuLengthMm}mm, ${Math.abs(margin)}mm too long).`,
        recommendation: `Choose a dual-fan GPU under ${pcCase.maxGpuLengthMm}mm or select a larger case with ≥${gpu.lengthMm + 15}mm GPU clearance.`,
        affectedCategories: ['gpu', 'case'],
      });
    } else if (margin <= 12) {
      results.push({
        id: 'rule-gpu-case-length',
        ruleCategory: 'Physical Clearance',
        status: 'warn',
        title: `Tight GPU Length Clearance (${margin}mm Margin)`,
        explanation: `${gpu.name} (${gpu.lengthMm}mm) leaves only ${margin}mm of space inside ${pcCase.name} (max ${pcCase.maxGpuLengthMm}mm). Front-mounting an AIO radiator will cause a physical collision.`,
        recommendation: 'Ensure any liquid radiator is top-mounted, or choose a deeper chassis.',
        affectedCategories: ['gpu', 'case'],
      });
    } else {
      results.push({
        id: 'rule-gpu-case-length',
        ruleCategory: 'Physical Clearance',
        status: 'pass',
        title: `GPU Length Clearance Verified (${gpu.lengthMm}mm / ${pcCase.maxGpuLengthMm}mm)`,
        explanation: `${gpu.name} fits comfortably inside ${pcCase.name} with ${margin}mm of spare front clearance.`,
        affectedCategories: ['gpu', 'case'],
      });
    }
  }

  // 6. CPU Cooler Socket, Height vs Case Clearance, Radiator Size, and TDP Rating
  if (cooler && cpu) {
    if (!cooler.supportedSockets.includes(cpu.socket)) {
      results.push({
        id: 'rule-cooler-socket',
        ruleCategory: 'Thermal & Cooling',
        status: 'fail',
        title: `Cooler Mounting Bracket Incompatible with ${cpu.socket}`,
        explanation: `${cooler.name} only includes mounting hardware for [${cooler.supportedSockets.join(', ')}] and cannot mount onto ${cpu.name} (${cpu.socket}).`,
        recommendation: `Select a CPU cooler with ${cpu.socket} socket support.`,
        affectedCategories: ['cooler', 'cpu'],
      });
    } else {
      results.push({
        id: 'rule-cooler-socket',
        ruleCategory: 'Thermal & Cooling',
        status: 'pass',
        title: `Cooler Bracket Supports ${cpu.socket}`,
        explanation: `${cooler.name} includes compatible mounting brackets for socket ${cpu.socket}.`,
        affectedCategories: ['cooler', 'cpu'],
      });
    }

    if (cooler.tdpRatingWatts < cpu.tdpWatts) {
      results.push({
        id: 'rule-cooler-tdp',
        ruleCategory: 'Thermal & Cooling',
        status: 'fail',
        title: `Cooler Under-Rated for CPU Thermal Load (${cooler.tdpRatingWatts}W < ${cpu.tdpWatts}W TDP)`,
        explanation: `${cpu.name} has a rated thermal output of ${cpu.tdpWatts}W, exceeding ${cooler.name}'s ${cooler.tdpRatingWatts}W dissipation capacity. Severe thermal throttling will occur.`,
        recommendation: `Upgrade to a dual-tower air cooler or 240mm/360mm AIO rated for at least ${Math.ceil(cpu.tdpWatts * 1.25)}W TDP.`,
        affectedCategories: ['cooler', 'cpu'],
      });
    } else if (cooler.tdpRatingWatts < cpu.tdpWatts * 1.2) {
      results.push({
        id: 'rule-cooler-tdp',
        ruleCategory: 'Thermal & Cooling',
        status: 'warn',
        title: `Minimal Thermal Headroom (${cooler.tdpRatingWatts}W Cooler on ${cpu.tdpWatts}W CPU)`,
        explanation: `${cooler.name} (${cooler.tdpRatingWatts}W rating) is close to ${cpu.name}'s ${cpu.tdpWatts}W TDP. Fans may run loudly under sustained tropical ambient temperatures.`,
        recommendation: 'Consider a higher-capacity cooler for quieter acoustics under heavy load.',
        affectedCategories: ['cooler', 'cpu'],
      });
    } else {
      results.push({
        id: 'rule-cooler-tdp',
        ruleCategory: 'Thermal & Cooling',
        status: 'pass',
        title: `Thermal Dissipation Capacity Sufficient (${cooler.tdpRatingWatts}W vs ${cpu.tdpWatts}W CPU)`,
        explanation: `${cooler.name} provides ample thermal headroom for ${cpu.name}.`,
        affectedCategories: ['cooler', 'cpu'],
      });
    }
  }

  if (cooler && pcCase) {
    if (cooler.type === 'Air') {
      if (cooler.heightMm > pcCase.maxCoolerHeightMm) {
        results.push({
          id: 'rule-cooler-case-height',
          ruleCategory: 'Physical Clearance',
          status: 'fail',
          title: `Air Cooler Too Tall for Case Side Panel (${cooler.heightMm}mm > ${pcCase.maxCoolerHeightMm}mm)`,
          explanation: `${cooler.name} stands ${cooler.heightMm}mm tall, preventing ${pcCase.name}'s side panel (max ${pcCase.maxCoolerHeightMm}mm) from closing.`,
          recommendation: `Choose a cooler ≤${pcCase.maxCoolerHeightMm}mm tall, an AIO liquid cooler, or a wider case.`,
          affectedCategories: ['cooler', 'case'],
        });
      } else {
        results.push({
          id: 'rule-cooler-case-height',
          ruleCategory: 'Physical Clearance',
          status: 'pass',
          title: `Air Cooler Height Clears Side Panel (${cooler.heightMm}mm / ${pcCase.maxCoolerHeightMm}mm)`,
          explanation: `${cooler.name} fits inside ${pcCase.name} with ${pcCase.maxCoolerHeightMm - cooler.heightMm}mm side panel clearance.`,
          affectedCategories: ['cooler', 'case'],
        });
      }
    } else if (cooler.type === 'AIO' && cooler.radiatorSizeMm) {
      if (cooler.radiatorSizeMm > pcCase.maxRadiatorMm) {
        results.push({
          id: 'rule-aio-case-rad',
          ruleCategory: 'Physical Clearance',
          status: 'fail',
          title: `AIO Radiator Exceeds Case Mount Support (${cooler.radiatorSizeMm}mm > ${pcCase.maxRadiatorMm}mm)`,
          explanation: `${cooler.name} uses a ${cooler.radiatorSizeMm}mm radiator, but ${pcCase.name} only supports radiators up to ${pcCase.maxRadiatorMm}mm.`,
          recommendation: `Select a ${pcCase.maxRadiatorMm}mm AIO cooler or a case with 360mm radiator support.`,
          affectedCategories: ['cooler', 'case'],
        });
      } else {
        results.push({
          id: 'rule-aio-case-rad',
          ruleCategory: 'Physical Clearance',
          status: 'pass',
          title: `AIO Radiator Mount Supported (${cooler.radiatorSizeMm}mm)`,
          explanation: `${pcCase.name} supports mounting the ${cooler.radiatorSizeMm}mm radiator of ${cooler.name}.`,
          affectedCategories: ['cooler', 'case'],
        });
      }
    }
  }

  // 7. RAM Height vs Cooler Clearance
  if (ram && cooler) {
    if (ram.heightMm > cooler.ramClearanceMm) {
      const diff = ram.heightMm - cooler.ramClearanceMm;
      results.push({
        id: 'rule-ram-cooler-clearance',
        ruleCategory: 'Physical Clearance',
        status: 'fail',
        title: `RAM Module Height Collides with Air Cooler Fan (${ram.heightMm}mm > ${cooler.ramClearanceMm}mm)`,
        explanation: `${ram.name} is ${ram.heightMm}mm tall, exceeding ${cooler.name}'s ${cooler.ramClearanceMm}mm front fan overhang clearance by ${diff}mm.`,
        recommendation: `Switch to low-profile RAM (≤${cooler.ramClearanceMm}mm, such as Corsair LPX / G.Skill Flare X5) or choose an offset/AIO cooler.`,
        affectedCategories: ['ram', 'cooler'],
      });
    } else {
      results.push({
        id: 'rule-ram-cooler-clearance',
        ruleCategory: 'Physical Clearance',
        status: 'pass',
        title: `RAM Height Clears CPU Cooler (${ram.heightMm}mm ≤ ${cooler.ramClearanceMm}mm)`,
        explanation: `${ram.name} (${ram.heightMm}mm height) fits underneath ${cooler.name} without fan interference.`,
        affectedCategories: ['ram', 'cooler'],
      });
    }
  }

  // 8. PSU Form Factor vs Case, PSU Wattage vs Load, and GPU Power Connectors
  if (psu && pcCase) {
    if (!pcCase.supportedPsuFormFactors.includes(psu.formFactor)) {
      results.push({
        id: 'rule-psu-case-ff',
        ruleCategory: 'Physical Clearance',
        status: 'fail',
        title: `PSU Form Factor Incompatible with Case (${psu.formFactor} PSU in ${pcCase.name})`,
        explanation: `${psu.name} is an ${psu.formFactor} power supply, but ${pcCase.name} only accepts [${pcCase.supportedPsuFormFactors.join(', ')}] units.`,
        recommendation: `Select a ${pcCase.supportedPsuFormFactors[0]} power supply.`,
        affectedCategories: ['psu', 'case'],
      });
    } else {
      results.push({
        id: 'rule-psu-case-ff',
        ruleCategory: 'Physical Clearance',
        status: 'pass',
        title: `PSU Form Factor Fits Case (${psu.formFactor})`,
        explanation: `${psu.name} (${psu.formFactor}) mounts properly inside ${pcCase.name}.`,
        affectedCategories: ['psu', 'case'],
      });
    }
  }

  if (psu && power.typicalLoadWatts > 0) {
    if (psu.wattage < power.peakLoadWatts) {
      results.push({
        id: 'rule-psu-wattage',
        ruleCategory: 'Power Delivery (PSU)',
        status: 'fail',
        title: `PSU Wattage Insufficient for System Load (${psu.wattage}W < ${power.peakLoadWatts}W Peak)`,
        explanation: `Estimated peak system load is ${power.peakLoadWatts}W (${power.typicalLoadWatts}W typical), which exceeds ${psu.name}'s ${psu.wattage}W capacity and will trigger Over-Power Protection (OPP) shutdowns.`,
        recommendation: `Upgrade to at least a ${power.recommendedPsuWatts}W 80+ Gold power supply.`,
        affectedCategories: ['psu', 'gpu', 'cpu'],
      });
    } else if (psu.wattage < power.recommendedPsuWatts) {
      results.push({
        id: 'rule-psu-wattage',
        ruleCategory: 'Power Delivery (PSU)',
        status: 'warn',
        title: `Low PSU Wattage Headroom (${psu.wattage}W vs ${power.recommendedPsuWatts}W Recommended)`,
        explanation: `${psu.name} (${psu.wattage}W) can run the ${power.typicalLoadWatts}W typical load, but falls below the recommended ${power.recommendedPsuWatts}W buffer for GPU transient power spikes.`,
        recommendation: `Consider a ${power.recommendedPsuWatts}W PSU for safer transient response and quieter fan operation.`,
        affectedCategories: ['psu', 'gpu'],
      });
    } else {
      results.push({
        id: 'rule-psu-wattage',
        ruleCategory: 'Power Delivery (PSU)',
        status: 'pass',
        title: `Healthy PSU Wattage Headroom (${psu.wattage}W for ~${power.typicalLoadWatts}W Load)`,
        explanation: `${psu.name} provides ${power.psuHeadroomPercent}% headroom above peak transient load (${power.peakLoadWatts}W).`,
        affectedCategories: ['psu'],
      });
    }
  }

  if (psu && gpu) {
    const req16 = gpu.pcieConnectors.sixteenPin;
    const req8 = gpu.pcieConnectors.eightPin;

    if (req16 > 0) {
      if (psu.connectors.pcie16Pin >= req16) {
        results.push({
          id: 'rule-psu-gpu-connectors',
          ruleCategory: 'Power Delivery (PSU)',
          status: 'pass',
          title: 'Native 16-Pin (12VHPWR) GPU Cable Included',
          explanation: `${psu.name} has a native ATX 3.0 16-pin PCIe 5.0 connector for ${gpu.name}, eliminating bulky adapter cables.`,
          affectedCategories: ['psu', 'gpu'],
        });
      } else if (psu.connectors.pcie8Pin >= 3) {
        results.push({
          id: 'rule-psu-gpu-connectors',
          ruleCategory: 'Power Delivery (PSU)',
          status: 'warn',
          title: 'GPU Requires 16-Pin Adapter (PSU Lacks Native 12VHPWR)',
          explanation: `${gpu.name} uses a 16-pin (12VHPWR) power input. ${psu.name} lacks a native 16-pin port, so you must use the GPU's bundled ${psu.connectors.pcie8Pin}x 8-pin to 16-pin adapter.`,
          recommendation: 'Switch to an ATX 3.0 PSU (e.g., MSI MAG A750GL, Corsair RM750e/RM850x) for a clean single-cable native connection.',
          affectedCategories: ['psu', 'gpu'],
        });
      } else {
        results.push({
          id: 'rule-psu-gpu-connectors',
          ruleCategory: 'Power Delivery (PSU)',
          status: 'fail',
          title: 'Missing Required GPU Power Connectors (16-Pin / 8-Pin Deficit)',
          explanation: `${gpu.name} requires a 16-pin 12VHPWR connector (or ≥3x 8-pin PCIe cables via adapter), but ${psu.name} only provides ${psu.connectors.pcie8Pin}x 8-pin cables and 0x 16-pin ports.`,
          recommendation: 'Select an ATX 3.0 PSU with a native 16-pin connector.',
          affectedCategories: ['psu', 'gpu'],
        });
      }
    } else if (req8 > 0) {
      if (psu.connectors.pcie8Pin < req8) {
        results.push({
          id: 'rule-psu-gpu-connectors',
          ruleCategory: 'Power Delivery (PSU)',
          status: 'fail',
          title: `Insufficient 8-Pin PCIe Power Connectors (${psu.connectors.pcie8Pin} Available vs ${req8} Required)`,
          explanation: `${gpu.name} requires ${req8}x 8-pin PCIe power connectors, but ${psu.name} only has ${psu.connectors.pcie8Pin}.`,
          recommendation: `Choose a PSU with at least ${req8}x 8-pin PCIe connectors.`,
          affectedCategories: ['psu', 'gpu'],
        });
      } else {
        results.push({
          id: 'rule-psu-gpu-connectors',
          ruleCategory: 'Power Delivery (PSU)',
          status: 'pass',
          title: `PCIe 8-Pin Power Connectors Verified (${req8} Required / ${psu.connectors.pcie8Pin} Available)`,
          explanation: `${psu.name} supplies all required 8-pin PCIe power connectors for ${gpu.name}.`,
          affectedCategories: ['psu', 'gpu'],
        });
      }
    }
  }

  // 9. Storage M.2 and SATA Slot Availability vs Motherboard & Case Drive Bays
  if (storage.length > 0 && motherboard) {
    const m2Count = storage.filter((d) => d.formFactor === 'M.2 2280').length;
    const sataCount = storage.filter((d) => d.formFactor !== 'M.2 2280').length;

    if (m2Count > motherboard.m2Slots) {
      results.push({
        id: 'rule-storage-m2-slots',
        ruleCategory: 'Storage & Expansion',
        status: 'fail',
        title: `M.2 NVMe Drives Exceed Motherboard Slots (${m2Count} Selected > ${motherboard.m2Slots} M.2 Slots)`,
        explanation: `You selected ${m2Count} M.2 NVMe drive(s), but ${motherboard.name} only has ${motherboard.m2Slots} M.2 slot(s).`,
        recommendation: `Remove ${m2Count - motherboard.m2Slots} M.2 drive(s), consolidate into a single higher-capacity NVMe SSD, or choose a motherboard with ${m2Count}+ M.2 slots.`,
        affectedCategories: ['storage', 'motherboard'],
      });
    } else if (m2Count > 0) {
      results.push({
        id: 'rule-storage-m2-slots',
        ruleCategory: 'Storage & Expansion',
        status: 'pass',
        title: `M.2 NVMe Slot Allocation Valid (${m2Count}/${motherboard.m2Slots} Populated)`,
        explanation: `${motherboard.name} accommodates all ${m2Count} selected M.2 2280 NVMe drive(s).`,
        affectedCategories: ['storage', 'motherboard'],
      });
    }

    if (sataCount > motherboard.sataPorts) {
      results.push({
        id: 'rule-storage-sata-ports',
        ruleCategory: 'Storage & Expansion',
        status: 'fail',
        title: `SATA Drives Exceed Motherboard SATA Ports (${sataCount} > ${motherboard.sataPorts})`,
        explanation: `You selected ${sataCount} SATA drive(s), exceeding ${motherboard.name}'s ${motherboard.sataPorts} SATA III ports.`,
        recommendation: `Reduce SATA drive count to ${motherboard.sataPorts} or fewer.`,
        affectedCategories: ['storage', 'motherboard'],
      });
    } else if (sataCount > 0) {
      results.push({
        id: 'rule-storage-sata-ports',
        ruleCategory: 'Storage & Expansion',
        status: 'pass',
        title: `SATA III Port Allocation Valid (${sataCount}/${motherboard.sataPorts} Populated)`,
        explanation: `${motherboard.name} has sufficient SATA III ports for your ${sataCount} SATA drive(s).`,
        affectedCategories: ['storage', 'motherboard'],
      });
    }

    // Warn if only HDD is selected (no SSD for OS boot)
    const hasSsd = storage.some((d) => d.type === 'NVMe' || d.type === 'SATA SSD');
    if (!hasSsd) {
      results.push({
        id: 'rule-storage-boot-hdd',
        ruleCategory: 'Storage & Expansion',
        status: 'warn',
        title: 'No Solid State Drive (SSD) Selected for OS Boot',
        explanation: 'Your build only contains a mechanical Hard Disk Drive (HDD). Booting Windows/Linux from an HDD results in severe system sluggishness.',
        recommendation: 'Add at least a 500GB or 1TB NVMe M.2 SSD as your primary operating system drive.',
        affectedCategories: ['storage'],
      });
    }
  }

  if (storage.length > 0 && pcCase) {
    const count35 = storage.filter((d) => d.formFactor === '3.5-inch').length;
    const count25 = storage.filter((d) => d.formFactor === '2.5-inch').length;

    if (count35 > pcCase.driveBays35) {
      results.push({
        id: 'rule-storage-case-35',
        ruleCategory: 'Physical Clearance',
        status: 'fail',
        title: `3.5" HDD Count Exceeds Case Drive Bays (${count35} > ${pcCase.driveBays35} Bays)`,
        explanation: `${pcCase.name} only has ${pcCase.driveBays35}x 3.5-inch HDD bay(s), which cannot fit ${count35}x 3.5-inch hard drives.`,
        recommendation: 'Switch to M.2 NVMe / 2.5" SATA SSDs or choose a case with more 3.5" drive cages.',
        affectedCategories: ['storage', 'case'],
      });
    }
    if (count25 > pcCase.driveBays25 + pcCase.driveBays35) {
      results.push({
        id: 'rule-storage-case-25',
        ruleCategory: 'Physical Clearance',
        status: 'fail',
        title: `2.5" SSD Count Exceeds Case Mounts (${count25} Drives)`,
        explanation: `${pcCase.name} does not have enough 2.5" mounting trays for ${count25} SATA SSDs.`,
        recommendation: 'Use M.2 NVMe SSDs which mount directly onto the motherboard.',
        affectedCategories: ['storage', 'case'],
      });
    }
  }

  const passedCount = results.filter((r) => r.status === 'pass').length;
  const warningCount = results.filter((r) => r.status === 'warn').length;
  const failureCount = results.filter((r) => r.status === 'fail').length;

  let overallStatus: CompatibilityStatus = 'pass';
  if (failureCount > 0) {
    overallStatus = 'fail';
  } else if (warningCount > 0) {
    overallStatus = 'warn';
  }

  const score = Math.max(
    0,
    Math.min(100, 100 - failureCount * 25 - warningCount * 8)
  );

  return {
    overallStatus,
    score,
    estimatedWattage: power,
    results,
    passedCount,
    warningCount,
    failureCount,
  };
}

/**
 * Checks whether a candidate component would introduce a failure or warning
 * if placed into the current build state (used to badge items live in the Part Picker).
 */
export function checkCandidatePartCompatibility(
  currentBuild: PCBuildState,
  candidate: AnyComponent
): {
  compatible: boolean;
  status: CompatibilityStatus;
  reasons: string[];
} {
  const testBuild: PCBuildState = {
    ...currentBuild,
    storage: [...currentBuild.storage],
  };

  switch (candidate.category) {
    case 'cpu':
      testBuild.cpu = candidate;
      break;
    case 'motherboard':
      testBuild.motherboard = candidate;
      break;
    case 'ram':
      testBuild.ram = candidate;
      break;
    case 'gpu':
      testBuild.gpu = candidate;
      break;
    case 'psu':
      testBuild.psu = candidate;
      break;
    case 'case':
      testBuild.case = candidate;
      break;
    case 'cooler':
      testBuild.cooler = candidate;
      break;
    case 'storage':
      testBuild.storage = [...currentBuild.storage, candidate];
      break;
  }

  const report = evaluateCompatibility(testBuild);
  const relevantFailures = report.results.filter(
    (r) =>
      r.status === 'fail' &&
      r.affectedCategories.includes(candidate.category) &&
      // Ignore missing GPU error when picking a CPU unless the user is specifically inspecting it
      r.id !== 'rule-display-output'
  );
  const relevantWarnings = report.results.filter(
    (r) =>
      r.status === 'warn' && r.affectedCategories.includes(candidate.category)
  );

  if (relevantFailures.length > 0) {
    return {
      compatible: false,
      status: 'fail',
      reasons: relevantFailures.map((f) => f.title),
    };
  }
  if (relevantWarnings.length > 0) {
    return {
      compatible: true,
      status: 'warn',
      reasons: relevantWarnings.map((w) => w.title),
    };
  }

  return {
    compatible: true,
    status: 'pass',
    reasons: [],
  };
}
