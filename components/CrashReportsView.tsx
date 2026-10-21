import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Share,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import type { CrashReport } from '@/types/crash';
import {
  clearCrashReports,
  deleteCrashReport,
  formatCrashReport,
  getCrashReports,
  recordTestCrash,
  setCrashResolved,
} from '@/services/crashTracker';
import { diagnoseCrash, formatCrashTime } from '@/utils/crashDiagnostics';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

const MONOSPACE = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

interface CrashReportsViewProps {
  onClose?: () => void;
}

export function CrashReportsView({ onClose }: CrashReportsViewProps) {
  const overlayTopInset = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24);
  const [reports, setReports] = useState<CrashReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadReports = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    }
    try {
      const data = await getCrashReports();
      setReports(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports(false);
  }, [loadReports]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports(false);
  }, [loadReports]);

  const handleShare = useCallback(async (report: CrashReport) => {
    try {
      await Share.share({ message: formatCrashReport(report), title: 'Recipe Vault AI crash report' });
    } catch (error) {
      Alert.alert('Unable to share', error instanceof Error ? error.message : 'Please try again.');
    }
  }, []);

  const handleDelete = useCallback(
    (report: CrashReport) => {
      Alert.alert('Delete crash report?', 'This removes the report from this device.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCrashReport(report.fingerprint);
            setExpanded(null);
            loadReports(false);
          },
        },
      ]);
    },
    [loadReports]
  );

  const handleResolve = useCallback(
    async (report: CrashReport) => {
      await setCrashResolved(report.fingerprint, !report.resolved);
      loadReports(false);
    },
    [loadReports]
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear all crash reports?',
      'This permanently removes every crash report stored on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearCrashReports();
            setExpanded(null);
            loadReports(false);
          },
        },
      ]
    );
  }, [loadReports]);

  const handleTestCrash = useCallback(async () => {
    recordTestCrash();
    await loadReports(false);
    setExpanded(null);
    Alert.alert(
      'Test crash recorded',
      'If the report list did not update, the crash database is unavailable and reports are being kept in memory.'
    );
  }, [loadReports]);

  const totalOccurrences = reports.reduce((sum, report) => sum + report.occurrences, 0);
  const fatalCount = reports.filter((report) => report.isFatal).length;

  if (loading) {
    return (
      <View style={[styles.center, onClose ? { paddingTop: overlayTopInset } : null]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading crash reports...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, onClose ? { paddingTop: overlayTopInset } : null]}>
      {onClose ? (
        <View style={styles.viewerHeader}>
          <Text style={styles.viewerTitle}>Crash Reports</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Close crash reports"
          >
            <Ionicons name="close" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{reports.length}</Text>
            <Text style={styles.summaryLabel}>distinct issues</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalOccurrences}</Text>
            <Text style={styles.summaryLabel}>total crashes</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, fatalCount > 0 && styles.fatalValue]}>{fatalCount}</Text>
            <Text style={styles.summaryLabel}>fatal</Text>
          </View>
        </View>
        <Text style={styles.summaryHint}>
          Reports are grouped by error and stored on this device in a separate database, so app data
          problems cannot erase them.
        </Text>
        <View style={styles.summaryActions}>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleRefresh} activeOpacity={0.8}>
            <Ionicons name="refresh" size={16} color={Colors.primary} />
            <Text style={styles.secondaryActionText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleTestCrash} activeOpacity={0.8}>
            <Ionicons name="flask-outline" size={16} color={Colors.primary} />
            <Text style={styles.secondaryActionText}>Test crash</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerAction} onPress={handleClearAll} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
            <Text style={styles.dangerActionText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      </View>

      {reports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="shield-checkmark-outline" size={44} color={Colors.success} />
          <Text style={styles.emptyTitle}>No crashes recorded</Text>
          <Text style={styles.emptyMessage}>
            When the app hits an error, it will appear here with the time, screen, device, stack
            trace, likely cause, and a suggested fix.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.fingerprint}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => {
            const isExpanded = expanded === item.fingerprint;
            const diagnosis = diagnoseCrash(item.message, item.stack);
            const accent = item.resolved ? Colors.textMuted : item.isFatal ? Colors.error : Colors.warning;

            return (
              <View style={[styles.card, item.resolved && styles.resolvedCard]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setExpanded(isExpanded ? null : item.fingerprint)}
                >
                  <View style={[styles.severityBar, { backgroundColor: accent }]} />
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.badges}>
                        <View style={[styles.badge, { backgroundColor: accent }]}>
                          <Text style={styles.badgeText}>
                            {item.resolved ? 'RESOLVED' : item.isFatal ? 'FATAL' : 'ERROR'}
                          </Text>
                        </View>
                        <View style={styles.sourceBadge}>
                          <Text style={styles.sourceBadgeText}>{item.source}</Text>
                        </View>
                      </View>
                      <Text style={styles.occurrenceText}>x{item.occurrences}</Text>
                    </View>

                    <Text style={styles.errorName}>
                      {item.name}: {item.message}
                    </Text>

                    <Text style={styles.metaText}>
                      Last seen {formatCrashTime(item.lastSeen)}
                      {item.route ? ` on ${item.route}` : ''}
                    </Text>
                    <Text style={styles.metaText}>
                      {item.device} - {item.platform} {item.osVersion} - app {item.appVersion}
                    </Text>

                    <View style={styles.expandHint}>
                      <Text style={styles.expandHintText}>
                        {isExpanded ? 'Hide details' : 'Show cause, fix, and stack trace'}
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={Colors.primary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded ? (
                  <View style={styles.details}>
                    <View style={styles.diagnosisBox}>
                      <Text style={styles.diagnosisLabel}>LIKELY CAUSE</Text>
                      <Text style={styles.diagnosisText}>{diagnosis.likelyCause}</Text>
                      <Text style={[styles.diagnosisLabel, styles.fixLabel]}>HOW TO FIX</Text>
                      <Text style={styles.diagnosisText}>{diagnosis.suggestedFix}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>First seen</Text>
                      <Text style={styles.detailValue}>{formatCrashTime(item.firstSeen)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Fingerprint</Text>
                      <Text style={styles.detailValue}>{item.fingerprint}</Text>
                    </View>
                    {item.context ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailKey}>Context</Text>
                        <Text style={styles.detailValue}>{item.context}</Text>
                      </View>
                    ) : null}

                    <Text style={styles.codeLabel}>Stack trace</Text>
                    <View style={styles.codeBox}>
                      <Text style={styles.codeText} selectable>
                        {item.stack}
                      </Text>
                    </View>

                    {item.componentStack ? (
                      <>
                        <Text style={styles.codeLabel}>Component stack</Text>
                        <View style={styles.codeBox}>
                          <Text style={styles.codeText} selectable>
                            {item.componentStack}
                          </Text>
                        </View>
                      </>
                    ) : null}

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleShare(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="share-outline" size={16} color={Colors.primary} />
                        <Text style={styles.actionText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleResolve(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={item.resolved ? 'refresh-outline' : 'checkmark-circle-outline'}
                          size={16}
                          color={Colors.primary}
                        />
                        <Text style={styles.actionText}>{item.resolved ? 'Reopen' : 'Resolve'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  viewerTitle: {
    ...Typography.subtitle,
    fontSize: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tipBackground,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.bodySmall,
  },
  summaryCard: {
    margin: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...Typography.title,
    fontSize: 24,
  },
  fatalValue: {
    color: Colors.error,
  },
  summaryLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderLight,
  },
  summaryHint: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  summaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.tipBackground,
  },
  secondaryActionText: {
    ...Typography.label,
  },
  dangerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FDE8E8',
  },
  dangerActionText: {
    ...Typography.label,
    color: Colors.error,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadows.card,
  },
  resolvedCard: {
    opacity: 0.72,
  },
  severityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardBody: {
    padding: Spacing.lg,
    paddingLeft: Spacing.xl,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: Spacing.xs,
  },
  badge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  sourceBadge: {
    backgroundColor: Colors.tipBackground,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    flexShrink: 1,
  },
  sourceBadgeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  occurrenceText: {
    ...Typography.label,
    color: Colors.error,
  },
  errorName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
    marginTop: 2,
  },
  expandHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  expandHintText: {
    ...Typography.label,
    color: Colors.primary,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    padding: Spacing.lg,
    paddingLeft: Spacing.xl,
  },
  diagnosisBox: {
    backgroundColor: Colors.tipBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  diagnosisLabel: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.accent,
  },
  fixLabel: {
    marginTop: Spacing.md,
  },
  diagnosisText: {
    ...Typography.bodySmall,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  detailKey: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  detailValue: {
    ...Typography.caption,
    color: Colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  codeLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  codeBox: {
    backgroundColor: '#1B2A4A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  codeText: {
    fontFamily: MONOSPACE,
    fontSize: 11,
    lineHeight: 16,
    color: '#E2E8F0',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.tipBackground,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  actionText: {
    ...Typography.label,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FDE8E8',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  deleteText: {
    ...Typography.label,
    color: Colors.error,
  },
  emptyCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.card,
  },
  emptyTitle: {
    ...Typography.subtitle,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
});
