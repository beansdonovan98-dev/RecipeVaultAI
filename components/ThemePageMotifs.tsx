import React from 'react';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import type { CardPattern, ThemePalette } from '@/constants/themes';

/* ------------------------------------------------------------------ */
/* Color helpers                                                       */
/* ------------------------------------------------------------------ */

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function mixHex(color: string, base: string, weight: number): string {
  const a = parseHex(color);
  const b = parseHex(base);
  const channel = (index: number) =>
    Math.round(a[index] * weight + b[index] * (1 - weight))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

/** Softens a palette color toward the page so content stays readable. */
function tint(palette: ThemePalette, color: string, weight: number): string {
  return mixHex(color, palette.card, weight);
}

interface MotifProps {
  palette: ThemePalette;
}

/* ------------------------------------------------------------------ */
/* Shared shapes                                                       */
/* ------------------------------------------------------------------ */

function Sparkle({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        style,
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          width: size,
          height: Math.max(1, size * 0.075),
          borderRadius: 1,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: Math.max(1, size * 0.075),
          height: size,
          borderRadius: 1,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          width: Math.max(2, size * 0.16),
          height: Math.max(2, size * 0.16),
          borderRadius: size * 0.08,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Riso Pop: halftone dot fields and overprint rings                   */
/* ------------------------------------------------------------------ */

const HALFTONE_SIZES = [12, 9, 6, 4, 7, 10, 5, 8];

function HalftoneField({
  palette,
  color,
  style,
  rotate,
  columns,
  rows,
  gap,
}: MotifProps & {
  color: string;
  style: ViewStyle;
  rotate: string;
  columns: number;
  rows: number;
  gap: number;
}) {
  const dot = tint(palette, color, 0.5);

  return (
    <View
      style={[
        style,
        {
          width: columns * gap,
          flexDirection: 'row',
          flexWrap: 'wrap',
          transform: [{ rotate }],
        },
      ]}
    >
      {Array.from({ length: columns * rows }).map((_, index) => {
        const size = HALFTONE_SIZES[index % HALFTONE_SIZES.length];
        return (
          <View
            key={index}
            style={{
              width: gap,
              height: gap,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: dot,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

function RisoMotif({ palette }: MotifProps) {
  const hot = tint(palette, palette.accent, 0.42);
  const ink = tint(palette, palette.primary, 0.2);

  return (
    <View style={StyleSheet.absoluteFill}>
      <HalftoneField
        palette={palette}
        color={palette.accent}
        style={{ position: 'absolute', top: 4, right: -20 }}
        rotate="-12deg"
        columns={8}
        rows={7}
        gap={23}
      />
      <HalftoneField
        palette={palette}
        color={palette.primary}
        style={{ position: 'absolute', bottom: 52, left: -24 }}
        rotate="9deg"
        columns={7}
        rows={5}
        gap={21}
      />

      {/* Overprint rings where the two inks meet. */}
      <View
        style={{
          position: 'absolute',
          top: '30%',
          left: '-4%',
          width: 104,
          height: 104,
          borderRadius: 52,
          borderWidth: 12,
          borderColor: tint(palette, palette.accent, 0.26),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '35%',
          left: '6%',
          width: 78,
          height: 78,
          borderRadius: 39,
          borderWidth: 9,
          borderColor: tint(palette, palette.primary, 0.16),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '66%',
          right: '6%',
          width: 74,
          height: 74,
          borderRadius: 37,
          borderWidth: 9,
          borderColor: tint(palette, palette.accent, 0.24),
        }}
      />

      {([
        { top: '15%', left: '40%', size: 28 },
        { top: '20%', left: '86%', size: 18 },
        { top: '50%', left: '80%', size: 20 },
        { top: '78%', left: '48%', size: 32 },
        { top: '88%', left: '14%', size: 16 },
      ] as Array<{ top: DimensionValue; left: DimensionValue; size: number }>).map((dot, index) => (
        <View
          key={`loose-${index}`}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: index % 2 === 0 ? hot : ink,
            opacity: 0.85,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Night Diner: awning stripes and neon rings                          */
/* ------------------------------------------------------------------ */

function Awning({
  palette,
  style,
  rotate,
  count,
  width,
  gap,
}: MotifProps & {
  style: ViewStyle;
  rotate: string;
  count: number;
  width: number;
  gap: number;
}) {
  const pink = tint(palette, palette.primary, 0.46);
  const mint = tint(palette, palette.accent, 0.5);

  return (
    <View
      style={[
        style,
        {
          flexDirection: 'row',
          gap,
          transform: [{ rotate }],
        },
      ]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            width,
            backgroundColor: index % 2 === 0 ? pink : mint,
            opacity: 0.75 + (index % 3) * 0.1,
          }}
        />
      ))}
    </View>
  );
}

function DinerMotif({ palette }: MotifProps) {
  const pink = tint(palette, palette.primary, 0.5);
  const mint = tint(palette, palette.accent, 0.5);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Awning
        palette={palette}
        style={{ position: 'absolute', top: -46, right: -34, height: 360 }}
        rotate="-10deg"
        count={7}
        width={18}
        gap={13}
      />
      <Awning
        palette={palette}
        style={{ position: 'absolute', bottom: -66, left: -42, height: 300 }}
        rotate="8deg"
        count={5}
        width={16}
        gap={15}
      />

      {/* Neon signs, drawn as a bright ring inside a soft halo. */}
      <View
        style={{
          position: 'absolute',
          top: '40%',
          left: '4%',
          width: 136,
          height: 136,
          borderRadius: 68,
          borderWidth: 5,
          borderColor: tint(palette, palette.primary, 0.14),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '43%',
          left: '7%',
          width: 118,
          height: 118,
          borderRadius: 59,
          borderWidth: 2,
          borderColor: pink,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '64%',
          right: '5%',
          width: 96,
          height: 96,
          borderRadius: 48,
          borderWidth: 4,
          borderColor: tint(palette, palette.accent, 0.14),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '66.5%',
          right: '7%',
          width: 82,
          height: 82,
          borderRadius: 41,
          borderWidth: 2,
          borderColor: mint,
        }}
      />

      {([
        { top: '16%', left: '48%', size: 20, color: mint },
        { top: '28%', left: '12%', size: 14, color: pink },
        { top: '54%', left: '82%', size: 18, color: mint },
        { top: '79%', left: '18%', size: 12, color: pink },
        { top: '88%', left: '60%', size: 16, color: mint },
      ] as Array<{ top: DimensionValue; left: DimensionValue; size: number; color: string }>).map((sparkle, index) => (
        <Sparkle
          key={`sparkle-${index}`}
          size={sparkle.size}
          color={sparkle.color}
          style={{
            position: 'absolute',
            top: sparkle.top,
            left: sparkle.left,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Midnight Brass: sparkles, orbit ring, brass dust                    */
/* ------------------------------------------------------------------ */

function MidnightMotif({ palette }: MotifProps) {
  const brass = tint(palette, palette.accent, 0.72);
  const faint = tint(palette, palette.accent, 0.4);

  const sparkles: Array<{
    top: DimensionValue;
    left: DimensionValue;
    size: number;
    opacity: number;
  }> = [
    { top: '5%', left: '70%', size: 40, opacity: 0.95 },
    { top: '11%', left: '14%', size: 20, opacity: 0.8 },
    { top: '20%', left: '46%', size: 12, opacity: 0.6 },
    { top: '32%', left: '82%', size: 24, opacity: 0.7 },
    { top: '43%', left: '6%', size: 16, opacity: 0.65 },
    { top: '54%', left: '60%', size: 30, opacity: 0.8 },
    { top: '64%', left: '24%', size: 11, opacity: 0.55 },
    { top: '74%', left: '86%', size: 22, opacity: 0.75 },
    { top: '84%', left: '46%', size: 15, opacity: 0.65 },
    { top: '91%', left: '16%', size: 9, opacity: 0.5 },
    { top: '27%', left: '28%', size: 7, opacity: 0.45 },
    { top: '69%', left: '68%', size: 8, opacity: 0.5 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Brass crescent: a solid cutout in the page color carves the moon. */}
      <View
        style={{
          position: 'absolute',
          top: '6%',
          right: '2%',
          width: 132,
          height: 132,
          borderRadius: 66,
          backgroundColor: brass,
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '3%',
          right: '8%',
          width: 118,
          height: 118,
          borderRadius: 59,
          backgroundColor: palette.background,
        }}
      />

      {/* Brass orbit with a small planet on the ring. */}
      <View
        style={{
          position: 'absolute',
          bottom: '4%',
          left: '-18%',
          width: 170,
          height: 170,
          borderRadius: 85,
          borderWidth: 1.5,
          borderColor: tint(palette, palette.accent, 0.32),
          transform: [{ rotate: '-18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '10%',
          width: 9,
          height: 9,
          borderRadius: 4.5,
          backgroundColor: brass,
        }}
      />

      {sparkles.map((sparkle, index) => (
        <Sparkle
          key={`sparkle-${index}`}
          size={sparkle.size}
          color={brass}
          style={{
            position: 'absolute',
            top: sparkle.top,
            left: sparkle.left,
            opacity: sparkle.opacity,
          }}
        />
      ))}

      {([
        { top: '16%', left: '36%' },
        { top: '25%', left: '66%' },
        { top: '38%', left: '20%' },
        { top: '49%', left: '44%' },
        { top: '59%', left: '10%' },
        { top: '63%', left: '74%' },
        { top: '72%', left: '38%' },
        { top: '81%', left: '16%' },
        { top: '89%', left: '68%' },
        { top: '8%', left: '42%' },
        { top: '41%', left: '92%' },
        { top: '70%', left: '56%' },
        { top: '36%', left: '56%' },
        { top: '86%', left: '90%' },
      ] as Array<{ top: DimensionValue; left: DimensionValue }>).map((dot, index) => (
        <View
          key={`dust-${index}`}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: index % 3 === 0 ? 3 : 2,
            height: index % 3 === 0 ? 3 : 2,
            borderRadius: 1.5,
            backgroundColor: faint,
          }}
        />
      ))}

      <View
        style={{
          position: 'absolute',
          top: '30%',
          left: '30%',
          width: 64,
          height: 1,
          borderRadius: 1,
          backgroundColor: tint(palette, palette.accent, 0.24),
          transform: [{ rotate: '32deg' }],
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Sea Glass: bubbles, rings, and frosted shards                       */
/* ------------------------------------------------------------------ */

function SeaglassMotif({ palette }: MotifProps) {
  const teal = tint(palette, palette.primary, 0.34);
  const coral = tint(palette, palette.accent, 0.36);
  const tealFill = tint(palette, palette.primary, 0.12);
  const coralFill = tint(palette, palette.accent, 0.14);

  const bubbles: Array<{
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    size: number;
    color: string;
    fill?: string;
  }> = [
    { top: '-3%', right: '-8%', size: 132, color: teal },
    { top: '16%', left: '-6%', size: 52, color: coral },
    { top: '27%', right: '18%', size: 28, color: teal, fill: tealFill },
    { top: '41%', left: '10%', size: 74, color: teal },
    { top: '52%', right: '-7%', size: 96, color: coral },
    { top: '63%', left: '34%', size: 20, color: coral, fill: coralFill },
    { top: '72%', left: '-4%', size: 44, color: teal },
    { top: '82%', right: '22%', size: 34, color: coral, fill: coralFill },
    { bottom: '-2%', left: '58%', size: 62, color: teal },
  ];

  const shards: Array<{
    top: DimensionValue;
    left: DimensionValue;
    width: number;
    height: number;
    rotate: string;
    color: string;
    fill: string;
  }> = [
    { top: '22%', left: '12%', width: 54, height: 32, rotate: '-24deg', color: coral, fill: coralFill },
    { top: '58%', left: '66%', width: 46, height: 28, rotate: '18deg', color: teal, fill: tealFill },
    { top: '86%', left: '8%', width: 62, height: 34, rotate: '12deg', color: coral, fill: coralFill },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {shards.map((shard, index) => (
        <View
          key={`shard-${index}`}
          style={{
            position: 'absolute',
            top: shard.top,
            left: shard.left,
            width: shard.width,
            height: shard.height,
            borderRadius: shard.height * 0.42,
            borderWidth: 1,
            borderColor: shard.color,
            backgroundColor: shard.fill,
            transform: [{ rotate: shard.rotate }],
          }}
        />
      ))}

      {bubbles.map((bubble, index) => (
        <View
          key={`bubble-${index}`}
          style={{
            position: 'absolute',
            top: bubble.top,
            bottom: bubble.bottom,
            left: bubble.left,
            right: bubble.right,
            width: bubble.size,
            height: bubble.size,
            borderRadius: bubble.size / 2,
            borderWidth: bubble.fill ? 0 : 1.5,
            borderColor: bubble.color,
            backgroundColor: bubble.fill,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: '18%',
              left: '22%',
              width: bubble.size * 0.2,
              height: bubble.size * 0.2,
              borderRadius: bubble.size * 0.1,
              backgroundColor: tint(palette, palette.white, 0.5),
              opacity: 0.7,
            }}
          />
        </View>
      ))}

      {([
        { top: '36%', left: '76%' },
        { top: '66%', left: '18%' },
        { top: '90%', left: '42%' },
        { top: '12%', left: '42%' },
        { top: '48%', left: '48%' },
      ] as Array<{ top: DimensionValue; left: DimensionValue }>).map((dot, index) => (
        <View
          key={`sand-${index}`}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: index % 2 === 0 ? 4 : 3,
            height: index % 2 === 0 ? 4 : 3,
            borderRadius: 2,
            backgroundColor: index % 2 === 0 ? coral : teal,
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Butter & Cocoa: polka dots and cocoa rings                          */
/* ------------------------------------------------------------------ */

function ButterMotif({ palette }: MotifProps) {
  const cocoa = tint(palette, palette.primary, 0.22);
  const persimmon = tint(palette, palette.accent, 0.3);

  const dots: Array<{
    top: DimensionValue;
    left: DimensionValue;
    size: number;
    color: string;
  }> = [
    { top: '5%', left: '74%', size: 40, color: persimmon },
    { top: '9%', left: '12%', size: 16, color: cocoa },
    { top: '18%', left: '46%', size: 10, color: persimmon },
    { top: '26%', left: '88%', size: 22, color: cocoa },
    { top: '33%', left: '6%', size: 30, color: persimmon },
    { top: '41%', left: '62%', size: 14, color: cocoa },
    { top: '49%', left: '30%', size: 8, color: persimmon },
    { top: '57%', left: '80%', size: 34, color: persimmon },
    { top: '65%', left: '14%', size: 18, color: cocoa },
    { top: '72%', left: '50%', size: 12, color: persimmon },
    { top: '80%', left: '72%', size: 26, color: cocoa },
    { top: '88%', left: '28%', size: 20, color: persimmon },
    { top: '93%', left: '58%', size: 10, color: cocoa },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {dots.map((dot, index) => (
        <View
          key={`dot-${index}`}
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

      {/* Oversized chocolate rings. */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '-9%',
          width: 104,
          height: 104,
          borderRadius: 52,
          borderWidth: 18,
          borderColor: tint(palette, palette.primary, 0.2),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '74%',
          right: '-8%',
          width: 88,
          height: 88,
          borderRadius: 44,
          borderWidth: 15,
          borderColor: tint(palette, palette.accent, 0.24),
        }}
      />

      {([
        { top: '15%', left: '34%' },
        { top: '38%', left: '40%' },
        { top: '60%', left: '92%' },
        { top: '86%', left: '8%' },
        { top: '45%', left: '22%' },
      ] as Array<{ top: DimensionValue; left: DimensionValue }>).map((crumb, index) => (
        <View
          key={`crumb-${index}`}
          style={{
            position: 'absolute',
            top: crumb.top,
            left: crumb.left,
            width: index % 2 === 0 ? 5 : 4,
            height: index % 2 === 0 ? 5 : 4,
            borderRadius: 2.5,
            backgroundColor: index % 2 === 0 ? cocoa : persimmon,
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Lavender Haze: sprigs and drifting buds                             */
/* ------------------------------------------------------------------ */

function PageSprig({
  palette,
  size,
  rotate,
  style,
}: MotifProps & {
  size: number;
  rotate: string;
  style: ViewStyle;
}) {
  const stem = tint(palette, palette.primary, 0.26);
  const bud = tint(palette, palette.accent, 0.34);
  const budLight = tint(palette, palette.accent, 0.45);

  const buds: Array<{ top: number; side: -1 | 1; tilt: string; size: number }> = [
    { top: 0.08, side: -1, tilt: '28deg', size: 0.2 },
    { top: 0.18, side: 1, tilt: '-30deg', size: 0.22 },
    { top: 0.3, side: -1, tilt: '26deg', size: 0.19 },
    { top: 0.41, side: 1, tilt: '-24deg', size: 0.21 },
    { top: 0.52, side: -1, tilt: '30deg', size: 0.17 },
    { top: 0.62, side: 1, tilt: '-28deg', size: 0.18 },
  ];

  return (
    <View
      style={[
        style,
        {
          width: size * 0.62,
          height: size,
          transform: [{ rotate }],
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          left: size * 0.29,
          top: size * 0.04,
          width: Math.max(1, size * 0.028),
          height: size * 0.9,
          borderRadius: 1,
          backgroundColor: stem,
        }}
      />
      {buds.map((entry, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: size * entry.top,
            left: entry.side === -1 ? size * 0.12 : size * 0.34,
            width: size * entry.size,
            height: size * entry.size * 0.62,
            borderRadius: size * entry.size * 0.31,
            backgroundColor: index % 2 === 0 ? bud : budLight,
            transform: [{ rotate: entry.tilt }],
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: size * 0.2,
          width: size * 0.2,
          height: size * 0.13,
          borderRadius: size * 0.1,
          backgroundColor: budLight,
        }}
      />
    </View>
  );
}

function LavenderMotif({ palette }: MotifProps) {
  const sprigs: Array<{
    top: DimensionValue;
    left: DimensionValue;
    size: number;
    rotate: string;
    opacity: number;
  }> = [
    { top: '2%', left: '66%', size: 96, rotate: '16deg', opacity: 0.9 },
    { top: '12%', left: '8%', size: 70, rotate: '-28deg', opacity: 0.75 },
    { top: '26%', left: '42%', size: 54, rotate: '32deg', opacity: 0.5 },
    { top: '40%', left: '82%', size: 82, rotate: '-18deg', opacity: 0.7 },
    { top: '55%', left: '-4%', size: 88, rotate: '24deg', opacity: 0.65 },
    { top: '68%', left: '56%', size: 60, rotate: '-34deg', opacity: 0.55 },
    { top: '80%', left: '18%', size: 100, rotate: '12deg', opacity: 0.7 },
    { top: '90%', left: '74%', size: 64, rotate: '-22deg', opacity: 0.55 },
  ];

  const buds: Array<{ top: DimensionValue; left: DimensionValue }> = [
    { top: '18%', left: '34%' },
    { top: '33%', left: '72%' },
    { top: '48%', left: '14%' },
    { top: '62%', left: '90%' },
    { top: '74%', left: '40%' },
    { top: '88%', left: '60%' },
    { top: '9%', left: '46%' },
    { top: '55%', left: '34%' },
    { top: '93%', left: '6%' },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {sprigs.map((sprig, index) => (
        <PageSprig
          key={`sprig-${index}`}
          palette={palette}
          size={sprig.size}
          rotate={sprig.rotate}
          style={{
            position: 'absolute',
            top: sprig.top,
            left: sprig.left,
            opacity: sprig.opacity,
          }}
        />
      ))}
      {buds.map((bud, index) => (
        <View
          key={`bud-${index}`}
          style={{
            position: 'absolute',
            top: bud.top,
            left: bud.left,
            width: index % 2 === 0 ? 10 : 7,
            height: index % 2 === 0 ? 6 : 4,
            borderRadius: 4,
            backgroundColor: tint(palette, palette.accent, 0.34),
            transform: [{ rotate: index % 2 === 0 ? '24deg' : '-36deg' }],
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Ember: coal glows and rising sparks                                 */
/* ------------------------------------------------------------------ */

function EmberMotif({ palette }: MotifProps) {
  const core = tint(palette, palette.accent, 0.58);
  const halo = tint(palette, palette.accent, 0.28);
  const trail = tint(palette, palette.primary, 0.34);

  const embers: Array<{ top: DimensionValue; left: DimensionValue; size: number }> = [
    { top: '54%', left: '12%', size: 5 },
    { top: '62%', left: '26%', size: 3 },
    { top: '48%', left: '38%', size: 4 },
    { top: '70%', left: '46%', size: 6 },
    { top: '58%', left: '58%', size: 3 },
    { top: '76%', left: '68%', size: 5 },
    { top: '66%', left: '82%', size: 4 },
    { top: '82%', left: '88%', size: 7 },
    { top: '72%', left: '6%', size: 3 },
    { top: '86%', left: '22%', size: 5 },
    { top: '90%', left: '40%', size: 4 },
    { top: '88%', left: '54%', size: 8 },
    { top: '92%', left: '76%', size: 3 },
    { top: '38%', left: '22%', size: 3 },
    { top: '44%', left: '72%', size: 2.5 },
    { top: '34%', left: '52%', size: 2.5 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Soft coal glow along the bottom edge. */}
      {([
        { left: '2%', size: 190 },
        { left: '34%', size: 220 },
        { left: '68%', size: 170 },
      ] as Array<{ left: DimensionValue; size: number }>).map((glow, index) => (
        <View key={`glow-${index}`} style={{ position: 'absolute', bottom: -70, left: glow.left }}>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: -glow.size / 2,
              width: glow.size,
              height: glow.size,
              borderRadius: glow.size / 2,
              backgroundColor: tint(palette, palette.accent, 0.1),
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 18,
              left: -glow.size / 3,
              width: glow.size * 0.66,
              height: glow.size * 0.66,
              borderRadius: glow.size * 0.33,
              backgroundColor: tint(palette, palette.accent, 0.16),
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 42,
              left: -glow.size / 5,
              width: glow.size * 0.4,
              height: glow.size * 0.4,
              borderRadius: glow.size * 0.2,
              backgroundColor: tint(palette, palette.accent, 0.24),
            }}
          />
        </View>
      ))}

      {/* Thin heat trails. */}
      {([
        { bottom: '24%', left: '20%', height: 34 },
        { bottom: '32%', left: '50%', height: 46 },
        { bottom: '20%', left: '72%', height: 30 },
      ] as Array<{ bottom: DimensionValue; left: DimensionValue; height: number }>).map((line, index) => (
        <View
          key={`trail-${index}`}
          style={{
            position: 'absolute',
            bottom: line.bottom,
            left: line.left,
            width: 1,
            height: line.height,
            borderRadius: 1,
            backgroundColor: trail,
            opacity: 0.55,
          }}
        />
      ))}

      {embers.map((ember, index) => (
        <View key={`halo-${index}`} style={{ position: 'absolute', top: ember.top, left: ember.left }}>
          <View
            style={{
              position: 'absolute',
              top: -(ember.size + 8) / 2 + ember.size / 2,
              left: -(ember.size + 8) / 2 + ember.size / 2,
              width: ember.size + 8,
              height: ember.size + 8,
              borderRadius: (ember.size + 8) / 2,
              borderWidth: 1,
              borderColor: halo,
            }}
          />
          <View
            style={{
              width: ember.size,
              height: ember.size,
              borderRadius: ember.size / 2,
              backgroundColor: core,
            }}
          />
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export const PAGE_MOTIFS: Partial<
  Record<CardPattern, React.ComponentType<MotifProps>>
> = {
  halftone: RisoMotif,
  stripes: DinerMotif,
  stars: MidnightMotif,
  bubbles: SeaglassMotif,
  dots: ButterMotif,
  sprigs: LavenderMotif,
  embers: EmberMotif,
};
