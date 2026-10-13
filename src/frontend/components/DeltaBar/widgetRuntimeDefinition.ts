import type { WidgetRuntimeDefinition } from '../../widgetRuntime';

export default {
  id: 'deltabar',
  // Session visibility (race / qualify / practice) needs the session type.
  sessionData: true,
  channels: ['track-state.snapshot'],
  ratePreset: 'static',
  // The bar tracks a value that changes every frame, so it wants track-state
  // at the channel's ceiling rather than the informational default.
  channelRates: { 'track-state.snapshot': 25 },
} satisfies WidgetRuntimeDefinition;
