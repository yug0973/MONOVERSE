import { PriceBreakdown } from '../types/enquiry';

export const BASE_RATE_PER_SQ_FT = 6800; // INR 6,800 per sq ft base
export const FLOOR_RISE_PER_SQ_FT = 45; // INR 45 per sq ft per floor rise above floor 1
export const CLUB_AMENITIES_FEE = 450000; // Flat INR 4,50,000 club house & development
export const COVERED_PARKING_FEE = 350000; // Flat INR 3,50,000 reserved basement car slot
export const GST_RATE = 0.05; // 5% GST on residential under-construction
export const STAMP_DUTY_RATE = 0.049; // 4.9% Gujarat stamp duty
export const REGISTRATION_RATE = 0.01; // 1% registration fee

/**
 * Calculates realistic, deterministic flat pricing based on carpet area and floor level.
 * Higher floors have incremental floor-rise premium (higher views, light, quietness).
 */
export function calculateFlatPrice(
  carpetAreaSqFt: number,
  floorNumber: number
): { basePrice: number; totalPrice: number; breakdown: PriceBreakdown } {
  // Base cost calculated at floor 1
  const baseCost = carpetAreaSqFt * BASE_RATE_PER_SQ_FT;

  // Floor rise applies for floors > 1
  const floorMultiplier = Math.max(0, floorNumber - 1);
  const floorRiseTotal = carpetAreaSqFt * (FLOOR_RISE_PER_SQ_FT * floorMultiplier);

  // Agreement value
  const netAgreementValue = baseCost + floorRiseTotal + CLUB_AMENITIES_FEE + COVERED_PARKING_FEE;

  // Taxes and duties
  const gstAmount = Math.round(netAgreementValue * GST_RATE);
  const stampDutyAndRegistration = Math.round(netAgreementValue * (STAMP_DUTY_RATE + REGISTRATION_RATE));

  const totalAllInclusivePrice = netAgreementValue + gstAmount + stampDutyAndRegistration;

  return {
    basePrice: baseCost,
    totalPrice: totalAllInclusivePrice,
    breakdown: {
      carpetAreaSqFt,
      baseRatePerSqFt: BASE_RATE_PER_SQ_FT,
      baseCost,
      floorRiseRatePerSqFt: FLOOR_RISE_PER_SQ_FT,
      floorRiseTotal,
      clubAmenitiesCharge: CLUB_AMENITIES_FEE,
      coveredParkingSlot: COVERED_PARKING_FEE,
      netAgreementValue,
      gstAmount,
      stampDutyAndRegistration,
      totalAllInclusivePrice,
    },
  };
}

/**
 * Standard milestone payment schedule compliant with Gujarat RERA construction stages.
 */
export function calculatePaymentSchedule(totalPrice: number) {
  return [
    {
      stage: 'Booking Confirmation',
      percentage: 10,
      amount: Math.round(totalPrice * 0.1),
      description: 'Upon signing the allotment agreement',
    },
    {
      stage: 'Plinth Completion',
      percentage: 15,
      amount: Math.round(totalPrice * 0.15),
      description: 'Completion of foundation & basement excavation',
    },
    {
      stage: 'Podium & 5th Floor Slab',
      percentage: 20,
      amount: Math.round(totalPrice * 0.2),
      description: 'Structural casting up to 5th level',
    },
    {
      stage: '10th Floor Slab',
      percentage: 20,
      amount: Math.round(totalPrice * 0.2),
      description: 'Structural casting up to 10th level',
    },
    {
      stage: 'Top Terrace Slab',
      percentage: 15,
      amount: Math.round(totalPrice * 0.15),
      description: 'Full tower superstructure completion',
    },
    {
      stage: 'Masonry & Internal Plaster',
      percentage: 10,
      amount: Math.round(totalPrice * 0.1),
      description: 'Internal partition walls & MEP rough-ins',
    },
    {
      stage: 'Possession & Handover',
      percentage: 10,
      amount: Math.round(totalPrice * 0.1),
      description: 'Upon receipt of Building Use (BU) permission',
    },
  ];
}
