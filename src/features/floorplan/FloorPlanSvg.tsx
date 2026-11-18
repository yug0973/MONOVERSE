import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FlatData, RoomGeometry } from '../../types/building';

interface FloorPlanSvgProps {
  flat: FlatData;
  onRoomSelect?: (roomId: string) => void;
}

export const FloorPlanSvg: React.FC<FloorPlanSvgProps> = ({ flat, onRoomSelect }) => {
  const {
    hoveredRoomId,
    activeRoomId,
    setHoveredRoom,
    enterRoom,
    toggleFloorPlanModal,
  } = useAppStore();

  const handleRoomClick = (room: RoomGeometry) => {
    enterRoom(room.id);
    toggleFloorPlanModal(false);
    if (onRoomSelect) onRoomSelect(room.id);
  };

  // SVG coordinate mapping derived from flat room templates
  // Flat dimensions approx 13.5m width x 11.5m length -> SVG viewBox 0 0 800 680
  const getRoomSvgBounds = (roomId: string) => {
    switch (roomId) {
      case 'living_dining':
        return { x: 260, y: 160, w: 280, h: 320 };
      case 'balcony':
        return { x: 260, y: 490, w: 280, h: 140 };
      case 'kitchen':
        return { x: 60, y: 160, w: 190, h: 220 };
      case 'master_bedroom':
        return { x: 550, y: 280, w: 210, h: 260 };
      case 'bedroom_2':
        return { x: 550, y: 60, w: 210, h: 210 };
      case 'bedroom_3':
        return { x: 60, y: 390, w: 190, h: 210 };
      case 'foyer':
        return { x: 260, y: 60, w: 160, h: 90 };
      case 'master_bath':
        return { x: 430, y: 60, w: 110, h: 90 };
      default:
        return { x: 100, y: 100, w: 150, h: 150 };
    }
  };

  return (
    <div className="relative w-full aspect-[4/3.4] max-w-2xl mx-auto bg-canvas-light border border-canvas-muted rounded-lg p-4 select-none shadow-soft">
      {/* Blueprint SVG */}
      <svg
        viewBox="0 0 820 680"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E6E0D4" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Blueprint background grid */}
        <rect width="820" height="680" fill="url(#blueprint-grid)" />

        {/* Outer Flat Boundary Walls */}
        <rect
          x="40"
          y="40"
          width="740"
          height="600"
          fill="none"
          stroke="#1E2024"
          strokeWidth="12"
          strokeLinejoin="miter"
        />

        {/* Balcony Perimeter Glazing Outline */}
        <rect
          x="250"
          y="490"
          width="300"
          height="145"
          fill="none"
          stroke="#BA5D38"
          strokeWidth="4"
          strokeDasharray="6,4"
        />

        {/* Interactive Rooms */}
        {flat.rooms.map((room) => {
          const bounds = getRoomSvgBounds(room.id);
          const isHovered = hoveredRoomId === room.id;
          const isActive = activeRoomId === room.id;

          return (
            <g
              key={room.id}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
              onClick={() => handleRoomClick(room)}
            >
              {/* Room Floor Polygon */}
              <rect
                x={bounds.x}
                y={bounds.y}
                width={bounds.w}
                height={bounds.h}
                className="transition-colors duration-200"
                fill={
                  isActive
                    ? 'rgba(186, 93, 56, 0.25)'
                    : isHovered
                    ? 'rgba(186, 93, 56, 0.14)'
                    : 'rgba(253, 251, 247, 0.85)'
                }
                stroke={isHovered || isActive ? '#BA5D38' : '#363940'}
                strokeWidth={isHovered || isActive ? '3' : '1.5'}
              />

              {/* Room Title */}
              <text
                x={bounds.x + bounds.w / 2}
                y={bounds.y + bounds.h / 2 - 8}
                textAnchor="middle"
                className={`font-serif text-[15px] font-semibold transition-colors select-none ${
                  isHovered || isActive ? 'fill-accent-terracotta' : 'fill-ink-primary'
                }`}
              >
                {room.name}
              </text>

              {/* Room Area & Dimensions */}
              <text
                x={bounds.x + bounds.w / 2}
                y={bounds.y + bounds.h / 2 + 14}
                textAnchor="middle"
                className="font-sans text-[11px] fill-ink-muted select-none"
              >
                {room.areaSqFt} sq ft · {room.dimensionsMeters.width}m × {room.dimensionsMeters.length}m
              </text>

              {/* Click to Enter Beacon Indicator */}
              <circle
                cx={bounds.x + bounds.w / 2}
                cy={bounds.y + bounds.h / 2 + 36}
                r={isHovered ? '7' : '4'}
                fill={isHovered || isActive ? '#BA5D38' : '#9E7D47'}
                className="transition-all"
              />
            </g>
          );
        })}

        {/* Entrance Foyer Arrow */}
        <g transform="translate(320, 30)">
          <path d="M 0 0 L 0 25 M -5 18 L 0 25 L 5 18" fill="none" stroke="#BA5D38" strokeWidth="2.5" />
          <text x="0" y="-8" textAnchor="middle" className="text-[10px] font-mono uppercase fill-accent-terracotta font-semibold">
            Main Entrance
          </text>
        </g>

        {/* Compass Rose in Corner */}
        <g transform="translate(740, 600)">
          <circle cx="0" cy="0" r="22" fill="#FAF8F5" stroke="#363940" strokeWidth="1" />
          <path d="M 0 -18 L 4 0 L -4 0 Z" fill="#BA5D38" />
          <path d="M 0 18 L 4 0 L -4 0 Z" fill="#363940" />
          <text x="0" y="-22" textAnchor="middle" className="text-[10px] font-mono font-bold fill-ink-primary">
            {flat.facing === 'EAST' ? 'E' : 'W'}
          </text>
        </g>
      </svg>
    </div>
  );
};
