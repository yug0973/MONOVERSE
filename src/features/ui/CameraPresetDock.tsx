import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Layers, Armchair, BedDouble, UtensilsCrossed, SunMedium } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ALL_FLATS } from '../../data/buildingData';
import { FlatData } from '../../types/building';

interface CameraPreset {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  viewMode: 'building' | 'floor_slice' | 'dollhouse' | 'walkthrough';
  roomId?: string;
}

const PRESETS: CameraPreset[] = [
  { id: 'tower', label: 'Tower Orbit', icon: Building2, viewMode: 'building' },
  { id: 'floor', label: 'Floor Slice', icon: Layers, viewMode: 'floor_slice' },
  { id: 'living', label: 'Living Salon', icon: Armchair, viewMode: 'walkthrough', roomId: 'living_dining' },
  { id: 'master', label: 'Master Suite', icon: BedDouble, viewMode: 'walkthrough', roomId: 'master_bedroom' },
  { id: 'kitchen', label: 'Chef Kitchen', icon: UtensilsCrossed, viewMode: 'walkthrough', roomId: 'kitchen' },
  { id: 'balcony', label: 'Sky Sundeck', icon: SunMedium, viewMode: 'walkthrough', roomId: 'balcony' },
];

export const CameraPresetDock: React.FC = () => {
  const {
    viewMode,
    activeRoomId,
    selectedFloorNumber,
    selectedFlatId,
    setViewMode,
    selectFloor,
    selectFlat,
    enterRoom,
  } = useAppStore();

  // Hide in walkthrough or panorama modes so room navigation HUD has unobstructed view
  if (viewMode === 'walkthrough' || viewMode === 'panorama' || viewMode === 'flat_flyin') return null;

  const handleSelectPreset = (preset: CameraPreset) => {
    if (preset.id === 'tower') {
      setViewMode('building');
      return;
    }

    if (preset.id === 'floor') {
      if (!selectedFloorNumber) {
        selectFloor(9); // Default to scenic floor 9
      } else {
        setViewMode('floor_slice');
      }
      return;
    }

    // Inside-flat room presets
    let currentFlatId = selectedFlatId;
    if (!currentFlatId) {
      // Find an available flat on chosen floor or floor 9
      const targetFloor = selectedFloorNumber || 9;
      const availableFlat =
        ALL_FLATS.find((f: FlatData) => f.floorNumber === targetFloor && f.status === 'AVAILABLE') ||
        ALL_FLATS.find((f: FlatData) => f.status === 'AVAILABLE');
      if (availableFlat) {
        selectFlat(availableFlat.id);
        currentFlatId = availableFlat.id;
      }
    }

    if (preset.roomId) {
      enterRoom(preset.roomId);
    }
  };

  const isPresetActive = (preset: CameraPreset) => {
    if (preset.id === 'tower') return viewMode === 'building' || viewMode === 'landing';
    if (preset.id === 'floor') return viewMode === 'floor_slice';
    if (preset.roomId && activeRoomId === preset.roomId) return true;
    return false;
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      aria-label="Cinematic Camera Views"
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[94vw]"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-[#0A101C]/85 backdrop-blur-xl border border-white/15 shadow-elevation">
        <span className="hidden lg:inline-block px-3 text-[10px] uppercase tracking-widest font-mono text-white/70 border-r border-white/15">
          Cinematic Views
        </span>

        {PRESETS.map((preset) => {
          const active = isPresetActive(preset);
          const Icon = preset.icon;

          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-sans transition-all duration-200 shrink-0 ${
                active
                  ? 'bg-accent-terracotta text-white shadow-soft font-medium'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={preset.label}
              aria-pressed={active}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </motion.aside>
  );
};
