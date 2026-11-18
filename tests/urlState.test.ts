import { describe, it, expect } from 'vitest';
import { encodeConfigToUrl, decodeConfigFromUrl } from '../src/lib/urlEncoding';
import { FlatCustomizationState } from '../src/types/customizer';

describe('URL State Serialization & Deserialization Suite', () => {
  const sampleState: FlatCustomizationState = {
    wallMode: 'global',
    globalWallColor: 'terracotta_dusk',
    roomWallColors: {},
    flooring: 'herringbone',
    furniturePackage: 'premium',
    timeOfDay: 'golden_hour',
  };

  it('encodes flat configuration into URL query string', () => {
    const urlQuery = encodeConfigToUrl('flat-12-a', sampleState);
    expect(urlQuery).toContain('unit=flat-12-a');
    expect(urlQuery).toContain('wall=terracotta_dusk');
    expect(urlQuery).toContain('floor=herringbone');
    expect(urlQuery).toContain('furn=premium');
    expect(urlQuery).toContain('time=golden_hour');
  });

  it('decodes query string back into exact customization state', () => {
    const encoded = encodeConfigToUrl('flat-7-b', sampleState);
    const decoded = decodeConfigFromUrl(`?${encoded}`);

    expect(decoded.flatId).toBe('flat-7-b');
    expect(decoded.customization?.globalWallColor).toBe('terracotta_dusk');
    expect(decoded.customization?.flooring).toBe('herringbone');
    expect(decoded.customization?.furniturePackage).toBe('premium');
    expect(decoded.customization?.timeOfDay).toBe('golden_hour');
  });

  it('supports per-room wall color serialization and deserialization', () => {
    const perRoomState: FlatCustomizationState = {
      ...sampleState,
      wallMode: 'per_room',
      roomWallColors: {
        living_dining: 'warm_sand',
        master_bedroom: 'sage_whisper',
      },
    };

    const encoded = encodeConfigToUrl('flat-4-c', perRoomState);
    expect(encoded).toContain('rooms=living_dining%3Awarm_sand%3Bmaster_bedroom%3Asage_whisper');

    const decoded = decodeConfigFromUrl(`?${encoded}`);
    expect(decoded.customization?.wallMode).toBe('per_room');
    expect(decoded.customization?.roomWallColors?.['living_dining']).toBe('warm_sand');
    expect(decoded.customization?.roomWallColors?.['master_bedroom']).toBe('sage_whisper');
  });

  it('safely handles empty or corrupt query strings with fallbacks', () => {
    const decodedEmpty = decodeConfigFromUrl('');
    expect(decodedEmpty.flatId).toBeUndefined();
    expect(decodedEmpty.customization).toBeUndefined();

    const decodedCorrupt = decodeConfigFromUrl('?invalid=gibberish&wall=unknown_color');
    expect(decodedCorrupt.customization?.globalWallColor).toBeUndefined();
  });
});
