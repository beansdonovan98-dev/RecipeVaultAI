import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import {
  FONT_COLORS,
  FONT_OPTIONS,
  isHexColor,
  normalizeHexColor,
} from '@/constants/appearance';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import { THEME_OPTIONS } from '@/constants/themes';
import { useAppearance } from '@/contexts/AppearanceContext';

interface CustomizeAppearanceViewProps {
  onClose?: () => void;
}

export function CustomizeAppearanceView({ onClose }: CustomizeAppearanceViewProps) {
  const {
    fontKey,
    fontFamily,
    fontColor,
    themeKey,
    theme,
    setFontKey,
    setFontColor,
    setThemeKey,
    resetAppearance,
  } = useAppearance();
  const [customColor, setCustomColor] = useState(fontColor);
  const [colorError, setColorError] = useState<string | null>(null);

  useEffect(() => {
    setCustomColor(fontColor);
  }, [fontColor]);

  const applyCustomColor = () => {
    if (!isHexColor(customColor)) {
      setColorError('Use a 6-digit hex color, like #5B3A29.');
      return;
    }
    setColorError(null);
    void setFontColor(normalizeHexColor(customColor));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.introCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
        <Ionicons name="color-palette-outline" size={28} color={theme.accent} />
        <Text style={styles.introTitle}>Make it yours</Text>
        <Text style={styles.introText}>
          Choose a theme, font, and text color for the whole app. Your choices are saved for both
          phones in your shared room.
        </Text>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
        <Text style={styles.sectionLabel}>Theme</Text>
        <View style={styles.themeGrid}>
          {THEME_OPTIONS.map((option) => {
            const selected = option.id === themeKey;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeCard,
                  { backgroundColor: option.colors.inputBackground, borderColor: option.colors.borderLight },
                  selected && { borderColor: option.colors.accent },
                ]}
                onPress={() => void setThemeKey(option.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Use ${option.label} theme`}
              >
                <View style={[styles.themePreview, { backgroundColor: option.colors.background }]}>
                  <View style={[styles.themePreviewCard, { backgroundColor: option.colors.card }]}>
                    <View style={[styles.themePreviewLine, { backgroundColor: option.colors.primary }]} />
                    <View style={[styles.themePreviewLineShort, { backgroundColor: option.colors.accent }]} />
                  </View>
                </View>
                <View style={styles.themeCardText}>
                  <Text style={styles.themeLabel}>{option.label}</Text>
                  <Text style={styles.themeDescription}>{option.description}</Text>
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={20} color={option.colors.accent} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
        <Text style={styles.sectionLabel}>Font</Text>
        <View style={styles.fontGrid}>
          {FONT_OPTIONS.map((option) => {
            const selected = option.id === fontKey;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.fontCard,
                  { backgroundColor: theme.inputBackground, borderColor: theme.borderLight },
                  selected && { borderColor: theme.accent, backgroundColor: theme.tipBackground },
                ]}
                onPress={() => void setFontKey(option.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Use ${option.label} font`}
              >
                <RNText
                  style={[
                    styles.fontSample,
                    { fontFamily: Platform.select(option.families) },
                    selected && styles.fontSampleSelected,
                  ]}
                >
                  Aa
                </RNText>
                <View style={styles.fontCardText}>
                  <Text style={styles.fontLabel}>{option.label}</Text>
                  <Text style={styles.fontDescription}>{option.description}</Text>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
        <Text style={styles.sectionLabel}>Font color</Text>
        <View style={styles.swatchGrid}>
          {FONT_COLORS.map((option) => {
            const selected = option.value === fontColor;
            return (
              <TouchableOpacity
                key={option.id}
                style={styles.swatchItem}
                onPress={() => void setFontColor(option.value)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Use ${option.label} text color`}
              >
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: option.value },
                    selected && styles.swatchSelected,
                  ]}
                >
                  {selected ?               <Ionicons name="checkmark" size={18} color={theme.white} /> : null}
                </View>
                <Text style={styles.swatchLabel}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.customColorRow}>
          <View style={styles.customColorInput}>
            <Text style={styles.customColorLabel}>Custom hex</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBackground, borderColor: theme.borderLight, color: theme.text },
              ]}
              value={customColor}
              onChangeText={(value) => {
                setCustomColor(value);
                setColorError(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              placeholder="#1B2A4A"
              placeholderTextColor={theme.textMuted}
              returnKeyType="done"
              onSubmitEditing={applyCustomColor}
            />
          </View>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: theme.primary }]}
            onPress={applyCustomColor}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
        {colorError ? <Text style={styles.errorText}>{colorError}</Text> : null}
      </View>

      <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
        <Text style={styles.sectionLabel}>Preview</Text>
        <RNText style={[styles.previewTitle, { fontFamily, color: fontColor }]}>
          Sunday Pot Roast
        </RNText>
        <RNText style={[styles.previewBody, { fontFamily, color: fontColor }]}>
          A warm, comforting meal for the two of you. Season, simmer, and serve when tender.
        </RNText>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => void resetAppearance()}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh-outline" size={16} color={theme.textSecondary} />
        <Text style={styles.resetText}>Reset to defaults</Text>
      </TouchableOpacity>

      {onClose ? (
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: theme.primary }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      ) : null}
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
  sectionCard: {
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
  themeGrid: {
    gap: Spacing.sm,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.sm,
  },
  themePreview: {
    width: 74,
    height: 52,
    borderRadius: BorderRadius.sm,
    padding: 6,
    justifyContent: 'center',
  },
  themePreviewCard: {
    flex: 1,
    borderRadius: 4,
    padding: 6,
    justifyContent: 'center',
    gap: 4,
  },
  themePreviewLine: {
    height: 4,
    width: '80%',
    borderRadius: 2,
  },
  themePreviewLineShort: {
    height: 3,
    width: '55%',
    borderRadius: 2,
  },
  themeCardText: {
    flex: 1,
    gap: 2,
  },
  themeLabel: {
    ...Typography.label,
    fontSize: 14,
  },
  themeDescription: {
    ...Typography.caption,
  },
  fontGrid: {
    gap: Spacing.sm,
  },
  fontCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  fontCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.tipBackground,
  },
  fontSample: {
    width: 48,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  fontSampleSelected: {
    color: Colors.primary,
  },
  fontCardText: {
    flex: 1,
    gap: 2,
  },
  fontLabel: {
    ...Typography.label,
    fontSize: 14,
  },
  fontDescription: {
    ...Typography.caption,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  swatchItem: {
    alignItems: 'center',
    gap: Spacing.xs,
    width: 54,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  swatchLabel: {
    ...Typography.caption,
    fontSize: 10,
    textAlign: 'center',
  },
  customColorRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  customColorInput: {
    flex: 1,
    gap: Spacing.xs,
  },
  customColorLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  applyButtonText: {
    ...Typography.label,
    color: Colors.white,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
  },
  previewCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  previewTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  previewBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  resetText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.button,
  },
  doneButtonText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 16,
  },
});
