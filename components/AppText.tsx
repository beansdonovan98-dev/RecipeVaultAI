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

function shouldUseCustomColor(color: unknown): boolean {
  return color === undefined || color === Colors.primary || color === Colors.text;
}

export function AppText({ style, ...props }: TextProps) {
  const { fontFamily, fontColor } = useAppearance();
  const flattened = StyleSheet.flatten(style);
  const useCustomColor = shouldUseCustomColor(flattened?.color);
  const useCustomFont = fontFamily && !flattened?.fontFamily;

  return (
    <RNText
      {...props}
      style={[
        style,
        useCustomFont ? { fontFamily } : null,
        useCustomColor ? { color: fontColor } : null,
      ]}
    />
  );
}

export function AppTextInput({ style, ...props }: TextInputProps) {
  const { fontFamily, fontColor } = useAppearance();
  const flattened = StyleSheet.flatten(style);
  const useCustomColor = shouldUseCustomColor(flattened?.color);
  const useCustomFont = fontFamily && !flattened?.fontFamily;

  return (
    <RNTextInput
      {...props}
      style={[
        style,
        useCustomFont ? { fontFamily } : null,
        useCustomColor ? { color: fontColor } : null,
      ]}
    />
  );
}
