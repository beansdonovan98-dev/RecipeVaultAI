import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { getSetting, setSetting } from '@/db/settings';
import {
  DEFAULT_ASSISTANT_NAME,
  DEFAULT_ASSISTANT_PERSONA_ID,
  getAssistantPersona,
  isAssistantPersonaId,
  normalizeAssistantName,
  type AssistantPersona,
  type AssistantPersonaId,
} from '@/constants/assistant';
import { useRoomConfig } from '@/hooks/useRoomConfig';
import {
  getRoomSettings,
  isRemoteConfigured,
  setRoomSetting,
  uploadPhoto,
} from '@/services/remote';
import { captureException } from '@/services/crashTracker';

const NAME_SETTING = 'app_assistant_name';
const PERSONA_SETTING = 'app_assistant_persona';
const BACKGROUND_SETTING = 'app_assistant_background';
const SHARED_SETTINGS_REFRESH_MS = 15000;

interface AssistantContextValue {
  /** Display name both phones use. */
  name: string;
  persona: AssistantPersona;
  personaId: AssistantPersonaId;
  /** True when the name and persona are coming from the shared room. */
  isShared: boolean;
  /** Set when the room rejected the last shared save, so the UI can explain. */
  sharedError: string | null;
  /** Photo behind the chat. Null means the built-in backdrop. */
  backgroundUri: string | null;
  setName: (next: string) => Promise<void>;
  setPersona: (next: AssistantPersonaId) => Promise<void>;
  setBackground: (uri: string | null) => Promise<void>;
  resetAssistant: () => Promise<void>;
}

const AssistantContext = createContext<AssistantContextValue>({
  name: DEFAULT_ASSISTANT_NAME,
  persona: getAssistantPersona(DEFAULT_ASSISTANT_PERSONA_ID),
  personaId: DEFAULT_ASSISTANT_PERSONA_ID,
  isShared: false,
  sharedError: null,
  backgroundUri: null,
  setName: async () => {},
  setPersona: async () => {},
  setBackground: async () => {},
  resetAssistant: async () => {},
});

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const { config } = useRoomConfig();
  const [name, setNameState] = useState(DEFAULT_ASSISTANT_NAME);
  const [personaId, setPersonaIdState] = useState<AssistantPersonaId>(
    DEFAULT_ASSISTANT_PERSONA_ID
  );
  const [sharedError, setSharedError] = useState<string | null>(null);
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);

  const roomCode = config?.code ?? null;
  const roomId = config?.roomId ?? null;
  const isShared = Boolean(roomCode && roomId && isRemoteConfigured());

  useEffect(() => {
    if (isShared) {
      return;
    }

    let active = true;
    Promise.all([
      getSetting(NAME_SETTING),
      getSetting(PERSONA_SETTING),
      getSetting(BACKGROUND_SETTING),
    ])
      .then(([savedName, savedPersona, savedBackground]) => {
        if (!active) {
          return;
        }
        if (isAssistantPersonaId(savedPersona)) {
          setPersonaIdState(savedPersona);
        }
        const fallback = getAssistantPersona(
          isAssistantPersonaId(savedPersona) ? savedPersona : DEFAULT_ASSISTANT_PERSONA_ID
        ).defaultName;
        if (savedName) {
          setNameState(normalizeAssistantName(savedName, fallback));
        }
        if (savedBackground) {
          setBackgroundUri(savedBackground);
        }
      })
      .catch((error) => {
        captureException(error, { source: 'assistant.loadLocal' });
      });

    return () => {
      active = false;
    };
  }, [isShared]);

  useEffect(() => {
    if (!isShared || !roomCode || !roomId) {
      return;
    }

    let active = true;
    let inFlight = false;
    let seedAttempted = false;

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

        const sharedName = settings.find((setting) => setting.key === NAME_SETTING)?.value;
        const sharedPersona = settings.find((setting) => setting.key === PERSONA_SETTING)?.value;
        const sharedBackground = settings.find(
          (setting) => setting.key === BACKGROUND_SETTING
        )?.value;

        const localName = await getSetting(NAME_SETTING);
        const localPersona = await getSetting(PERSONA_SETTING);
        const localBackground = await getSetting(BACKGROUND_SETTING);

        const nextPersonaId = isAssistantPersonaId(sharedPersona)
          ? sharedPersona
          : isAssistantPersonaId(localPersona)
            ? localPersona
            : DEFAULT_ASSISTANT_PERSONA_ID;
        const personaFallback = getAssistantPersona(nextPersonaId).defaultName;
        const nextName = sharedName
          ? normalizeAssistantName(sharedName, personaFallback)
          : normalizeAssistantName(localName, personaFallback);

        const needsSeed =
          (!isAssistantPersonaId(sharedPersona) && isAssistantPersonaId(localPersona)) ||
          (!sharedName && Boolean(localName));

        // Only seed once per session: if the room server rejects the new
        // settings keys, retrying every 15s would just spam the crash log.
        if (needsSeed && !seedAttempted) {
          seedAttempted = true;
          if (!isAssistantPersonaId(sharedPersona) && isAssistantPersonaId(localPersona)) {
            try {
              await setRoomSetting(roomCode, PERSONA_SETTING, localPersona);
            } catch (error) {
              captureException(error, { source: 'assistant.seedPersonaShared' });
            }
          }
          if (!sharedName && localName) {
            try {
              await setRoomSetting(
                roomCode,
                NAME_SETTING,
                normalizeAssistantName(localName, personaFallback)
              );
            } catch (error) {
              captureException(error, { source: 'assistant.seedNameShared' });
            }
          }
        }

        if (!active) {
          return;
        }
        setPersonaIdState(nextPersonaId);
        setNameState(nextName);
        setBackgroundUri(sharedBackground || localBackground || null);
      } catch (error) {
        captureException(error, { source: 'assistant.loadShared' });
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
  }, [isShared, roomCode, roomId]);

  const persist = useCallback(
    async (key: string, value: string, source: string) => {
      if (isShared && roomCode) {
        try {
          await setRoomSetting(roomCode, key, value);
          setSharedError(null);
          return;
        } catch (error) {
          captureException(error, { source: `${source}.shared` });
          setSharedError(
            error instanceof Error
              ? error.message
              : 'The shared room would not accept that setting.'
          );
        }
      }
      try {
        await setSetting(key, value);
      } catch (error) {
        captureException(error, { source: `${source}.local` });
      }
    },
    [isShared, roomCode]
  );

  const setName = useCallback(
    async (next: string) => {
      const personaDefault = getAssistantPersona(personaId).defaultName;
      const normalized = normalizeAssistantName(next, personaDefault);
      setNameState(normalized);
      await persist(NAME_SETTING, normalized, 'assistant.setName');
    },
    [personaId, persist]
  );

  const setPersona = useCallback(
    async (next: AssistantPersonaId) => {
      const persona = getAssistantPersona(next);
      setPersonaIdState(persona.id);
      setNameState(persona.defaultName);
      await persist(PERSONA_SETTING, persona.id, 'assistant.setPersona');
      await persist(NAME_SETTING, persona.defaultName, 'assistant.setPersonaName');
    },
    [persist]
  );

  const setBackground = useCallback(
    async (uri: string | null) => {
      if (!uri) {
        setBackgroundUri(null);
        await persist(BACKGROUND_SETTING, '', 'assistant.clearBackground');
        // Clear the local copy too, otherwise it would reappear when the room
        // value is empty.
        try {
          await setSetting(BACKGROUND_SETTING, '');
        } catch (error) {
          captureException(error, { source: 'assistant.clearBackground.local' });
        }
        return;
      }

      if (isShared && roomCode && roomId) {
        try {
          const uploaded = await uploadPhoto(roomId, 'assistant-background', uri);
          try {
            await setRoomSetting(roomCode, BACKGROUND_SETTING, uploaded);
            setSharedError(null);
            setBackgroundUri(uploaded);
            return;
          } catch (error) {
            captureException(error, { source: 'assistant.setBackground.shared' });
            setSharedError(
              error instanceof Error
                ? error.message
                : 'The shared room would not accept that setting.'
            );
          }
        } catch (error) {
          captureException(error, { source: 'assistant.setBackground.upload' });
          setSharedError(
            error instanceof Error ? error.message : 'Could not upload that photo.'
          );
        }
      }

      setBackgroundUri(uri);
      try {
        await setSetting(BACKGROUND_SETTING, uri);
      } catch (error) {
        captureException(error, { source: 'assistant.setBackground.local' });
      }
    },
    [isShared, roomCode, roomId, persist]
  );

  const resetAssistant = useCallback(async () => {    const persona = getAssistantPersona(DEFAULT_ASSISTANT_PERSONA_ID);
    setPersonaIdState(persona.id);
    setNameState(persona.defaultName);
    await persist(PERSONA_SETTING, persona.id, 'assistant.resetPersona');
    await persist(NAME_SETTING, persona.defaultName, 'assistant.resetName');
  }, [persist]);

  const value = useMemo<AssistantContextValue>(
    () => ({
      name,
      personaId,
      persona: getAssistantPersona(personaId),
      isShared,
      sharedError,
      backgroundUri,
      setName,
      setPersona,
      setBackground,
      resetAssistant,
    }),
    [
      name,
      personaId,
      isShared,
      sharedError,
      backgroundUri,
      setName,
      setPersona,
      setBackground,
      resetAssistant,
    ]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant(): AssistantContextValue {
  return useContext(AssistantContext);
}
