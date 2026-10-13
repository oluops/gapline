import { describe, expect, it } from 'vitest';
import type { TrackStateSnapshot } from '@irdashies/types';
import { barFraction, formatDelta, readDelta, trendOf } from './deltaBarMath';

const snap = (fields: Partial<TrackStateSnapshot>) =>
  fields as TrackStateSnapshot;

describe('readDelta', () => {
  it('reads the selected reference', () => {
    const s = snap({
      lapDeltaSessionBest: -0.31,
      lapDeltaSessionBestOk: true,
      lapDeltaSessionBestRate: -0.1,
      lapDeltaBest: 1.2,
      lapDeltaBestOk: true,
    });
    expect(readDelta(s, 'sessionBest')).toEqual({ delta: -0.31, rate: -0.1 });
    expect(readDelta(s, 'best')).toEqual({ delta: 1.2, rate: 0 });
  });

  it('returns null when iRacing marks the delta invalid', () => {
    const s = snap({ lapDeltaOptimal: 0.5, lapDeltaOptimalOk: false });
    expect(readDelta(s, 'optimal')).toBeNull();
    expect(readDelta(snap({}), 'sessionLast')).toBeNull();
  });
});

describe('barFraction', () => {
  it('scales and clamps to the range', () => {
    expect(barFraction(0.5, 2)).toBe(0.25);
    expect(barFraction(-3, 2)).toBe(-1);
    expect(barFraction(9, 2)).toBe(1);
    expect(barFraction(1, 0)).toBe(0);
  });
});

describe('formatDelta', () => {
  it('always carries a sign except at zero', () => {
    expect(formatDelta(0.4249, 2)).toBe('+0.42');
    expect(formatDelta(-1.07, 2)).toBe('-1.07');
    expect(formatDelta(-0.001, 2)).toBe('0.00');
    expect(formatDelta(0.12345, 3)).toBe('+0.123');
  });
});

describe('trendOf', () => {
  it('uses a deadband around zero', () => {
    expect(trendOf(-0.2)).toBe('gaining');
    expect(trendOf(0.2)).toBe('losing');
    expect(trendOf(0.01)).toBe('steady');
  });
});
