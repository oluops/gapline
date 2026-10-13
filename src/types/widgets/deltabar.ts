import { defineWidgetManifest } from './types';

export default defineWidgetManifest({
  id: 'deltabar',
  name: 'Delta Bar',
  enabled: false,
  layout: {
    x: 760,
    y: 120,
    width: 400,
    height: 48,
  },
  config: {
    background: { opacity: 80 },
    reference: 'sessionBest',
    rangeSeconds: 2,
    decimalPlaces: 2,
    showNumber: true,
    showTrend: true,
    showOnlyWhenOnTrack: true,
    sessionVisibility: {
      race: true,
      loneQualify: true,
      openQualify: true,
      practice: true,
      offlineTesting: true,
    },
  },
  properties: {
    reference: {
      type: 'enum',
      label: 'Compare Against',
      description:
        'Reference lap for the delta. Best is your all-time best in this car and track, Session Best is this session only, Optimal is your best sectors combined.',
      options: [
        { value: 'sessionBest', label: 'Session Best' },
        { value: 'best', label: 'All-time Best' },
        { value: 'optimal', label: 'Optimal' },
        { value: 'sessionLast', label: 'Last Lap' },
      ],
      control: 'select',
    },
    'background.opacity': {
      type: 'number',
      label: 'Background Opacity',
      description: 'Opacity of the widget background.',
      min: 0,
      max: 100,
      step: 5,
      units: '%',
    },
    rangeSeconds: {
      type: 'number',
      label: 'Bar Range',
      description:
        'Delta at which the bar is full. Lower values make small differences more visible.',
      min: 0.2,
      max: 5,
      step: 0.1,
      units: ' s',
    },
    decimalPlaces: {
      type: 'number',
      label: 'Decimal Places',
      description: 'Precision of the numeric readout.',
      min: 1,
      max: 3,
      step: 1,
    },
    showNumber: {
      type: 'boolean',
      label: 'Show number',
      description: 'Show the numeric delta over the bar.',
    },
    showTrend: {
      type: 'boolean',
      label: 'Show trend',
      description:
        'Colour the number by whether you are gaining or losing time right now, independent of the overall delta.',
    },
    showOnlyWhenOnTrack: {
      type: 'boolean',
      label: 'Show only when on track',
      description: 'If enabled, widget will only be shown when driving.',
    },
  },
});
