import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type QuietHours = { start: number; end: number }; // 0–23 hour integers

export type Settings = {
  lightMode: boolean;
  quietHoursEnabled: boolean;
  quietHours: QuietHours;
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  // mood prompts / sound effects — reserved, not yet implemented
  moodPromptsEnabled: boolean;
  soundEffectsEnabled: boolean;
};

const DEFAULTS: Settings = {
  lightMode: false,
  quietHoursEnabled: true,
  quietHours: { start: 22, end: 7 },
  notificationsEnabled: true,
  hapticsEnabled: true,
  moodPromptsEnabled: false,
  soundEffectsEnabled: false,
};

type SettingsCtxType = {
  settings: Settings;
  update: (patch: Partial<Settings>) => Promise<void>;
};

const SettingsCtx = createContext<SettingsCtxType | null>(null);

const KEY = 'selfcare_settings_v1';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try {
          setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
        } catch {}
      }
    });
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, [settings]);

  return (
    <SettingsCtx.Provider value={{ settings, update }}>
      {children}
    </SettingsCtx.Provider>
  );
}

export function useSettings(): SettingsCtxType {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

// Returns true if current time is inside quiet hours (handles overnight ranges)
export function isQuietNow(settings: Settings): boolean {
  if (!settings.quietHoursEnabled) return false;
  const h = new Date().getHours();
  const { start, end } = settings.quietHours;
  if (start <= end) return h >= start && h < end;
  return h >= start || h < end; // overnight e.g. 22–7
}
