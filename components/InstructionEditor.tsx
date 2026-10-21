import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';
import {
  applyBullet,
  wrapSelection,
  type FormatResult,
  type TextSelection,
} from '@/utils/instructionFormatting';

interface InstructionEditorProps {
  index: number;
  value: string;
  onChangeText: (value: string) => void;
  onRemove: () => void;
  placeholder: string;
}

export function InstructionEditor({
  index,
  value,
  onChangeText,
  onRemove,
  placeholder,
}: InstructionEditorProps) {
  const { theme } = useAppearance();
  const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0 });

  const applyFormat = (result: FormatResult) => {
    onChangeText(result.text);
    setSelection(result.selection);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.stepNumber, { backgroundColor: theme.primary, color: theme.white }]}>
          {index + 1}
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.inputBackground, borderColor: theme.borderLight },
          ]}
          value={value}
          onChangeText={onChangeText}
          onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
          selection={selection}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          multiline
        />
        <TouchableOpacity onPress={onRemove} style={styles.removeButton} accessibilityLabel={`Remove step ${index + 1}`}>
          <Ionicons name="close-circle" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => applyFormat(applyBullet(value, selection))}
          accessibilityRole="button"
          accessibilityLabel="Toggle bullet point"
        >
          <Ionicons name="list-outline" size={16} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => applyFormat(wrapSelection(value, selection, '**', 'bold'))}
          accessibilityRole="button"
          accessibilityLabel="Bold selected text"
        >
          <Text style={[styles.boldIcon, { color: theme.primary }]}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => applyFormat(wrapSelection(value, selection, '__', 'underline'))}
          accessibilityRole="button"
          accessibilityLabel="Underline selected text"
        >
          <Text style={[styles.underlineIcon, { color: theme.primary }]}>U</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  stepNumber: {
    ...Typography.label,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  removeButton: {
    padding: Spacing.xs,
    marginTop: Spacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginLeft: 32,
  },
  toolButton: {
    width: 32,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.tipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldIcon: {
    ...Typography.label,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  underlineIcon: {
    ...Typography.label,
    fontSize: 13,
    textDecorationLine: 'underline',
    color: Colors.primary,
  },
});
