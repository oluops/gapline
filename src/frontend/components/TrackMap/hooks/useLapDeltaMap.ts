import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  DeltaMapReference,
  ReferenceLap,
  TrackStateSnapshot,
} from '@irdashies/types';
import {
  useDriverCarIdx,
  useReferenceLapStore,
  useSessionStore,
  useTrackStateSelector,
} from '@irdashies/context';
import { getBucketIndex } from '@irdashies/utils/referenceLap';
import { interpolateAtPoint } from '@irdashies/utils/referenceLapInterpolation';
import { LapDeltaTracker } from '../lapDeltaTracker';

export interface LapDeltaMapData {
  current: readonly (number | null)[];
  previous: readonly (number | null)[] | null;
  /** False when there is no reference lap to compare against yet. */
  hasReference: boolean;
}

const EMPTY: LapDeltaMapData = {
  current: [],
  previous: null,
  hasReference: false,
};

const lapTimeOf = (lap: ReferenceLap) => lap.finishTime - lap.startTime;

const isUsable = (lap: ReferenceLap | null | undefined): lap is ReferenceLap =>
  !!lap && lap.startTime >= 0 && lap.pointsCount > 0 && lapTimeOf(lap) > 0;

/**
 * Picks the reference lap for the delta map.
 * - trackBest: fastest clean lap ever recorded here in the player's class, by
 *   anyone (saved across sessions); falls back to this session's fastest.
 * - sessionFastest: fastest clean lap this session in the player's class.
 * - personalBest: the player's own best clean lap this session.
 */
export const pickReferenceLap = (
  reference: DeltaMapReference,
  playerCarIdx: number,
  playerClassId: number,
  classByCarIdx: ReadonlyMap<number, number>,
  bestLaps: ReadonlyMap<number, ReferenceLap>,
  persistedLaps: ReadonlyMap<number, ReferenceLap>
): ReferenceLap | null => {
  if (reference === 'personalBest') {
    const own = bestLaps.get(playerCarIdx);
    return isUsable(own) && own.isCleanLap ? own : null;
  }

  let sessionFastest: ReferenceLap | null = null;
  for (const [carIdx, lap] of bestLaps) {
    if (classByCarIdx.get(carIdx) !== playerClassId) continue;
    if (!isUsable(lap) || !lap.isCleanLap) continue;
    if (!sessionFastest || lapTimeOf(lap) < lapTimeOf(sessionFastest)) {
      sessionFastest = lap;
    }
  }
  if (reference === 'sessionFastest') return sessionFastest;

  const saved = persistedLaps.get(playerClassId);
  if (isUsable(saved)) {
    return sessionFastest && lapTimeOf(sessionFastest) < lapTimeOf(saved)
      ? sessionFastest
      : saved;
  }
  return sessionFastest;
};

/** Reference elapsed time at a point, or null where the lap has no data. */
const referenceTimeAt = (lap: ReferenceLap) => (pct: number) => {
  const bucket = getBucketIndex(pct, lap.pointsCount);
  if (!(lap.pointPos[bucket] >= 0)) return null;
  return interpolateAtPoint(lap, pct);
};

type Sample = readonly [number, number, boolean, number | null];

const selectSample = (s: TrackStateSnapshot): Sample => [
  s.lapDistPct,
  s.sessionTime,
  s.isOnTrack && !s.onPitRoad && !s.isReplayPlaying,
  s.sessionNum,
];

const sameSample = (a: Sample, b: Sample) =>
  a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

/**
 * Live per-segment time gained/lost against the chosen reference, for
 * painting onto the track map. Re-renders only when a segment completes.
 */
export const useLapDeltaMap = (
  enabled: boolean,
  reference: DeltaMapReference
): LapDeltaMapData => {
  const playerCarIdx = useDriverCarIdx();
  const drivers = useSessionStore((s) => s.session?.DriverInfo?.Drivers);
  const bestLaps = useReferenceLapStore((s) => s.bestLaps);
  const persistedLaps = useReferenceLapStore((s) => s.persistedLaps);
  const sample = useTrackStateSelector(selectSample, {
    enabled,
    equality: sameSample,
  });

  const classByCarIdx = useMemo(() => {
    const map = new Map<number, number>();
    for (const d of drivers ?? []) map.set(d.CarIdx, d.CarClassID);
    return map;
  }, [drivers]);
  const playerClassId =
    playerCarIdx == null ? undefined : classByCarIdx.get(playerCarIdx);

  const refLap = useMemo(
    () =>
      enabled && playerCarIdx != null && playerClassId != null
        ? pickReferenceLap(
            reference,
            playerCarIdx,
            playerClassId,
            classByCarIdx,
            bestLaps,
            persistedLaps
          )
        : null,
    [
      enabled,
      reference,
      playerCarIdx,
      playerClassId,
      classByCarIdx,
      bestLaps,
      persistedLaps,
    ]
  );

  const tracker = useRef<LapDeltaTracker | null>(null);
  const lastRef = useRef<ReferenceLap | null>(null);
  const lastSessionNum = useRef<number | null>(null);
  const [data, setData] = useState<LapDeltaMapData>(EMPTY);

  // A different reference mode measures something else entirely: start over.
  useEffect(() => {
    tracker.current?.reset();
    setData(EMPTY);
  }, [reference, enabled]);

  useEffect(() => {
    if (!enabled || !sample) return;
    tracker.current ??= new LapDeltaTracker();
    const t = tracker.current;
    const [lapDistPct, sessionTime, valid, sessionNum] = sample;

    if (sessionNum !== lastSessionNum.current) {
      lastSessionNum.current = sessionNum;
      t.reset();
    }
    if (refLap !== lastRef.current) {
      lastRef.current = refLap;
      t.referenceChanged();
    }
    if (!refLap) {
      setData((prev) => (prev.hasReference ? EMPTY : prev));
      return;
    }

    const changed = t.sample(
      { lapDistPct, sessionTime, valid },
      referenceTimeAt(refLap)
    );
    if (changed) {
      setData({
        current: [...t.current],
        previous: t.previous,
        hasReference: true,
      });
    } else {
      setData((prev) =>
        prev.hasReference ? prev : { ...prev, hasReference: true }
      );
    }
  }, [enabled, sample, refLap]);

  return enabled ? data : EMPTY;
};
