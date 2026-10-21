import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { ThemePalette } from '@/constants/themes';

export type ThemeCardPatternKind = 'clouds';

interface ThemeCardPatternProps {
  pattern?: ThemeCardPatternKind;
  palette: ThemePalette;
}

interface CloudProps {
  color: string;
  width: number;
  height: number;
  style?: ViewStyle;
}

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/** Mixes two hex colors; weight is how much of `color` to keep. */
function mixHex(color: string, base: string, weight: number): string {
  const a = parseHex(color);
  const b = parseHex(base);
  const channel = (index: number) =>
    Math.round(a[index] * weight + b[index] * (1 - weight))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

/**
 * A wide three-lobed cloud built from circles and a rounded base. Drawn twice
 * (larger ink layer behind a color fill) to read as a screen-printed outline.
 */
function Cloud({ color, width, height, style }: CloudProps) {
  const baseHeight = height * 0.52;
  const leftSize = width * 0.34;
  const middleSize = width * 0.44;
  const rightSize = width * 0.3;

  return (
    <View style={[{ width, height }, style]}>
      <View
        style={{
          position: 'absolute',
          left: width * 0.08,
          top: Math.max(height - baseHeight - leftSize * 0.5, 0),
          width: leftSize,
          height: leftSize,
          borderRadius: leftSize / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: width * 0.29,
          top: Math.max(height - baseHeight - middleSize * 0.55, 0),
          width: middleSize,
          height: middleSize,
          borderRadius: middleSize / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: width * 0.64,
          top: Math.max(height - baseHeight - rightSize * 0.45, 0),
          width: rightSize,
          height: rightSize,
          borderRadius: rightSize / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          height: baseHeight,
          borderRadius: baseHeight / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

interface ClusterProps {
  palette: ThemePalette;
  /** 0-1: how strongly the cloud picks up its red fill and ink outline. */
  strength: number;
  width: number;
  height: number;
  rotate: string;
  style: ViewStyle;
}

function CloudCluster({ palette, strength, width, height, rotate, style }: ClusterProps) {
  const fill = mixHex(palette.accent, palette.card, strength);
  const ink = mixHex(palette.border, palette.card, Math.min(strength * 1.5, 0.92));

  return (
    <View style={[style, { width, height, transform: [{ rotate }] }]}>
      <Cloud
        color={ink}
        width={width + 6}
        height={height + 6}
        style={{ position: 'absolute', left: -3, top: -3 }}
      />
      <Cloud color={fill} width={width} height={height} />
    </View>
  );
}

/**
 * Decorative card wallpaper for themes that want more than flat color.
 * Rendered behind card content and never interactive.
 */
export function ThemeCardPattern({ pattern, palette }: ThemeCardPatternProps) {
  if (pattern !== 'clouds') {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <CloudCluster
        palette={palette}
        strength={0.55}
        width={150}
        height={72}
        rotate="-10deg"
        style={{ position: 'absolute', top: '24%', right: -38 }}
      />
      <CloudCluster
        palette={palette}
        strength={0.45}
        width={122}
        height={60}
        rotate="7deg"
        style={{ position: 'absolute', bottom: -16, left: -30 }}
      />
      <CloudCluster
        palette={palette}
        strength={0.25}
        width={86}
        height={42}
        rotate="5deg"
        style={{ position: 'absolute', top: 2, left: -22 }}
      />
      <CloudCluster
        palette={palette}
        strength={0.32}
        width={88}
        height={44}
        rotate="-4deg"
        style={{ position: 'absolute', top: '60%', left: '38%' }}
      />
    </View>
  );
}
