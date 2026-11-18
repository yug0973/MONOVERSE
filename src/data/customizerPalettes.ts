import {
  FlooringOption,
  FurnitureTierOption,
  TimeOfDayPreset,
  WallPalette,
} from '../types/customizer';

export const WALL_PALETTES: WallPalette[] = [
  {
    id: 'ivory_wash',
    name: 'Ivory Wash',
    hex: '#F5F2EB',
    roughness: 0.88,
    description: 'Soft lime-washed mineral tone reflecting natural Gujarat daylight.',
  },
  {
    id: 'sage_whisper',
    name: 'Sage Whisper',
    hex: '#D7DDD4',
    roughness: 0.85,
    description: 'Subtle eucalyptus grey-green with calming biophilic undertones.',
  },
  {
    id: 'terracotta_dusk',
    name: 'Terracotta Dusk',
    hex: '#C88065',
    roughness: 0.82,
    description: 'Earthy baked Gujarat clay accent evoking traditional craft.',
  },
  {
    id: 'greige_classic',
    name: 'Greige Classic',
    hex: '#DFDBD4',
    roughness: 0.86,
    description: 'Timeless architectural neutral bridging warm wood and stone.',
  },
  {
    id: 'monsoon_slate',
    name: 'Monsoon Slate',
    hex: '#7A848D',
    roughness: 0.78,
    description: 'Deep, atmospheric muted slate for intimate evening salons.',
  },
  {
    id: 'warm_sand',
    name: 'Warm Sand',
    hex: '#EADFCF',
    roughness: 0.87,
    description: 'Golden riverine sand tone bringing sunlit warmth indoors.',
  },
  {
    id: 'ochre_accent',
    name: 'Burnished Ochre',
    hex: '#C99D59',
    roughness: 0.75,
    description: 'Rich heritage mustard gold capturing filtered sunset rays.',
  },
  {
    id: 'raw_chalk',
    name: 'Raw Chalk',
    hex: '#FAF8F5',
    roughness: 0.92,
    description: 'Pure, crisp matte alabaster for maximum spatial openness.',
  },
];

export const FLOORING_OPTIONS: FlooringOption[] = [
  {
    id: 'warm_oak',
    name: 'Natural Warm Oak',
    tagline: 'Engineered European planks with subtle grain',
    roughness: 0.45,
    metalness: 0.05,
    bumpScale: 0.04,
    accentColor: '#B88F65',
  },
  {
    id: 'light_marble',
    name: 'Banswara White Marble',
    tagline: 'Polished micro-veined Indian marble slabs',
    roughness: 0.15,
    metalness: 0.12,
    bumpScale: 0.015,
    accentColor: '#E6E4DE',
  },
  {
    id: 'dark_slate',
    name: 'Kund Honed Slate',
    tagline: 'Textured deep charcoal mineral tile',
    roughness: 0.65,
    metalness: 0.08,
    bumpScale: 0.08,
    accentColor: '#3C4046',
  },
  {
    id: 'herringbone',
    name: 'Artisan Herringbone',
    tagline: 'Chevron parquetry in toasted smoked oak',
    roughness: 0.4,
    metalness: 0.05,
    bumpScale: 0.05,
    accentColor: '#8E6746',
  },
];

export const FURNITURE_TIERS: FurnitureTierOption[] = [
  {
    id: 'empty',
    title: 'Bare Shell',
    description: 'Unfurnished architectural massing to inspect raw spatial volumes.',
    pieceCount: 0,
    approxAddedCost: 0,
  },
  {
    id: 'essential',
    title: 'Essential Living',
    description: 'Curated 3-seater sofa, master king bed, dining table with 4 chairs, and TV credenza.',
    pieceCount: 8,
    approxAddedCost: 650000,
  },
  {
    id: 'premium',
    title: 'Architect’s Residence',
    description: 'Complete luxury suite: modular sectional, king beds with integrated dressers, 6-seater dining, study nook, indoor planters, and textured rugs.',
    pieceCount: 18,
    approxAddedCost: 1450000,
  },
];

export const TIME_OF_DAY_PRESETS: Record<string, TimeOfDayPreset> = {
  morning: {
    id: 'morning',
    label: 'Morning Sun (08:30)',
    sunPosition: [45, 24, -28], // East-facing crisp angle
    sunColor: '#FFF3DC',
    sunIntensity: 2.6,
    ambientColor: '#D2E2F2',
    ambientIntensity: 0.85,
    skyColor: '#A8CEF0',
    interiorLightsOn: false,
  },
  noon: {
    id: 'noon',
    label: 'Midday Zenith (12:30)',
    sunPosition: [12, 65, 8],
    sunColor: '#FFFFFF',
    sunIntensity: 3.0,
    ambientColor: '#E2ECF7',
    ambientIntensity: 1.0,
    skyColor: '#7BB3E8',
    interiorLightsOn: false,
  },
  golden_hour: {
    id: 'golden_hour',
    label: 'Golden Hour (17:45)',
    sunPosition: [-46, 18, 24], // West-facing warm beam
    sunColor: '#FFB366',
    sunIntensity: 2.8,
    ambientColor: '#6B8CA8', // Slate blue ambient counter-fill (prevents orange wash)
    ambientIntensity: 0.75,
    skyColor: '#537A9E', // Rich architectural sky (not orange)
    interiorLightsOn: true,
  },
  night: {
    id: 'night',
    label: 'Atmospheric Night (21:00)',
    sunPosition: [-24, 38, -26], // Cool moonlight
    sunColor: '#4A6FA5', // Visible cool moonlight beam
    sunIntensity: 0.85,
    ambientColor: '#182438',
    ambientIntensity: 0.65,
    skyColor: '#0A1120',
    interiorLightsOn: true,
  },
};
