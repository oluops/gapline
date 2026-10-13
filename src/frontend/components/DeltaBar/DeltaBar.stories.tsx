import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelSnapshotDecorator } from '@irdashies/storybook';
import { mockTrackState } from '../DeltaSpeed/mockTrackState';
import { DeltaBar } from './DeltaBar';

export default {
  component: DeltaBar,
  title: 'widgets/DeltaBar',
  args: {
    background: { opacity: 80 },
    reference: 'sessionBest',
    rangeSeconds: 2,
    decimalPlaces: 2,
    showNumber: true,
    showTrend: true,
    showOnlyWhenOnTrack: false,
    sessionVisibility: {
      race: true,
      loneQualify: true,
      openQualify: true,
      practice: true,
      offlineTesting: true,
    },
  },
} as Meta<typeof DeltaBar>;

type Story = StoryObj<typeof DeltaBar>;

export const Ahead: Story = {
  decorators: [
    ChannelSnapshotDecorator({
      'track-state.snapshot': mockTrackState({
        lapDeltaSessionBest: -0.42,
        lapDeltaSessionBestOk: true,
        lapDeltaSessionBestRate: -0.08,
      }),
    }),
  ],
};

export const Behind: Story = {
  decorators: [
    ChannelSnapshotDecorator({
      'track-state.snapshot': mockTrackState({
        lapDeltaSessionBest: 1.37,
        lapDeltaSessionBestOk: true,
        lapDeltaSessionBestRate: -0.05,
      }),
    }),
  ],
};

export const NoReference: Story = {
  decorators: [
    ChannelSnapshotDecorator({
      'track-state.snapshot': mockTrackState(),
    }),
  ],
};
