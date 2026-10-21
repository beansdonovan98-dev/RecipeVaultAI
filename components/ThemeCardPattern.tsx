import React from 'react';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import type { CardPattern, ThemePalette } from '@/constants/themes';

export type ThemeCardPatternKind = CardPattern;

interface ThemeCardPatternProps {
  pattern?: CardPattern;
  palette: ThemePalette;
}

interface PatternProps {
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

/** Softens a palette color toward the card so text stays readable on top. */
function tint(palette: ThemePalette, color: string, weight: number): string {
  return mixHex(color, palette.card, weight);
}

/* ------------------------------------------------------------------ */
/* Shapes                                                              */
/* ------------------------------------------------------------------ */

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

interface CloudClusterProps {
  palette: ThemePalette;
  /** 0-1: how strongly the cloud picks up its red fill and ink outline. */
  strength: number;
  width: number;
  height: number;
  rotate: string;
  style: ViewStyle;
}

function CloudCluster({ palette, strength, width, height, rotate, style }: CloudClusterProps) {
  const fill = tint(palette, palette.accent, strength);
  const ink = tint(palette, palette.border, Math.min(strength * 1.5, 0.92));

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

/* ------------------------------------------------------------------ */
/* Patterns                                                            */
/* ------------------------------------------------------------------ */

/** Taverna: a corner of red-and-cream checked tablecloth. */
function ChecksPattern({ palette }: PatternProps) {
  const cell = 30;
  const rows = 3;
  const cols = 4;
  const warm = tint(palette, palette.accent, 0.26);
  const cool = tint(palette, palette.primary, 0.09);

  return (
    <View
      style={{
        position: 'absolute',
        right: -16,
        bottom: -14,
        transform: [{ rotate: '-8deg' }],
      }}
    >
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={{ flexDirection: 'row' }}>
          {Array.from({ length: cols }).map((_, col) => (
            <View
              key={col}
              style={{
                width: cell,
                height: cell,
                backgroundColor: (row + col) % 2 === 0 ? warm : cool,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Riso: an offset grid of screen-print halftone dots. */
function HalftonePattern({ palette }: PatternProps) {
  const dot = 7;
  const gap = 9;
  const cols = 6;
  const rows = 5;
  const hot = tint(palette, palette.accent, 0.3);
  const ink = tint(palette, palette.primary, 0.12);

  return (
    <View
      style={{
        position: 'absolute',
        top: 12,
        right: -10,
        width: cols * (dot + gap),
        flexDirection: 'row',
        flexWrap: 'wrap',
        transform: [{ rotate: '-12deg' }],
      }}
    >
      {Array.from({ length: cols * rows }).map((_, index) => (
        <View
          key={index}
          style={{
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            margin: gap / 2,
            backgroundColor: index % 3 === 0 ? hot : ink,
          }}
        />
      ))}
    </View>
  );
}

/** Night Diner: awning stripes running down the edge of the card. */
function StripesPattern({ palette }: PatternProps) {
  const hot = tint(palette, palette.accent, 0.18);
  const pink = tint(palette, palette.primary, 0.14);

  return (
    <View
      style={{
        position: 'absolute',
        top: -34,
        bottom: -34,
        right: 4,
        flexDirection: 'row',
        gap: 12,
        transform: [{ rotate: '-10deg' }],
      }}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={index}
          style={{ width: 7, backgroundColor: index % 2 === 0 ? hot : pink }}
        />
      ))}
    </View>
  );
}

/** Midnight: brass sparkles and a scatter of small stars. */
function StarsPattern({ palette }: PatternProps) {
  const brass = tint(palette, palette.accent, 0.55);
  const faint = tint(palette, palette.accent, 0.3);

  const sparkles: Array<{
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    size: number;
  }> = [
    { top: 18, right: 26, size: 18 },
    { top: 74, left: 16, size: 11 },
    { bottom: 26, right: 74, size: 8 },
    { bottom: 58, left: '54%', size: 6 },
  ];

  const dots: Array<{ top: DimensionValue; left: DimensionValue }> = [
    { top: '34%', left: '38%' },
    { top: '58%', left: '22%' },
    { top: '16%', left: '62%' },
    { top: '72%', left: '82%' },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {sparkles.map((sparkle, index) => {
        const size = sparkle.size;
        return (
          <View
            key={`sparkle-${index}`}
            style={{
              position: 'absolute',
              top: sparkle.top,
              bottom: sparkle.bottom,
              left: sparkle.left,
              right: sparkle.right,
              width: size,
              height: size,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                position: 'absolute',
                width: size,
                height: 1.5,
                borderRadius: 1,
                backgroundColor: brass,
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: 1.5,
                height: size,
                borderRadius: 1,
                backgroundColor: brass,
              }}
            />
            <View
              style={{
                width: 2.5,
                height: 2.5,
                borderRadius: 1.25,
                backgroundColor: brass,
              }}
            />
          </View>
        );
      })}
      {dots.map((dot, index) => (
        <View
          key={`dot-${index}`}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: 2.5,
            height: 2.5,
            borderRadius: 1.25,
            backgroundColor: faint,
          }}
        />
      ))}
    </View>
  );
}

/** Sea Glass: soft bubbles drifting up from the corner. */
function BubblesPattern({ palette }: PatternProps) {
  const teal = tint(palette, palette.primary, 0.28);
  const coral = tint(palette, palette.accent, 0.32);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: 14,
          right: -24,
          width: 86,
          height: 86,
          borderRadius: 43,
          borderWidth: 1.5,
          borderColor: teal,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 58,
          left: 14,
          width: 34,
          height: 34,
          borderRadius: 17,
          borderWidth: 1.5,
          borderColor: coral,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 34,
          right: 62,
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1.5,
          borderColor: teal,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 14,
          left: 52,
          width: 11,
          height: 11,
          borderRadius: 5.5,
          backgroundColor: coral,
        }}
      />
    </View>
  );
}

/** Butter & Cocoa: cheerful polka dots. */
function DotsPattern({ palette }: PatternProps) {
  const cocoa = tint(palette, palette.primary, 0.14);
  const persimmon = tint(palette, palette.accent, 0.22);

  const dots: Array<{ top: DimensionValue; left: DimensionValue; size: number; color: string }> = [
    { top: '8%', left: '78%', size: 18, color: persimmon },
    { top: '26%', left: '10%', size: 11, color: cocoa },
    { top: '54%', left: '44%', size: 7, color: persimmon },
    { top: '72%', left: '12%', size: 15, color: persimmon },
    { top: '80%', left: '72%', size: 9, color: cocoa },
    { top: '40%', left: '90%', size: 12, color: cocoa },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {dots.map((dot, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: dot.color,
          }}
        />
      ))}
    </View>
  );
}

/** Newsprint: ruled notebook lines with a red margin. */
function RulesPattern({ palette }: PatternProps) {
  const rule = tint(palette, palette.primary, 0.14);
  const margin = tint(palette, palette.accent, 0.24);

  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 9 }).map((_, index) => (
        <View
          key={`rule-${index}`}
          style={{
            position: 'absolute',
            left: 10,
            right: 10,
            top: 16 + index * 22,
            height: 1,
            backgroundColor: rule,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          left: 10,
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: margin,
        }}
      />
    </View>
  );
}

/** Citrus Grove: a juicy wheel of citrus tucked into the corner. */
function SlicesPattern({ palette }: PatternProps) {
  const diameter = 92;
  const outer = tint(palette, palette.accent, 0.5);
  const flesh = tint(palette, palette.accent, 0.16);
  const segment = tint(palette, palette.accent, 0.4);
  const innerSize = diameter * 0.76;
  const barWidth = diameter * 0.7;

  return (
    <View
      style={{
        position: 'absolute',
        right: -28,
        bottom: -26,
        width: diameter,
        height: diameter,
        borderRadius: diameter / 2,
        borderWidth: 3,
        borderColor: outer,
        backgroundColor: flesh,
        transform: [{ rotate: '12deg' }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: (diameter - innerSize) / 2,
          top: (diameter - innerSize) / 2,
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          borderWidth: 1.5,
          borderColor: segment,
        }}
      />
      {[0, 45, 90, 135].map((angle) => (
        <View
          key={angle}
          style={{
            position: 'absolute',
            left: (diameter - barWidth) / 2,
            top: diameter / 2 - 1,
            width: barWidth,
            height: 2,
            backgroundColor: segment,
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          left: diameter / 2 - 4,
          top: diameter / 2 - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: segment,
        }}
      />
    </View>
  );
}

/** Lavender: a couple of sprigs leaning in from the corners. */
function Sprig({
  palette,
  rotate,
  style,
}: PatternProps & { rotate: string; style: ViewStyle }) {
  const stem = tint(palette, palette.primary, 0.2);
  const bud = tint(palette, palette.accent, 0.32);

  const buds: Array<{ top: number; left: number; tilt: string }> = [
    { top: 12, left: 8, tilt: '32deg' },
    { top: 30, left: 24, tilt: '-32deg' },
    { top: 46, left: 7, tilt: '28deg' },
    { top: 60, left: 22, tilt: '-26deg' },
  ];

  return (
    <View style={[style, { width: 44, height: 86, transform: [{ rotate }] }]}>
      <View
        style={{
          position: 'absolute',
          left: 20,
          top: 4,
          width: 1.5,
          height: 76,
          borderRadius: 1,
          backgroundColor: stem,
        }}
      />
      {buds.map((entry, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: entry.top,
            left: entry.left,
            width: 13,
            height: 8,
            borderRadius: 6,
            backgroundColor: bud,
            transform: [{ rotate: entry.tilt }],
          }}
        />
      ))}
    </View>
  );
}

function SprigsPattern({ palette }: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Sprig
        palette={palette}
        rotate="18deg"
        style={{ position: 'absolute', top: -18, right: 6 }}
      />
      <Sprig
        palette={palette}
        rotate="-24deg"
        style={{ position: 'absolute', bottom: -30, left: 2 }}
      />
    </View>
  );
}

/** Sakura: petals drifting across the card. */
function PetalsPattern({ palette }: PatternProps) {
  const petal = tint(palette, palette.accent, 0.32);
  const pollen = tint(palette, palette.primary, 0.14);

  const petals: Array<{
    top: DimensionValue;
    left: DimensionValue;
    size: number;
    rotate: string;
  }> = [
    { top: '6%', left: '74%', size: 20, rotate: '24deg' },
    { top: '20%', left: '86%', size: 12, rotate: '-16deg' },
    { top: '30%', left: '8%', size: 16, rotate: '-38deg' },
    { top: '58%', left: '68%', size: 10, rotate: '52deg' },
    { top: '76%', left: '20%', size: 14, rotate: '12deg' },
    { top: '86%', left: '58%', size: 8, rotate: '-24deg' },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {petals.map((entry, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: entry.top,
            left: entry.left,
            width: entry.size * 0.55,
            height: entry.size,
            borderRadius: entry.size * 0.5,
            backgroundColor: petal,
            transform: [{ rotate: entry.rotate }],
          }}
        />
      ))}
      {([
        { top: '22%', left: '78%' },
        { top: '62%', left: '24%' },
        { top: '80%', left: '64%' },
      ] as Array<{ top: DimensionValue; left: DimensionValue }>).map((dot, index) => (
        <View
          key={`pollen-${index}`}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: pollen,
          }}
        />
      ))}
    </View>
  );
}

/** Ember: glowing coals and embers rising from the bottom edge. */
function EmbersPattern({ palette }: PatternProps) {
  const flame = tint(palette, palette.accent, 0.5);
  const halo = tint(palette, palette.accent, 0.24);

  const embers: Array<{ bottom: number; left: DimensionValue; size: number }> = [
    { bottom: 8, left: '12%', size: 5 },
    { bottom: 24, left: '28%', size: 3 },
    { bottom: 14, left: '46%', size: 4 },
    { bottom: 40, left: '58%', size: 2.5 },
    { bottom: 10, left: '72%', size: 6 },
    { bottom: 30, left: '86%', size: 3 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {embers.map((ember, index) => (
        <View
          key={`halo-${index}`}
          style={{
            position: 'absolute',
            bottom: ember.bottom - 5,
            left: ember.left,
            width: ember.size + 10,
            height: ember.size + 10,
            borderRadius: (ember.size + 10) / 2,
            borderWidth: 1,
            borderColor: halo,
          }}
        />
      ))}
      {embers.map((ember, index) => (
        <View
          key={`ember-${index}`}
          style={{
            position: 'absolute',
            bottom: ember.bottom,
            left: ember.left,
            width: ember.size,
            height: ember.size,
            borderRadius: ember.size / 2,
            backgroundColor: flame,
          }}
        />
      ))}
    </View>
  );
}

/** Blueprint: drafting graph paper with a compass ring. */
function GridPattern({ palette }: PatternProps) {
  const line = tint(palette, palette.primaryLight, 0.18);
  const note = tint(palette, palette.accent, 0.34);
  const spacing = 28;

  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 14 }).map((_, index) => (
        <View
          key={`v-${index}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: index * spacing,
            width: 1,
            backgroundColor: line,
          }}
        />
      ))}
      {Array.from({ length: 9 }).map((_, index) => (
        <View
          key={`h-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: index * spacing,
            height: 1,
            backgroundColor: line,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 16,
          right: 18,
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: note,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 33,
          right: 10,
          width: 52,
          height: 1,
          backgroundColor: note,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 35,
          width: 1,
          height: 52,
          backgroundColor: note,
        }}
      />
    </View>
  );
}

/** Shinobi: black-rimmed red clouds across the card. */
function CloudsPattern({ palette }: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
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

/* ------------------------------------------------------------------ */

const PATTERNS: Record<CardPattern, React.ComponentType<PatternProps>> = {
  checks: ChecksPattern,
  halftone: HalftonePattern,
  stripes: StripesPattern,
  stars: StarsPattern,
  bubbles: BubblesPattern,
  dots: DotsPattern,
  rules: RulesPattern,
  slices: SlicesPattern,
  sprigs: SprigsPattern,
  petals: PetalsPattern,
  embers: EmbersPattern,
  grid: GridPattern,
  clouds: CloudsPattern,
};

/**
 * Decorative card wallpaper for themes that want more than flat color.
 * Rendered behind card content and never interactive.
 */
export function ThemeCardPattern({ pattern, palette }: ThemeCardPatternProps) {
  if (!pattern) {
    return null;
  }

  const Pattern = PATTERNS[pattern];
  if (!Pattern) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Pattern palette={palette} />
    </View>
  );
}
