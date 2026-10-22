import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import {
  FONT_COLORS,
  FONT_OPTIONS,
  isHexColor,
  normalizeHexColor,
  readableTextColor,
} from '@/constants/appearance';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import { THEME_OPTIONS, DISPLAY_FONTS, themeCardStyle } from '@/constants/themes';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useAssistant } from '@/contexts/AssistantContext';
import {
  ASSISTANT_NAME_MAX_LENGTH,
  ASSISTANT_PERSONAS,
  normalizeAssistantName,
} from '@/constants/assistant';

interface CustomizeAppearanceViewProps {
  onClose?: () => void;
}

/**
 * Some room errors mean the Supabase function is out of date, not that the
 * photo is bad. Only those should point at settings.sql.
 */
function needsSettingsSqlHelp(message: string): boolean {
  return /unknown setting|invalid assistant background|room not found|could not find the function|schema cache|does not exist/i.test(
    message
  );
}

export function CustomizeAppearanceView({ onClose }: CustomizeAppearanceViewProps) {
  const {
    fontKey,
    fontFamily,
    fontColor,
    themeKey,
    theme,
    design,
    displayFamily,
    setFontKey,
    setFontColor,
    setThemeKey,
    resetAppearance,
  } = useAppearance();
  const [customColor, setCustomColor] = useState(fontColor);
  const [colorError, setColorError] = useState<string | null>(null);
  const cardTokens = themeCardStyle(design, theme);

  const {
    name: assistantName,
    persona,
    personaId,
    isShared,
    sharedError,
    backgroundUri,
    setBackground,
    setName,
    setPersona,
  } = useAssistant();
  const [nameDraft, setNameDraft] = useState(assistantName);
  const [nameSaved, setNameSaved] = useState(false);
  const [pickingBackground, setPickingBackground] = useState(false);
  const [retryingShare, setRetryingShare] = useState(false);

  useEffect(() => {
    setCustomColor(fontColor);
  }, [fontColor]);

  useEffect(() => {
    setNameDraft(assistantName);
    setNameSaved(false);
  }, [assistantName]);

  const applyAssistantName = () => {
    const next = normalizeAssistantName(nameDraft, persona.defaultName);
    setNameDraft(next);
    setNameSaved(true);
    void setName(next);
  };

  const pickBackground = async () => {
    setPickingBackground(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        await setBackground(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Could not use that photo', 'Try choosing a different image.');
    } finally {
      setPickingBackground(false);
    }
  };

  const retrySharingBackground = async () => {
    if (!backgroundUri) {
      return;
    }
    setRetryingShare(true);
    try {
      await setBackground(backgroundUri);
    } finally {
      setRetryingShare(false);
    }
  };

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
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.introCard, cardTokens, { backgroundColor: theme.card }]}>
        <Ionicons name="color-palette-outline" size={28} color={theme.accent} />
        <Text style={[styles.introTitle, { fontFamily: displayFamily }]}>Make it yours</Text>
        <Text style={styles.introText}>
          Choose a theme, font, and text color, and name the recipe assistant. Your choices are saved
          for both phones in your shared room.
        </Text>
      </View>

      <View style={[styles.sectionCard, cardTokens, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionLabel, { fontFamily: displayFamily }]}>Theme</Text>
        <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>
          Each theme brings its own heading face, card shape, and shadow — not just colors.
        </Text>
        <View style={styles.themeGrid}>
          {THEME_OPTIONS.map((option) => {
            const selected = option.id === themeKey;
            const previewFont = Platform.select(DISPLAY_FONTS[option.design.displayFont]);
            const previewCard = themeCardStyle(option.design, option.colors);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeTile,
                  {
                    backgroundColor: option.colors.background,
                    borderColor: selected ? option.colors.accent : option.colors.borderLight,
                    borderRadius: Math.max(option.design.cardRadius, 8),
                  },
                ]}
                onPress={() => void setThemeKey(option.id)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Use ${option.label} theme`}
              >
                <View
                  style={[
                    styles.themeTilePreview,
                    {
                      backgroundColor: option.colors.card,
                      borderColor: previewCard.borderColor,
                      borderWidth: previewCard.borderWidth,
                      borderRadius: Math.min(previewCard.borderRadius, 12),
                      shadowColor:
                        option.design.cardShadow === 'hard'
                          ? option.colors.border
                          : option.colors.shadow,
                      shadowOpacity: option.design.cardShadow === 'none' ? 0 : 1,
                      shadowRadius: option.design.cardShadow === 'hard' ? 0 : 6,
                      shadowOffset:
                        option.design.cardShadow === 'hard'
                          ? { width: 3, height: 3 }
                          : { width: 0, height: 2 },
                      elevation: option.design.cardShadow === 'none' ? 0 : 3,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: previewFont,
                      color: option.colors.text,
                      fontSize: 20,
                      fontWeight: '700',
                    }}
                  >
                    Aa
                  </Text>
                  <View
                    style={[
                      styles.themePreviewLine,
                      { backgroundColor: option.colors.primary, width: '70%' },
                    ]}
                  />
                  <View
                    style={[
                      styles.themePreviewLine,
                      { backgroundColor: option.colors.accent, width: '40%', height: 3 },
                    ]}
                  />
                </View>

                <View style={styles.themeTileRow}>
                  <Text
                    style={[styles.themeTileLabel, { color: option.colors.text }]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={14} color={option.colors.accent} />
                  ) : null}
                </View>
                <Text
                  style={[styles.themeTileDescription, { color: option.colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {option.description}
                </Text>
                <View style={styles.themeSwatches}>
                  {[
                    option.colors.primary,
                    option.colors.accent,
                    option.colors.background,
                    option.colors.card,
                  ].map((swatch, swatchIndex) => (
                    <View
                      key={`${option.id}-swatch-${swatchIndex}`}
                      style={[
                        styles.themeSwatch,
                        { backgroundColor: swatch, borderColor: option.colors.borderLight },
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.sectionCard, cardTokens, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionLabel, { fontFamily: displayFamily }]}>Font</Text>
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

      <View style={[styles.sectionCard, cardTokens, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionLabel, { fontFamily: displayFamily }]}>Font color</Text>
        <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>
          If a color would disappear on the current theme, the app lightens or darkens it just enough to read.
        </Text>
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

      <View style={[styles.sectionCard, cardTokens, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionLabel, { fontFamily: displayFamily }]}>Recipe assistant</Text>
        <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>
          {isShared
            ? 'The name and personality are shared, so you both talk to the same assistant.'
            : 'Saved on this phone. Join a shared room to use the same assistant on both phones.'}
        </Text>

        <View style={styles.nameRow}>
          <View style={styles.nameInput}>
            <Text style={styles.customColorLabel}>Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.borderLight,
                  color: theme.text,
                },
              ]}
              value={nameDraft}
              onChangeText={(value) => {
                setNameDraft(value);
                setNameSaved(false);
              }}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={ASSISTANT_NAME_MAX_LENGTH}
              placeholder={persona.defaultName}
              placeholderTextColor={theme.textMuted}
              returnKeyType="done"
              onSubmitEditing={applyAssistantName}
            />
          </View>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: theme.primary }]}
            onPress={applyAssistantName}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        {nameSaved ? (
          <Text style={[styles.savedText, { color: theme.success }]}>Saved</Text>
        ) : null}
        {sharedError ? (
          <View style={[styles.sharedErrorBox, { borderColor: theme.error }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>{sharedError}</Text>
            <Text style={[styles.sharedErrorHint, { color: theme.textMuted }]}>
              Saved on this phone only.
              {needsSettingsSqlHelp(sharedError)
                ? ' Re-run supabase/settings.sql in the Supabase SQL editor, then try sharing again.'
                : ''}
            </Text>
          </View>
        ) : null}

        <View style={styles.personaGrid}>
          {ASSISTANT_PERSONAS.map((option) => {
            const selected = option.id === personaId;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.personaCard,
                  { backgroundColor: theme.inputBackground, borderColor: theme.borderLight },
                  selected && { borderColor: theme.accent, backgroundColor: theme.tipBackground },
                ]}
                onPress={() => {
                  setNameSaved(false);
                  void setPersona(option.id).then(() => setNameDraft(option.defaultName));
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Use the ${option.label} personality`}
              >
                <View style={styles.personaText}>
                  <Text style={styles.personaLabel}>{option.label}</Text>
                  <Text style={[styles.personaTagline, { color: theme.textSecondary }]}>
                    {option.tagline}
                  </Text>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.backgroundBlock}>
          <Text style={styles.customColorLabel}>Chat background</Text>
          <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>
            Shown behind the assistant chat and all three AI tools. Save a picture of your assistant
            to your photos, then choose it here.
          </Text>
          <View style={styles.backgroundRow}>
            <View
              style={[
                styles.backgroundPreview,
                { backgroundColor: theme.inputBackground, borderColor: theme.borderLight },
              ]}
            >
              {backgroundUri ? (
                <Image
                  source={{ uri: backgroundUri }}
                  style={styles.backgroundImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="image-outline" size={22} color={theme.textMuted} />
              )}
            </View>
            <View style={styles.backgroundActions}>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: theme.primary }]}
                onPress={() => void pickBackground()}
                activeOpacity={0.8}
                disabled={pickingBackground}
              >
                {pickingBackground ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  <Text style={styles.applyButtonText}>
                    {backgroundUri ? 'Change photo' : 'Choose photo'}
                  </Text>
                )}
              </TouchableOpacity>
              {backgroundUri ? (
                <TouchableOpacity
                  onPress={() => void setBackground(null)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Remove chat background"
                >
                  <Text style={[styles.removeText, { color: theme.error }]}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          {isShared && sharedError && backgroundUri ? (
            <TouchableOpacity
              style={[styles.retryShareButton, { borderColor: theme.primary }]}
              onPress={() => void retrySharingBackground()}
              activeOpacity={0.8}
              disabled={retryingShare}
              accessibilityRole="button"
              accessibilityLabel="Try sharing the background again"
            >
              {retryingShare ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Ionicons name="share-outline" size={14} color={theme.primary} />
                  <Text style={[styles.retryShareText, { color: theme.primary }]}>
                    Try sharing again
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={[styles.previewCard, cardTokens, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionLabel, { fontFamily: displayFamily }]}>Preview</Text>
        <RNText style={[styles.previewTitle, { fontFamily, color: readableTextColor(fontColor, theme.card, theme.text) }]}>
          Sunday Pot Roast
        </RNText>
        <RNText style={[styles.previewBody, { fontFamily, color: readableTextColor(fontColor, theme.card, theme.text) }]}>
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
  sectionHint: {
    ...Typography.caption,
    lineHeight: 17,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  nameInput: {
    flex: 1,
    gap: Spacing.xs,
  },
  savedText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  personaGrid: {
    gap: Spacing.sm,
  },
  personaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  personaText: {
    flex: 1,
    gap: 2,
  },
  personaLabel: {
    ...Typography.label,
    fontSize: 14,
  },
  personaTagline: {
    ...Typography.caption,
    lineHeight: 16,
  },
  backgroundBlock: {
    gap: Spacing.xs,
  },
  backgroundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  backgroundPreview: {
    width: 64,
    height: 84,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundActions: {
    flex: 1,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  removeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  retryShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  retryShareText: {
    ...Typography.label,
    fontSize: 11,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  themeTile: {
    width: '48%',
    padding: Spacing.sm,
    borderWidth: 2,
    gap: 4,
  },
  themeTilePreview: {
    height: 58,
    paddingHorizontal: 8,
    justifyContent: 'center',
    gap: 3,
  },
  themePreviewLine: {
    height: 4,
    borderRadius: 2,
  },
  themeSwatches: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  themeSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  themeTileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  themeTileLabel: {
    ...Typography.label,
    fontSize: 12,
    flexShrink: 1,
  },
  themeTileDescription: {
    ...Typography.caption,
    fontSize: 10,
    lineHeight: 13,
    minHeight: 26,
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
  sharedErrorBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 2,
  },
  sharedErrorHint: {
    ...Typography.caption,
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
