import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BUILDING_FLOORS } from '../../data/buildingData';
import { Layers, ChevronUp, ChevronDown, X } from 'lucide-react';

export const FloorSelector: React.FC = () => {
  const {
    viewMode,
    selectedFloorNumber,
    hoveredFloorNumber,
    selectFloor,
    setHoveredFloor,
  } = useAppStore();

  const isVisible = viewMode === 'building' || viewMode === 'floor_slice';
  if (!isVisible) return null;

  // Residential floors in descending order (14 down to 1)
  const residentialFloors = [...BUILDING_FLOORS.slice(1)].reverse();

  const handleNextFloor = () => {
    const current = selectedFloorNumber || 1;
    if (current < 14) selectFloor(current + 1);
  };

  const handlePrevFloor = () => {
    const current = selectedFloorNumber || 14;
    if (current > 1) selectFloor(current - 1);
  };

  return (
    <aside
      aria-label="Floor Navigator"
      className="absolute left-4 sm:left-6 top-20 bottom-24 z-20 flex flex-col justify-between pointer-events-none select-none"
    >
      <div className="bg-canvas/90 backdrop-blur-md border border-canvas-muted rounded-lg p-2.5 shadow-card pointer-events-auto flex flex-col max-h-full">
        {/* Header indicator */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-canvas-muted gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-primary">
            <Layers className="w-3.5 h-3.5 text-accent-terracotta" />
            <span className="hidden sm:inline">Floors</span>
          </div>

          {selectedFloorNumber !== null && (
            <button
              onClick={() => selectFloor(null)}
              title="Close floor slice"
              className="p-1 text-ink-muted hover:text-ink-primary rounded hover:bg-canvas-subtle"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Stepper Controls */}
        <div className="flex flex-col gap-1 mb-2">
          <button
            onClick={handleNextFloor}
            disabled={selectedFloorNumber === 14}
            className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            title="Next Floor (Up)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Floor List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 max-h-[380px] text-xs">
          {residentialFloors.map((floor) => {
            const isSelected = selectedFloorNumber === floor.floorNumber;
            const isHovered = hoveredFloorNumber === floor.floorNumber;
            const availableCount = floor.flats.filter((f) => f.status === 'AVAILABLE').length;

            return (
              <button
                key={floor.floorNumber}
                onClick={() => selectFloor(floor.floorNumber)}
                onMouseEnter={() => setHoveredFloor(floor.floorNumber)}
                onMouseLeave={() => setHoveredFloor(null)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-all text-left ${
                  isSelected
                    ? 'bg-accent-terracotta text-white font-semibold shadow-soft'
                    : isHovered
                    ? 'bg-canvas-muted text-ink-primary'
                    : 'text-ink-secondary hover:bg-canvas-subtle'
                }`}
              >
                <span className="font-mono text-xs">
                  {floor.floorNumber < 10 ? `0${floor.floorNumber}` : floor.floorNumber}
                </span>

                <span className="hidden sm:inline ml-2 text-[11px] opacity-80">
                  {floor.floorNumber}F
                </span>

                <span
                  className={`text-[10px] px-1 rounded ml-2 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : availableCount > 0
                      ? 'bg-status-availableBg text-status-available'
                      : 'bg-canvas-muted text-ink-muted'
                  }`}
                  title={`${availableCount} flats available`}
                >
                  {availableCount} avail
                </span>
              </button>
            );
          })}
        </div>

        {/* Down stepper */}
        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-canvas-muted">
          <button
            onClick={handlePrevFloor}
            disabled={selectedFloorNumber === 1}
            className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            title="Previous Floor (Down)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
