import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

interface Props {
  error: Error;
  onRetry: () => void;
  isRetrying?: boolean;
  onViewCrashReports?: () => void;
}

export function StartupErrorScreen({
  error,
  onRetry,
  isRetrying = false,
  onViewCrashReports,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Unable to start</Text>
        <Text style={styles.message}>
          Recipe Vault AI could not initialize its local database. Your saved recipes have not been
          changed.
        </Text>
        <Text style={styles.detail}>{error.message || 'Unknown initialization error'}</Text>
        <TouchableOpacity
          style={[styles.button, isRetrying && styles.buttonDisabled]}
          onPress={onRetry}
          activeOpacity={0.8}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Try Again</Text>
          )}
        </TouchableOpacity>
        {onViewCrashReports ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onViewCrashReports}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>View crash reports</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    ...Typography.subtitle,
    marginBottom: Spacing.sm,
    color: Colors.error,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  detail: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...Typography.label,
    color: Colors.white,
  },
  secondaryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  secondaryButtonText: {
    ...Typography.label,
    color: Colors.primary,
  },
});
