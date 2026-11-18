export type WallPaletteId =
  | 'ivory_wash'
  | 'sage_whisper'
  | 'terracotta_dusk'
  | 'greige_classic'
  | 'monsoon_slate'
  | 'warm_sand'
  | 'ochre_accent'
  | 'raw_chalk';

export interface WallPalette {
  id: WallPaletteId;
  name: string;
  hex: string;
  roughness: number;
  description: string;
}

export type FlooringId = 'warm_oak' | 'light_marble' | 'dark_slate' | 'herringbone';

export interface FlooringOption {
  id: FlooringId;
  name: string;
  tagline: string;
  roughness: number;
  metalness: number;
  bumpScale: number;
  accentColor: string;
}

export type FurnitureTier = 'empty' | 'essential' | 'premium';

export interface FurnitureTierOption {
  id: FurnitureTier;
  title: string;
  description: string;
  pieceCount: number;
  approxAddedCost: number;
}

export type TimeOfDay = 'morning' | 'noon' | 'golden_hour' | 'night';

export interface TimeOfDayPreset {
  id: TimeOfDay;
  label: string;
  sunPosition: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  skyColor: string;
  interiorLightsOn: boolean;
}

export interface FlatCustomizationState {
  wallMode: 'global' | 'per_room';
  globalWallColor: WallPaletteId;
  roomWallColors: Record<string, WallPaletteId>;
  flooring: FlooringId;
  furniturePackage: FurnitureTier;
  timeOfDay: TimeOfDay;
}
