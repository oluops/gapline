/**
 * Builds a per-segment map of where the player gains or loses time against a
 * reference lap, as the lap is driven.
 *
 * The lap is split into equal slices of lap distance. At each sample the
 * running delta is (time into this lap) - (reference time at this point);
 * when the car crosses into the next slice, the change in that running delta
 * across the slice it just left is that slice's gain (negative) or loss
 * (positive). Laps are only measured from a start/finish crossing, so an
 * out-lap or a lap joined part way through is never scored.
 */
export const DELTA_MAP_SEGMENTS = 100;

/** Reference lap's elapsed time at a lap-distance fraction, or null if unknown. */
export type ReferenceTimeAt = (lapDistPct: number) => number | null;

export interface LapDeltaSample {
  lapDistPct: number;
  sessionTime: number;
  /** False on pit road or otherwise not a lap worth scoring. */
  valid: boolean;
}

const emptySegments = (count: number): (number | null)[] =>
  new Array<number | null>(count).fill(null);

export class LapDeltaTracker {
  readonly segments: number;
  /** This lap's per-segment delta, null where not yet driven or not scored. */
  current: (number | null)[];
  /** The previous completed lap's per-segment delta. */
  previous: (number | null)[] | null = null;
  /** Bumped whenever `current` or `previous` changes. */
  version = 0;

  private lapStart: number | null = null;
  private lastPct = -1;
  private lastTime = -1;
  private segIdx = -1;
  private segStartDelta: number | null = null;

  constructor(segments = DELTA_MAP_SEGMENTS) {
    this.segments = segments;
    this.current = emptySegments(segments);
  }

  /** Forget everything, e.g. on a new session or a new reference. */
  reset(): void {
    this.current = emptySegments(this.segments);
    this.previous = null;
    this.lapStart = null;
    this.lastPct = -1;
    this.lastTime = -1;
    this.segIdx = -1;
    this.segStartDelta = null;
    this.version += 1;
  }

  /**
   * The reference lap was replaced (a faster lap was set). Earlier segments
   * stay as measured; the segment in progress is skipped rather than scored
   * against two different references.
   */
  referenceChanged(): void {
    this.segIdx = -1;
    this.segStartDelta = null;
  }

  /** Feed one telemetry sample. Returns true if the map changed. */
  sample(
    { lapDistPct: pct, sessionTime, valid }: LapDeltaSample,
    referenceTimeAt: ReferenceTimeAt
  ): boolean {
    if (!Number.isFinite(pct) || pct < 0 || !Number.isFinite(sessionTime)) {
      return false;
    }
    let changed = false;

    // Time went backwards: replay scrub, reset to pits, or a new session.
    if (this.lastTime >= 0 && sessionTime < this.lastTime) {
      this.invalidateLap();
    } else if (this.lastPct > 0.95 && pct < 0.05) {
      changed = this.startNewLap(pct, sessionTime) || changed;
    } else if (this.lastPct >= 0 && pct < this.lastPct - 0.02) {
      // Moved backwards without crossing the line (tow, reset): don't score.
      this.invalidateLap();
    }

    this.lastPct = pct;
    this.lastTime = sessionTime;

    if (!valid) {
      this.invalidateLap();
      return changed;
    }
    if (this.lapStart === null) return changed;

    const reference = referenceTimeAt(pct);
    if (reference === null || !Number.isFinite(reference)) {
      // No reference here: don't bridge a gap across it.
      this.segIdx = -1;
      this.segStartDelta = null;
      return changed;
    }

    const delta = sessionTime - this.lapStart - reference;
    const seg = Math.min(
      this.segments - 1,
      Math.max(0, Math.floor(pct * this.segments))
    );

    if (seg === this.segIdx) return changed;

    if (this.segIdx >= 0 && this.segStartDelta !== null && seg > this.segIdx) {
      // Spread the change evenly over every slice crossed since the last
      // sample, so a slow tick rate never leaves holes in the map.
      const crossed = seg - this.segIdx;
      const perSegment = (delta - this.segStartDelta) / crossed;
      for (let i = this.segIdx; i < seg; i++) this.current[i] = perSegment;
      changed = true;
    }
    this.segIdx = seg;
    this.segStartDelta = delta;
    if (changed) this.version += 1;
    return changed;
  }

  private startNewLap(pct: number, sessionTime: number): boolean {
    // Interpolate the moment the line was crossed between the two samples.
    const before = 1 - this.lastPct;
    const span = before + pct;
    const crossing =
      span > 0
        ? this.lastTime + ((sessionTime - this.lastTime) * before) / span
        : sessionTime;

    const hadLap = this.lapStart !== null;
    if (hadLap) this.previous = this.current;
    this.current = emptySegments(this.segments);
    this.lapStart = crossing;
    this.segIdx = -1;
    this.segStartDelta = null;
    this.version += 1;
    return true;
  }

  private invalidateLap(): void {
    this.lapStart = null;
    this.segIdx = -1;
    this.segStartDelta = null;
  }
}
