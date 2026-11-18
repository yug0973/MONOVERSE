import React from 'react';
import { Html } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import { RoomGeometry } from '../../types/building';
import { Footprints } from 'lucide-react';

interface RoomLabel3DProps {
  room: RoomGeometry;
}

const getCompactRoomName = (name: string): string => {
  if (name.includes('Junior')) return 'Junior Suite';
  if (name.includes('Presidential') || name.includes('Master')) return 'Master Bed';
  if (name.includes('Living')) return 'Living & Dining';
  if (name.includes('Bedroom')) return 'Bedroom 2';
  if (name.includes('Kitchen')) return 'Kitchen';
  if (name.includes('Sky Deck') || name.includes('Balcony')) return 'Balcony';
  if (name.includes('Lounge') || name.includes('Library') || name.includes('Study')) return 'Lounge';
  if (name.includes('Vestibule') || name.includes('Elevator') || name.includes('Foyer')) return 'Foyer';
  return name.length > 14 ? name.slice(0, 12) + '...' : name;
};

export const RoomLabel3D: React.FC<RoomLabel3DProps> = ({ room }) => {
  const {
    viewMode,
    activeRoomId,
    hoveredRoomId,
    setHoveredRoom,
    enterRoom,
  } = useAppStore();

  // Labels are active in dollhouse mode
  if (viewMode !== 'dollhouse') return null;

  const isHovered = hoveredRoomId === room.id;
  const isActive = activeRoomId === room.id;
  const displayName = getCompactRoomName(room.name);

  return (
    <group position={[room.position[0], 2.8, room.position[2]]}>
      <Html center>
        <button
          onClick={(e) => {
            e.stopPropagation();
            enterRoom(room.id);
          }}
          onMouseEnter={() => setHoveredRoom(room.id)}
          onMouseLeave={() => setHoveredRoom(null)}
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-card backdrop-blur-md transition-all select-none text-left cursor-pointer whitespace-nowrap ${
            isActive || isHovered
              ? 'bg-accent-terracotta text-white scale-105 shadow-elevation'
              : 'bg-canvas-light/95 text-ink-primary hover:bg-canvas-subtle hover:scale-105 border border-canvas-muted'
          }`}
          title={`Enter ${room.name} (${room.areaSqFt} sq ft)`}
        >
          <Footprints className="w-3 h-3 opacity-80 shrink-0" />
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-semibold tracking-tight">{displayName}</span>
            <span className="text-[9px] opacity-70">({room.areaSqFt} sq ft)</span>
          </div>
        </button>
      </Html>
    </group>
  );
};
