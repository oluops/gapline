import { memo } from 'react';
import { useStandingsSelector } from '@irdashies/context';

interface GearCellProps {
  carIdx: number;
  compactMode?: string;
}

/** iRacing CarIdxGear: -1 reverse, 0 neutral, 1+ forward. */
export const formatGear = (gear: number | undefined): string => {
  if (gear === undefined || !Number.isFinite(gear)) return '';
  if (gear < 0) return 'R';
  if (gear === 0) return 'N';
  return String(gear);
};

/**
 * Current gear of another car. Each row subscribes to its own scalar so a
 * gear change only re-renders that row.
 */
export const GearCell = memo(({ carIdx, compactMode }: GearCellProps) => {
  const gear = useStandingsSelector((s) => s.carIdxGear[carIdx]);
  const pxClass = compactMode === 'ultra' ? '' : 'px-1';
  const label = formatGear(gear);

  return (
    <td
      data-column="gear"
      className={`w-[2rem] ${pxClass} text-center align-middle whitespace-nowrap tabular-nums`}
    >
      {label ? (
        <span className={label === 'N' || label === 'R' ? 'text-white/50' : ''}>
          {label}
        </span>
      ) : null}
    </td>
  );
});

GearCell.displayName = 'GearCell';
