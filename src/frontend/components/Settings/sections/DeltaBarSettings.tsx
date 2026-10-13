import { useState, useEffect } from 'react';
import { BaseSettingsSection } from '../components/BaseSettingsSection';
import {
  DeltaBarWidgetSettings,
  SettingsTabType,
  getWidgetDefaultConfig,
} from '@irdashies/types';
import { useDashboard } from '@irdashies/context';
import { TabButton } from '../components/TabButton';
import { SessionVisibility } from '../components/SessionVisibility';
import { SettingsSection } from '../components/SettingSection';
import { SettingDivider } from '../components/SettingDivider';
import { SettingProps, settingPropFor } from '../components/SettingProp';

const SETTING_ID = 'deltabar';
const SettingProp = settingPropFor(SETTING_ID);

const defaultConfig = getWidgetDefaultConfig('deltabar');

export const DeltaBarSettings = () => {
  const { currentDashboard } = useDashboard();

  const savedSettings = currentDashboard?.widgets.find(
    (w) => w.id === SETTING_ID
  ) as DeltaBarWidgetSettings | undefined;

  const [settings, setSettings] = useState<DeltaBarWidgetSettings>({
    id: SETTING_ID,
    enabled: savedSettings?.enabled ?? false,
    config:
      (savedSettings?.config as DeltaBarWidgetSettings['config']) ??
      defaultConfig,
  });

  // useState only reads its initialiser on the first render, and the Loading
  // return below does not re-run it. Mounting before the dashboard has loaded —
  // or switching profile — would otherwise leave this holding defaults, and
  // BaseSettingsSection persists the whole settings object, so the next edit to
  // any one control would write those defaults over the saved config. Re-seed
  // whenever the saved widget changes, using the same guarded
  // set-during-render sync as BaseSettingsSection so there is no stale paint.
  const [prevSaved, setPrevSaved] = useState(savedSettings);
  if (JSON.stringify(savedSettings) !== JSON.stringify(prevSaved)) {
    setPrevSaved(savedSettings);
    if (savedSettings) {
      setSettings({
        id: SETTING_ID,
        enabled: savedSettings.enabled ?? false,
        config:
          (savedSettings.config as DeltaBarWidgetSettings['config']) ??
          defaultConfig,
      });
    }
  }

  const [activeTab, setActiveTab] = useState<SettingsTabType>(
    () =>
      (localStorage.getItem('deltaBarTab') as SettingsTabType) || 'options'
  );

  useEffect(() => {
    localStorage.setItem('deltaBarTab', activeTab);
  }, [activeTab]);

  if (!currentDashboard) return <>Loading...</>;

  return (
    <BaseSettingsSection
      title="Delta Bar"
      description="Live lap time delta against a reference lap, from iRacing's own delta telemetry."
      settings={settings as DeltaBarWidgetSettings}
      onSettingsChange={(s) => setSettings(s as DeltaBarWidgetSettings)}
      widgetId={SETTING_ID}
    >
      {(handleConfigChange) => (
        <SettingProps
          widget={SETTING_ID}
          config={settings.config}
          onChange={handleConfigChange}
        >
          <div className="space-y-4">
            <div className="flex border-b border-slate-700/50">
              <TabButton
                id="options"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              >
                Options
              </TabButton>
              <TabButton
                id="visibility"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              >
                Visibility
              </TabButton>
            </div>

            <div>
              {activeTab === 'options' && (
                <SettingsSection title="Display">
                  <SettingProp path="reference" />
                  <SettingProp path="background.opacity" />
                  <SettingProp path="rangeSeconds" />
                  <SettingProp path="decimalPlaces" />
                  <SettingProp path="showNumber" />
                  <SettingProp path="showTrend" />
                </SettingsSection>
              )}

              {activeTab === 'visibility' && (
                <SettingsSection title="Session Visibility">
                  <SessionVisibility
                    sessionVisibility={settings.config.sessionVisibility}
                    handleConfigChange={handleConfigChange}
                  />

                  <SettingDivider />

                  <SettingProp path="showOnlyWhenOnTrack" />
                </SettingsSection>
              )}
            </div>
          </div>
        </SettingProps>
      )}
    </BaseSettingsSection>
  );
};
