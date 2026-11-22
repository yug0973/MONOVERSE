export interface ArchSpecItem {
  id: string;
  title: string;
  category: 'Flooring' | 'Millwork' | 'Glazing' | 'Timber' | 'Balcony';
  subtitle: string;
  position: [number, number, number];
  description: string;
  specifications: { label: string; value: string }[];
}

export const ARCHITECTURAL_SPECS: ArchSpecItem[] = [
  {
    id: 'spec-foyer-portal',
    title: 'Solid Teak Fluted Portal',
    category: 'Millwork',
    subtitle: 'Private Vestibule Entrance',
    position: [0.0, 1.4, -2.2],
    description:
      'Grand 2.7m floor-to-ceiling pivot portal crafted in solid reclaimed Burma teak with concealed magnetic hinges and biometric smart lock integration.',
    specifications: [
      { label: 'Material', value: 'Grade-A Burma Teak' },
      { label: 'Height', value: '2700mm Floor-to-Ceiling' },
      { label: 'Hardware', value: 'FritsJurgens Concealed Pivot' },
      { label: 'Security', value: 'Fingerprint + RFID + Digital Key' },
    ],
  },
  {
    id: 'spec-marble',
    title: 'Italian Statuario Marble',
    category: 'Flooring',
    subtitle: 'Living & Dining Hall',
    position: [7.2, 0.45, -8.5],
    description:
      'Hand-selected 2400x1200mm bookmatched Italian marble slabs with honed satin finish and zero-grout seamless joints.',
    specifications: [
      { label: 'Origin', value: 'Carrara, Italy' },
      { label: 'Thickness', value: '20mm Solid Slab' },
      { label: 'Finish', value: 'Honed Silk Matte' },
      { label: 'Treatment', value: 'Deep Seal Nanocoating' },
    ],
  },
  {
    id: 'spec-kitchen',
    title: 'German Blum Modular Kitchen',
    category: 'Millwork',
    subtitle: 'Island Kitchen & Dry Store',
    position: [7.2, 1.15, -3.5],
    description:
      'Bespoke center quartz island with integrated soft-close Blum tandembox runners and fluted natural oak veneer.',
    specifications: [
      { label: 'Hardware', value: 'Blum Motion Soft-Close' },
      { label: 'Countertop', value: 'Silestone Quartz 18mm' },
      { label: 'Veneer', value: 'European White Oak' },
      { label: 'Lighting', value: '3000K Diffused LED Channels' },
    ],
  },
  {
    id: 'spec-glazing',
    title: 'Acoustic Double-Glazed Facade',
    category: 'Glazing',
    subtitle: 'Floor-to-Ceiling Windows',
    position: [7.8, 1.4, -13.6],
    description:
      'Heavy-duty thermal break aluminium sliding systems with double-glazed low-E toughened acoustic glass.',
    specifications: [
      { label: 'System', value: 'Schüco Slimline Sliding' },
      { label: 'Glass', value: '8mm + 12mm Air + 8mm Low-E' },
      { label: 'Acoustics', value: '38 dB Sound Reduction' },
      { label: 'UV Cut', value: '99.2% Solar Heat Gain Rejected' },
    ],
  },
  {
    id: 'spec-bedroom-wood',
    title: 'Engineered European Oak',
    category: 'Timber',
    subtitle: 'Master Suite Flooring',
    position: [-8.5, 0.45, -9.5],
    description:
      'Premium European white oak planks with wire-brushed texture, bevelled edges, and UV matte lacquer.',
    specifications: [
      { label: 'Wood Species', value: 'Quercus Robur (White Oak)' },
      { label: 'Construction', value: '3-Ply Multi-layer Core' },
      { label: 'Plank Size', value: '190mm x 1900mm' },
      { label: 'Emission', value: 'E0 Eco-Certified' },
    ],
  },
  {
    id: 'spec-balcony',
    title: 'Panoramic Glass Balustrade',
    category: 'Balcony',
    subtitle: 'Sundeck Sky Terrace',
    position: [7.8, 1.15, -16.2],
    description:
      'Continuous frameless structural glass balustrades offering an uninterrupted 180° vista of the Vadodara skyline.',
    specifications: [
      { label: 'Safety', value: '15mm Toughened Laminated' },
      { label: 'Handrail', value: 'Flush Anodized Bronze Profile' },
      { label: 'Drainage', value: 'Concealed Perimeter Scupper' },
      { label: 'Wind Rating', value: 'Up to 180 km/h Tested' },
    ],
  },
];
