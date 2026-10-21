import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { getCategoryInfo } from '@/constants/categories';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Category } from '@/types/recipe';

interface CategoryBadgeProps {
  category: Category;
  onPress?: () => void;
  selected?: boolean;
  showCount?: boolean;
  count?: number;
}

export function CategoryBadge({ category, onPress, selected, showCount, count }: CategoryBadgeProps) {
  const { theme } = useAppearance();
  const info = getCategoryInfo(category);

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.inputBackground, borderColor: theme.borderLight },
        selected && { backgroundColor: theme.primary, borderColor: theme.primary },
      ]}
    >
      <Ionicons name={info.icon as any} size={14} color={selected ? theme.white : info.color} />
      <Text style={[styles.text, { color: selected ? theme.white : theme.text }]}>{category}</Text>
      {showCount && count !== undefined && (
        <Text style={[styles.count, { color: selected ? theme.white : theme.textMuted }]}>
          ({count})
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  selected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    ...Typography.label,
    fontSize: 12,
  },
  selectedText: {
    color: Colors.white,
  },
  count: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
