import React from 'react';
import { Html } from '@react-three/drei';
import { Sparkles, Utensils, Coffee, Sofa } from 'lucide-react';

interface HotspotDefinition {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  xPercent: number;
  yPercent: number;
  targetRoomId: string;
}

const PANORAMA_HOTSPOTS: HotspotDefinition[] = [
  {
    id: 'hs-balcony',
    label: 'Balcony Sundeck',
    sublabel: 'Skyline view',
    icon: <Coffee className="w-3.5 h-3.5" />,
    xPercent: 51.0,
    yPercent: 52.0,
    targetRoomId: 'balcony',
  },
  {
    id: 'hs-living',
    label: 'Living Salon',
    sublabel: 'Double-height volume',
    icon: <Sofa className="w-3.5 h-3.5" />,
    xPercent: 30.0,
    yPercent: 62.0,
    targetRoomId: 'living',
  },
  {
    id: 'hs-dining',
    label: 'Master Bedroom',
    sublabel: 'Private sanctuary',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    xPercent: 76.0,
    yPercent: 64.0,
    targetRoomId: 'bedroom',
  },
  {
    id: 'hs-kitchen',
    label: 'Modular Kitchen',
    sublabel: 'German hardware',
    icon: <Utensils className="w-3.5 h-3.5" />,
    xPercent: 92.0,
    yPercent: 52.0,
    targetRoomId: 'kitchen',
  },
];

/**
 * Senior Architectural Panorama Hotspots (Module 4)
 * - Converts equirectangular percentage coordinates to 3D spherical positions:
 *   yaw = (x/W - 0.5) * 360, pitch = (0.5 - y/H) * 180
 * - Inverted normals coordinate mapping matching equirectangular sphere.
 */
export const PanoramaHotspots: React.FC = () => {
  const radius = 22.0; // Place hotspots on an 22m radius sphere around camera

  const handleHotspotClick = (hs: HotspotDefinition) => {
    // Notify window or store of hotspot click
    const evt = new CustomEvent('panorama-hotspot-select', { detail: hs });
    window.dispatchEvent(evt);
  };

  return (
    <group name="panorama-hotspots">
      {PANORAMA_HOTSPOTS.map((hs) => {
        // Spec formula:
        // yaw = (x/W - 0.5) * 360, pitch = (0.5 - y/H) * 180
        const yawDeg = (hs.xPercent / 100 - 0.5) * 360;
        const pitchDeg = (0.5 - hs.yPercent / 100) * 180;

        const yawRad = (yawDeg * Math.PI) / 180;
        const pitchRad = (pitchDeg * Math.PI) / 180;

        // Spherical to 3D Cartesian (mapped for inverted sphere scale [-1, 1, 1])
        const x = -radius * Math.cos(pitchRad) * Math.sin(yawRad);
        const y = radius * Math.sin(pitchRad);
        const z = radius * Math.cos(pitchRad) * Math.cos(yawRad);

        return (
          <group key={hs.id} position={[x, y, z]}>
            <Html center distanceFactor={26} style={{ pointerEvents: 'auto' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHotspotClick(hs);
                }}
                className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas-light/95 hover:bg-white text-ink-primary backdrop-blur-md border border-accent-terracotta/40 hover:border-accent-terracotta shadow-elevation transition-all active:scale-95 cursor-pointer select-none"
                title={`Explore ${hs.label}`}
              >
                {/* Glowing Pulsing Terracotta Core */}
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-accent-terracotta text-white shadow-[0_0_12px_#C85A32]">
                  <span className="absolute inset-0 rounded-full bg-accent-terracotta animate-ping opacity-35" />
                  {hs.icon}
                </div>

                {/* Hotspot Typography */}
                <div className="text-left pr-1">
                  <div className="text-xs font-serif font-semibold text-ink-primary leading-tight group-hover:text-accent-terracotta transition-colors">
                    {hs.label}
                  </div>
                  <div className="text-[9px] text-ink-muted font-sans leading-none">
                    {hs.sublabel}
                  </div>
                </div>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
