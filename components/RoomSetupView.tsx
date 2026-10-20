import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as db from '@/db';
import { useRoomConfig } from '@/hooks/useRoomConfig';
import { createRoom, isRemoteConfigured } from '@/services/remote';
import { syncRecipes } from '@/services/recipeSync';
import { notifyDataChanged } from '@/services/dataEvents';
import {
  generateRoomCode,
  isRoomCodeValid,
  MAX_ROOM_CODE_LENGTH,
  normalizeRoomCode,
} from '@/services/syncHelpers';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

interface RoomSetupViewProps {
  onClose: () => void;
}

export function RoomSetupView({ onClose }: RoomSetupViewProps) {
  const { config, reload: reloadRoomConfig } = useRoomConfig();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
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
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.introCard}>
        <Ionicons name="people-outline" size={28} color={Colors.primary} />
        <Text style={styles.introTitle}>One room, both phones</Text>
        <Text style={styles.introText}>
          Enter the same room code on both phones. There are no accounts and no sign-in. Recipe
          changes and photos sync automatically when both phones are online.
        </Text>
      </View>

      {config ? (
        <View style={styles.currentCard}>
          <View style={styles.currentHeader}>
            <Text style={styles.sectionLabel}>Current room</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={16} color={Colors.primary} />
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

      {!configured ? (
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={18} color={Colors.warning} />
          <Text style={styles.warningText}>
            This build does not have sharing configured yet. Add
            {' '}
            EXPO_PUBLIC_SUPABASE_URL
            {' '}and{' '}
            EXPO_PUBLIC_SUPABASE_ANON_KEY, then rebuild.
          </Text>
        </View>
      ) : null}

      <View style={styles.formCard}>
        <Text style={styles.sectionLabel}>Room code</Text>
        <TextInput
          style={styles.input}
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
          placeholderTextColor={Colors.textMuted}
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
          <Ionicons name="dice-outline" size={16} color={Colors.primary} />
          <Text style={styles.generateText}>Generate a code</Text>
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {warning ? (
          <View style={styles.warningBox}>
            <Ionicons name="cloud-offline-outline" size={16} color={Colors.warning} />
            <Text style={styles.warningText}>{warning}</Text>
          </View>
        ) : null}

        {joined ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
            <Text style={styles.successText}>
              Room saved. {syncing ? 'Syncing recipes now...' : 'You are ready to share.'}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.joinButton, (!configured || joining) && styles.disabledButton]}
          onPress={handleJoin}
          disabled={joining || !configured}
          activeOpacity={0.8}
        >
          {joining ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.joinButtonText}>{config ? 'Use this code' : 'Join room'}</Text>
          )}
        </TouchableOpacity>

        {joined ? (
          <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.doneButtonText}>Done</Text>
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
