import { FlatData, FlatStatus, FlatUnit, FloorData } from '../types/building';
import { calculateFlatPrice } from '../lib/pricing';
import { ROOMS_2BHK, ROOMS_3BHK, ROOMS_3BHK_PREMIUM } from './roomTemplates';

// Exactly 31 AVAILABLE (55.4%), 11 HELD (19.6%), 14 SOLD (25.0%) across 56 residential units
const STATUS_DISTRIBUTION: FlatStatus[] = [
  // Floor 1 (1S, 0H, 3A)
  'SOLD', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
  // Floor 2 (1S, 1H, 2A)
  'AVAILABLE', 'HELD', 'AVAILABLE', 'SOLD',
  // Floor 3 (1S, 1H, 2A)
  'HELD', 'AVAILABLE', 'SOLD', 'AVAILABLE',
  // Floor 4 (1S, 1H, 2A)
  'HELD', 'AVAILABLE', 'AVAILABLE', 'SOLD',
  // Floor 5 (1S, 1H, 2A)
  'AVAILABLE', 'SOLD', 'HELD', 'AVAILABLE',
  // Floor 6 (1S, 1H, 2A)
  'AVAILABLE', 'SOLD', 'AVAILABLE', 'HELD',
  // Floor 7 (1S, 0H, 3A)
  'SOLD', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
  // Floor 8 (1S, 1H, 2A)
  'AVAILABLE', 'HELD', 'SOLD', 'AVAILABLE',
  // Floor 9 (1S, 1H, 2A)
  'AVAILABLE', 'AVAILABLE', 'HELD', 'SOLD',
  // Floor 10 (1S, 1H, 2A)
  'HELD', 'AVAILABLE', 'SOLD', 'AVAILABLE',
  // Floor 11 (1S, 1H, 2A)
  'AVAILABLE', 'SOLD', 'AVAILABLE', 'HELD',
  // Floor 12 (1S, 1H, 2A)
  'AVAILABLE', 'HELD', 'SOLD', 'AVAILABLE',
  // Floor 13 (1S, 1H, 2A)
  'HELD', 'AVAILABLE', 'AVAILABLE', 'SOLD',
  // Floor 14 (1S, 1H, 2A)
  'AVAILABLE', 'HELD', 'SOLD', 'AVAILABLE',
];

export function generateBuildingFloors(): FloorData[] {
  const floors: FloorData[] = [];

  // Ground level / Podium
  floors.push({
    floorNumber: 0,
    title: 'Ground Level & Grand Promenade',
    elevationMeters: 0,
    isAmenityFloor: true,
    flats: [],
  });

  let flatIndex = 0;

  for (let floorNum = 1; floorNum <= 14; floorNum++) {
    const floorElevation = floorNum * 3.3; // 3.3m floor-to-floor height
    const flats: FlatData[] = [];

    // 4 Flats per floor: A, B, C, D
    const unitConfigs: Array<{
      unit: FlatUnit;
      type: '2BHK' | '3BHK' | '3BHK_PREMIUM';
      area: number;
      balcony: number;
      facing: 'EAST' | 'WEST';
      rooms: typeof ROOMS_2BHK;
    }> = [
      {
        unit: 'A',
        type: '3BHK_PREMIUM',
        area: 1950,
        balcony: 220,
        facing: 'EAST',
        rooms: ROOMS_3BHK_PREMIUM,
      },
      {
        unit: 'B',
        type: '3BHK',
        area: 1650,
        balcony: 160,
        facing: 'EAST',
        rooms: ROOMS_3BHK,
      },
      {
        unit: 'C',
        type: '2BHK',
        area: 1150,
        balcony: 110,
        facing: 'WEST',
        rooms: ROOMS_2BHK,
      },
      {
        unit: 'D',
        type: '3BHK',
        area: 1650,
        balcony: 160,
        facing: 'WEST',
        rooms: ROOMS_3BHK,
      },
    ];

    for (const config of unitConfigs) {
      const status = STATUS_DISTRIBUTION[flatIndex] || 'AVAILABLE';
      flatIndex++;

      const unitCode = `${floorNum}${floorNum < 10 ? '0' : ''}${config.unit === 'A' ? 1 : config.unit === 'B' ? 2 : config.unit === 'C' ? 3 : 4}`;
      const { basePrice, totalPrice } = calculateFlatPrice(config.area, floorNum);

      flats.push({
        id: `flat-${floorNum}-${config.unit.toLowerCase()}`,
        code: unitCode,
        floorNumber: floorNum,
        unitNumber: config.unit,
        type: config.type,
        carpetAreaSqFt: config.area,
        balconyAreaSqFt: config.balcony,
        facing: config.facing,
        status,
        basePrice,
        floorRiseRatePerSqFt: 45,
        totalPrice,
        rooms: config.rooms,
      });
    }

    floors.push({
      floorNumber: floorNum,
      title: `${floorNum}${getOrdinalSuffix(floorNum)} Residential Floor`,
      elevationMeters: floorElevation,
      flats,
    });
  }

  return floors;
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export const BUILDING_FLOORS: FloorData[] = generateBuildingFloors();

export const ALL_FLATS: FlatData[] = BUILDING_FLOORS.flatMap((f) => f.flats);

export function getFlatById(flatId: string): FlatData | undefined {
  const normalized = flatId.toLowerCase();
  return ALL_FLATS.find(
    (flat) => flat.id.toLowerCase() === normalized || flat.code === flatId
  );
}
