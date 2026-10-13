import { describe, expect, it } from 'vitest';
import { LapDeltaTracker } from './lapDeltaTracker';

/** Reference: a 100 s lap at constant pace. */
const ref = (pct: number) => pct * 100;

/** Drive one lap from `t0`, `pace` seconds per 1% of lap, sampling every 0.5%. */
const driveLap = (
  tracker: LapDeltaTracker,
  t0: number,
  pace: (pct: number) => number,
  valid: (pct: number) => boolean = () => true
) => {
  let t = t0;
  for (let i = 0; i <= 199; i++) {
    const pct = i / 200;
    tracker.sample({ lapDistPct: pct, sessionTime: t, valid: valid(pct) }, ref);
    t += pace(pct) / 2;
  }
  return t;
};

describe('LapDeltaTracker', () => {
  it('does not score the lap it joined part way through', () => {
    const tracker = new LapDeltaTracker(10);
    for (let pct = 0.5; pct < 0.95; pct += 0.05) {
      tracker.sample(
        { lapDistPct: pct, sessionTime: pct * 100, valid: true },
        ref
      );
    }
    expect(tracker.current.every((v) => v === null)).toBe(true);
  });

  it('marks slow segments positive and fast ones negative', () => {
    const tracker = new LapDeltaTracker(100);
    // Approach the line to start a measured lap.
    tracker.sample({ lapDistPct: 0.99, sessionTime: 99, valid: true }, ref);
    // 1 s per 1% (same as reference) except 0.2 s slower per % in 20-30%,
    // and 0.1 s faster per % in 60-70%.
    driveLap(tracker, 100, (pct) =>
      pct >= 0.2 && pct < 0.3 ? 1.2 : pct >= 0.6 && pct < 0.7 ? 0.9 : 1
    );

    expect(tracker.current[10]).toBeCloseTo(0, 5);
    expect(tracker.current[25]).toBeCloseTo(0.2, 5);
    expect(tracker.current[65]).toBeCloseTo(-0.1, 5);
  });

  it('moves the finished lap to previous on crossing the line', () => {
    const tracker = new LapDeltaTracker(100);
    tracker.sample({ lapDistPct: 0.99, sessionTime: 99, valid: true }, ref);
    const end = driveLap(tracker, 100, (pct) => (pct < 0.5 ? 1.1 : 1));
    tracker.sample({ lapDistPct: 0.001, sessionTime: end, valid: true }, ref);

    expect(tracker.previous?.[10]).toBeCloseTo(0.1, 5);
    expect(tracker.current.every((v) => v === null)).toBe(true);
  });

  it('stops scoring on pit road until the next lap starts', () => {
    const tracker = new LapDeltaTracker(100);
    tracker.sample({ lapDistPct: 0.99, sessionTime: 99, valid: true }, ref);
    driveLap(
      tracker,
      100,
      () => 1,
      (pct) => pct < 0.5
    );

    expect(tracker.current[30]).not.toBeNull();
    expect(tracker.current.slice(50).every((v) => v === null)).toBe(true);
  });

  it('skips the segment in progress when the reference changes', () => {
    const tracker = new LapDeltaTracker(100);
    tracker.sample({ lapDistPct: 0.99, sessionTime: 99, valid: true }, ref);
    tracker.sample({ lapDistPct: 0.0, sessionTime: 100, valid: true }, ref);
    tracker.sample({ lapDistPct: 0.1, sessionTime: 110, valid: true }, ref);
    tracker.referenceChanged();
    tracker.sample({ lapDistPct: 0.11, sessionTime: 111, valid: true }, ref);
    expect(tracker.current[10]).toBeNull();
  });

  it('fills every segment crossed between two samples', () => {
    const tracker = new LapDeltaTracker(100);
    tracker.sample({ lapDistPct: 0.99, sessionTime: 99, valid: true }, ref);
    tracker.sample({ lapDistPct: 0.0, sessionTime: 100, valid: true }, ref);
    // Jump 4 segments while losing 0.4 s.
    tracker.sample({ lapDistPct: 0.04, sessionTime: 104.4, valid: true }, ref);
    expect(tracker.current.slice(0, 4)).toEqual([
      expect.closeTo(0.1, 5),
      expect.closeTo(0.1, 5),
      expect.closeTo(0.1, 5),
      expect.closeTo(0.1, 5),
    ]);
  });
});
