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
 * Static style sheets are written against the default palette. When a theme is
 * active, map those colors onto the matching theme role so secondary/muted/
 * accent text keeps its meaning (and stays legible) in every palette.
 */
const STATIC_COLOR_ROLES: Array<[string, keyof ThemePalette]> = [
  [Colors.textSecondary, 'textSecondary'],
  [Colors.textMuted, 'textMuted'],
  [Colors.secondary, 'secondary'],
  [Colors.accent, 'accent'],
  [Colors.accentLight, 'accentLight'],
  [Colors.primaryLight, 'primaryLight'],
  [Colors.error, 'error'],
  [Colors.success, 'success'],
  [Colors.warning, 'warning'],
  [Colors.heart, 'heart'],
  [Colors.heartEmpty, 'heartEmpty'],
];

function resolveTextColor(
  color: unknown,
  fontColor: string,
  theme: ThemePalette
): string | undefined {
  if (color === undefined || color === Colors.text || color === Colors.primary) {
    return readableTextColor(fontColor, theme.background, theme.text);
  }

  if (typeof color !== 'string') {
    return undefined;
  }

  const match = STATIC_COLOR_ROLES.find(([staticColor]) => staticColor === color);
  if (!match) {
    return undefined;
  }

  return readableTextColor(theme[match[1]], theme.background, theme.text);
}

export function AppText({ style, ...props }: TextProps) {
  const { fontFamily, fontColor, theme } = useAppearance();
  const flattened = StyleSheet.flatten(style);
  const resolvedColor = resolveTextColor(flattened?.color, fontColor, theme);
  const useCustomFont = fontFamily && !flattened?.fontFamily;

  return (
    <RNText
      {...props}
      style={[style, useCustomFont ? { fontFamily } : null, resolvedColor ? { color: resolvedColor } : null]}
    />
  );
}

export const AppTextInput = React.forwardRef<RNTextInput, TextInputProps>(function AppTextInput(
  { style, ...props },
  ref
) {
  const { fontFamily, fontColor, theme } = useAppearance();
  const flattened = StyleSheet.flatten(style);
  const resolvedColor = resolveTextColor(flattened?.color, fontColor, theme);
  const useCustomFont = fontFamily && !flattened?.fontFamily;

  return (
    <RNTextInput
      ref={ref}
      {...props}
      style={[style, useCustomFont ? { fontFamily } : null, resolvedColor ? { color: resolvedColor } : null]}
    />
  );
});
