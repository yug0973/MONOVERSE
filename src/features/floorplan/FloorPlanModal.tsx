import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { Modal } from '../../shared/ui/Modal';
import { FloorPlanSvg } from './FloorPlanSvg';
import { sqFtToSqM } from '../../lib/utils';
import { Footprints, Layers } from 'lucide-react';

export const FloorPlanModal: React.FC = () => {
  const {
    isFloorPlanModalOpen,
    toggleFloorPlanModal,
    selectedFlatId,
    hoveredRoomId,
    setHoveredRoom,
    enterRoom,
  } = useAppStore();

  const flat = selectedFlatId ? getFlatById(selectedFlatId) : getFlatById('flat-12-a');
  if (!flat) return null;

  return (
    <Modal
      isOpen={isFloorPlanModalOpen}
      onClose={() => toggleFloorPlanModal(false)}
      title={`Architectural Blueprint — Unit ${flat.code}`}
      subtitle={`${flat.type.replace('_', ' ')} · Floor ${flat.floorNumber} · ${flat.carpetAreaSqFt} sq ft Carpet (${sqFtToSqM(flat.carpetAreaSqFt)} m²)`}
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Interactive Vector Blueprint (Takes 2 Columns) */}
        <div className="lg:col-span-2">
          <FloorPlanSvg flat={flat} />
          <p className="text-center text-[11px] text-ink-muted mt-2">
            Click any room on the blueprint or hover to synchronize with the 3D cutaway.
          </p>
        </div>

        {/* Room Dimensional Schedule & Areas (Takes 1 Column) */}
        <div className="space-y-4">
          <div className="p-3.5 bg-canvas-subtle rounded border border-canvas-muted text-xs">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-canvas-muted">
              <span className="font-semibold text-ink-primary">Area Schedule</span>
              <span className="font-mono text-accent-terracotta">Facing {flat.facing}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-ink-muted">RERA Carpet Area:</span>
              <strong className="text-ink-primary">{flat.carpetAreaSqFt} sq ft</strong>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-ink-muted">Balcony Deck:</span>
              <strong className="text-ink-primary">{flat.balconyAreaSqFt} sq ft</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider text-ink-muted font-medium px-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-accent-brass" />
              <span>Room Breakdown</span>
            </div>

            <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
              {flat.rooms.map((room) => {
                const isHovered = hoveredRoomId === room.id;

                return (
                  <div
                    key={room.id}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    className={`flex items-center justify-between p-2.5 rounded border text-xs transition-all ${
                      isHovered
                        ? 'border-accent-terracotta bg-accent-terracotta/5 shadow-soft'
                        : 'border-canvas-muted bg-canvas-light hover:bg-canvas-subtle'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-ink-primary">{room.name}</div>
                      <div className="text-[11px] text-ink-muted font-mono">
                        {room.dimensionsMeters.width}m × {room.dimensionsMeters.length}m · {room.areaSqFt} sq ft
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        enterRoom(room.id);
                        toggleFloorPlanModal(false);
                      }}
                      className="p-1.5 rounded text-accent-terracotta hover:bg-accent-terracotta/10 transition-colors"
                      title={`Glide to ${room.name}`}
                    >
                      <Footprints className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
