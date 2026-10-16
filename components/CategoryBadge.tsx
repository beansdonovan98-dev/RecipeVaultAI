import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { getCategoryInfo } from '@/constants/categories';
import { Category } from '@/types/recipe';

interface CategoryBadgeProps {
  category: Category;
  onPress?: () => void;
  selected?: boolean;
  showCount?: boolean;
  count?: number;
}

export function CategoryBadge({ category, onPress, selected, showCount, count }: CategoryBadgeProps) {
  const info = getCategoryInfo(category);

  const content = (
    <View style={[styles.container, selected && styles.selected]}>
      <Ionicons name={info.icon as any} size={14} color={selected ? Colors.white : info.color} />
      <Text style={[styles.text, selected && styles.selectedText]}>{category}</Text>
      {showCount && count !== undefined && (
        <Text style={[styles.count, selected && styles.selectedText]}>({count})</Text>
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
