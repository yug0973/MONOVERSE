import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ArchSpecItem {
  id: string;
  title: string;
  category: 'Flooring' | 'Millwork' | 'Glazing' | 'Timber' | 'Balcony';
  subtitle: string;
  position: [number, number, number];
  description: string;
  specifications: { label: string; value: string }[];
}

export const ARCHITECTURAL_SPECS: ArchSpecItem[] = [
  {
    id: 'spec-foyer-portal',
    title: 'Solid Teak Fluted Portal',
    category: 'Millwork',
    subtitle: 'Private Vestibule Entrance',
    position: [0.0, 1.4, -2.2],
    description:
      'Grand 2.7m floor-to-ceiling pivot portal crafted in solid reclaimed Burma teak with concealed magnetic hinges and biometric smart lock integration.',
    specifications: [
      { label: 'Material', value: 'Grade-A Burma Teak' },
      { label: 'Height', value: '2700mm Floor-to-Ceiling' },
      { label: 'Hardware', value: 'FritsJurgens Pivot' },
      { label: 'Security', value: 'Fingerprint + RFID + Key' },
    ],
  },
  {
    id: 'spec-marble',
    title: 'Italian Statuario Marble',
    category: 'Flooring',
    subtitle: 'Living & Dining Hall',
    position: [7.2, 0.45, -8.5],
    description:
      'Hand-selected 2400x1200mm bookmatched Italian marble slabs with honed satin finish and zero-grout seamless joints.',
    specifications: [
      { label: 'Origin', value: 'Carrara, Italy' },
      { label: 'Thickness', value: '20mm Solid Slab' },
      { label: 'Finish', value: 'Honed Silk Matte' },
      { label: 'Treatment', value: 'Deep Seal Nanocoating' },
    ],
  },
  {
    id: 'spec-kitchen',
    title: 'German Blum Modular Kitchen',
    category: 'Millwork',
    subtitle: 'Island Kitchen & Dry Store',
    position: [7.2, 1.15, -3.5],
    description:
      'Bespoke center quartz island with integrated soft-close Blum tandembox runners and fluted natural oak veneer.',
    specifications: [
      { label: 'Hardware', value: 'Blum Motion Soft-Close' },
      { label: 'Countertop', value: 'Silestone Quartz 18mm' },
      { label: 'Veneer', value: 'European White Oak' },
      { label: 'Lighting', value: '3000K Diffused LED' },
    ],
  },
  {
    id: 'spec-glazing',
    title: 'Acoustic Double-Glazed Facade',
    category: 'Glazing',
    subtitle: 'Floor-to-Ceiling Windows',
    position: [7.8, 1.4, -13.6],
    description:
      'Heavy-duty thermal break aluminium sliding systems with double-glazed low-E toughened acoustic glass.',
    specifications: [
      { label: 'System', value: 'Schüco Slimline Sliding' },
      { label: 'Glass', value: '8mm + 12mm Air + 8mm Low-E' },
      { label: 'Acoustics', value: '38 dB Sound Reduction' },
      { label: 'UV Cut', value: '99.2% Solar Heat Gain' },
    ],
  },
  {
    id: 'spec-bedroom-wood',
    title: 'Engineered European Oak',
    category: 'Timber',
    subtitle: 'Master Suite Flooring',
    position: [-8.5, 0.45, -9.5],
    description:
      'Premium European white oak planks with wire-brushed texture, bevelled edges, and UV matte lacquer.',
    specifications: [
      { label: 'Wood Species', value: 'Quercus Robur (Oak)' },
      { label: 'Construction', value: '3-Ply Multi-layer Core' },
      { label: 'Plank Size', value: '190mm x 1900mm' },
      { label: 'Emission', value: 'E0 Eco-Certified' },
    ],
  },
  {
    id: 'spec-balcony',
    title: 'Panoramic Glass Balustrade',
    category: 'Balcony',
    subtitle: 'Sundeck Sky Terrace',
    position: [7.8, 1.15, -16.2],
    description:
      'Continuous frameless structural glass balustrades offering an uninterrupted 180° vista of the Vadodara skyline.',
    specifications: [
      { label: 'Safety', value: '15mm Toughened Laminated' },
      { label: 'Handrail', value: 'Flush Anodized Bronze Profile' },
      { label: 'Drainage', value: 'Concealed Perimeter Scupper' },
      { label: 'Wind Rating', value: 'Up to 180 km/h Tested' },
    ],
  },
];

interface SpecPinProps {
  item: ArchSpecItem;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const SpecPin: React.FC<SpecPinProps> = ({ item, isOpen, onToggle, onClose }) => {
  const pinRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (pinRef.current) {
      const t = state.clock.getElapsedTime();
      pinRef.current.position.y = item.position[1] + Math.sin(t * 2.5 + item.position[0]) * 0.04;
    }
  });

  return (
    <group ref={pinRef} position={item.position}>
      {/* 3D Interactive Pin Mesh */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={isHovered || isOpen ? '#BA5D38' : '#9E7D47'}
          emissive={isHovered || isOpen ? '#BA5D38' : '#6B542F'}
          emissiveIntensity={isHovered || isOpen ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Pulsing subtle aura ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[0.12, 0.16, 24]} />
        <meshBasicMaterial
          color={isHovered || isOpen ? '#BA5D38' : '#C4A468'}
          transparent
          opacity={isHovered || isOpen ? 0.8 : 0.45}
        />
      </mesh>

      {/* Floating 2D/3D Info Badge / Modal */}
      <Html position={[0, 0.18, 0]} center distanceFactor={14} pointerEvents="none">
        <div className="relative select-none pointer-events-auto">
          {/* Subtle Collapsed Pin Label */}
          {!isOpen && (
            <button
              onClick={onToggle}
              className={`px-2.5 py-1 rounded-full shadow-elevation backdrop-blur-md text-[10px] sm:text-xs font-sans font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isHovered
                  ? 'bg-ink-primary text-canvas scale-105 ring-2 ring-accent-terracotta'
                  : 'bg-canvas-light/90 text-ink-primary border border-canvas-muted'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 text-accent-brass" />
              <span>{item.title}</span>
            </button>
          )}

          {/* Expanded Specification Card */}
          {isOpen && (
            <div className="w-72 sm:w-80 p-4 rounded-xl bg-canvas-light/95 backdrop-blur-lg border border-accent-terracotta/40 shadow-elevation text-ink-primary animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-canvas-muted/80 pb-2.5 mb-2.5">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-accent-terracotta/15 text-accent-terracotta mb-1">
                    {item.category} Specification
                  </span>
                  <h4 className="font-serif text-base font-semibold leading-tight text-ink-primary">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-ink-muted">{item.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-ink-muted hover:text-ink-primary rounded-md hover:bg-canvas-subtle transition-colors"
                  title="Close Specification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                {item.description}
              </p>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 bg-canvas-subtle/60 rounded-lg p-2.5 text-[11px] border border-canvas-muted/50">
                {item.specifications.map((spec, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[10px] text-ink-muted flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      {spec.label}
                    </span>
                    <strong className="text-ink-primary font-medium text-[11px] mt-0.5">
                      {spec.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

export const ArchitecturalSpecHotspots: React.FC = () => {
  const [activeSpecId, setActiveSpecId] = useState<string | null>(null);

  return (
    <group>
      {ARCHITECTURAL_SPECS.map((spec) => (
        <SpecPin
          key={spec.id}
          item={spec}
          isOpen={activeSpecId === spec.id}
          onToggle={() =>
            setActiveSpecId((curr) => (curr === spec.id ? null : spec.id))
          }
          onClose={() => setActiveSpecId(null)}
        />
      ))}
    </group>
  );
};
