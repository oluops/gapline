import { describe, expect, it } from 'vitest';
import { formatGear } from './GearCell';

describe('formatGear', () => {
  it('maps iRacing gear numbers to display labels', () => {
    expect(formatGear(-1)).toBe('R');
    expect(formatGear(0)).toBe('N');
    expect(formatGear(4)).toBe('4');
  });

  it('renders nothing when the gear is unknown', () => {
    expect(formatGear(undefined)).toBe('');
    expect(formatGear(Number.NaN)).toBe('');
  });
});
