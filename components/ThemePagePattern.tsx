import React from 'react';
import { Image, StyleSheet, View, type DimensionValue } from 'react-native';
import { ThemeCardPattern } from '@/components/ThemeCardPattern';
import { PAGE_MOTIFS } from '@/components/ThemePageMotifs';
import { useAppearance } from '@/contexts/AppearanceContext';
import type { CardPattern } from '@/constants/themes';

/** How strong each hand-drawn page motif is; dark themes need more. */
const MOTIF_OPACITY: Partial<Record<CardPattern, number>> = {
  clouds: 0.9,
  mountains: 0.9,
  halloween: 0.9,
  petals: 0.92,
  ocean: 0.9,
  forest: 0.9,
  space: 0.95,
  candy: 0.9,
};

/** Patterns that already fill their space, so one faint layer is plenty. */
const DENSE_PATTERNS: CardPattern[] = ['mountains', 'halloween', 'space'];

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
  { top: '20%', left: '40%', size: 110, rotate: '-6deg', opacity: 0.45 },
  { top: '55%', right: '20%', size: 130, rotate: '8deg', opacity: 0.5 },
  { top: '88%', left: '5%', size: 100, rotate: '-10deg', opacity: 0.4 },
  { top: '5%', right: '30%', size: 90, rotate: '14deg', opacity: 0.55 },
  { top: '40%', left: '60%', size: 80, rotate: '-8deg', opacity: 0.35 },
];

const SHURIKEN: { top: string; left?: string; right?: string; size: number; rotate: string; opacity: number }[] = [
  { top: '8%', left: '25%', size: 45, rotate: '15deg', opacity: 0.7 },
  { top: '22%', right: '18%', size: 35, rotate: '-20deg', opacity: 0.6 },
  { top: '40%', left: '8%', size: 40, rotate: '30deg', opacity: 0.65 },
  { top: '55%', right: '12%', size: 38, rotate: '-15deg', opacity: 0.55 },
  { top: '70%', left: '35%', size: 42, rotate: '25deg', opacity: 0.6 },
  { top: '85%', right: '25%', size: 36, rotate: '-25deg', opacity: 0.5 },
  { top: '15%', left: '60%', size: 32, rotate: '40deg', opacity: 0.45 },
  { top: '48%', left: '70%', size: 30, rotate: '-30deg', opacity: 0.4 },
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

  const pagePalette = { ...theme, card: theme.background };

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
        {SHURIKEN.map((s, index) => (
          <Image
            key={`page-shuriken-${index}`}
            source={require('../assets/theme-shuriken.png')}
            resizeMode="contain"
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              right: s.right,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              transform: [{ rotate: s.rotate }],
            } as any}
          />
        ))}
        {/* 9-tailed fox (Kurama). */}
        <Image
          source={require('../assets/theme-kurama.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            bottom: '18%',
            right: '5%',
            width: 140,
            height: 110,
            opacity: 0.5,
            transform: [{ rotate: '-5deg' }],
          } as any}
        />
        {/* Hidden Leaf symbol. */}
        <Image
          source={require('../assets/theme-konoha.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: '12%',
            left: '8%',
            width: 90,
            height: 90,
            opacity: 0.45,
          } as any}
        />
        {/* Ramen bowl. */}
        <Image
          source={require('../assets/theme-ramen.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '15%',
            width: 100,
            height: 75,
            opacity: 0.6,
          } as any}
        />
      </View>
    );
  }

  const Motif = PAGE_MOTIFS[pattern];
  if (Motif) {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.clip,
          { opacity: opacity ?? MOTIF_OPACITY[pattern] ?? 0.7 },
        ]}
      >
        <Motif palette={pagePalette} />
      </View>
    );
  }

  const dense = DENSE_PATTERNS.includes(pattern);
  const baseOpacity = opacity ?? (dense ? 0.24 : 0.46);

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
