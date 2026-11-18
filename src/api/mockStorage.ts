import { SiteVisitEnquiry } from '../types/enquiry';

const STORAGE_KEY = 'aarohan_site_enquiries_v1';

const SEED_ENQUIRIES: SiteVisitEnquiry[] = [
  {
    id: 'enq-001',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    customerName: 'Kavita Patel',
    phoneNumber: '9825012345',
    email: 'kavita.patel@gmail.com',
    preferredDate: '2026-11-24',
    timeSlot: '11:00 AM - 01:00 PM',
    flatId: 'flat-12-a',
    flatCode: '1201',
    floorNumber: 12,
    flatType: '3BHK_PREMIUM',
    carpetAreaSqFt: 1950,
    estimatedPrice: 16850000,
    customization: {
      wallMode: 'global',
      globalWallColor: 'ivory_wash',
      roomWallColors: {},
      flooring: 'light_marble',
      furniturePackage: 'premium',
      timeOfDay: 'golden_hour',
    },
    shareableUrl: '?unit=flat-12-a&wall=ivory_wash&floor=light_marble&furn=premium&time=golden_hour',
    message: 'Interested in the higher-floor East-facing sunrise view. Please arrange golf-cart tour of podium.',
    status: 'CONFIRMED',
  },
  {
    id: 'enq-002',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    customerName: 'Dr. Harsh Shah',
    phoneNumber: '9879598765',
    email: 'dr.harsh.shah@hospital.org',
    preferredDate: '2026-11-26',
    timeSlot: '04:00 PM - 06:00 PM',
    flatId: 'flat-8-b',
    flatCode: '802',
    floorNumber: 8,
    flatType: '3BHK',
    carpetAreaSqFt: 1650,
    estimatedPrice: 13850000,
    customization: {
      wallMode: 'global',
      globalWallColor: 'sage_whisper',
      roomWallColors: {},
      flooring: 'herringbone',
      furniturePackage: 'essential',
      timeOfDay: 'noon',
    },
    shareableUrl: '?unit=flat-8-b&wall=sage_whisper&floor=herringbone&furn=essential&time=noon',
    message: 'Looking for 3 BHK unit with good morning light. Ready for immediate booking decision.',
    status: 'NEW',
  },
];

export function getStoredEnquiries(): SiteVisitEnquiry[] {
  if (typeof window === 'undefined') return SEED_ENQUIRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENQUIRIES));
      return SEED_ENQUIRIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_ENQUIRIES;
  } catch (e) {
    console.error('Failed to parse stored enquiries:', e);
    return SEED_ENQUIRIES;
  }
}

export function saveEnquiry(enquiry: SiteVisitEnquiry): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredEnquiries();
    const updated = [enquiry, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save enquiry:', e);
  }
}

export function updateEnquiryStatus(
  id: string,
  status: SiteVisitEnquiry['status']
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredEnquiries();
    const updated = current.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update enquiry status:', e);
  }
}
