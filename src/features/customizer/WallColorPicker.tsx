import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { WALL_PALETTES } from '../../data/customizerPalettes';
import { getFlatById } from '../../data/buildingData';
import { WallPaletteId } from '../../types/customizer';
import { Check, Paintbrush } from 'lucide-react';

export const WallColorPicker: React.FC = () => {
  const {
    customization,
    selectedFlatId,
    activeRoomId,
    setWallPalette,
  } = useAppStore();

  const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
  const rooms = flat?.rooms || [];

  const [activeTab, setActiveTab] = React.useState<'global' | 'per_room'>(customization.wallMode);
  const [selectedTargetRoom, setSelectedTargetRoom] = React.useState<string>(
    activeRoomId || rooms[0]?.id || 'living_dining'
  );

  const handleSelectPalette = (paletteId: WallPaletteId) => {
    if (activeTab === 'per_room') {
      setWallPalette(paletteId, selectedTargetRoom);
    } else {
      setWallPalette(paletteId);
    }
  };

  const currentColor =
    activeTab === 'per_room'
      ? customization.roomWallColors[selectedTargetRoom] || customization.globalWallColor
      : customization.globalWallColor;

  return (
    <div className="space-y-4">
      {/* Scope Switcher: Whole Flat vs Per Room */}
      <div className="flex items-center gap-1 p-1 bg-canvas-subtle rounded border border-canvas-muted">
        <button
          onClick={() => {
            setActiveTab('global');
            setWallPalette(customization.globalWallColor);
          }}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors text-center ${
            activeTab === 'global'
              ? 'bg-canvas text-ink-primary shadow-soft'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          Whole Residence
        </button>
        <button
          onClick={() => setActiveTab('per_room')}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors text-center ${
            activeTab === 'per_room'
              ? 'bg-canvas text-ink-primary shadow-soft'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          Room-by-Room
        </button>
      </div>

      {/* Room Selector dropdown when in per_room mode */}
      {activeTab === 'per_room' && (
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-ink-muted font-medium flex items-center gap-1">
            <Paintbrush className="w-3 h-3 text-accent-terracotta" />
            <span>Select Room to Paint</span>
          </label>
          <select
            value={selectedTargetRoom}
            onChange={(e) => setSelectedTargetRoom(e.target.value)}
            className="w-full text-xs p-2 rounded bg-canvas border border-canvas-muted text-ink-primary focus:border-accent-terracotta focus:outline-none"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.areaSqFt} sq ft)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 8 Curated Palettes Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {WALL_PALETTES.map((palette) => {
          const isSelected = currentColor === palette.id;

          return (
            <button
              key={palette.id}
              onClick={() => handleSelectPalette(palette.id)}
              className={`flex items-center gap-2.5 p-2 rounded border text-left transition-all ${
                isSelected
                  ? 'border-accent-terracotta bg-accent-terracotta/5 ring-1 ring-accent-terracotta shadow-soft'
                  : 'border-canvas-muted bg-canvas-light hover:bg-canvas-subtle'
              }`}
            >
              {/* Color Swatch */}
              <div
                className="w-7 h-7 rounded border border-ink-primary/10 shrink-0 shadow-inner flex items-center justify-center relative"
                style={{ backgroundColor: palette.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      palette.id === 'monsoon_slate' || palette.id === 'terracotta_dusk'
                        ? 'text-white'
                        : 'text-ink-primary'
                    }`}
                  />
                )}
              </div>

              {/* Text Description */}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-ink-primary truncate">
                  {palette.name}
                </div>
                <div className="text-[10px] text-ink-muted uppercase font-mono">
                  {palette.hex}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
