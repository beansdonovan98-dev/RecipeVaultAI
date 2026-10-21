import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

export function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  const { theme } = useAppearance();

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ActivityIndicator size={size} color={theme.primary} />
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
});
