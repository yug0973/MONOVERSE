import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { Button } from '../../shared/ui/Button';
import { Drawer } from '../../shared/ui/Drawer';
import { ARCHITECTURAL_SPECS } from '../../data/architecturalSpecs';
import { TimeOfDay } from '../../types/customizer';
import {
  Layers,
  ArrowLeft,
  Move,
  Home,
  Grid,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getShortRoomName = (name: string = ''): string => {
  if (name.includes('Living')) return 'Living & Dining';
  if (name.includes('Junior')) return 'Junior Suite';
  if (name.includes('Presidential') || name.includes('Master')) return 'Master Suite';
  if (name.includes('Kitchen')) return 'Kitchen';
  if (name.includes('Sky Deck') || name.includes('Balcony') || name.includes('Terrace')) return 'Sky Deck';
  if (name.includes('Lounge')) return 'Family Lounge';
  if (name.includes('Foyer') || name.includes('Vestibule') || name.includes('Entrance')) return 'Front Foyer';
  return name.length > 16 ? name.slice(0, 14) + '...' : name;
};

export const WalkthroughControls: React.FC = () => {
  const {
    viewMode,
    selectedFloorNumber,
    selectedFlatId,
    activeRoomId,
    customization,
    setTimeOfDay,
    enterRoom,
    exitToDollhouse,
    exitToFloor,
    exitToBuilding,
  } = useAppStore();

  const [isSpecsDrawerOpen, setIsSpecsDrawerOpen] = useState(false);

  const isWalkthrough = viewMode === 'walkthrough';
  const isFoyerEntry = viewMode === 'foyer_entry';
  const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
  const currentRoom = flat?.rooms.find((r) => r.id === activeRoomId);

  // Desktop keyboard listener (Escape to exit to floor cutaway)
  useEffect(() => {
    if (!isWalkthrough && !isFoyerEntry) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSpecsDrawerOpen) {
          setIsSpecsDrawerOpen(false);
        } else {
          exitToFloor();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWalkthrough, isFoyerEntry, exitToFloor, isSpecsDrawerOpen]);

  const shortName = getShortRoomName(currentRoom?.name || 'Front Foyer');

  const lightingPresets: Array<{ id: TimeOfDay; label: string; icon: React.ReactNode }> = [
    { id: 'morning', label: 'Day', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'golden_hour', label: 'Sunset', icon: <Sunset className="w-3.5 h-3.5" /> },
    { id: 'night', label: 'Night', icon: <Moon className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <AnimatePresence>
        {(isWalkthrough || isFoyerEntry) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between"
          >
            {/* Top Bar HUD */}
            <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-30 pointer-events-auto flex items-center justify-between gap-2">
              {/* Residence & Location Info Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas-light/90 backdrop-blur-md border border-canvas-muted shadow-card shrink-0">
                <Home className="w-3.5 h-3.5 text-accent-terracotta shrink-0" />
                <div className="text-[11px] sm:text-xs">
                  {flat && (
                    <span className="font-semibold text-ink-primary mr-1.5">
                      Fl {selectedFloorNumber} · Unit {flat.unitNumber}
                    </span>
                  )}
                  <span className="text-ink-muted hidden md:inline">| Inside: </span>
                  <strong className="text-accent-terracotta font-medium">
                    {isFoyerEntry ? 'Approaching Foyer...' : shortName}
                  </strong>
                  {currentRoom && !isFoyerEntry && (
                    <span className="text-ink-muted ml-1 text-[10px] sm:text-[11px]">
                      ({currentRoom.areaSqFt} sq ft)
                    </span>
                  )}
                </div>
              </div>

              {/* Center: Atmospheric Lighting Mood Presets */}
              <div className="hidden sm:flex items-center p-0.5 rounded-full bg-canvas-light/90 backdrop-blur-md border border-canvas-muted shadow-card shrink-0">
                {lightingPresets.map((preset) => {
                  const isActive = customization.timeOfDay === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setTimeOfDay(preset.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-ink-primary text-canvas shadow-soft'
                          : 'text-ink-muted hover:text-ink-primary'
                      }`}
                      title={`Switch lighting to ${preset.label}`}
                    >
                      {preset.icon}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSpecsDrawerOpen(true)}
                  icon={<Sparkles className="w-3.5 h-3.5 text-accent-brass" />}
                  className="shadow-card text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3"
                  title="View Architectural Finishes & Specifications"
                >
                  <span className="hidden sm:inline">Finishes & Specs</span>
                  <span className="sm:hidden">Specs</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={exitToFloor}
                  icon={<Grid className="w-3.5 h-3.5" />}
                  className="shadow-card text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3"
                  title="Return to Floor Cutaway (Esc)"
                >
                  <span className="hidden sm:inline">Floor Plan</span>
                  <span className="sm:hidden">Floor</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={exitToDollhouse}
                  icon={<Layers className="w-3.5 h-3.5" />}
                  className="shadow-card text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3"
                  title="View 3D Dollhouse Cutaway"
                >
                  <span className="hidden sm:inline">Dollhouse</span>
                  <span className="sm:hidden">3D</span>
                </Button>

                <button
                  onClick={exitToBuilding}
                  className="p-1.5 rounded-full bg-canvas-light/90 backdrop-blur-md border border-canvas-muted text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors shadow-card"
                  title="Back to Tower Explorer"
                  aria-label="Back to Tower Explorer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom: Luxury Room Switcher Dock & Subtle Guide */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 pointer-events-auto flex flex-col items-center gap-1.5">
              {/* Room Dock */}
              {flat && (
                <div className="flex items-center gap-1 p-1 rounded-full bg-canvas-light/95 backdrop-blur-md border border-canvas-muted shadow-elevation max-w-full overflow-x-auto">
                  {flat.rooms.map((room) => {
                    const isActive = room.id === activeRoomId;
                    return (
                      <button
                        key={room.id}
                        onClick={() => enterRoom(room.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-accent-terracotta text-canvas shadow-soft'
                            : 'text-ink-primary hover:bg-canvas-subtle'
                        }`}
                        title={`Glide to ${room.name}`}
                      >
                        <span>{getShortRoomName(room.name)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Minimal Navigation Hint */}
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-ink-muted/80 bg-canvas-light/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-canvas-muted/40 select-none">
                <Move className="w-2.5 h-2.5 text-accent-terracotta" />
                <span>Click floor or use WASD to walk · Drag to look · Esc to exit</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Slide-Over Drawer for Architectural Specifications (Never blocks 3D view) */}
      <Drawer
        isOpen={isSpecsDrawerOpen}
        onClose={() => setIsSpecsDrawerOpen(false)}
        title="Architectural Specifications"
        subtitle="Curated luxury finishes and structural engineering across Residence 12-A"
        position="right"
      >
        <div className="space-y-4 py-2">
          {ARCHITECTURAL_SPECS.map((spec) => (
            <div
              key={spec.id}
              className="p-3.5 rounded-xl bg-canvas-subtle/80 border border-canvas-muted text-ink-primary space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-accent-terracotta/15 text-accent-terracotta">
                  {spec.category}
                </span>
                <span className="text-[10px] text-ink-muted">{spec.subtitle}</span>
              </div>

              <div>
                <h4 className="font-serif text-sm font-semibold text-ink-primary">
                  {spec.title}
                </h4>
                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  {spec.description}
                </p>
              </div>

              {/* Specifications grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-canvas-muted/60 text-[10px] sm:text-[11px]">
                {spec.specifications.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-ink-muted flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      {item.label}
                    </span>
                    <strong className="text-ink-primary font-medium mt-0.5">
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};
