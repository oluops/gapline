import { defineWidgetManifest } from './types';

export default defineWidgetManifest({
  id: 'map',
  name: 'Track Map',
  enabled: true,
  layout: {
    x: 1102,
    y: 41,
    width: 407,
    height: 227,
  },
  config: {
    turnLabels: {
      enabled: false,
      labelType: 'both',
      highContrast: true,
      labelFontSize: 100,
    },
    showCarNumbers: true,
    invertTrackColors: false,
    driverCircleSize: 40,
    playerCircleSize: 40,
    trackmapFontSize: 100,
    trackLineWidth: 20,
    trackOutlineWidth: 40,
    useHighlightColor: false,
    invertLeaderColor: false,
    showOnlyWhenOnTrack: false,
    sessionVisibility: {
      race: true,
      loneQualify: true,
      openQualify: true,
      practice: true,
      offlineTesting: true,
    },
    styling: { isMinimalTrack: false, isMinimalCar: false },
    sectorColoring: { enabled: false },
    playerIcon: { enabled: false, fileName: '' },
    deltaMap: {
      enabled: false,
      reference: 'trackBest',
      scaleSeconds: 0.05,
      showPreviousLap: true,
    },
  },
  properties: {
    'deltaMap.enabled': {
      type: 'boolean',
      label: 'Delta Map',
      description:
        'Colour the track by where you gain (green) or lose (red) time against a reference lap, updated as you drive. Replaces sector colours while on.',
    },
    'deltaMap.reference': {
      type: 'enum',
      label: 'Compare Against',
      description:
        "Track Best is the fastest clean lap recorded here in your class by anyone, kept across sessions. Session Fastest is this session's fastest in your class. Personal Best is your own best this session.",
      options: [
        { value: 'trackBest', label: 'Track Best' },
        { value: 'sessionFastest', label: 'Session Fastest' },
        { value: 'personalBest', label: 'Personal Best' },
      ],
      control: 'select',
    },
    'deltaMap.scaleSeconds': {
      type: 'number',
      label: 'Full Colour At',
      description:
        'Time gained or lost within one short segment (1% of the lap) at which its colour is fully saturated. Lower values make small differences stand out.',
      min: 0.01,
      max: 0.3,
      step: 0.01,
      units: ' s',
    },
    'deltaMap.showPreviousLap': {
      type: 'boolean',
      label: 'Show Last Lap Ahead',
      description:
        "Show last lap's colours, dimmed, on the part of the track you haven't reached yet this lap.",
    },
    trackLineWidth: {
      type: 'number',
      label: 'Track Line Width',
      description:
        'Thickness of the track line (matches curved track map scale)',
      min: 5,
      max: 40,
      step: 1,
      units: 'px',
    },
    trackOutlineWidth: {
      type: 'number',
      label: 'Track Outline Width',
      description: 'Thickness of the outline around the track',
      min: 10,
      max: 80,
      step: 1,
      units: 'px',
    },
    invertTrackColors: {
      type: 'boolean',
      label: 'Invert Track Colors',
      description: 'Swap black and white colors for the track',
    },
    'turnLabels.labelType': {
      type: 'enum',
      label: 'Display Mode',
      options: [
        { value: 'numbers', label: 'Numbers' },
        { value: 'names', label: 'Names' },
        { value: 'both', label: 'Both' },
      ],
    },
    'turnLabels.highContrast': {
      type: 'boolean',
      label: 'High Contrast Labels',
      description:
        'Use black background for turn numbers and turn names for better legibility',
    },
    'turnLabels.labelFontSize': {
      type: 'number',
      label: 'Relative Label Size',
      description: 'Relative font size of the turn labels',
      min: 50,
      max: 300,
      step: 1,
      units: '%',
    },
    showCarNumbers: {
      type: 'boolean',
      label: 'Show Car Numbers',
      description: 'Display car numbers on driver circles',
    },
    driverCircleSize: {
      type: 'number',
      label: 'Driver Circle Size',
      description:
        'Size of the circle for other drivers (matches curved track map scale)',
      min: 10,
      max: 80,
      step: 1,
      units: 'px',
    },
    playerCircleSize: {
      type: 'number',
      label: 'Player Circle Size',
      description: 'Size of the circle or custom icon for your car',
      min: 10,
      max: 100,
      step: 1,
      units: 'px',
    },
    trackmapFontSize: {
      type: 'number',
      label: 'Relative Font Size',
      description: 'Relative size of the font within the trackmap',
      min: 50,
      max: 150,
      step: 1,
      units: '%',
    },
    useHighlightColor: {
      type: 'boolean',
      label: 'Use Highlight Color for Player',
      description:
        'Use your custom highlight color for the player car instead of class color',
    },
    invertLeaderColor: {
      type: 'boolean',
      label: 'Use Inverted Color for the Leader',
      description:
        'Use an alternate color for the leader car instead of class color',
    },
    'styling.isMinimalTrack': {
      type: 'boolean',
      label: 'Minimal Track',
      description: 'Remove the drop shadow from the track',
    },
    'styling.isMinimalCar': {
      type: 'boolean',
      label: 'Minimal Car Markers',
      description: 'Remove the drop shadow from the car markers',
    },
    showOnlyWhenOnTrack: {
      type: 'boolean',
      label: 'Show only when on track',
      description: 'If enabled, track map will only be shown when driving',
    },
  },
});
