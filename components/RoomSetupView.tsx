import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as db from '@/db';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import { AuthorSelector } from '@/components/AuthorSelector';
import type { AuthorId } from '@/constants/authors';
import { useRoomConfig } from '@/hooks/useRoomConfig';
import { createRoom, isRemoteConfigured } from '@/services/remote';
import { syncRecipes } from '@/services/recipeSync';
import { notifyDataChanged } from '@/services/dataEvents';
import { openScreenOverlay } from '@/services/screenOverlay';
import {
  generateRoomCode,
  isRoomCodeValid,
  MAX_ROOM_CODE_LENGTH,
  normalizeRoomCode,
} from '@/services/syncHelpers';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';
import { themeCardStyle } from '@/constants/themes';

interface RoomSetupViewProps {
  onClose: () => void;
}

export function RoomSetupView({ onClose }: RoomSetupViewProps) {
  const { theme, design } = useAppearance();
  const cardTokens = themeCardStyle(design, theme);
  const { config, reload: reloadRoomConfig } = useRoomConfig();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [member, setMemberState] = useState<AuthorId | null>(null);
  const mountedRef = useRef(true);
  const joiningRef = useRef(false);
  const configured = isRemoteConfigured();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (config?.code) {
      setCode(config.code);
    }
  }, [config?.code]);

  useEffect(() => {
    let active = true;
    db.getMember()
      .then((value) => {
        if (active) {
          setMemberState(value);
        }
      })
      .catch(() => {
        recordBreadcrumb('member:load-failed');
      });
    return () => {
      active = false;
    };
  }, []);

  const chooseMember = async (next: AuthorId) => {
    setMemberState(next);
    try {
      await db.setMember(next);
      notifyDataChanged();
      recordBreadcrumb(`member:${next}`);
    } catch (error) {
      captureException(error, { source: 'roomSetup.setMember' });
    }
  };

  const runFirstSync = async () => {
    if (mountedRef.current) {
      setSyncing(true);
    }
    try {
      const summary = await syncRecipes();
      if (summary.failed > 0 && mountedRef.current) {
        setWarning(
          `${summary.failed} item${summary.failed === 1 ? '' : 's'} could not sync yet. They will retry automatically.`
        );
      }
    } catch (syncError) {
      console.warn('[SYNC] first room sync failed', syncError);
      if (mountedRef.current) {
        setWarning('The room is saved, but the first sync failed. It will retry when you are online.');
      }
      recordBreadcrumb('sync:room-first-failed');
    } finally {
      if (mountedRef.current) {
        setSyncing(false);
      }
    }
  };

  const performJoin = async (roomCode: string) => {
    if (joiningRef.current) {
      return;
    }
    joiningRef.current = true;
    setJoining(true);
    setError(null);
    setWarning(null);
    setJoined(false);

    try {
      const roomId = await createRoom(roomCode);
      await db.activateRoom({ code: roomCode, roomId });
      notifyDataChanged();
      await reloadRoomConfig();
      if (mountedRef.current) {
        setCode(roomCode);
        setJoined(true);
      }
      recordBreadcrumb('room:joined');
      runFirstSync();
    } catch (joinError) {
      captureException(joinError, {
        source: 'roomSetup.join',
        extra: { roomCodeLength: roomCode.length },
      });
      if (mountedRef.current) {
        setError(joinError instanceof Error ? joinError.message : 'Could not join that room.');
      }
    } finally {
      joiningRef.current = false;
      if (mountedRef.current) {
        setJoining(false);
      }
    }
  };

  const handleJoin = () => {
    const normalized = normalizeRoomCode(code);
    if (!isRoomCodeValid(normalized)) {
      setError('Use 6 to 20 letters or numbers for the room code.');
      return;
    }
    if (!configured) {
      setError('Sharing is not configured in this build.');
      return;
    }

    setCode(normalized);
    if (config && config.code !== normalized) {
      Alert.alert(
        'Change shared room?',
        'Synced recipes from the current room will be removed from this phone. They will stay in the old room.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change room',
            style: 'destructive',
            onPress: () => performJoin(normalized),
          },
        ]
      );
      return;
    }

    performJoin(normalized);
  };

  const handleShare = async () => {
    if (!config) return;
    try {
      await Share.share({
        message: `Join my Recipe Vault room: ${config.code}`,
        title: 'Recipe Vault room code',
      });
    } catch (shareError) {
      captureException(shareError, { source: 'roomSetup.share' });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.introCard,
          cardTokens,
          { backgroundColor: theme.card },
        ]}
      >
        <Ionicons name="people-outline" size={28} color={theme.primary} />
        <Text style={styles.introTitle}>One room, both phones</Text>
        <Text style={[styles.introText, { color: theme.textSecondary }]}>
          Enter the same room code on both phones. There are no accounts and no sign-in. Recipe
          changes and photos sync automatically when both phones are online.
        </Text>
      </View>

      {config ? (
        <View style={[styles.currentCard, { backgroundColor: theme.tipBackground }]}>
          <View style={styles.currentHeader}>
            <Text style={styles.sectionLabel}>Current room</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={16} color={theme.primary} />
              <Text style={styles.shareText}>Share code</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={[styles.currentCode, config.code.length > 12 && styles.currentCodeCompact]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {config.code}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.statusButton,
          cardTokens,
          { backgroundColor: theme.card },
        ]}
        onPress={() => openScreenOverlay('sync-status')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open connection status"
      >
        <View style={styles.statusTextBlock}>
          <Text style={styles.sectionLabel}>Connection status</Text>
          <Text style={styles.helperText}>Check sync state and the last successful sync.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      <View
        style={[
          styles.formCard,
          cardTokens,
          { backgroundColor: theme.card },
        ]}
      >
        <AuthorSelector value={member} onChange={chooseMember} />
      </View>

      {!configured ? (
        <View
          style={[styles.warningBox, { backgroundColor: theme.card, borderColor: theme.warning }]}
        >
          <Ionicons name="warning-outline" size={18} color={theme.warning} />
          <Text style={[styles.warningText, { color: theme.warning }]}>
            This build does not have sharing configured yet. Add
            {' '}
            EXPO_PUBLIC_SUPABASE_URL
            {' '}and{' '}
            EXPO_PUBLIC_SUPABASE_ANON_KEY, then rebuild.
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.formCard,
          cardTokens,
          { backgroundColor: theme.card },
        ]}
      >
        <Text style={styles.sectionLabel}>Room code</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.borderLight,
              color: theme.primary,
            },
          ]}
          value={code}
          onChangeText={(value) => {
            setCode(value);
            setError(null);
            setJoined(false);
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          spellCheck={false}
          maxLength={MAX_ROOM_CODE_LENGTH}
          placeholder="e.g. FAMILY7X2K"
          placeholderTextColor={theme.textMuted}
          editable={!joining}
          onSubmitEditing={handleJoin}
          returnKeyType="done"
        />
        <Text style={styles.helperText}>
          Use 6 to 20 letters or numbers. A 10-character code is safer; share it only with your
          partner. If the code is new, this creates a fresh shared room.
        </Text>

        <TouchableOpacity
          style={[styles.generateButton, joining && styles.disabledButton]}
          onPress={() => {
            setCode(generateRoomCode());
            setError(null);
            setJoined(false);
          }}
          disabled={joining}
          activeOpacity={0.7}
        >
          <Ionicons name="dice-outline" size={16} color={theme.primary} />
          <Text style={styles.generateText}>Generate a code</Text>
        </TouchableOpacity>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.card, borderColor: theme.error }]}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        ) : null}

        {warning ? (
          <View
            style={[styles.warningBox, { backgroundColor: theme.card, borderColor: theme.warning }]}
          >
            <Ionicons name="cloud-offline-outline" size={16} color={theme.warning} />
            <Text style={[styles.warningText, { color: theme.warning }]}>{warning}</Text>
          </View>
        ) : null}

        {joined ? (
          <View
            style={[styles.successBox, { backgroundColor: theme.card, borderColor: theme.success }]}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.success} />
            <Text style={[styles.successText, { color: theme.success }]}>
              Room saved. {syncing ? 'Syncing recipes now...' : 'You are ready to share.'}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.joinButton,
            { backgroundColor: theme.primary, shadowColor: theme.shadow },
            (!configured || joining) && styles.disabledButton,
          ]}
          onPress={handleJoin}
          disabled={joining || !configured}
          activeOpacity={0.8}
        >
          {joining ? (
            <ActivityIndicator color={theme.white} />
          ) : (
            <Text style={[styles.joinButtonText, { color: theme.white }]}>
              {config ? 'Use this code' : 'Join room'}
            </Text>
          )}
        </TouchableOpacity>

        {joined ? (
          <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.doneButtonText, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.footerText}>
        Photos are uploaded to this room's storage and load from a public link. Keep the room code
        between the two of you.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  introCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  introTitle: {
    ...Typography.subtitle,
  },
  introText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  currentCard: {
    backgroundColor: Colors.tipBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentCode: {
    ...Typography.title,
    fontSize: 28,
    letterSpacing: 2,
  },
  currentCodeCompact: {
    fontSize: 20,
    letterSpacing: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  shareText: {
    ...Typography.label,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  statusTextBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.card,
  },
  sectionLabel: {
    ...Typography.sectionLabel,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.primary,
  },
  helperText: {
    ...Typography.bodySmall,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  generateText: {
    ...Typography.label,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FFFAF0',
    borderWidth: 1,
    borderColor: '#FEEBC8',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  warningText: {
    ...Typography.bodySmall,
    color: '#975A16',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  successText: {
    ...Typography.bodySmall,
    color: Colors.success,
    flex: 1,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
    ...Shadows.button,
  },
  joinButtonText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.55,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  doneButtonText: {
    ...Typography.label,
    color: Colors.primary,
    fontSize: 15,
  },
  footerText: {
    ...Typography.caption,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
});
