import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Colors } from '@/constants/theme';
import { readableTextColor } from '@/constants/appearance';
import type { ThemePalette } from '@/constants/themes';

/**
 * Semantic colors that keep their theme meaning regardless of the user's
 * font-color choice (errors, success, warnings, hearts).
 */
const SEMANTIC_COLOR_ROLES: Array<[string, keyof ThemePalette]> = [
  [Colors.error, 'error'],
  [Colors.success, 'success'],
  [Colors.warning, 'warning'],
  [Colors.heart, 'heart'],
  [Colors.heartEmpty, 'heartEmpty'],
];

/**
 * The user's font color always wins over theme-derived text colors.
 * Only truly semantic colors (error, success, warning, heart) keep their
 * theme meaning so the UI stays legible and meaningful.
 */
function resolveTextColor(
  color: unknown,
  fontColor: string,
  theme: ThemePalette
): string {
  const semanticMatch = SEMANTIC_COLOR_ROLES.find(([staticColor]) => staticColor === color);
  if (semanticMatch) {
    return readableTextColor(theme[semanticMatch[1]], theme.background, theme.text);
  }
  return readableTextColor(fontColor, theme.background, theme.text);
}

export function AppText({ style, ...props }: TextProps) {
  const { fontFamily, fontColor, theme } = useAppearance();
  const resolvedColor = resolveTextColor(StyleSheet.flatten(style)?.color, fontColor, theme);

  return (
    <RNText
      {...props}
      style={[style, fontFamily ? { fontFamily } : null, { color: resolvedColor }]}
    />
  );
}

export const AppTextInput = React.forwardRef<RNTextInput, TextInputProps>(function AppTextInput(
  { style, ...props },
  ref
) {
  const { fontFamily, fontColor, theme } = useAppearance();
  const resolvedColor = resolveTextColor(StyleSheet.flatten(style)?.color, fontColor, theme);

  return (
    <RNTextInput
      ref={ref}
      {...props}
      style={[style, fontFamily ? { fontFamily } : null, { color: resolvedColor }]}
    />
  );
});
