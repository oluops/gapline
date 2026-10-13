import type { DeltaBarReference, TrackStateSnapshot } from '@irdashies/types';

export interface DeltaReading {
  /** Seconds vs the reference; negative = faster. */
  delta: number;
  /** Rate of change in s/s; negative = gaining time right now. */
  rate: number;
}

const FIELDS = {
  best: ['lapDeltaBest', 'lapDeltaBestOk', 'lapDeltaBestRate'],
  sessionBest: [
    'lapDeltaSessionBest',
    'lapDeltaSessionBestOk',
    'lapDeltaSessionBestRate',
  ],
  optimal: ['lapDeltaOptimal', 'lapDeltaOptimalOk', 'lapDeltaOptimalRate'],
  sessionLast: [
    'lapDeltaSessionLast',
    'lapDeltaSessionLastOk',
    'lapDeltaSessionLastRate',
  ],
} as const satisfies Record<
  DeltaBarReference,
  readonly [keyof TrackStateSnapshot, keyof TrackStateSnapshot, keyof TrackStateSnapshot]
>;

/**
 * The delta against one reference, or null when iRacing says it is not valid
 * (no reference lap yet, or the car is off the racing line / in the pits).
 */
export const readDelta = (
  snapshot: TrackStateSnapshot,
  reference: DeltaBarReference
): DeltaReading | null => {
  const [deltaKey, okKey, rateKey] = FIELDS[reference];
  if (snapshot[okKey] !== true) return null;
  const delta = snapshot[deltaKey];
  if (typeof delta !== 'number' || !Number.isFinite(delta)) return null;
  const rate = snapshot[rateKey];
  return {
    delta,
    rate: typeof rate === 'number' && Number.isFinite(rate) ? rate : 0,
  };
};

/** Signed fill fraction in [-1, 1]; 0 when the range is not positive. */
export const barFraction = (delta: number, rangeSeconds: number): number => {
  if (!(rangeSeconds > 0)) return 0;
  return Math.max(-1, Math.min(1, delta / rangeSeconds));
};

/** "+0.42" / "-1.07" / "0.00" — explicit sign so the readout never jumps width. */
export const formatDelta = (delta: number, decimalPlaces: number): string => {
  const places = Math.max(0, Math.min(3, Math.round(decimalPlaces)));
  const fixed = Math.abs(delta).toFixed(places);
  if (Number(fixed) === 0) return fixed;
  return `${delta < 0 ? '-' : '+'}${fixed}`;
};

/** Below this rate the trend reads as steady rather than flickering. */
const TREND_DEADBAND = 0.02;

export type Trend = 'gaining' | 'losing' | 'steady';

export const trendOf = (rate: number): Trend =>
  rate < -TREND_DEADBAND
    ? 'gaining'
    : rate > TREND_DEADBAND
      ? 'losing'
      : 'steady';
