import { describe, it, expect } from 'vitest';
import {
  calculateFlatPrice,
  calculatePaymentSchedule,
  BASE_RATE_PER_SQ_FT,
  FLOOR_RISE_PER_SQ_FT,
} from '../src/lib/pricing';

describe('Pricing Logic Suite', () => {
  it('calculates base price correctly for Floor 1 without floor rise', () => {
    const area = 1150;
    const { basePrice, breakdown } = calculateFlatPrice(area, 1);

    expect(basePrice).toBe(area * BASE_RATE_PER_SQ_FT);
    expect(breakdown.floorRiseTotal).toBe(0);
    expect(breakdown.carpetAreaSqFt).toBe(1150);
  });

  it('applies floor rise incrementally as floor increases', () => {
    const area = 1650;
    const floor4 = calculateFlatPrice(area, 4);
    const floor10 = calculateFlatPrice(area, 10);

    // Floor 4 has 3 floor rise steps: (4 - 1) * 45 * 1650
    expect(floor4.breakdown.floorRiseTotal).toBe(3 * FLOOR_RISE_PER_SQ_FT * area);

    // Floor 10 has 9 floor rise steps: (10 - 1) * 45 * 1650
    expect(floor10.breakdown.floorRiseTotal).toBe(9 * FLOOR_RISE_PER_SQ_FT * area);

    expect(floor10.totalPrice).toBeGreaterThan(floor4.totalPrice);
  });

  it('computes agreement value, taxes (GST 5% + Stamp/Registration ~5.9%), and total price correctly', () => {
    const { breakdown, totalPrice } = calculateFlatPrice(1950, 12);
    const expectedAgreement =
      breakdown.baseCost +
      breakdown.floorRiseTotal +
      breakdown.clubAmenitiesCharge +
      breakdown.coveredParkingSlot;

    expect(breakdown.netAgreementValue).toBe(expectedAgreement);
    expect(breakdown.gstAmount).toBe(Math.round(expectedAgreement * 0.05));
    expect(totalPrice).toBe(
      expectedAgreement + breakdown.gstAmount + breakdown.stampDutyAndRegistration
    );
  });

  it('generates milestone payment schedule totaling 100% of the price', () => {
    const total = 15000000;
    const schedule = calculatePaymentSchedule(total);

    const totalPercentage = schedule.reduce((sum, item) => sum + item.percentage, 0);
    const totalAmount = schedule.reduce((sum, item) => sum + item.amount, 0);

    expect(totalPercentage).toBe(100);
    expect(Math.abs(totalAmount - total)).toBeLessThanOrEqual(5); // rounding tolerance
  });
});
