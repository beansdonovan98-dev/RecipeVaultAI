import React from 'react';
import { Image, StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import type { CardPattern, ThemePalette } from '@/constants/themes';

export type ThemeCardPatternKind = CardPattern;

interface ThemeCardPatternProps {
  pattern?: CardPattern;
  palette: ThemePalette;
}

interface PatternProps {
  palette: ThemePalette;
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

/** A thin connector line whose two endpoints are card-relative pixel values. */
function Connector({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
}) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <View
      style={{
        position: 'absolute',
        left: (x1 + x2) / 2 - length / 2,
        top: (y1 + y2) / 2 - width / 2,
        width: length,
        height: width,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
}

/** Four-point brass star. */
function Sparkle({ size, color, style }: { size: number; color: string; style: ViewStyle }) {
  return (
    <View style={[style, { width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: Math.max(1, size * 0.12),
          borderRadius: 1,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: Math.max(1, size * 0.12),
          height: size,
          borderRadius: 1,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          width: Math.max(2, size * 0.22),
          height: Math.max(2, size * 0.22),
          borderRadius: size,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Patterns                                                            */
/* ------------------------------------------------------------------ */

/** Taverna: olive branches spilling in from opposite corners. */
function OlivePattern(_props: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../assets/theme-olive-branch.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: -24,
          left: -28,
          width: 142,
          height: 178,
          opacity: 0.56,
          transform: [{ rotate: '-16deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-olive-branch.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          right: -34,
          bottom: -44,
          width: 188,
          height: 236,
          opacity: 0.7,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      {([
        { top: '16%', left: '62%', size: 12 },
        { top: '38%', left: '48%', size: 8 },
        { top: '64%', left: '74%', size: 10 },
      ] as Array<{ top: DimensionValue; left: DimensionValue; size: number }>).map((olive, index) => (
        <View
          key={`olive-${index}`}
          style={{
            position: 'absolute',
            top: olive.top,
            left: olive.left,
            width: olive.size,
            height: olive.size,
            borderRadius: olive.size / 2,
            backgroundColor: '#55652C',
            opacity: 0.65,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: olive.size * 0.18,
              left: olive.size * 0.18,
              width: olive.size * 0.3,
              height: olive.size * 0.3,
              borderRadius: olive.size,
              backgroundColor: '#C7D69A',
              opacity: 0.7,
            }}
          />
        </View>
      ))}
    </View>
  );
}

/** Riso Pop: oversized mis-registered ink shapes and a halftone block. */
function RisoPattern({ palette }: PatternProps) {
  const pink = tint(palette, palette.accent, 0.5);
  const blue = tint(palette, palette.primary, 0.34);
  const yellow = tint(palette, palette.tipBackground, 0.72);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: -38,
          right: -18,
          width: 124,
          height: 124,
          borderRadius: 62,
          backgroundColor: pink,
          opacity: 0.45,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -32,
          right: -30,
          width: 124,
          height: 124,
          borderRadius: 62,
          borderWidth: 4,
          borderColor: blue,
          opacity: 0.5,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -46,
          left: -34,
          width: 118,
          height: 118,
          borderRadius: 18,
          backgroundColor: blue,
          opacity: 0.3,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -38,
          left: -24,
          width: 118,
          height: 118,
          borderRadius: 18,
          borderWidth: 3,
          borderColor: pink,
          opacity: 0.55,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: '20%',
          bottom: '20%',
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: yellow,
          opacity: 0.7,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 16,
          left: 14,
          width: 72,
          flexDirection: 'row',
          flexWrap: 'wrap',
          transform: [{ rotate: '-8deg' }],
        }}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const size = index % 4 === 0 ? 7 : index % 3 === 0 ? 5 : 3.5;
          return (
            <View
              key={index}
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                margin: 3,
                backgroundColor: index % 2 === 0 ? blue : pink,
                opacity: 0.65,
              }}
            />
          );
        })}
      </View>
      <View
        style={{
          position: 'absolute',
          left: 18,
          top: '50%',
          width: 54,
          height: 8,
          backgroundColor: pink,
          opacity: 0.6,
          transform: [{ rotate: '-8deg' }],
        }}
      />
    </View>
  );
}

/** Night Diner: scalloped awning, checkerboard floor, and a neon ring. */
function StripesPattern({ palette }: PatternProps) {
  const pink = tint(palette, palette.primary, 0.62);
  const mint = tint(palette, palette.accent, 0.55);
  const ink = tint(palette, palette.border, 0.4);
  const stripeWidth = 15;
  const stripeCount = 26;

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', top: -2, left: -8, right: -8, height: 44 }}>
        {Array.from({ length: stripeCount }).map((_, index) => (
          <View
            key={`stripe-${index}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: index * stripeWidth,
              width: stripeWidth,
              backgroundColor: index % 2 === 0 ? pink : mint,
              opacity: 0.55,
            }}
          />
        ))}
        {Array.from({ length: stripeCount }).map((_, index) => (
          <View
            key={`scallop-${index}`}
            style={{
              position: 'absolute',
              top: 32,
              left: index * stripeWidth - stripeWidth / 2,
              width: stripeWidth * 2,
              height: stripeWidth,
              borderBottomLeftRadius: stripeWidth,
              borderBottomRightRadius: stripeWidth,
              backgroundColor: index % 2 === 0 ? pink : mint,
              opacity: 0.55,
            }}
          />
        ))}
      </View>
      <View
        style={{
          position: 'absolute',
          left: -24,
          right: -24,
          bottom: -22,
          height: 74,
          transform: [{ rotate: '-5deg' }],
          opacity: 0.5,
        }}
      >
        {Array.from({ length: 3 }).map((_, row) => (
          <View key={`row-${row}`} style={{ flexDirection: 'row' }}>
            {Array.from({ length: 26 }).map((_, col) => (
              <View
                key={`tile-${row}-${col}`}
                style={{
                  width: 28,
                  height: 22,
                  backgroundColor:
                    (row + col) % 2 === 0 ? ink : tint(palette, palette.card, 0.9),
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <View
        style={{
          position: 'absolute',
          top: 68,
          right: 20,
          width: 62,
          height: 62,
          borderRadius: 31,
          borderWidth: 3,
          borderColor: mint,
          opacity: 0.65,
        }}
      />
      <Sparkle
        size={18}
        color={mint}
        style={{ position: 'absolute', top: 58, right: 88, opacity: 0.8 }}
      />
    </View>
  );
}

/** Midnight Brass: crescent moon, ringed planet, constellations. */
function StarsPattern({ palette }: PatternProps) {
  const brass = tint(palette, palette.accent, 0.6);
  const faint = tint(palette, palette.accent, 0.33);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: 14,
          right: 22,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: brass,
          opacity: 0.7,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: palette.card,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 26,
          bottom: 26,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: tint(palette, palette.primaryLight, 0.55),
          opacity: 0.85,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 12,
          bottom: 37,
          width: 64,
          height: 15,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: brass,
          opacity: 0.75,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      <Connector x1={152} y1={44} x2={206} y2={76} color={faint} width={1} />
      <Connector x1={206} y1={76} x2={252} y2={48} color={faint} width={1} />
      <Connector x1={206} y1={76} x2={214} y2={122} color={faint} width={1} />
      {[
        { x: 152, y: 44 },
        { x: 206, y: 76 },
        { x: 252, y: 48 },
        { x: 214, y: 122 },
      ].map((star, index) => (
        <View
          key={`constellation-${index}`}
          style={{
            position: 'absolute',
            left: star.x - 2,
            top: star.y - 2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: brass,
          }}
        />
      ))}
      <Sparkle size={17} color={brass} style={{ position: 'absolute', top: 92, left: 26, opacity: 0.8 }} />
      <Sparkle size={11} color={faint} style={{ position: 'absolute', top: 150, right: 66, opacity: 0.7 }} />
      {([
        { top: '18%', left: '46%' },
        { top: '38%', left: '86%' },
        { top: '68%', left: '58%' },
        { top: '82%', left: '34%' },
        { top: '58%', left: '12%' },
      ] as Array<{ top: DimensionValue; left: DimensionValue }>).map((dot, index) => (
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

/** Sea Glass: sand dollars, a starfish, glass shards, and bubbles. */
function BubblesPattern({ palette }: PatternProps) {
  const teal = tint(palette, palette.primary, 0.4);
  const coral = tint(palette, palette.accent, 0.42);
  const amber = '#E7B86A';
  const shards: Array<{
    top: DimensionValue;
    left: DimensionValue;
    w: number;
    h: number;
    color: string;
    rotate: string;
  }> = [
    { top: '46%', left: '12%', w: 34, h: 18, color: teal, rotate: '24deg' },
    { top: '70%', left: '58%', w: 26, h: 14, color: coral, rotate: '-18deg' },
    { top: '20%', left: '48%', w: 20, h: 12, color: amber, rotate: '54deg' },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../assets/theme-sand-dollar.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: -12,
          right: -14,
          width: 96,
          height: 96,
          opacity: 0.45,
          transform: [{ rotate: '14deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-starfish.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: -18,
          left: -18,
          width: 78,
          height: 78,
          opacity: 0.55,
          transform: [{ rotate: '-16deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-sand-dollar.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: 10,
          right: 24,
          width: 34,
          height: 34,
          opacity: 0.35,
          transform: [{ rotate: '-12deg' }],
        }}
      />
      {shards.map((shard, index) => (
        <View
          key={`shard-${index}`}
          style={{
            position: 'absolute',
            top: shard.top,
            left: shard.left,
            width: shard.w,
            height: shard.h,
            borderRadius: shard.h / 2,
            backgroundColor: shard.color,
            opacity: 0.32,
            transform: [{ rotate: shard.rotate }],
          }}
        />
      ))}
      {([
        { top: '12%', left: '24%', size: 14 },
        { top: '34%', left: '78%', size: 9 },
        { top: '62%', left: '38%', size: 20 },
        { top: '82%', left: '76%', size: 11 },
        { top: '52%', left: '90%', size: 6 },
      ] as Array<{ top: DimensionValue; left: DimensionValue; size: number }>).map((bubble, index) => (
        <View
          key={`bubble-${index}`}
          style={{
            position: 'absolute',
            top: bubble.top,
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            borderRadius: bubble.size / 2,
            borderWidth: 1.5,
            borderColor: index % 2 === 0 ? teal : coral,
            opacity: 0.55,
          }}
        />
      ))}
    </View>
  );
}

/** Butter & Cocoa: chocolate-chip cookies, sprinkles, and cocoa rings. */
function CookiesPattern({ palette }: PatternProps) {
  const cocoa = tint(palette, palette.primary, 0.5);
  const raspberry = palette.accent;
  const mint = '#7FB069';
  const sprinkles: Array<{
    top: DimensionValue;
    left: DimensionValue;
    rotate: string;
    color: string;
  }> = [
    { top: '18%', left: '20%', rotate: '26deg', color: raspberry },
    { top: '28%', left: '58%', rotate: '-18deg', color: mint },
    { top: '44%', left: '38%', rotate: '64deg', color: cocoa },
    { top: '58%', left: '72%', rotate: '12deg', color: raspberry },
    { top: '70%', left: '26%', rotate: '-42deg', color: cocoa },
    { top: '82%', left: '54%', rotate: '30deg', color: mint },
    { top: '12%', left: '84%', rotate: '-58deg', color: cocoa },
    { top: '52%', left: '8%', rotate: '48deg', color: raspberry },
    { top: '86%', left: '86%', rotate: '-12deg', color: raspberry },
    { top: '38%', left: '90%', rotate: '20deg', color: mint },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../assets/theme-cookie.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: -16,
          right: -8,
          width: 96,
          height: 96,
          opacity: 0.55,
          transform: [{ rotate: '10deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-cookie.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: -16,
          left: -18,
          width: 70,
          height: 70,
          opacity: 0.5,
          transform: [{ rotate: '-14deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 40,
          left: 20,
          width: 54,
          height: 54,
          borderRadius: 27,
          borderWidth: 3,
          borderColor: cocoa,
          opacity: 0.14,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 26,
          right: 34,
          width: 34,
          height: 34,
          borderRadius: 17,
          borderWidth: 2,
          borderColor: cocoa,
          opacity: 0.18,
        }}
      />
      {sprinkles.map((sprinkle, index) => (
        <View
          key={`sprinkle-${index}`}
          style={{
            position: 'absolute',
            top: sprinkle.top,
            left: sprinkle.left,
            width: 4,
            height: 11,
            borderRadius: 2,
            backgroundColor: sprinkle.color,
            opacity: 0.7,
            transform: [{ rotate: sprinkle.rotate }],
          }}
        />
      ))}
    </View>
  );
}

/** Newsprint: newspaper columns, a red stamp, and a coffee ring. */
function RulesPattern({ palette }: PatternProps) {
  const ink = tint(palette, palette.primary, 0.22);
  const faint = tint(palette, palette.primary, 0.1);
  const stamp = tint(palette, palette.accent, 0.42);
  const coffee = tint(palette, palette.accent, 0.1);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          width: 122,
          height: 9,
          backgroundColor: ink,
          opacity: 0.6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 28,
          left: 14,
          width: 82,
          height: 3,
          backgroundColor: faint,
          opacity: 0.8,
        }}
      />
      {Array.from({ length: 7 }).map((_, index) => (
        <View
          key={`col-a-${index}`}
          style={{
            position: 'absolute',
            top: 44 + index * 11,
            left: 14,
            width: index === 6 ? 74 : 104 - (index % 3) * 8,
            height: 2,
            backgroundColor: faint,
            opacity: 0.75,
          }}
        />
      ))}
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={`col-b-${index}`}
          style={{
            position: 'absolute',
            top: 44 + index * 11,
            left: '56%',
            width: index === 5 ? 48 : 74 - (index % 2) * 12,
            height: 2,
            backgroundColor: faint,
            opacity: 0.7,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 30,
          left: '56%',
          width: 62,
          height: 6,
          backgroundColor: ink,
          opacity: 0.5,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 38,
          left: '56%',
          width: 40,
          height: 2,
          backgroundColor: faint,
          opacity: 0.6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 16,
          right: 18,
          width: 46,
          height: 46,
          borderRadius: 23,
          borderWidth: 2,
          borderColor: coffee,
          opacity: 0.35,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 22,
          right: 11,
          width: 46,
          height: 46,
          borderRadius: 23,
          borderWidth: 1,
          borderColor: coffee,
          opacity: 0.22,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 26,
          width: 54,
          height: 54,
          borderRadius: 27,
          borderWidth: 2,
          borderColor: stamp,
          opacity: 0.45,
          transform: [{ rotate: '-14deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          right: 35,
          width: 36,
          height: 3,
          backgroundColor: stamp,
          opacity: 0.45,
          transform: [{ rotate: '-14deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 36,
          right: 35,
          width: 28,
          height: 3,
          backgroundColor: stamp,
          opacity: 0.35,
          transform: [{ rotate: '-14deg' }],
        }}
      />
    </View>
  );
}

/** Citrus Grove: orange, lemon, and lime wheels with a leafy sprig. */
function SlicesPattern({ palette }: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../assets/theme-citrus-orange.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: -20,
          left: -18,
          width: 92,
          height: 92,
          opacity: 0.5,
          transform: [{ rotate: '-12deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-citrus-lemon.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          right: -16,
          bottom: -20,
          width: 78,
          height: 78,
          opacity: 0.55,
          transform: [{ rotate: '14deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-citrus-lime.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          right: '16%',
          top: '12%',
          width: 42,
          height: 42,
          opacity: 0.42,
          transform: [{ rotate: '-8deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-citrus-leaf.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          left: '22%',
          bottom: -6,
          width: 96,
          height: 64,
          opacity: 0.55,
          transform: [{ rotate: '8deg' }],
        }}
      />
      {([
        { top: '36%', left: '46%', size: 7 },
        { top: '64%', left: '30%', size: 5 },
        { top: '20%', left: '74%', size: 4 },
      ] as Array<{ top: DimensionValue; left: DimensionValue; size: number }>).map((drop, index) => (
        <View
          key={`drop-${index}`}
          style={{
            position: 'absolute',
            top: drop.top,
            left: drop.left,
            width: drop.size,
            height: drop.size * 1.5,
            borderRadius: drop.size,
            backgroundColor: tint(palette, palette.accent, 0.5),
            opacity: 0.55,
            transform: [{ rotate: '24deg' }],
          }}
        />
      ))}
    </View>
  );
}

/** Lavender: a haze of soft blooms and three leaning sprigs. */
function Sprig({
  palette,
  rotate,
  style,
}: PatternProps & { rotate: string; style: ViewStyle }) {
  const stem = tint(palette, palette.primary, 0.28);
  const bud = tint(palette, palette.accent, 0.42);
  const budLight = tint(palette, palette.accentLight, 0.52);

  const buds: Array<{ top: number; left: number; tilt: string; size: number }> = [
    { top: 10, left: 10, tilt: '34deg', size: 15 },
    { top: 26, left: 24, tilt: '-34deg', size: 13 },
    { top: 42, left: 6, tilt: '30deg', size: 14 },
    { top: 56, left: 22, tilt: '-28deg', size: 12 },
    { top: 70, left: 8, tilt: '24deg', size: 10 },
  ];

  return (
    <View style={[style, { width: 52, height: 100, transform: [{ rotate }] }]}>
      <View
        style={{
          position: 'absolute',
          left: 24,
          top: 2,
          width: 2,
          height: 92,
          borderRadius: 1,
          backgroundColor: stem,
          opacity: 0.8,
        }}
      />
      {buds.map((entry, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: entry.top,
            left: entry.left,
            width: entry.size,
            height: entry.size * 0.62,
            borderRadius: entry.size,
            backgroundColor: index % 2 === 0 ? bud : budLight,
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
      <View
        style={{
          position: 'absolute',
          top: -70,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: tint(palette, palette.accentLight, 0.16),
          opacity: 0.8,
        }}
      />
      <Sprig
        palette={palette}
        rotate="18deg"
        style={{ position: 'absolute', top: -24, right: 8 }}
      />
      <Sprig
        palette={palette}
        rotate="-26deg"
        style={{ position: 'absolute', bottom: -38, left: -2 }}
      />
      <Sprig
        palette={palette}
        rotate="64deg"
        style={{ position: 'absolute', top: 24, left: -16, opacity: 0.7 }}
      />
      {([
        { top: '14%', left: '56%', size: 7 },
        { top: '38%', left: '78%', size: 5 },
        { top: '62%', left: '40%', size: 6 },
        { top: '80%', left: '68%', size: 4 },
        { top: '30%', left: '32%', size: 4 },
      ] as Array<{ top: DimensionValue; left: DimensionValue; size: number }>).map((bud, index) => (
        <View
          key={`bud-${index}`}
          style={{
            position: 'absolute',
            top: bud.top,
            left: bud.left,
            width: bud.size,
            height: bud.size * 0.7,
            borderRadius: bud.size,
            backgroundColor: tint(palette, palette.accent, 0.55),
            opacity: 0.7,
            transform: [{ rotate: index % 2 === 0 ? '28deg' : '-34deg' }],
          }}
        />
      ))}
    </View>
  );
}

/** Sakura: a branch in the corner and a flurry of petals. */
function PetalsPattern({ palette }: PatternProps) {
  const pollen = tint(palette, palette.primary, 0.2);
  const petals: Array<{
    top: DimensionValue;
    left: DimensionValue;
    size: number;
    rotate: string;
    opacity?: number;
  }> = [
    { top: '2%', left: '70%', size: 30, rotate: '24deg' },
    { top: '14%', left: '88%', size: 18, rotate: '-16deg', opacity: 0.9 },
    { top: '22%', left: '58%', size: 15, rotate: '62deg', opacity: 0.75 },
    { top: '28%', left: '8%', size: 24, rotate: '-38deg' },
    { top: '40%', left: '38%', size: 14, rotate: '78deg', opacity: 0.75 },
    { top: '48%', left: '80%', size: 19, rotate: '52deg' },
    { top: '56%', left: '20%', size: 16, rotate: '12deg', opacity: 0.9 },
    { top: '66%', left: '62%', size: 21, rotate: '-24deg' },
    { top: '74%', left: '34%', size: 13, rotate: '124deg', opacity: 0.7 },
    { top: '82%', left: '76%', size: 16, rotate: '-64deg', opacity: 0.85 },
    { top: '90%', left: '12%', size: 12, rotate: '42deg', opacity: 0.8 },
    { top: '8%', left: '36%', size: 13, rotate: '-82deg', opacity: 0.7 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../assets/theme-sakura-branch.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: -18,
          left: -34,
          width: 168,
          height: 86,
          opacity: 0.6,
          transform: [{ rotate: '-8deg' }],
        }}
      />
      {petals.map((entry, index) => (
        <Image
          key={index}
          source={require('../assets/theme-petal.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: entry.top,
            left: entry.left,
            width: entry.size * 0.66,
            height: entry.size,
            opacity: entry.opacity ?? 0.95,
            transform: [{ rotate: entry.rotate }],
          }}
        />
      ))}
      {([
        { top: '18%', left: '70%' },
        { top: '50%', left: '24%' },
        { top: '74%', left: '58%' },
        { top: '88%', left: '40%' },
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
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

/** Ember: a low fire, charred logs, smoke, and rising sparks. */
function EmbersPattern({ palette }: PatternProps) {
  const glow = tint(palette, palette.accent, 0.35);
  const spark = tint(palette, palette.accentLight, 0.65);
  const wood = '#2A1712';
  const embers: Array<{ bottom: number; left: DimensionValue; size: number }> = [
    { bottom: 20, left: '10%', size: 5 },
    { bottom: 36, left: '24%', size: 3.5 },
    { bottom: 26, left: '40%', size: 4 },
    { bottom: 52, left: '52%', size: 3 },
    { bottom: 30, left: '64%', size: 5.5 },
    { bottom: 44, left: '78%', size: 3.5 },
    { bottom: 20, left: '88%', size: 4 },
    { bottom: 64, left: '34%', size: 2.5 },
    { bottom: 70, left: '70%', size: 2.5 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          left: '18%',
          right: '18%',
          bottom: -54,
          height: 150,
          borderRadius: 80,
          backgroundColor: glow,
          opacity: 0.24,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 4,
          left: '12%',
          width: 86,
          height: 15,
          borderRadius: 8,
          backgroundColor: wood,
          borderTopWidth: 2,
          borderTopColor: tint(palette, palette.primary, 0.55),
          transform: [{ rotate: '-8deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: '12%',
          width: 92,
          height: 15,
          borderRadius: 8,
          backgroundColor: wood,
          borderTopWidth: 2,
          borderTopColor: tint(palette, palette.accent, 0.5),
          transform: [{ rotate: '7deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-flame.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: 8,
          left: '18%',
          width: 58,
          height: 82,
          opacity: 0.85,
        }}
      />
      <Image
        source={require('../assets/theme-flame.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: 6,
          left: '44%',
          width: 38,
          height: 54,
          opacity: 0.7,
        }}
      />
      <Image
        source={require('../assets/theme-flame.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: 4,
          right: '20%',
          width: 32,
          height: 46,
          opacity: 0.65,
          transform: [{ rotate: '8deg' }],
        }}
      />
      {embers.map((ember, index) => (
        <View key={`ember-${index}`}>
          <View
            style={{
              position: 'absolute',
              bottom: ember.bottom - 4,
              left: ember.left,
              width: ember.size + 8,
              height: ember.size + 8,
              borderRadius: (ember.size + 8) / 2,
              borderWidth: 1,
              borderColor: glow,
              opacity: 0.35,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: ember.bottom,
              left: ember.left,
              width: ember.size,
              height: ember.size,
              borderRadius: ember.size / 2,
              backgroundColor: spark,
              opacity: 0.85,
            }}
          />
        </View>
      ))}
      <View
        style={{
          position: 'absolute',
          bottom: 78,
          left: '30%',
          width: 1.5,
          height: 44,
          borderRadius: 1,
          backgroundColor: spark,
          opacity: 0.18,
          transform: [{ rotate: '12deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 96,
          left: '62%',
          width: 1.5,
          height: 36,
          borderRadius: 1,
          backgroundColor: spark,
          opacity: 0.14,
          transform: [{ rotate: '-14deg' }],
        }}
      />
    </View>
  );
}

/** Blueprint: full-card drafting grid, compass, and dimension marks. */
function GridPattern({ palette }: PatternProps) {
  const line = tint(palette, palette.primaryLight, 0.2);
  const note = tint(palette, palette.accent, 0.45);
  const spacing = 22;

  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 26 }).map((_, index) => (
        <View
          key={`v-${index}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: index * spacing,
            width: 1,
            backgroundColor: line,
            opacity: 0.55,
          }}
        />
      ))}
      {Array.from({ length: 26 }).map((_, index) => (
        <View
          key={`h-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: index * spacing,
            height: 1,
            backgroundColor: line,
            opacity: 0.55,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 18,
          right: 20,
          width: 58,
          height: 58,
          borderRadius: 29,
          borderWidth: 1.5,
          borderColor: note,
          opacity: 0.65,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 32,
          right: 34,
          width: 30,
          height: 30,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: note,
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 46,
          right: 12,
          width: 74,
          height: 1,
          backgroundColor: note,
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 48,
          width: 1,
          height: 78,
          backgroundColor: note,
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 20,
          bottom: 34,
          width: 132,
          height: 1,
          backgroundColor: note,
          opacity: 0.5,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 20,
          bottom: 30,
          width: 1,
          height: 9,
          backgroundColor: note,
          opacity: 0.7,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 148,
          bottom: 30,
          width: 1,
          height: 9,
          backgroundColor: note,
          opacity: 0.7,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 18,
          bottom: 16,
          width: 82,
          height: 42,
          borderWidth: 1,
          borderColor: note,
          opacity: 0.4,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 18,
          bottom: 30,
          width: 82,
          height: 1,
          backgroundColor: note,
          opacity: 0.4,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 54,
          bottom: 16,
          width: 1,
          height: 42,
          backgroundColor: note,
          opacity: 0.4,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 16,
          height: 16,
          borderTopWidth: 1.5,
          borderLeftWidth: 1.5,
          borderColor: note,
          opacity: 0.6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          width: 16,
          height: 16,
          borderBottomWidth: 1.5,
          borderLeftWidth: 1.5,
          borderColor: note,
          opacity: 0.6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 96,
          left: 26,
          width: 7,
          height: 7,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: note,
          opacity: 0.6,
        }}
      />
    </View>
  );
}

/**
 * Shinobi: Akatsuki-style red clouds with a cream rim and dark keyline.
 * The emblem is a baked PNG (silhouette from the public-domain CC0
 * "Akatsuki clouds" artwork) so we get the exact cloud-with-curls shape
 * without adding an SVG renderer.
 */
function CloudsPattern(_props: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../assets/theme-cloud.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: '22%',
          right: -44,
          width: 156,
          height: 105,
          transform: [{ rotate: '-8deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-cloud.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: -20,
          left: -30,
          width: 118,
          height: 80,
          opacity: 0.9,
          transform: [{ rotate: '7deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-cloud.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: 0,
          left: -24,
          width: 86,
          height: 58,
          opacity: 0.7,
          transform: [{ rotate: '4deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-cloud.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: '62%',
          left: '42%',
          width: 84,
          height: 57,
          opacity: 0.8,
          transform: [{ rotate: '-6deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-cloud.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: '10%',
          left: '30%',
          width: 60,
          height: 40,
          opacity: 0.6,
          transform: [{ rotate: '12deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-shuriken.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: '8%',
          right: 20,
          width: 32,
          height: 32,
          opacity: 0.7,
          transform: [{ rotate: '15deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-shuriken.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: '15%',
          left: 15,
          width: 28,
          height: 28,
          opacity: 0.6,
          transform: [{ rotate: '-20deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-shuriken.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: '45%',
          right: '30%',
          width: 24,
          height: 24,
          opacity: 0.5,
          transform: [{ rotate: '30deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-kurama.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: -5,
          right: -10,
          width: 70,
          height: 55,
          opacity: 0.5,
        }}
      />
      <Image
        source={require('../assets/theme-konoha.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: 5,
          left: '35%',
          width: 40,
          height: 40,
          opacity: 0.45,
        }}
      />
      <Image
        source={require('../assets/theme-ramen.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: 5,
          left: '10%',
          width: 50,
          height: 37,
          opacity: 0.55,
        }}
      />
    </View>
  );
}

/** South Park: construction-paper mountains, a yellow sun, and primary confetti. */
function MountainsPattern({ palette }: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../assets/theme-sp-scene.png')}
        resizeMode="cover"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          opacity: 0.9,
        }}
      />
      {/* Construction paper fiber texture. */}
      {Array.from({ length: 8 }).map((_, index) => (
        <View
          key={`fiber-${index}`}
          style={{
            position: 'absolute',
            top: `${(index * 47) % 100}%`,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: tint(palette, palette.primary, 0.08),
            opacity: 0.3,
          }}
        />
      ))}
      {/* Confetti (character colors). */}
      {Array.from({ length: 8 }).map((_, index) => (
        <View
          key={`confetti-${index}`}
          style={{
            position: 'absolute',
            top: `${4 + ((index * 31) % 88)}%`,
            left: `${(index * 47) % 92}%`,
            width: index % 3 === 0 ? 9 : 5,
            height: index % 3 === 0 ? 9 : 5,
            borderRadius: index % 2 === 0 ? 0 : 3,
            backgroundColor: ['#2563EB', '#16A34A', '#DC2626', '#F97316', '#FACC15', '#9333EA'][index % 6],
            opacity: 0.75,
            transform: [{ rotate: `${(index * 37) % 90}deg` }],
          }}
        />
      ))}
    </View>
  );
}
/** Halloween: friendly ghosts, smiling pumpkins, candy corn, and bats. */
function HalloweenPattern({ palette }: PatternProps) {
  const ghost = tint(palette, palette.white, 0.95);
  const pumpkin = tint(palette, palette.primary, 0.85);
  const purple = tint(palette, palette.accent, 0.7);
  const yellow = tint(palette, palette.tipBackground, 0.9);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Spider webs in corners. */}
      <Image
        source={require('../assets/theme-spiderweb.png')}
        resizeMode="contain"
        style={{ position: 'absolute', top: -30, left: -30, width: 110, height: 110, opacity: 0.35 }}
      />
      <Image
        source={require('../assets/theme-spiderweb.png')}
        resizeMode="contain"
        style={{ position: 'absolute', bottom: -30, right: -30, width: 90, height: 90, opacity: 0.3, transform: [{ rotate: '180deg' }] }}
      />
      {/* Ghosts. */}
      <Image
        source={require('../assets/theme-ghost.png')}
        resizeMode="contain"
        style={{ position: 'absolute', top: -10, right: 10, width: 70, height: 100, opacity: 0.85, transform: [{ rotate: '-8deg' }] }}
      />
      <Image
        source={require('../assets/theme-ghost.png')}
        resizeMode="contain"
        style={{ position: 'absolute', bottom: -5, left: 20, width: 50, height: 72, opacity: 0.7, transform: [{ rotate: '12deg' }] }}
      />
      {/* Pumpkins. */}
      <Image
        source={require('../assets/theme-pumpkin.png')}
        resizeMode="contain"
        style={{ position: 'absolute', bottom: -15, right: -10, width: 80, height: 82, opacity: 0.85, transform: [{ rotate: '-6deg' }] }}
      />
      <Image
        source={require('../assets/theme-pumpkin.png')}
        resizeMode="contain"
        style={{ position: 'absolute', top: 10, left: -5, width: 55, height: 57, opacity: 0.7, transform: [{ rotate: '10deg' }] }}
      />
      {/* Bats. */}
      <Image
        source={require('../assets/theme-bat.png')}
        resizeMode="contain"
        style={{ position: 'absolute', top: 20, left: '30%', width: 60, height: 36, opacity: 0.6, transform: [{ rotate: '-15deg' }] }}
      />
      <Image
        source={require('../assets/theme-bat.png')}
        resizeMode="contain"
        style={{ position: 'absolute', top: 55, right: '25%', width: 45, height: 27, opacity: 0.5, transform: [{ rotate: '20deg' }] }}
      />
      {/* Candy corn. */}
      {Array.from({ length: 8 }).map((_, index) => (
        <Image
          key={`candy-${index}`}
          source={require('../assets/theme-candy-corn.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: `${10 + ((index * 37) % 75)}%`,
            left: `${(index * 53) % 88}%`,
            width: index % 2 === 0 ? 22 : 16,
            height: index % 2 === 0 ? 33 : 24,
            opacity: 0.7,
            transform: [{ rotate: `${(index * 41) % 60 - 30}deg` }],
          }}
        />
      ))}
      {/* Witch hat. */}
      <Image
        source={require('../assets/theme-witch-hat.png')}
        resizeMode="contain"
        style={{ position: 'absolute', top: -8, left: '45%', width: 40, height: 50, opacity: 0.6, transform: [{ rotate: '-12deg' }] }}
      />
      {/* Cauldron. */}
      <Image
        source={require('../assets/theme-cauldron.png')}
        resizeMode="contain"
        style={{ position: 'absolute', bottom: 8, left: '35%', width: 55, height: 48, opacity: 0.65 }}
      />
    </View>
  );
}

/** Ocean: waves, bubbles, fish, coral, and shells. */
function OceanPattern({ palette }: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Image key={'wave-' + index} source={require('../assets/theme-wave.png')} resizeMode="contain" style={{ position: 'absolute', bottom: (index * 14) + '%', left: '-5%', width: '110%', height: 50, opacity: 0.5, transform: [{ rotate: index % 2 === 0 ? '0deg' : '180deg' }] } as any} />
      ))}
      {Array.from({ length: 6 }).map((_, index) => (
        <Image key={'bubble-' + index} source={require('../assets/theme-bubble.png')} resizeMode="contain" style={{ position: 'absolute', top: (5 + ((index * 37) % 85)) + '%', left: ((index * 53) % 92) + '%', width: index % 3 === 0 ? 32 : 18, height: index % 3 === 0 ? 32 : 18, opacity: 0.6 } as any} />
      ))}
      {Array.from({ length: 4 }).map((_, index) => (
        <Image key={'fish-' + index} source={require('../assets/theme-fish.png')} resizeMode="contain" style={{ position: 'absolute', top: (15 + ((index * 41) % 60)) + '%', left: ((index * 59) % 70) + '%', width: 55, height: 36, opacity: 0.75, transform: [{ rotate: ((index * 23) % 40 - 20) + 'deg' }, { scaleX: index % 2 === 0 ? 1 : -1 }] } as any} />
      ))}
      {Array.from({ length: 3 }).map((_, index) => (
        <Image key={'coral-' + index} source={require('../assets/theme-coral.png')} resizeMode="contain" style={{ position: 'absolute', bottom: 5, left: (10 + index * 30) + '%', width: 40, height: 60, opacity: 0.7 } as any} />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <Image key={'shell-' + index} source={require('../assets/theme-shell.png')} resizeMode="contain" style={{ position: 'absolute', bottom: (3 + index * 2) + '%', left: ((index * 47) % 85) + '%', width: 28, height: 28, opacity: 0.65, transform: [{ rotate: ((index * 37) % 60 - 30) + 'deg' }] } as any} />
      ))}
    </View>
  );
}

/** Forest: trees, mushrooms, fireflies, and falling leaves. */
function ForestPattern({ palette }: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Image key={'tree-' + index} source={require('../assets/theme-tree.png')} resizeMode="contain" style={{ position: 'absolute', bottom: -10, left: ((index * 23) % 75) + '%', width: index % 2 === 0 ? 65 : 50, height: index % 2 === 0 ? 108 : 83, opacity: 0.8 } as any} />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <Image key={'mushroom-' + index} source={require('../assets/theme-mushroom.png')} resizeMode="contain" style={{ position: 'absolute', bottom: 5, left: ((index * 47) % 85) + '%', width: 32, height: 42, opacity: 0.75, transform: [{ rotate: ((index * 17) % 20 - 10) + 'deg' }] } as any} />
      ))}
      {Array.from({ length: 8 }).map((_, index) => (
        <Image key={'firefly-' + index} source={require('../assets/theme-firefly.png')} resizeMode="contain" style={{ position: 'absolute', top: (8 + ((index * 31) % 80)) + '%', left: ((index * 53) % 90) + '%', width: 14, height: 14, opacity: 0.8 } as any} />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <Image key={'leaf-' + index} source={require('../assets/theme-leaf.png')} resizeMode="contain" style={{ position: 'absolute', top: (5 + ((index * 43) % 85)) + '%', left: ((index * 61) % 90) + '%', width: 22, height: 30, opacity: 0.6, transform: [{ rotate: ((index * 37) % 90) + 'deg' }] } as any} />
      ))}
    </View>
  );
}

/** Space: planets, stars, rockets, and nebulas. */
function SpacePattern({ palette }: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={'star-' + index} style={{ position: 'absolute', top: ((index * 37) % 98) + '%', left: ((index * 53) % 98) + '%', width: index % 5 === 0 ? 3 : 2, height: index % 5 === 0 ? 3 : 2, borderRadius: 1.5, backgroundColor: '#FFFFFF', opacity: 0.6 } as any} />
      ))}
      {Array.from({ length: 3 }).map((_, index) => (
        <Image key={'nebula-' + index} source={require('../assets/theme-nebula.png')} resizeMode="contain" style={{ position: 'absolute', top: ((index * 17) % 50) + '%', left: ((index * 23) % 50) + '%', width: 90, height: 90, opacity: 0.4 } as any} />
      ))}
      {Array.from({ length: 3 }).map((_, index) => (
        <Image key={'planet-' + index} source={require('../assets/theme-planet.png')} resizeMode="contain" style={{ position: 'absolute', top: (10 + ((index * 19) % 60)) + '%', left: ((index * 31) % 70) + '%', width: 50, height: 50, opacity: 0.8 } as any} />
      ))}
      {Array.from({ length: 2 }).map((_, index) => (
        <Image key={'rocket-' + index} source={require('../assets/theme-rocket.png')} resizeMode="contain" style={{ position: 'absolute', top: (20 + index * 30) + '%', left: (25 + index * 35) + '%', width: 30, height: 60, opacity: 0.7, transform: [{ rotate: (index * 15 - 10) + 'deg' }] } as any} />
      ))}
      {Array.from({ length: 6 }).map((_, index) => (
        <Image key={'star-' + index} source={require('../assets/theme-star.png')} resizeMode="contain" style={{ position: 'absolute', top: (5 + ((index * 41) % 88)) + '%', left: ((index * 59) % 90) + '%', width: 22, height: 22, opacity: 0.7, transform: [{ rotate: ((index * 37) % 90) + 'deg' }] } as any} />
      ))}
    </View>
  );
}

/** Candy: lollipops, candy pieces, chocolate, and sprinkles. */
function CandyPattern({ palette }: PatternProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Image key={'lollipop-' + index} source={require('../assets/theme-lollipop.png')} resizeMode="contain" style={{ position: 'absolute', top: (5 + ((index * 17) % 60)) + '%', left: ((index * 23) % 80) + '%', width: 40, height: 80, opacity: 0.8, transform: [{ rotate: ((index * 31) % 40 - 20) + 'deg' }] } as any} />
      ))}
      {Array.from({ length: 6 }).map((_, index) => (
        <Image key={'candy-' + index} source={require('../assets/theme-candy.png')} resizeMode="contain" style={{ position: 'absolute', top: (5 + ((index * 29) % 88)) + '%', left: ((index * 47) % 92) + '%', width: index % 3 === 0 ? 28 : 18, height: index % 3 === 0 ? 28 : 18, opacity: 0.75, transform: [{ rotate: ((index * 37) % 90) + 'deg' }] } as any} />
      ))}
      {Array.from({ length: 4 }).map((_, index) => (
        <Image key={'chocolate-' + index} source={require('../assets/theme-chocolate.png')} resizeMode="contain" style={{ position: 'absolute', top: (15 + ((index * 31) % 60)) + '%', left: ((index * 43) % 75) + '%', width: 55, height: 44, opacity: 0.7, transform: [{ rotate: ((index * 19) % 30 - 15) + 'deg' }] } as any} />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={'sprinkle-' + index} style={{ position: 'absolute', top: (5 + ((index * 23) % 88)) + '%', left: ((index * 41) % 92) + '%', width: 3, height: 8, borderRadius: 1.5, backgroundColor: ['#E91E63', '#FF4081', '#F06292', '#FF80AB', '#FFD54F', '#FFF176'][index % 6], opacity: 0.7, transform: [{ rotate: ((index * 41) % 120 - 60) + 'deg' }] } as any} />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */

const PATTERNS: Record<CardPattern, React.ComponentType<PatternProps>> = {
  clouds: CloudsPattern,
  mountains: MountainsPattern,
  halloween: HalloweenPattern,
  petals: PetalsPattern,
  ocean: OceanPattern,
  forest: ForestPattern,
  space: SpacePattern,
  candy: CandyPattern,
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
