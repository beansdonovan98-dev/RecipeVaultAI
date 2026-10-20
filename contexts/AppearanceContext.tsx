import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
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
import { useRoomConfig } from '@/hooks/useRoomConfig';
import { getRoomSettings, isRemoteConfigured, setRoomSetting } from '@/services/remote';
import { captureException } from '@/services/crashTracker';

const FONT_KEY_SETTING = 'app_font_key';
const FONT_COLOR_SETTING = 'app_font_color';
const SHARED_SETTINGS_REFRESH_MS = 15000;

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
  const { config } = useRoomConfig();
  const [fontKey, setFontKeyState] = useState<FontKey>(DEFAULT_FONT_KEY);
  const [fontColor, setFontColorState] = useState(DEFAULT_FONT_COLOR);
  const roomCode = config?.code ?? null;
  const roomId = config?.roomId ?? null;
  const hasRemoteRoom = Boolean(roomCode && roomId && isRemoteConfigured());

  useEffect(() => {
    if (hasRemoteRoom) {
      return;
    }

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
        captureException(error, { source: 'appearance.loadLocal' });
      });

    return () => {
      active = false;
    };
  }, [hasRemoteRoom]);

  useEffect(() => {
    if (!hasRemoteRoom || !roomCode || !roomId) {
      return;
    }

    let active = true;
    let inFlight = false;

    const loadSharedSettings = async () => {
      if (inFlight) {
        return;
      }
      inFlight = true;
      try {
        const settings = await getRoomSettings(roomCode);
        if (!active) {
          return;
        }

        const savedFontKey = settings.find((setting) => setting.key === FONT_KEY_SETTING)?.value;
        const savedFontColor = settings.find((setting) => setting.key === FONT_COLOR_SETTING)?.value;

        let nextFontKey = isFontKey(savedFontKey) ? savedFontKey : DEFAULT_FONT_KEY;
        let nextFontColor =
          savedFontColor && isHexColor(savedFontColor)
            ? normalizeHexColor(savedFontColor)
            : DEFAULT_FONT_COLOR;

        const localFontKey = await getSetting(FONT_KEY_SETTING);
        const localFontColor = await getSetting(FONT_COLOR_SETTING);
        if (!isFontKey(savedFontKey) && isFontKey(localFontKey)) {
          nextFontKey = localFontKey;
          try {
            await setRoomSetting(roomCode, FONT_KEY_SETTING, localFontKey);
          } catch (error) {
            captureException(error, { source: 'appearance.seedFontShared' });
          }
        }
        if (!(savedFontColor && isHexColor(savedFontColor)) && isHexColor(localFontColor ?? '')) {
          nextFontColor = normalizeHexColor(localFontColor as string);
          try {
            await setRoomSetting(roomCode, FONT_COLOR_SETTING, localFontColor as string);
          } catch (error) {
            captureException(error, { source: 'appearance.seedColorShared' });
          }
        }

        if (!active) {
          return;
        }
        setFontKeyState(nextFontKey);
        setFontColorState(nextFontColor);
      } catch (error) {
        captureException(error, { source: 'appearance.loadShared' });
      } finally {
        inFlight = false;
      }
    };

    loadSharedSettings();
    const timer = setInterval(loadSharedSettings, SHARED_SETTINGS_REFRESH_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        loadSharedSettings();
      }
    });

    return () => {
      active = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [hasRemoteRoom, roomCode, roomId]);

  const setFontKey = useCallback(
    async (next: FontKey) => {
      setFontKeyState(next);
      if (hasRemoteRoom && roomCode && roomId) {
        try {
          await setRoomSetting(roomCode, FONT_KEY_SETTING, next);
          return;
        } catch (error) {
          captureException(error, { source: 'appearance.setFontShared' });
        }
      }
      try {
        await setSetting(FONT_KEY_SETTING, next);
      } catch (error) {
        captureException(error, { source: 'appearance.setFontLocal' });
      }
    },
    [hasRemoteRoom, roomCode, roomId]
  );

  const setFontColor = useCallback(
    async (next: string) => {
      if (!isHexColor(next)) {
        return;
      }
      const normalized = normalizeHexColor(next);
      setFontColorState(normalized);
      if (hasRemoteRoom && roomCode && roomId) {
        try {
          await setRoomSetting(roomCode, FONT_COLOR_SETTING, normalized);
          return;
        } catch (error) {
          captureException(error, { source: 'appearance.setColorShared' });
        }
      }
      try {
        await setSetting(FONT_COLOR_SETTING, normalized);
      } catch (error) {
        captureException(error, { source: 'appearance.setColorLocal' });
      }
    },
    [hasRemoteRoom, roomCode, roomId]
  );

  const resetAppearance = useCallback(async () => {
    setFontKeyState(DEFAULT_FONT_KEY);
    setFontColorState(DEFAULT_FONT_COLOR);
    if (hasRemoteRoom && roomCode && roomId) {
      try {
        await Promise.all([
          setRoomSetting(roomCode, FONT_KEY_SETTING, DEFAULT_FONT_KEY),
          setRoomSetting(roomCode, FONT_COLOR_SETTING, DEFAULT_FONT_COLOR),
        ]);
        return;
      } catch (error) {
        captureException(error, { source: 'appearance.resetShared' });
      }
    }
    try {
      await Promise.all([
        setSetting(FONT_KEY_SETTING, DEFAULT_FONT_KEY),
        setSetting(FONT_COLOR_SETTING, DEFAULT_FONT_COLOR),
      ]);
    } catch (error) {
      captureException(error, { source: 'appearance.resetLocal' });
    }
  }, [hasRemoteRoom, roomCode, roomId]);

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
