import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export function EmptyState({ icon = 'restaurant-outline', title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={48} color={Colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  title: {
    ...Typography.subtitle,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodySmall,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
