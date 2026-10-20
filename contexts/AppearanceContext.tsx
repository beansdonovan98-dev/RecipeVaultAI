import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { getSetting, setSetting } from '@/db/settings';
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_KEY,
  FONT_OPTIONS,
  isFontKey,
  isHexColor,
  normalizeHexColor,
  type FontKey,
} from '@/constants/appearance';
import { captureException } from '@/services/crashTracker';

const FONT_KEY_SETTING = 'app_font_key';
const FONT_COLOR_SETTING = 'app_font_color';

interface AppearanceContextValue {
  fontKey: FontKey;
  fontFamily: string | undefined;
  fontColor: string;
  setFontKey: (next: FontKey) => Promise<void>;
  setFontColor: (next: string) => Promise<void>;
  resetAppearance: () => Promise<void>;
}

const AppearanceContext = createContext<AppearanceContextValue>({
  fontKey: DEFAULT_FONT_KEY,
  fontFamily: undefined,
  fontColor: DEFAULT_FONT_COLOR,
  setFontKey: async () => {},
  setFontColor: async () => {},
  resetAppearance: async () => {},
});

function resolveFontFamily(fontKey: FontKey): string | undefined {
  const option = FONT_OPTIONS.find((item) => item.id === fontKey);
  return Platform.select(option?.families ?? {});
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [fontKey, setFontKeyState] = useState<FontKey>(DEFAULT_FONT_KEY);
  const [fontColor, setFontColorState] = useState(DEFAULT_FONT_COLOR);

  useEffect(() => {
    let active = true;

    Promise.all([getSetting(FONT_KEY_SETTING), getSetting(FONT_COLOR_SETTING)])
      .then(([savedFontKey, savedFontColor]) => {
        if (!active) {
          return;
        }
        if (isFontKey(savedFontKey)) {
          setFontKeyState(savedFontKey);
        }
        if (savedFontColor && isHexColor(savedFontColor)) {
          setFontColorState(normalizeHexColor(savedFontColor));
        }
      })
      .catch((error) => {
        captureException(error, { source: 'appearance.load' });
      });

    return () => {
      active = false;
    };
  }, []);

  const setFontKey = useCallback(async (next: FontKey) => {
    setFontKeyState(next);
    try {
      await setSetting(FONT_KEY_SETTING, next);
    } catch (error) {
      captureException(error, { source: 'appearance.setFont' });
    }
  }, []);

  const setFontColor = useCallback(async (next: string) => {
    if (!isHexColor(next)) {
      return;
    }
    const normalized = normalizeHexColor(next);
    setFontColorState(normalized);
    try {
      await setSetting(FONT_COLOR_SETTING, normalized);
    } catch (error) {
      captureException(error, { source: 'appearance.setColor' });
    }
  }, []);

  const resetAppearance = useCallback(async () => {
    setFontKeyState(DEFAULT_FONT_KEY);
    setFontColorState(DEFAULT_FONT_COLOR);
    try {
      await Promise.all([
        setSetting(FONT_KEY_SETTING, DEFAULT_FONT_KEY),
        setSetting(FONT_COLOR_SETTING, DEFAULT_FONT_COLOR),
      ]);
    } catch (error) {
      captureException(error, { source: 'appearance.reset' });
    }
  }, []);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      fontKey,
      fontFamily: resolveFontFamily(fontKey),
      fontColor,
      setFontKey,
      setFontColor,
      resetAppearance,
    }),
    [fontKey, fontColor, setFontKey, setFontColor, resetAppearance]
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  return useContext(AppearanceContext);
}
