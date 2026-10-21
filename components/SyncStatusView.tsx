import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { useRoomConfig } from '@/hooks/useRoomConfig';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { syncRecipes } from '@/services/recipeSync';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import {
  getSyncStatusDisplay,
  type SyncTone,
} from '@/utils/syncStatusDisplay';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';
import { themeCardStyle } from '@/constants/themes';

interface SyncStatusViewProps {
  onClose: () => void;
}

function getToneIcon(tone: SyncTone): 'cloud-outline' | 'cloud-done-outline' | 'cloud-offline-outline' | 'alert-circle-outline' {
  switch (tone) {
    case 'success':
      return 'cloud-done-outline';
    case 'warning':
      return 'cloud-offline-outline';
    case 'error':
      return 'alert-circle-outline';
    case 'muted':
    default:
      return 'cloud-outline';
  }
}

function getStatusDescription(state: string, hasRoom: boolean): string {
  if (!hasRoom) {
    return 'Set up a shared room first. The room code connects both phones and keeps recipes in sync.';
  }

  switch (state) {
    case 'syncing':
      return 'Checking the shared room and sending any waiting changes.';
    case 'connected':
      return 'This phone is talking to the shared room. Changes sync automatically.';
    case 'offline':
      return 'The shared room could not be reached. Check the connection and try again.';
    case 'error':
      return 'The shared room returned an error. Try again, or check the room code and Supabase setup.';
    case 'idle':
    default:
      return 'No sync has run yet. Tap Check now, or wait for the automatic sync.';
  }
}

function formatLastSynced(value: number | null): string {
  if (!value) {
    return 'Not yet';
  }
  return new Date(value).toLocaleString();
}

export function SyncStatusView({ onClose }: SyncStatusViewProps) {
  const { theme, design } = useAppearance();
  const cardTokens = themeCardStyle(design, theme);
  const { config } = useRoomConfig();
  const status = useSyncStatus();
  const [checking, setChecking] = useState(false);
  const hasRoom = Boolean(config);
  const display = getSyncStatusDisplay(status.state, hasRoom);
  const toneColors: Record<SyncTone, string> = {
    muted: theme.textMuted,
    warning: theme.warning,
    success: theme.success,
    error: theme.error,
  };
  const toneColor = toneColors[display.tone];

  const handleCheck = useCallback(async () => {
    if (checking) return;

    setChecking(true);
    recordBreadcrumb('sync:manual-check');
    try {
      await syncRecipes();
    } catch (error) {
      captureException(error, { source: 'syncStatus.manualCheck' });
    } finally {
      setChecking(false);
    }
  }, [checking]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.statusCard,
          cardTokens,
          { backgroundColor: theme.card },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${toneColor}18` }]}>
          <Ionicons name={getToneIcon(display.tone)} size={36} color={toneColor} />
        </View>
        <Text style={[styles.statusLabel, { color: toneColor }]}>{display.label}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {getStatusDescription(status.state, hasRoom)}
        </Text>
      </View>

      <View
        style={[
          styles.detailsCard,
          cardTokens,
          { backgroundColor: theme.card },
        ]}
      >
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Room</Text>
          <Text style={styles.detailValue}>{config ? config.code : 'Not set up'}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last successful sync</Text>
          <Text style={styles.detailValue}>{formatLastSynced(status.lastSyncedAt)}</Text>
        </View>
        {status.message ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Details</Text>
              <Text style={[styles.detailValue, styles.detailMessage]}>{status.message}</Text>
            </View>
          </>
        ) : null}
      </View>

      <TouchableOpacity
        style={[
          styles.checkButton,
          { backgroundColor: theme.primary },
          (checking || !hasRoom) && styles.disabledButton,
        ]}
        onPress={handleCheck}
        disabled={checking || !hasRoom}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Check shared room connection"
      >
        {checking ? (
          <ActivityIndicator color={theme.white} />
        ) : (
          <>
            <Ionicons name="refresh-outline" size={18} color={theme.white} />
            <Text style={[styles.checkButtonText, { color: theme.white }]}>Check now</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Recipes and photos sync automatically when the app opens, returns to the foreground, and
        after you make a change. Keep both phones online to receive updates right away.
      </Text>

      <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.7}>
        <Text style={[styles.doneButtonText, { color: theme.primary }]}>Done</Text>
      </TouchableOpacity>
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
  statusCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statusLabel: {
    ...Typography.title,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  detailsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    ...Shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  detailMessage: {
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 50,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  checkButtonText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerText: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  doneButtonText: {
    ...Typography.label,
    color: Colors.primary,
  },
});
