import { useCallback } from 'react';
import type { DeltaBarConfig, TrackStateSnapshot } from '@irdashies/types';
import {
  trackStateSelectors,
  useSessionVisibility,
  useTrackStateSelector,
} from '@irdashies/context';
import {
  barFraction,
  formatDelta,
  readDelta,
  trendOf,
  type DeltaReading,
} from './deltaBarMath';

type DeltaBarProps = DeltaBarConfig;

const sameReading = (a: DeltaReading | null, b: DeltaReading | null) =>
  a === b || (!!a && !!b && a.delta === b.delta && a.rate === b.rate);

const TREND_CLASS = {
  gaining: 'text-green-300',
  losing: 'text-red-300',
  steady: 'text-white',
} as const;

/**
 * Classic time-delta bar: a centre line, a green fill to the left while ahead
 * of the reference and a red fill to the right while behind, with the signed
 * delta over it. Values come straight from iRacing's LapDeltaTo* telemetry.
 */
export const DeltaBar = ({
  background,
  reference = 'sessionBest',
  rangeSeconds = 2,
  decimalPlaces = 2,
  showNumber = true,
  showTrend = true,
  showOnlyWhenOnTrack,
  sessionVisibility,
}: DeltaBarProps) => {
  const selectReading = useCallback(
    (snapshot: TrackStateSnapshot) => readDelta(snapshot, reference),
    [reference]
  );
  const reading = useTrackStateSelector(selectReading, {
    equality: sameReading,
  });
  const isOnTrack = useTrackStateSelector(trackStateSelectors.isOnTrack);
  const isVisibleInSession = useSessionVisibility(sessionVisibility);

  if (!isVisibleInSession) return null;
  if (showOnlyWhenOnTrack && !isOnTrack) return null;

  const fraction = reading ? barFraction(reading.delta, rangeSeconds) : 0;
  const ahead = fraction < 0;
  const widthPct = `${Math.abs(fraction) * 50}%`;
  const numberClass =
    reading && showTrend ? TREND_CLASS[trendOf(reading.rate)] : 'text-white';

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-sm bg-slate-800/(--bg-opacity)"
      style={{
        ['--bg-opacity' as string]: `${background?.opacity ?? 80}%`,
      }}
      data-testid="delta-bar"
    >
      {reading ? (
        <>
          <div
            data-testid="delta-bar-fill"
            className={`absolute inset-y-0 ${
              ahead ? 'right-1/2 bg-green-600/80' : 'left-1/2 bg-red-600/80'
            }`}
            style={{ width: widthPct }}
          />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/60" />
          {showNumber && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`rounded-sm bg-slate-900/70 px-2 text-lg font-semibold tabular-nums ${numberClass}`}
              >
                {formatDelta(reading.delta, decimalPlaces)}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-sm text-white/40">No reference lap</span>
        </div>
      )}
    </div>
  );
};
