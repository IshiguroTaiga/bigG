import React, { Suspense, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import { PartCategory, PCBuildState } from '../types/pc';
import { evaluateCompatibility } from '../engine/compatibilityEngine';
import { CaseVisualizer2D } from './CaseVisualizer2D';

interface CaseVisualizer3DProps {
  build: PCBuildState;
  activeCategory: PartCategory;
  onSelectCategory: (cat: PartCategory) => void;
}

class ThreeErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const PCInteriorScene: React.FC<CaseVisualizer3DProps> = ({
  build,
  activeCategory,
  onSelectCategory,
}) => {
  const compat = evaluateCompatibility(build);

  const hasConflict = (cat: PartCategory) =>
    compat.results.some((r) => r.status === 'fail' && r.affectedCategories.includes(cat));
  const hasWarning = (cat: PartCategory) =>
    compat.results.some((r) => r.status === 'warn' && r.affectedCategories.includes(cat));

  const getPartColor = (cat: PartCategory, presentColor: string, emptyColor = '#334155') => {
    if (hasConflict(cat)) return '#f43f5e';
    if (hasWarning(cat)) return '#f59e0b';
    if (activeCategory === cat) return '#38bdf8';
    return presentColor || emptyColor;
  };

  // Scale GPU length visually in 3D space (100mm = 1.0 unit)
  const gpuLengthUnits = build.gpu ? Math.min(3.5, Math.max(1.5, build.gpu.lengthMm / 105)) : 2.0;
  const coolerHeightUnits = build.cooler
    ? build.cooler.type === 'AIO'
      ? 0.42
      : Math.min(1.5, Math.max(0.45, build.cooler.heightMm / 115))
    : 0.5;

  return (
    <group position={[0, -0.1, 0]}>
      {/* Ambient & Directional Studio Lights */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 6]} intensity={1.3} />
      <pointLight position={[-4, 3, 4]} intensity={0.6} color="#38bdf8" />

      {/* Outer PC Case Frame */}
      <group onClick={(e) => { e.stopPropagation(); onSelectCategory('case'); }}>
        {/* Backplate tray */}
        <RoundedBox args={[4.2, 4.4, 0.14]} position={[0, 0, -0.95]} radius={0.05}>
          <meshStandardMaterial
            color={getPartColor('case', build.case ? '#1e293b' : '#0f172a')}
            metalness={0.5}
            roughness={0.4}
          />
        </RoundedBox>
        {/* Bottom Plate */}
        <RoundedBox args={[4.2, 0.14, 2.0]} position={[0, -2.15, 0]} radius={0.04}>
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
        </RoundedBox>
        {/* Top Plate */}
        <RoundedBox args={[4.2, 0.14, 2.0]} position={[0, 2.15, 0]} radius={0.04}>
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
        </RoundedBox>
        {/* Rear Panel */}
        <RoundedBox args={[0.14, 4.4, 2.0]} position={[-2.05, 0, 0]} radius={0.04}>
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
        </RoundedBox>
        {/* Front Mesh Frame */}
        <RoundedBox args={[0.12, 4.4, 2.0]} position={[2.05, 0, 0]} radius={0.04}>
          <meshStandardMaterial
            color={hasConflict('case') ? '#f43f5e' : '#334155'}
            transparent
            opacity={0.45}
          />
        </RoundedBox>
      </group>

      {/* Motherboard PCB */}
      <group
        position={[-0.45, 0.35, -0.78]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCategory('motherboard');
        }}
      >
        <RoundedBox
          args={[
            build.motherboard?.formFactor === 'Mini-ITX'
              ? 1.9
              : build.motherboard?.formFactor === 'Micro-ATX'
              ? 2.35
              : 2.65,
            build.motherboard?.formFactor === 'Mini-ITX'
              ? 1.9
              : build.motherboard?.formFactor === 'Micro-ATX'
              ? 2.35
              : 2.85,
            0.12,
          ]}
          radius={0.04}
        >
          <meshStandardMaterial
            color={getPartColor('motherboard', build.motherboard ? '#0f766e' : '#1e293b')}
            metalness={0.4}
            roughness={0.5}
          />
        </RoundedBox>
      </group>

      {/* CPU Socket & Chip */}
      <group
        position={[-0.65, 0.72, -0.65]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCategory('cpu');
        }}
      >
        <RoundedBox args={[0.68, 0.68, 0.12]} radius={0.03}>
          <meshStandardMaterial
            color={getPartColor('cpu', build.cpu ? '#10b981' : '#475569')}
            metalness={0.7}
            roughness={0.25}
          />
        </RoundedBox>
      </group>

      {/* CPU Cooler (Tower or AIO Block + Top Radiator) */}
      {build.cooler && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectCategory('cooler');
          }}
        >
          <RoundedBox
            args={[0.78, 0.78, coolerHeightUnits]}
            position={[-0.65, 0.72, -0.55 + coolerHeightUnits / 2]}
            radius={0.05}
          >
            <meshStandardMaterial
              color={getPartColor('cooler', '#0284c7')}
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={0.88}
            />
          </RoundedBox>
          {build.cooler.type === 'AIO' && (
            <RoundedBox
              args={[build.cooler.radiatorSizeMm === 360 ? 2.9 : 2.1, 0.25, 1.2]}
              position={[-0.1, 1.92, 0]}
              radius={0.04}
            >
              <meshStandardMaterial
                color={getPartColor('cooler', '#0ea5e9')}
                metalness={0.5}
                roughness={0.4}
              />
            </RoundedBox>
          )}
        </group>
      )}

      {/* RAM Modules */}
      <group
        position={[0.12, 0.72, -0.52]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCategory('ram');
        }}
      >
        {[0, 1, 2, 3].map((idx) => {
          const modules = build.ram ? build.ram.modules : 2;
          const activeStick = build.ram && idx < modules;
          const stickDepth = build.ram ? Math.max(0.28, build.ram.heightMm / 110) : 0.28;
          return (
            <RoundedBox
              key={idx}
              args={[0.07, 0.72, stickDepth]}
              position={[idx * 0.12, 0, stickDepth / 2 - 0.1]}
              radius={0.015}
            >
              <meshStandardMaterial
                color={
                  activeStick
                    ? getPartColor('ram', build.ram?.rgb ? '#a855f7' : '#10b981')
                    : '#334155'
                }
                emissive={activeStick && build.ram?.rgb ? '#7e22ce' : '#000000'}
                emissiveIntensity={0.35}
              />
            </RoundedBox>
          );
        })}
      </group>

      {/* Graphics Card (GPU) */}
      <group
        position={[-1.7 + gpuLengthUnits / 2, -0.22, -0.15]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCategory('gpu');
        }}
      >
        <RoundedBox
          args={[
            gpuLengthUnits,
            build.gpu ? Math.max(0.38, build.gpu.slotWidth * 0.16) : 0.36,
            1.05,
          ]}
          radius={0.05}
        >
          <meshStandardMaterial
            color={getPartColor('gpu', build.gpu ? '#059669' : '#334155')}
            metalness={0.6}
            roughness={0.3}
            transparent={!build.gpu}
            opacity={build.gpu ? 1 : 0.45}
          />
        </RoundedBox>
      </group>

      {/* Storage Bay */}
      <group
        position={[1.38, 0.55, -0.5]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCategory('storage');
        }}
      >
        <RoundedBox args={[0.85, 1.25, 0.45]} radius={0.04}>
          <meshStandardMaterial
            color={getPartColor(
              'storage',
              build.storage.length > 0 ? '#0284c7' : '#334155'
            )}
            metalness={0.4}
            roughness={0.5}
          />
        </RoundedBox>
      </group>

      {/* Power Supply (PSU Shroud at Bottom) */}
      <group
        position={[-0.65, -1.62, -0.15]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCategory('psu');
        }}
      >
        <RoundedBox args={[2.3, 0.78, 1.35]} radius={0.05}>
          <meshStandardMaterial
            color={getPartColor('psu', build.psu ? '#d97706' : '#1e293b')}
            metalness={0.5}
            roughness={0.4}
          />
        </RoundedBox>
      </group>
    </group>
  );
};

export const CaseVisualizer3D: React.FC<CaseVisualizer3DProps> = (props) => {
  return (
    <ThreeErrorBoundary fallback={<CaseVisualizer2D {...props} />}>
      <div className="w-full h-[380px] rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
              Loading 3D Interactive Chassis...
            </div>
          }
        >
          <Canvas camera={{ position: [0, 0.5, 5.8], fov: 44 }}>
            <PCInteriorScene {...props} />
            <OrbitControls
              enablePan={false}
              minDistance={3.8}
              maxDistance={8.5}
              maxPolarAngle={Math.PI / 1.8}
            />
          </Canvas>
        </Suspense>
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
          <span>🖱️ Drag to rotate 3D chassis • Scroll to zoom • Click any component slot</span>
          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-emerald-400">
            WebGL 3D View
          </span>
        </div>
      </div>
    </ThreeErrorBoundary>
  );
};
