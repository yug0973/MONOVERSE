import {
  FlatCustomizationState,
  FlooringId,
  FurnitureTier,
  TimeOfDay,
  WallPaletteId,
} from '../types/customizer';

export interface DecodedConfigUrl {
  flatId?: string;
  customization?: Partial<FlatCustomizationState>;
}

const VALID_WALL_PALETTES: WallPaletteId[] = [
  'ivory_wash',
  'sage_whisper',
  'terracotta_dusk',
  'greige_classic',
  'monsoon_slate',
  'warm_sand',
  'ochre_accent',
  'raw_chalk',
];

const VALID_FLOORINGS: FlooringId[] = [
  'warm_oak',
  'light_marble',
  'dark_slate',
  'herringbone',
];

const VALID_FURNITURE: FurnitureTier[] = ['empty', 'essential', 'premium'];
const VALID_TIMES: TimeOfDay[] = ['morning', 'noon', 'golden_hour', 'night'];

/**
 * Encodes flat ID and customization state into a compact, human-readable URL query string.
 */
export function encodeConfigToUrl(
  flatId: string,
  customization: FlatCustomizationState
): string {
  const params = new URLSearchParams();
  params.set('unit', flatId);
  params.set('wall', customization.globalWallColor);
  params.set('floor', customization.flooring);
  params.set('furn', customization.furniturePackage);
  params.set('time', customization.timeOfDay);

  if (customization.wallMode === 'per_room' && Object.keys(customization.roomWallColors).length > 0) {
    const roomPairs = Object.entries(customization.roomWallColors)
      .map(([room, color]) => `${room}:${color}`)
      .join(';');
    params.set('rooms', roomPairs);
  }

  return params.toString();
}

/**
 * Decodes URL search parameters into flatId and customization state with fallbacks.
 */
export function decodeConfigFromUrl(searchString: string): DecodedConfigUrl {
  if (!searchString) return {};

  const cleanQuery = searchString.startsWith('?') ? searchString.slice(1) : searchString;
  const params = new URLSearchParams(cleanQuery);

  const flatId = params.get('unit') || undefined;
  const wallParam = params.get('wall') as WallPaletteId;
  const floorParam = params.get('floor') as FlooringId;
  const furnParam = params.get('furn') as FurnitureTier;
  const timeParam = params.get('time') as TimeOfDay;
  const roomsParam = params.get('rooms');

  const custom: Partial<FlatCustomizationState> = {};

  if (wallParam && VALID_WALL_PALETTES.includes(wallParam)) {
    custom.globalWallColor = wallParam;
    custom.wallMode = 'global';
  }

  if (floorParam && VALID_FLOORINGS.includes(floorParam)) {
    custom.flooring = floorParam;
  }

  if (furnParam && VALID_FURNITURE.includes(furnParam)) {
    custom.furniturePackage = furnParam;
  }

  if (timeParam && VALID_TIMES.includes(timeParam)) {
    custom.timeOfDay = timeParam;
  }

  if (roomsParam) {
    const roomMap: Record<string, WallPaletteId> = {};
    const pairs = roomsParam.split(';');
    for (const pair of pairs) {
      const [rId, cId] = pair.split(':');
      if (rId && cId && VALID_WALL_PALETTES.includes(cId as WallPaletteId)) {
        roomMap[rId] = cId as WallPaletteId;
      }
    }
    if (Object.keys(roomMap).length > 0) {
      custom.roomWallColors = roomMap;
      custom.wallMode = 'per_room';
    }
  }

  return {
    flatId,
    customization: Object.keys(custom).length > 0 ? custom : undefined,
  };
}
