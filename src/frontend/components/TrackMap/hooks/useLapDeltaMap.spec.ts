import { describe, expect, it } from 'vitest';
import type { ReferenceLap } from '@irdashies/types';
import { pickReferenceLap } from './useLapDeltaMap';

const lap = (seconds: number, clean = true): ReferenceLap =>
  ({
    startTime: 10,
    finishTime: 10 + seconds,
    pointsCount: 100,
    isCleanLap: clean,
    times: new Float32Array(100),
    pointPos: new Float32Array(100),
    tangents: new Float32Array(100),
    interval: 0.01,
    lastTrackedPct: 1,
  }) as ReferenceLap;

const me = 0;
const classes = new Map([
  [0, 1],
  [1, 1],
  [2, 2],
]);

describe('pickReferenceLap', () => {
  const mine = lap(92);
  const rival = lap(90);
  const otherClassFaster = lap(80);
  const best = new Map([
    [0, mine],
    [1, rival],
    [2, otherClassFaster],
  ]);

  it('session fastest ignores other classes', () => {
    expect(
      pickReferenceLap('sessionFastest', me, 1, classes, best, new Map())
    ).toBe(rival);
  });

  it('personal best is the player own lap', () => {
    expect(
      pickReferenceLap('personalBest', me, 1, classes, best, new Map())
    ).toBe(mine);
  });

  it('track best prefers the saved lap unless this session beat it', () => {
    const saved = lap(88);
    expect(
      pickReferenceLap('trackBest', me, 1, classes, best, new Map([[1, saved]]))
    ).toBe(saved);
    const slowSaved = lap(95);
    expect(
      pickReferenceLap(
        'trackBest',
        me,
        1,
        classes,
        best,
        new Map([[1, slowSaved]])
      )
    ).toBe(rival);
  });

  it('never uses a dirty lap', () => {
    const dirty = new Map([[1, lap(70, false)]]);
    expect(
      pickReferenceLap('sessionFastest', me, 1, classes, dirty, new Map())
    ).toBeNull();
  });
});
