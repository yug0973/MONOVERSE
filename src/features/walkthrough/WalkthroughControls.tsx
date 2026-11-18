import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { Button } from '../../shared/ui/Button';
import { Layers, ArrowLeft, Move, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getShortRoomName = (name: string = ''): string => {
  if (name.includes('Living')) return 'Living & Dining';
  if (name.includes('Junior')) return 'Junior Suite';
  if (name.includes('Presidential') || name.includes('Master')) return 'Master Suite';
  if (name.includes('Kitchen')) return 'Kitchen';
  if (name.includes('Sky Deck') || name.includes('Balcony')) return 'Sky Deck';
  if (name.includes('Lounge')) return 'Family Lounge';
  if (name.includes('Foyer') || name.includes('Vestibule')) return 'Foyer';
  return name.length > 16 ? name.slice(0, 14) + '...' : name;
};

export const WalkthroughControls: React.FC = () => {
  const {
    viewMode,
    selectedFlatId,
    activeRoomId,
    exitToDollhouse,
    exitToBuilding,
  } = useAppStore();

  const isWalkthrough = viewMode === 'walkthrough';
  const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
  const currentRoom = flat?.rooms.find((r) => r.id === activeRoomId);

  // Desktop keyboard listener (Escape to exit to dollhouse)
  useEffect(() => {
    if (!isWalkthrough) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitToDollhouse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWalkthrough, exitToDollhouse]);

  const shortName = getShortRoomName(currentRoom?.name);

  return (
    <AnimatePresence>
      {isWalkthrough && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between"
        >
          {/* Top Bar HUD: on mobile below compass with space-between, on desktop next to compass at top-4 */}
          <div className="absolute top-[72px] left-3 right-3 sm:top-4 sm:left-52 sm:right-auto z-30 pointer-events-auto flex items-center justify-between sm:justify-start gap-2">
            {/* Room Location Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-canvas-light/95 backdrop-blur-md border border-canvas-muted shadow-card shrink-0">
              <Home className="w-3.5 h-3.5 text-accent-terracotta shrink-0" />
              <div className="text-[11px] sm:text-xs">
                <span className="hidden md:inline text-ink-muted">Inside: </span>
                <strong className="text-ink-primary font-medium">
                  {shortName}
                </strong>
                {currentRoom && (
                  <span className="text-ink-muted ml-1 text-[10px] sm:text-[11px]">({currentRoom.areaSqFt} sq ft)</span>
                )}
              </div>
            </div>

            {/* Actions group */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={exitToDollhouse}
                icon={<Layers className="w-3.5 h-3.5" />}
                className="shadow-card text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3"
              >
                <span className="hidden sm:inline">Dollhouse Cutaway</span>
                <span className="sm:hidden">Cutaway</span>
              </Button>

              <button
                onClick={exitToBuilding}
                className="p-1 sm:p-1.5 rounded-full bg-canvas-light/95 backdrop-blur-md border border-canvas-muted text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors shadow-card"
                title="Back to Tower Explorer"
                aria-label="Back to Tower Explorer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Center Interaction Guide */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-ink-primary/90 text-canvas backdrop-blur-md text-[11px] sm:text-xs shadow-elevation select-none whitespace-nowrap">
              <Move className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent-brass animate-pulse" />
              <span>Drag to look around · Click room hotspots to glide</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
