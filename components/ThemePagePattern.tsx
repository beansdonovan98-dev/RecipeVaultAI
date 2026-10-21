import React from 'react';
import { Image, StyleSheet, View, type DimensionValue } from 'react-native';
import { ThemeCardPattern } from '@/components/ThemeCardPattern';
import { useAppearance } from '@/contexts/AppearanceContext';
import type { CardPattern } from '@/constants/themes';

/** Patterns that already fill their space, so one faint layer is plenty. */
const DENSE_PATTERNS: CardPattern[] = ['checks', 'halftone', 'stripes', 'dots', 'rules', 'grid'];

interface CloudPlacement {
  top?: DimensionValue;
  bottom?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  size: number;
  rotate: string;
  opacity: number;
}

const CLOUDS: CloudPlacement[] = [
  { top: '2%', left: '-10%', size: 196, rotate: '-12deg', opacity: 0.9 },
  { top: '12%', right: '-14%', size: 156, rotate: '10deg', opacity: 0.72 },
  { top: '31%', left: '-16%', size: 132, rotate: '6deg', opacity: 0.5 },
  { top: '47%', right: '-10%', size: 204, rotate: '-8deg', opacity: 0.6 },
  { top: '64%', left: '-12%', size: 166, rotate: '12deg', opacity: 0.55 },
  { top: '78%', right: '-16%', size: 146, rotate: '-14deg', opacity: 0.62 },
  { bottom: '2%', left: '30%', size: 124, rotate: '5deg', opacity: 0.42 },
];

interface PetalPlacement {
  top: DimensionValue;
  left: DimensionValue;
  size: number;
  rotate: string;
  opacity: number;
}

const PETALS: PetalPlacement[] = [
  { top: '3%', left: '68%', size: 44, rotate: '26deg', opacity: 0.9 },
  { top: '8%', left: '84%', size: 26, rotate: '-18deg', opacity: 0.7 },
  { top: '17%', left: '10%', size: 34, rotate: '-42deg', opacity: 0.8 },
  { top: '26%', left: '46%', size: 22, rotate: '74deg', opacity: 0.55 },
  { top: '36%', left: '76%', size: 38, rotate: '48deg', opacity: 0.7 },
  { top: '45%', left: '4%', size: 28, rotate: '14deg', opacity: 0.6 },
  { top: '53%', left: '38%', size: 20, rotate: '-64deg', opacity: 0.45 },
  { top: '61%', left: '66%', size: 34, rotate: '118deg', opacity: 0.6 },
  { top: '71%', left: '12%', size: 24, rotate: '22deg', opacity: 0.55 },
  { top: '78%', left: '52%', size: 40, rotate: '-32deg', opacity: 0.65 },
  { top: '86%', left: '28%', size: 18, rotate: '96deg', opacity: 0.4 },
  { top: '92%', left: '74%', size: 30, rotate: '8deg', opacity: 0.55 },
];

interface ThemePagePatternProps {
  /** Overall strength. Defaults lower for repeating textures than for motifs. */
  opacity?: number;
}

/**
 * The active theme's motif scattered behind a page. Clouds and petals use
 * image stamps placed across the whole screen; the other themes reuse their
 * card pattern in two offset layers. Placement is fixed, so it never changes
 * between renders. Never interactive: content always sits on top.
 */
export function ThemePagePattern({ opacity }: ThemePagePatternProps) {
  const { theme, design } = useAppearance();
  const pattern = design.cardPattern;
  if (!pattern) {
    return null;
  }

  if (pattern === 'clouds') {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip, { opacity: opacity ?? 0.62 }]}>
        {CLOUDS.map((cloud, index) => (
          <Image
            key={`page-cloud-${index}`}
            source={require('../assets/theme-cloud.png')}
            resizeMode="contain"
            style={{
              position: 'absolute',
              top: cloud.top,
              bottom: cloud.bottom,
              left: cloud.left,
              right: cloud.right,
              width: cloud.size,
              height: cloud.size / 1.482,
              opacity: cloud.opacity,
              transform: [{ rotate: cloud.rotate }],
            }}
          />
        ))}
      </View>
    );
  }

  if (pattern === 'petals') {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip, { opacity: opacity ?? 0.66 }]}>
        {PETALS.map((petal, index) => (
          <Image
            key={`page-petal-${index}`}
            source={require('../assets/theme-petal.png')}
            resizeMode="contain"
            style={{
              position: 'absolute',
              top: petal.top,
              left: petal.left,
              width: petal.size * 0.658,
              height: petal.size,
              opacity: petal.opacity,
              transform: [{ rotate: petal.rotate }],
            }}
          />
        ))}
      </View>
    );
  }

  const dense = DENSE_PATTERNS.includes(pattern);
  const baseOpacity = opacity ?? (dense ? 0.24 : 0.46);
  const pagePalette = { ...theme, card: theme.background };

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
      <View style={[StyleSheet.absoluteFill, { opacity: baseOpacity }]}>
        <ThemeCardPattern pattern={pattern} palette={pagePalette} />
      </View>
      {dense ? null : (
        <View style={[styles.offsetLayer, { opacity: baseOpacity * 0.62 }]}>
          <ThemeCardPattern pattern={pattern} palette={pagePalette} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  offsetLayer: {
    position: 'absolute',
    left: '-14%',
    top: '-12%',
    width: '128%',
    height: '124%',
    transform: [{ rotate: '8deg' }],
  },
});
