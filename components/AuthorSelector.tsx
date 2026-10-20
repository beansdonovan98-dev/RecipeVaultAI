import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AUTHOR_IDS, AUTHORS, type AuthorId } from '@/constants/authors';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

interface AuthorSelectorProps {
  value: AuthorId | null;
  onChange: (author: AuthorId) => void;
  disabled?: boolean;
}

export function AuthorSelector({ value, onChange, disabled = false }: AuthorSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Posting as</Text>
      <View style={styles.row}>
        {AUTHOR_IDS.map((author) => {
          const selected = value === author;
          return (
            <TouchableOpacity
              key={author}
              style={[styles.chip, selected && styles.chipSelected, disabled && styles.disabled]}
              onPress={() => onChange(author)}
              disabled={disabled}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Post as ${AUTHORS[author].label}`}
            >
              <Text style={[styles.emoji, selected && styles.emojiSelected]}>
                {AUTHORS[author].emoji}
              </Text>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {AUTHORS[author].name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.helperText}>
        {value
          ? `New recipes from this phone will be labeled ${AUTHORS[value].label}.`
          : 'Choose who is using this phone so shared recipes are labeled correctly.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.sectionLabel,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.inputBackground,
  },
  chipSelected: {
    backgroundColor: Colors.tipBackground,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.55,
  },
  emoji: {
    fontSize: 16,
  },
  emojiSelected: {
    fontSize: 18,
  },
  chipText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  helperText: {
    ...Typography.caption,
  },
});
