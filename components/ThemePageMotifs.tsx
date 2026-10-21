import React from 'react';
import { Image, StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
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

/** A line between two points in the parent's coordinate space. */
function Connector({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 1,
  opacity = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  opacity?: number;
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
        opacity,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Taverna: olive branches all over the page                           */
/* ------------------------------------------------------------------ */

function OliveMotif({ palette }: MotifProps) {
  const branches: Array<{
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    width: number;
    rotate: string;
    opacity: number;
  }> = [
    { top: '-3%', left: '-20%', width: 210, rotate: '-14deg', opacity: 0.58 },
    { top: '9%', right: '-26%', width: 240, rotate: '18deg', opacity: 0.52 },
    { top: '31%', left: '-28%', width: 180, rotate: '6deg', opacity: 0.4 },
    { top: '47%', right: '-24%', width: 210, rotate: '-10deg', opacity: 0.45 },
    { top: '63%', left: '-18%', width: 245, rotate: '14deg', opacity: 0.5 },
    { top: '80%', right: '-30%', width: 200, rotate: '-18deg', opacity: 0.55 },
    { bottom: '-4%', left: '24%', width: 160, rotate: '24deg', opacity: 0.36 },
    { top: '37%', left: '16%', width: 150, rotate: '34deg', opacity: 0.24 },
  ];

  const olives: Array<{ top: DimensionValue; left: DimensionValue; size: number }> = [
    { top: '18%', left: '76%', size: 22 },
    { top: '26%', left: '58%', size: 14 },
    { top: '39%', left: '16%', size: 18 },
    { top: '54%', left: '66%', size: 24 },
    { top: '62%', left: '34%', size: 12 },
    { top: '73%', left: '84%', size: 16 },
    { top: '86%', left: '46%', size: 20 },
    { top: '91%', left: '14%', size: 13 },
    { top: '44%', left: '44%', size: 15 },
    { top: '58%', left: '52%', size: 11 },
    { top: '35%', left: '56%', size: 9 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {branches.map((branch, index) => (
        <Image
          key={`branch-${index}`}
          source={require('../assets/theme-olive-branch.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: branch.top,
            bottom: branch.bottom,
            left: branch.left,
            right: branch.right,
            width: branch.width,
            height: branch.width * 1.253,
            opacity: branch.opacity,
            transform: [{ rotate: branch.rotate }],
          }}
        />
      ))}
      {olives.map((olive, index) => (
        <View
          key={`olive-${index}`}
          style={{
            position: 'absolute',
            top: olive.top,
            left: olive.left,
            width: olive.size,
            height: olive.size,
            borderRadius: olive.size / 2,
            backgroundColor: '#56662D',
            opacity: 0.62,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: olive.size * 0.18,
              left: olive.size * 0.16,
              width: olive.size * 0.3,
              height: olive.size * 0.3,
              borderRadius: olive.size,
              backgroundColor: '#C9D89C',
              opacity: 0.75,
            }}
          />
        </View>
      ))}
      <View
        style={{
          position: 'absolute',
          top: '30%',
          left: '42%',
          width: 90,
          height: 90,
          borderRadius: 45,
          borderWidth: 10,
          borderColor: tint(palette, palette.accent, 0.1),
          opacity: 0.7,
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Riso Pop: huge mis-registered ink shapes and halftone fields         */
/* ------------------------------------------------------------------ */

const HALFTONE_SIZES = [14, 10, 7, 4.5, 8, 12, 5.5, 9];

function HalftoneField({
  palette,
  color,
  style,
  rotate,
  columns,
  rows,
  gap,
  opacity = 0.75,
}: MotifProps & {
  color: string;
  style: ViewStyle;
  rotate: string;
  columns: number;
  rows: number;
  gap: number;
  opacity?: number;
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
          opacity,
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
  const pink = palette.accent;
  const blue = palette.primary;
  const yellow = palette.tipBackground;

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: -54,
          right: -62,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: pink,
          opacity: 0.2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -44,
          right: -50,
          width: 260,
          height: 260,
          borderRadius: 130,
          borderWidth: 7,
          borderColor: blue,
          opacity: 0.35,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '27%',
          left: '-28%',
          width: 210,
          height: 210,
          borderRadius: 30,
          backgroundColor: blue,
          opacity: 0.14,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '29%',
          left: '-25%',
          width: 210,
          height: 210,
          borderRadius: 30,
          borderWidth: 5,
          borderColor: pink,
          opacity: 0.42,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '7%',
          right: '8%',
          width: 138,
          height: 138,
          borderRadius: 69,
          backgroundColor: yellow,
          opacity: 0.6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '28%',
          right: '-12%',
          width: 132,
          height: 132,
          borderRadius: 66,
          borderWidth: 14,
          borderColor: blue,
          opacity: 0.22,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '56%',
          left: '10%',
          width: 164,
          height: 14,
          borderRadius: 4,
          backgroundColor: pink,
          opacity: 0.45,
          transform: [{ rotate: '-8deg' }],
        }}
      />
      <HalftoneField
        palette={palette}
        color={pink}
        style={{ position: 'absolute', top: 12, left: -18 }}
        rotate="-12deg"
        columns={9}
        rows={8}
        gap={24}
      />
      <HalftoneField
        palette={palette}
        color={blue}
        style={{ position: 'absolute', bottom: 60, left: -26 }}
        rotate="9deg"
        columns={8}
        rows={6}
        gap={24}
      />
      {([
        { top: '14%', left: '54%', size: 30, color: pink },
        { top: '22%', left: '86%', size: 18, color: blue },
        { top: '42%', left: '72%', size: 24, color: yellow },
        { top: '50%', left: '34%', size: 14, color: blue },
        { top: '68%', left: '58%', size: 38, color: pink },
        { top: '78%', left: '24%', size: 16, color: blue },
        { top: '88%', left: '78%', size: 22, color: pink },
        { top: '36%', left: '8%', size: 12, color: yellow },
      ] as Array<{ top: DimensionValue; left: DimensionValue; size: number; color: string }>).map(
        (dot, index) => (
          <View
            key={`loose-${index}`}
            style={{
              position: 'absolute',
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: dot.color,
              opacity: 0.55,
            }}
          />
        )
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Night Diner: awning, checkerboard floor, neon signs                  */
/* ------------------------------------------------------------------ */

function DinerMotif({ palette }: MotifProps) {
  const pink = palette.primary;
  const mint = palette.accent;
  const dark = palette.border;
  const tile = 34;

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', top: -10, left: -24, right: -24, height: 82 }}>
        {Array.from({ length: 24 }).map((_, index) => (
          <View
            key={`stripe-${index}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: index * 22,
              width: 22,
              backgroundColor: index % 2 === 0 ? pink : mint,
              opacity: 0.5,
            }}
          />
        ))}
        {Array.from({ length: 24 }).map((_, index) => (
          <View
            key={`scallop-${index}`}
            style={{
              position: 'absolute',
              top: 64,
              left: index * 22 - 11,
              width: 44,
              height: 22,
              borderBottomLeftRadius: 22,
              borderBottomRightRadius: 22,
              backgroundColor: index % 2 === 0 ? pink : mint,
              opacity: 0.5,
            }}
          />
        ))}
      </View>

      <View
        style={{
          position: 'absolute',
          left: -50,
          right: -50,
          bottom: -26,
          height: 190,
          transform: [{ rotate: '-3deg' }],
          opacity: 0.62,
        }}
      >
        {Array.from({ length: 4 }).map((_, row) => (
          <View key={`row-${row}`} style={{ flexDirection: 'row' }}>
            {Array.from({ length: 24 }).map((_, col) => (
              <View
                key={`tile-${row}-${col}`}
                style={{
                  width: tile,
                  height: 40,
                  backgroundColor:
                    (row + col) % 2 === 0
                      ? tint(palette, dark, 0.75)
                      : tint(palette, pink, 0.3),
                }}
              />
            ))}
          </View>
        ))}
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: '14%',
          right: '-8%',
          width: 184,
          height: 184,
          borderRadius: 92,
          borderWidth: 10,
          borderColor: tint(palette, pink, 0.18),
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '15.5%',
          right: '-6%',
          width: 160,
          height: 160,
          borderRadius: 80,
          borderWidth: 3,
          borderColor: pink,
          opacity: 0.75,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '36%',
          left: '-10%',
          width: 150,
          height: 150,
          borderRadius: 75,
          borderWidth: 8,
          borderColor: tint(palette, mint, 0.18),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '37.5%',
          left: '-8%',
          width: 128,
          height: 128,
          borderRadius: 64,
          borderWidth: 2.5,
          borderColor: mint,
          opacity: 0.7,
        }}
      />

      {/* Atomic starburst in the middle of the room. */}
      <View
        style={{
          position: 'absolute',
          top: '44%',
          left: '14%',
          width: 240,
          height: 240,
          opacity: 0.7,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 200,
            height: 200,
            borderRadius: 100,
            borderWidth: 2,
            borderColor: tint(palette, mint, 0.4),
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 1.5,
            borderColor: pink,
            opacity: 0.7,
          }}
        />
        <Connector x1={120} y1={8} x2={120} y2={232} color={mint} width={1.5} opacity={0.6} />
        <Connector x1={8} y1={120} x2={232} y2={120} color={pink} width={1.5} opacity={0.6} />
        <Connector x1={44} y1={44} x2={196} y2={196} color={mint} width={1} opacity={0.35} />
        <Connector x1={196} y1={44} x2={44} y2={196} color={pink} width={1} opacity={0.35} />
        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (index * Math.PI) / 4;
          return (
            <View
              key={`burst-dot-${index}`}
              style={{
                position: 'absolute',
                top: 118 + Math.sin(angle) * 108,
                left: 118 + Math.cos(angle) * 108,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: index % 2 === 0 ? mint : pink,
              }}
            />
          );
        })}
        <Sparkle size={26} color={mint} style={{ position: 'absolute', top: 107, left: 107 }} />
      </View>

      {([
        { top: '20%', left: '62%', size: 28, color: mint },
        { top: '30%', left: '12%', size: 18, color: pink },
        { top: '50%', left: '78%', size: 22, color: mint },
        { top: '60%', left: '38%', size: 14, color: pink },
        { top: '76%', left: '18%', size: 20, color: mint },
        { top: '88%', left: '68%', size: 16, color: pink },
      ] as Array<{ top: DimensionValue; left: DimensionValue; size: number; color: string }>).map(
        (sparkle, index) => (
          <Sparkle
            key={`sparkle-${index}`}
            size={sparkle.size}
            color={sparkle.color}
            style={{
              position: 'absolute',
              top: sparkle.top,
              left: sparkle.left,
              opacity: 0.8,
            }}
          />
        )
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Midnight Brass: moon, ringed planet, constellations, Art Deco fan    */
/* ------------------------------------------------------------------ */

function MidnightMotif({ palette }: MotifProps) {
  const brass = tint(palette, palette.accent, 0.75);
  const faint = tint(palette, palette.accent, 0.38);
  const planet = tint(palette, palette.primaryLight, 0.55);

  const sparkles: Array<{
    top: DimensionValue;
    left: DimensionValue;
    size: number;
    opacity: number;
  }> = [
    { top: '4%', left: '66%', size: 42, opacity: 0.95 },
    { top: '10%', left: '12%', size: 22, opacity: 0.8 },
    { top: '18%', left: '44%', size: 12, opacity: 0.6 },
    { top: '27%', left: '84%', size: 26, opacity: 0.75 },
    { top: '38%', left: '4%', size: 18, opacity: 0.65 },
    { top: '48%', left: '62%', size: 32, opacity: 0.85 },
    { top: '58%', left: '20%', size: 12, opacity: 0.55 },
    { top: '66%', left: '86%', size: 24, opacity: 0.75 },
    { top: '76%', left: '42%', size: 16, opacity: 0.65 },
    { top: '86%', left: '14%', size: 10, opacity: 0.5 },
    { top: '92%', left: '72%', size: 18, opacity: 0.6 },
    { top: '33%', left: '32%', size: 8, opacity: 0.5 },
    { top: '70%', left: '60%', size: 9, opacity: 0.55 },
    { top: '55%', left: '92%', size: 11, opacity: 0.5 },
  ];

  const fanRays = Array.from({ length: 9 }).map((_, index) => {
    const angle = 195 + index * 18;
    const rad = (angle * Math.PI) / 180;
    return {
      x: 150 + Math.cos(rad) * 230,
      y: 260 + Math.sin(rad) * 230,
    };
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Crescent brass moon. */}
      <View
        style={{
          position: 'absolute',
          top: '5%',
          right: '-2%',
          width: 156,
          height: 156,
          borderRadius: 78,
          backgroundColor: brass,
          opacity: 0.5,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '1%',
          right: '4%',
          width: 138,
          height: 138,
          borderRadius: 69,
          backgroundColor: palette.card,
        }}
      />

      {/* Ringed planet. */}
      <View
        style={{
          position: 'absolute',
          top: '35%',
          left: '-8%',
          width: 108,
          height: 108,
          borderRadius: 54,
          backgroundColor: planet,
          opacity: 0.65,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '38%',
          left: '-16%',
          width: 168,
          height: 38,
          borderRadius: 19,
          borderWidth: 2.5,
          borderColor: brass,
          opacity: 0.55,
          transform: [{ rotate: '-20deg' }],
        }}
      />

      {/* Shooting star across the upper left. */}
      <View
        style={{
          position: 'absolute',
          top: '6%',
          left: '2%',
          width: 200,
          height: 96,
        }}
      >
        <Connector x1={12} y1={78} x2={154} y2={16} color={brass} width={2} opacity={0.8} />
        <Connector x1={24} y1={88} x2={108} y2={48} color={faint} width={1} opacity={0.55} />
        <Connector x1={10} y1={92} x2={70} y2={62} color={faint} width={1} opacity={0.4} />
        <Sparkle size={18} color={brass} style={{ position: 'absolute', top: 5, left: 142, opacity: 0.95 }} />
      </View>

      {/* Faint brass orbit in the lower right. */}
      <View
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '-14%',
          width: 190,
          height: 190,
          borderRadius: 95,
          borderWidth: 1.5,
          borderColor: brass,
          opacity: 0.24,
        }}
      />
      {/* Constellation, anchored to the upper right. */}
      <View
        style={{
          position: 'absolute',
          top: '22%',
          right: '2%',
          width: 220,
          height: 220,
        }}
      >
        <Connector x1={40} y1={30} x2={100} y2={78} color={faint} width={1.2} opacity={0.8} />
        <Connector x1={100} y1={78} x2={168} y2={40} color={faint} width={1.2} opacity={0.8} />
        <Connector x1={100} y1={78} x2={128} y2={150} color={faint} width={1.2} opacity={0.8} />
        <Connector x1={100} y1={78} x2={42} y2={132} color={faint} width={1.2} opacity={0.8} />
        {[
          { x: 40, y: 30, size: 5 },
          { x: 100, y: 78, size: 7 },
          { x: 168, y: 40, size: 4 },
          { x: 128, y: 150, size: 4 },
          { x: 42, y: 132, size: 3.5 },
        ].map((star, index) => (
          <View
            key={`star-${index}`}
            style={{
              position: 'absolute',
              left: star.x - star.size / 2,
              top: star.y - star.size / 2,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: brass,
              opacity: 0.9,
            }}
          />
        ))}
      </View>

      {/* Art Deco fan rising from the lower left. */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 300,
          height: 280,
        }}
      >
        {fanRays.map((ray, index) => (
          <Connector
            key={`ray-${index}`}
            x1={150}
            y1={260}
            x2={ray.x}
            y2={ray.y}
            color={tint(palette, palette.accent, 0.3)}
            width={index % 2 === 0 ? 2 : 1}
            opacity={index % 2 === 0 ? 0.65 : 0.4}
          />
        ))}
        <View
          style={{
            position: 'absolute',
            left: 138,
            top: 248,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: brass,
            opacity: 0.55,
          }}
        />
      </View>

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

      {Array.from({ length: 22 }).map((_, index) => (
        <View
          key={`dust-${index}`}
          style={{
            position: 'absolute',
            top: `${6 + ((index * 37) % 88)}%`,
            left: `${(index * 53) % 92}%`,
            width: index % 4 === 0 ? 3 : 2,
            height: index % 4 === 0 ? 3 : 2,
            borderRadius: 2,
            backgroundColor: faint,
            opacity: 0.8,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Sea Glass: sand dollars, starfish, shards, bubbles                  */
/* ------------------------------------------------------------------ */

function SeaglassMotif({ palette }: MotifProps) {
  const teal = tint(palette, palette.primary, 0.42);
  const coral = tint(palette, palette.accent, 0.46);
  const amber = '#E4B46B';

  const sandDollars: Array<{
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    size: number;
    rotate: string;
    opacity: number;
  }> = [
    { top: '-4%', right: '-8%', size: 172, rotate: '14deg', opacity: 0.65 },
    { top: '16%', left: '-12%', size: 108, rotate: '-12deg', opacity: 0.55 },
    { top: '38%', right: '4%', size: 84, rotate: '24deg', opacity: 0.52 },
    { top: '52%', left: '18%', size: 64, rotate: '-6deg', opacity: 0.5 },
    { top: '68%', right: '-8%', size: 126, rotate: '-18deg', opacity: 0.6 },
    { bottom: '-4%', left: '-10%', size: 148, rotate: '10deg', opacity: 0.6 },
    { top: '84%', left: '54%', size: 56, rotate: '-24deg', opacity: 0.48 },
  ];

  const starfish: Array<{
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    size: number;
    rotate: string;
    opacity: number;
  }> = [
    { top: '10%', left: '6%', size: 96, rotate: '-18deg', opacity: 0.65 },
    { top: '32%', right: '-10%', size: 118, rotate: '22deg', opacity: 0.6 },
    { top: '62%', right: '18%', size: 72, rotate: '-8deg', opacity: 0.52 },
    { bottom: '3%', right: '-8%', size: 104, rotate: '16deg', opacity: 0.65 },
  ];

  const shards: Array<{
    top: DimensionValue;
    left: DimensionValue;
    width: number;
    height: number;
    rotate: string;
    color: string;
  }> = [
    { top: '26%', left: '46%', width: 58, height: 32, rotate: '22deg', color: teal },
    { top: '34%', left: '12%', width: 46, height: 26, rotate: '-30deg', color: coral },
    { top: '46%', left: '70%', width: 54, height: 30, rotate: '12deg', color: amber },
    { top: '58%', left: '34%', width: 38, height: 22, rotate: '-18deg', color: teal },
    { top: '70%', left: '8%', width: 50, height: 28, rotate: '32deg', color: coral },
    { top: '78%', left: '64%', width: 42, height: 24, rotate: '-24deg', color: teal },
    { top: '91%', left: '28%', width: 34, height: 20, rotate: '14deg', color: amber },
    { top: '20%', left: '78%', width: 30, height: 18, rotate: '-12deg', color: coral },
  ];

  const bubbles: Array<{ top: DimensionValue; left: DimensionValue; size: number; color: string }> = [
    { top: '8%', left: '44%', size: 22, color: teal },
    { top: '14%', left: '82%', size: 13, color: coral },
    { top: '24%', left: '30%', size: 9, color: teal },
    { top: '36%', left: '56%', size: 28, color: coral },
    { top: '44%', left: '6%', size: 16, color: teal },
    { top: '53%', left: '88%', size: 12, color: coral },
    { top: '61%', left: '50%', size: 20, color: teal },
    { top: '72%', left: '26%', size: 10, color: coral },
    { top: '81%', left: '76%', size: 24, color: teal },
    { top: '90%', left: '46%', size: 14, color: coral },
    { top: '48%', left: '28%', size: 6, color: teal },
    { top: '66%', left: '90%', size: 8, color: coral },
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
            borderRadius: shard.height * 0.45,
            borderWidth: 1,
            borderColor: shard.color,
            backgroundColor: tint(palette, shard.color, 0.22),
            opacity: 0.7,
            transform: [{ rotate: shard.rotate }],
          }}
        />
      ))}
      {sandDollars.map((dollar, index) => (
        <Image
          key={`sand-dollar-${index}`}
          source={require('../assets/theme-sand-dollar.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: dollar.top,
            bottom: dollar.bottom,
            left: dollar.left,
            right: dollar.right,
            width: dollar.size,
            height: dollar.size,
            opacity: dollar.opacity,
            transform: [{ rotate: dollar.rotate }],
          }}
        />
      ))}
      {starfish.map((star, index) => (
        <Image
          key={`starfish-${index}`}
          source={require('../assets/theme-starfish.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: star.top,
            bottom: star.bottom,
            left: star.left,
            right: star.right,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            transform: [{ rotate: star.rotate }],
          }}
        />
      ))}
      {bubbles.map((bubble, index) => (
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
            borderColor: bubble.color,
            opacity: 0.5,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: '20%',
              left: '22%',
              width: bubble.size * 0.2,
              height: bubble.size * 0.2,
              borderRadius: bubble.size,
              backgroundColor: '#FFFFFF',
              opacity: 0.65,
            }}
          />
        </View>
      ))}
      {Array.from({ length: 14 }).map((_, index) => (
        <View
          key={`speck-${index}`}
          style={{
            position: 'absolute',
            top: `${8 + ((index * 41) % 88)}%`,
            left: `${(index * 57) % 94}%`,
            width: index % 3 === 0 ? 4 : 3,
            height: index % 3 === 0 ? 4 : 3,
            borderRadius: 2,
            backgroundColor: index % 2 === 0 ? coral : teal,
            opacity: 0.6,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Butter & Cocoa: cookies, sprinkles, cocoa rings                     */
/* ------------------------------------------------------------------ */

function CookiesMotif({ palette }: MotifProps) {
  const cocoa = palette.primary;
  const raspberry = palette.accent;
  const mint = '#7FB069';

  const cookies: Array<{
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    size: number;
    rotate: string;
    opacity: number;
  }> = [
    { top: '-4%', right: '-10%', size: 168, rotate: '10deg', opacity: 0.55 },
    { top: '14%', left: '-12%', size: 110, rotate: '-14deg', opacity: 0.45 },
    { top: '34%', left: '56%', size: 88, rotate: '24deg', opacity: 0.42 },
    { top: '50%', right: '-14%', size: 136, rotate: '-8deg', opacity: 0.5 },
    { top: '66%', left: '-10%', size: 96, rotate: '18deg', opacity: 0.42 },
    { top: '78%', right: '18%', size: 76, rotate: '-22deg', opacity: 0.4 },
    { bottom: '-6%', left: '34%', size: 122, rotate: '12deg', opacity: 0.48 },
  ];

  const sprinkleColors = [raspberry, mint, cocoa, palette.accentLight];
  const sprinkles: Array<{
    top: DimensionValue;
    left: DimensionValue;
    rotate: string;
    color: string;
  }> = Array.from({ length: 28 }).map((_, index) => ({
    top: `${5 + ((index * 29) % 90)}%`,
    left: `${(index * 43) % 94}%`,
    rotate: `${(index * 31) % 120 - 60}deg`,
    color: sprinkleColors[index % sprinkleColors.length],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: '20%',
          left: '-12%',
          width: 180,
          height: 180,
          borderRadius: 90,
          borderWidth: 22,
          borderColor: tint(palette, cocoa, 0.25),
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '22%',
          right: '-10%',
          width: 150,
          height: 150,
          borderRadius: 75,
          borderWidth: 18,
          borderColor: tint(palette, raspberry, 0.25),
          opacity: 0.45,
        }}
      />
      {cookies.map((cookie, index) => (
        <Image
          key={`cookie-${index}`}
          source={require('../assets/theme-cookie.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: cookie.top,
            bottom: cookie.bottom,
            left: cookie.left,
            right: cookie.right,
            width: cookie.size,
            height: cookie.size,
            opacity: cookie.opacity,
            transform: [{ rotate: cookie.rotate }],
          }}
        />
      ))}
      {sprinkles.map((sprinkle, index) => (
        <View
          key={`sprinkle-${index}`}
          style={{
            position: 'absolute',
            top: sprinkle.top,
            left: sprinkle.left,
            width: 4,
            height: 12,
            borderRadius: 2,
            backgroundColor: sprinkle.color,
            opacity: 0.7,
            transform: [{ rotate: sprinkle.rotate }],
          }}
        />
      ))}
      {Array.from({ length: 9 }).map((_, index) => (
        <View
          key={`crumb-${index}`}
          style={{
            position: 'absolute',
            top: `${12 + ((index * 47) % 80)}%`,
            left: `${(index * 61) % 90}%`,
            width: index % 2 === 0 ? 5 : 4,
            height: index % 2 === 0 ? 5 : 4,
            borderRadius: 3,
            backgroundColor: index % 2 === 0 ? cocoa : raspberry,
            opacity: 0.55,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Newsprint: full newspaper columns, stamps, coffee rings             */
/* ------------------------------------------------------------------ */

function NewsprintMotif({ palette }: MotifProps) {
  const ink = tint(palette, palette.primary, 0.55);
  const faint = tint(palette, palette.primary, 0.32);
  const stamp = tint(palette, palette.accent, 0.5);
  const coffee = '#8A5A32';
  const columns: Array<{ left: DimensionValue; width: DimensionValue }> = [
    { left: '4%', width: '27%' },
    { left: '36%', width: '27%' },
    { left: '68%', width: '27%' },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Masthead. */}
      <View style={{ position: 'absolute', top: '5%', left: '4%', right: '4%', height: 72 }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '72%',
            height: 15,
            backgroundColor: ink,
            opacity: 0.65,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 22,
            left: 0,
            width: '48%',
            height: 8,
            backgroundColor: faint,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 38,
            left: 0,
            width: '88%',
            height: 2,
            backgroundColor: faint,
            opacity: 0.75,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 46,
            left: 0,
            width: '76%',
            height: 2,
            backgroundColor: faint,
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 96,
            height: 64,
            borderWidth: 1.5,
            borderColor: faint,
            opacity: 0.55,
          }}
        >
          {Array.from({ length: 5 }).map((_, row) => (
            <View key={`photo-row-${row}`} style={{ flexDirection: 'row' }}>
              {Array.from({ length: 7 }).map((_, col) => (
                <View
                  key={`photo-${row}-${col}`}
                  style={{
                    width: 12,
                    height: 11,
                    margin: 0.5,
                    borderRadius: 6,
                    backgroundColor:
                      (row + col) % 3 === 0 ? ink : tint(palette, palette.primary, 0.14),
                    opacity: 0.55,
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Columns of type. */}
      {columns.map((column, columnIndex) => (
        <View
          key={`column-${columnIndex}`}
          style={{
            position: 'absolute',
            top: '20%',
            bottom: '6%',
            left: column.left,
            width: column.width,
          }}
        >
          <View
            style={{
              width: '58%',
              height: 6,
              backgroundColor: ink,
              opacity: 0.55,
              marginBottom: 9,
            }}
          />
          {Array.from({ length: 54 }).map((_, row) => (
            <View
              key={`line-${row}`}
              style={{
                width: `${88 - ((row + columnIndex) % 5) * 11}%`,
                height: 2,
                backgroundColor: row % 7 === 0 ? ink : faint,
                opacity: row % 7 === 0 ? 0.72 : 0.62,
                marginBottom: 8,
              }}
            />
          ))}
        </View>
      ))}

      {[0, 1].map((index) => (
        <View
          key={`rule-${index}`}
          style={{
            position: 'absolute',
            top: '20%',
            bottom: '6%',
            left: index === 0 ? '33%' : '65%',
            width: 1,
            backgroundColor: faint,
            opacity: 0.55,
          }}
        />
      ))}

      {/* Red rubber stamp. */}
      <View
        style={{
          position: 'absolute',
          top: '38%',
          right: '-10%',
          width: 132,
          height: 132,
          borderRadius: 66,
          borderWidth: 7,
          borderColor: stamp,
          opacity: 0.5,
          transform: [{ rotate: '-14deg' }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 46,
            left: 20,
            width: 78,
            height: 6,
            backgroundColor: stamp,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 60,
            left: 32,
            width: 54,
            height: 5,
            backgroundColor: stamp,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 74,
            left: 24,
            width: 70,
            height: 5,
            backgroundColor: stamp,
          }}
        />
      </View>

      {/* Coffee rings. */}
      <View
        style={{
          position: 'absolute',
          top: '58%',
          left: '-8%',
          width: 214,
          height: 214,
          borderRadius: 107,
          borderWidth: 16,
          borderColor: coffee,
          opacity: 0.5,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '60%',
          left: '-4%',
          width: 194,
          height: 194,
          borderRadius: 97,
          borderWidth: 4,
          borderColor: coffee,
          opacity: 0.4,
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Citrus Grove: orange, lemon, lime wheels and leafy sprigs           */
/* ------------------------------------------------------------------ */

function CitrusMotif({ palette }: MotifProps) {
  const wheels: Array<{
    source: number;
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    size: number;
    rotate: string;
    opacity: number;
  }> = [
    {
      source: require('../assets/theme-citrus-orange.png'),
      top: '-5%',
      left: '-14%',
      size: 200,
      rotate: '-12deg',
      opacity: 0.52,
    },
    {
      source: require('../assets/theme-citrus-lemon.png'),
      top: '8%',
      right: '-14%',
      size: 136,
      rotate: '18deg',
      opacity: 0.5,
    },
    {
      source: require('../assets/theme-citrus-lime.png'),
      top: '26%',
      left: '4%',
      size: 92,
      rotate: '-6deg',
      opacity: 0.42,
    },
    {
      source: require('../assets/theme-citrus-orange.png'),
      top: '40%',
      right: '-18%',
      size: 150,
      rotate: '24deg',
      opacity: 0.48,
    },
    {
      source: require('../assets/theme-citrus-lemon.png'),
      top: '56%',
      left: '-16%',
      size: 118,
      rotate: '-20deg',
      opacity: 0.44,
    },
    {
      source: require('../assets/theme-citrus-lime.png'),
      top: '70%',
      right: '8%',
      size: 132,
      rotate: '10deg',
      opacity: 0.46,
    },
    {
      source: require('../assets/theme-citrus-orange.png'),
      bottom: '-6%',
      left: '26%',
      size: 112,
      rotate: '-14deg',
      opacity: 0.45,
    },
    {
      source: require('../assets/theme-citrus-lemon.png'),
      top: '88%',
      left: '64%',
      size: 76,
      rotate: '32deg',
      opacity: 0.4,
    },
  ];

  const leaves: Array<{
    top: DimensionValue;
    left: DimensionValue;
    size: number;
    rotate: string;
    opacity: number;
  }> = [
    { top: '18%', left: '58%', size: 176, rotate: '8deg', opacity: 0.62 },
    { top: '46%', left: '-6%', size: 154, rotate: '-18deg', opacity: 0.56 },
    { top: '68%', left: '42%', size: 192, rotate: '22deg', opacity: 0.52 },
    { top: '86%', left: '6%', size: 136, rotate: '-8deg', opacity: 0.5 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {leaves.map((leaf, index) => (
        <Image
          key={`leaf-${index}`}
          source={require('../assets/theme-citrus-leaf.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: leaf.top,
            left: leaf.left,
            width: leaf.size,
            height: leaf.size * 0.68,
            opacity: leaf.opacity,
            transform: [{ rotate: leaf.rotate }],
          }}
        />
      ))}
      {wheels.map((wheel, index) => (
        <Image
          key={`wheel-${index}`}
          source={wheel.source}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: wheel.top,
            bottom: wheel.bottom,
            left: wheel.left,
            right: wheel.right,
            width: wheel.size,
            height: wheel.size,
            opacity: wheel.opacity,
            transform: [{ rotate: wheel.rotate }],
          }}
        />
      ))}
      {Array.from({ length: 10 }).map((_, index) => (
        <View
          key={`drop-${index}`}
          style={{
            position: 'absolute',
            top: `${10 + ((index * 43) % 82)}%`,
            left: `${(index * 59) % 92}%`,
            width: index % 3 === 0 ? 8 : 5,
            height: index % 3 === 0 ? 12 : 8,
            borderRadius: 6,
            backgroundColor: tint(palette, palette.accent, 0.55),
            opacity: 0.55,
            transform: [{ rotate: '24deg' }],
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Lavender Haze: dense sprigs, haze, and drifting buds                */
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
  const stem = tint(palette, palette.primary, 0.3);
  const bud = tint(palette, palette.accent, 0.42);
  const budLight = tint(palette, palette.accent, 0.55);

  const buds: Array<{ top: number; side: -1 | 1; tilt: string; size: number }> = [
    { top: 0.06, side: -1, tilt: '28deg', size: 0.22 },
    { top: 0.15, side: 1, tilt: '-30deg', size: 0.24 },
    { top: 0.25, side: -1, tilt: '26deg', size: 0.2 },
    { top: 0.35, side: 1, tilt: '-24deg', size: 0.23 },
    { top: 0.45, side: -1, tilt: '30deg', size: 0.19 },
    { top: 0.55, side: 1, tilt: '-28deg', size: 0.21 },
    { top: 0.65, side: -1, tilt: '24deg', size: 0.18 },
  ];

  return (
    <View
      style={[
        style,
        {
          width: size * 0.66,
          height: size,
          transform: [{ rotate }],
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          left: size * 0.31,
          top: size * 0.04,
          width: Math.max(1, size * 0.025),
          height: size * 0.92,
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
            top: size * entry.top,
            left: entry.side === -1 ? size * 0.11 : size * 0.37,
            width: size * entry.size,
            height: size * entry.size * 0.66,
            borderRadius: size * entry.size * 0.33,
            backgroundColor: index % 2 === 0 ? bud : budLight,
            transform: [{ rotate: entry.tilt }],
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: size * 0.22,
          width: size * 0.22,
          height: size * 0.15,
          borderRadius: size * 0.11,
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
    { top: '0%', left: '62%', size: 132, rotate: '16deg', opacity: 0.8 },
    { top: '8%', left: '4%', size: 96, rotate: '-28deg', opacity: 0.7 },
    { top: '18%', left: '34%', size: 76, rotate: '32deg', opacity: 0.55 },
    { top: '27%', left: '78%', size: 112, rotate: '-18deg', opacity: 0.65 },
    { top: '37%', left: '-6%', size: 118, rotate: '24deg', opacity: 0.6 },
    { top: '47%', left: '56%', size: 86, rotate: '-34deg', opacity: 0.52 },
    { top: '56%', left: '12%', size: 104, rotate: '12deg', opacity: 0.55 },
    { top: '66%', left: '72%', size: 124, rotate: '-22deg', opacity: 0.62 },
    { top: '76%', left: '26%', size: 92, rotate: '28deg', opacity: 0.55 },
    { top: '84%', left: '-4%', size: 128, rotate: '-12deg', opacity: 0.62 },
    { top: '92%', left: '58%', size: 100, rotate: '18deg', opacity: 0.55 },
    { top: '40%', left: '88%', size: 64, rotate: '36deg', opacity: 0.45 },
  ];

  const buds: Array<{
    top: DimensionValue;
    left: DimensionValue;
    size: number;
    rotate: string;
  }> = Array.from({ length: 18 }).map((_, index) => ({
    top: `${4 + ((index * 37) % 92)}%`,
    left: `${(index * 53) % 94}%`,
    size: index % 3 === 0 ? 12 : 8,
    rotate: index % 2 === 0 ? '26deg' : '-34deg',
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: '-8%',
          right: '-14%',
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: tint(palette, palette.accent, 0.12),
          opacity: 0.9,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: '-18%',
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: tint(palette, palette.accent, 0.1),
          opacity: 0.9,
        }}
      />
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
            width: bud.size,
            height: bud.size * 0.64,
            borderRadius: bud.size,
            backgroundColor: tint(palette, palette.accent, 0.5),
            transform: [{ rotate: bud.rotate }],
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Sakura: a large branch and a dense fall of petals                   */
/* ------------------------------------------------------------------ */

const SAKURA_PETALS: Array<{
  top: DimensionValue;
  left: DimensionValue;
  size: number;
  rotate: string;
  opacity: number;
}> = [
  { top: '4%', left: '66%', size: 56, rotate: '26deg', opacity: 0.9 },
  { top: '7%', left: '84%', size: 34, rotate: '-18deg', opacity: 0.8 },
  { top: '10%', left: '12%', size: 42, rotate: '-42deg', opacity: 0.85 },
  { top: '14%', left: '44%', size: 24, rotate: '74deg', opacity: 0.65 },
  { top: '18%', left: '76%', size: 46, rotate: '48deg', opacity: 0.8 },
  { top: '22%', left: '4%', size: 30, rotate: '14deg', opacity: 0.7 },
  { top: '26%', left: '56%', size: 38, rotate: '-64deg', opacity: 0.75 },
  { top: '30%', left: '28%', size: 26, rotate: '118deg', opacity: 0.6 },
  { top: '34%', left: '86%', size: 40, rotate: '22deg', opacity: 0.75 },
  { top: '38%', left: '10%', size: 34, rotate: '-32deg', opacity: 0.7 },
  { top: '42%', left: '62%', size: 48, rotate: '96deg', opacity: 0.8 },
  { top: '46%', left: '38%', size: 22, rotate: '8deg', opacity: 0.55 },
  { top: '50%', left: '74%', size: 30, rotate: '-48deg', opacity: 0.65 },
  { top: '54%', left: '18%', size: 44, rotate: '62deg', opacity: 0.8 },
  { top: '58%', left: '50%', size: 28, rotate: '-16deg', opacity: 0.6 },
  { top: '62%', left: '88%', size: 36, rotate: '40deg', opacity: 0.7 },
  { top: '66%', left: '6%', size: 52, rotate: '-72deg', opacity: 0.85 },
  { top: '70%', left: '34%', size: 32, rotate: '18deg', opacity: 0.68 },
  { top: '74%', left: '66%', size: 42, rotate: '-38deg', opacity: 0.78 },
  { top: '78%', left: '18%', size: 24, rotate: '84deg', opacity: 0.55 },
  { top: '82%', left: '82%', size: 50, rotate: '12deg', opacity: 0.85 },
  { top: '86%', left: '44%', size: 28, rotate: '-58deg', opacity: 0.65 },
  { top: '90%', left: '8%', size: 36, rotate: '30deg', opacity: 0.75 },
  { top: '94%', left: '70%', size: 32, rotate: '-22deg', opacity: 0.7 },
  { top: '16%', left: '32%', size: 18, rotate: '128deg', opacity: 0.5 },
  { top: '32%', left: '70%', size: 20, rotate: '-8deg', opacity: 0.5 },
  { top: '48%', left: '6%', size: 26, rotate: '102deg', opacity: 0.55 },
  { top: '60%', left: '40%', size: 16, rotate: '40deg', opacity: 0.5 },
  { top: '72%', left: '92%', size: 22, rotate: '-66deg', opacity: 0.55 },
  { top: '88%', left: '24%', size: 18, rotate: '14deg', opacity: 0.5 },
  { top: '96%', left: '42%', size: 24, rotate: '-44deg', opacity: 0.6 },
  { top: '24%', left: '20%', size: 14, rotate: '76deg', opacity: 0.45 },
];

function SakuraMotif({ palette }: MotifProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../assets/theme-sakura-branch.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: -42,
          left: -120,
          width: 580,
          height: 298,
          opacity: 0.72,
          transform: [{ rotate: '-2deg' }],
        }}
      />
      <Image
        source={require('../assets/theme-sakura-branch.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          bottom: -54,
          right: -170,
          width: 430,
          height: 221,
          opacity: 0.36,
          transform: [{ rotate: '184deg' }],
        }}
      />
      {SAKURA_PETALS.map((petal, index) => (
        <Image
          key={`petal-${index}`}
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
      {Array.from({ length: 10 }).map((_, index) => (
        <View
          key={`pollen-${index}`}
          style={{
            position: 'absolute',
            top: `${8 + ((index * 43) % 86)}%`,
            left: `${(index * 61) % 92}%`,
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: tint(palette, palette.primary, 0.25),
            opacity: 0.65,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Ember: bonfire, logs, embers, smoke                                 */
/* ------------------------------------------------------------------ */

function EmberMotif({ palette }: MotifProps) {
  const core = tint(palette, palette.accent, 0.62);
  const halo = tint(palette, palette.accent, 0.32);
  const trail = tint(palette, palette.primary, 0.38);
  const wood = '#24120D';

  const embers: Array<{ top: DimensionValue; left: DimensionValue; size: number }> = [
    { top: '96%', left: '8%', size: 9 },
    { top: '92%', left: '18%', size: 6 },
    { top: '90%', left: '28%', size: 5 },
    { top: '94%', left: '38%', size: 8 },
    { top: '88%', left: '46%', size: 4 },
    { top: '95%', left: '54%', size: 10 },
    { top: '89%', left: '62%', size: 5 },
    { top: '93%', left: '70%', size: 7 },
    { top: '90%', left: '80%', size: 4 },
    { top: '96%', left: '88%', size: 8 },
    { top: '84%', left: '14%', size: 4 },
    { top: '82%', left: '34%', size: 3 },
    { top: '86%', left: '52%', size: 4 },
    { top: '83%', left: '68%', size: 3 },
    { top: '85%', left: '84%', size: 4 },
    { top: '76%', left: '22%', size: 3 },
    { top: '74%', left: '44%', size: 2.5 },
    { top: '78%', left: '58%', size: 3.5 },
    { top: '75%', left: '76%', size: 2.5 },
    { top: '68%', left: '10%', size: 3 },
    { top: '66%', left: '36%', size: 2.5 },
    { top: '70%', left: '64%', size: 3 },
    { top: '67%', left: '88%', size: 2.5 },
    { top: '58%', left: '20%', size: 2.5 },
    { top: '56%', left: '48%', size: 2 },
    { top: '60%', left: '72%', size: 2.5 },
    { top: '48%', left: '30%', size: 2 },
    { top: '46%', left: '58%', size: 2.5 },
    { top: '38%', left: '42%', size: 2 },
    { top: '30%', left: '66%', size: 1.8 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          bottom: -180,
          left: '-20%',
          width: 460,
          height: 460,
          borderRadius: 230,
          backgroundColor: tint(palette, palette.accent, 0.13),
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -130,
          right: '-24%',
          width: 380,
          height: 380,
          borderRadius: 190,
          backgroundColor: tint(palette, palette.primary, 0.2),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '26%',
          left: '-30%',
          width: 580,
          height: 580,
          borderRadius: 290,
          backgroundColor: tint(palette, palette.accent, 0.08),
        }}
      />

      {/* Logs. */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: '8%',
          width: 190,
          height: 24,
          borderRadius: 12,
          backgroundColor: wood,
          borderTopWidth: 3,
          borderTopColor: tint(palette, palette.primary, 0.5),
          transform: [{ rotate: '-9deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 10,
          right: '6%',
          width: 210,
          height: 24,
          borderRadius: 12,
          backgroundColor: wood,
          borderTopWidth: 3,
          borderTopColor: tint(palette, palette.accent, 0.5),
          transform: [{ rotate: '8deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 42,
          left: '28%',
          width: 150,
          height: 20,
          borderRadius: 10,
          backgroundColor: wood,
          borderTopWidth: 2,
          borderTopColor: tint(palette, palette.primary, 0.4),
          transform: [{ rotate: '16deg' }],
        }}
      />

      {/* Flames. */}
      {([
        { left: '6%', width: 160, height: 224, opacity: 0.72 },
        { left: '30%', width: 118, height: 166, opacity: 0.62 },
        { left: '50%', width: 142, height: 199, opacity: 0.68 },
        { left: '72%', width: 96, height: 134, opacity: 0.58 },
        { left: '18%', width: 76, height: 106, opacity: 0.55 },
        { left: '60%', width: 66, height: 92, opacity: 0.5 },
      ] as Array<{ left: DimensionValue; width: number; height: number; opacity: number }>).map((flame, index) => (
        <Image
          key={`flame-${index}`}
          source={require('../assets/theme-flame.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            bottom: 34,
            left: flame.left,
            width: flame.width,
            height: flame.height,
            opacity: flame.opacity,
          }}
        />
      ))}

      <View
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '14%',
          width: 240,
          height: 240,
          borderRadius: 120,
          borderWidth: 2,
          borderColor: halo,
          opacity: 0.25,
        }}
      />

      {/* Smoke trails. */}
      {([
        { bottom: '18%', left: '24%', height: 90 },
        { bottom: '24%', left: '54%', height: 120 },
        { bottom: '16%', left: '78%', height: 76 },
      ] as Array<{ bottom: DimensionValue; left: DimensionValue; height: number }>).map((smoke, index) => (
        <View
          key={`smoke-${index}`}
          style={{
            position: 'absolute',
            bottom: smoke.bottom,
            left: smoke.left,
            width: 2,
            height: smoke.height,
            borderRadius: 2,
            backgroundColor: trail,
            opacity: 0.28,
            transform: [{ rotate: index % 2 === 0 ? '9deg' : '-11deg' }],
          }}
        />
      ))}

      {Array.from({ length: 9 }).map((_, index) => {
        const size = [10, 7, 12, 6, 9, 5, 8, 6, 11][index];
        const top = 16 + index * 8;
        const left = 10 + ((index * 29) % 78);
        return (
          <View
            key={`big-spark-${index}`}
            style={{ position: 'absolute', top: `${top}%`, left: `${left}%` }}
          >
            <View
              style={{
                position: 'absolute',
                top: -(size + 16) / 2 + size / 2,
                left: -(size + 16) / 2 + size / 2,
                width: size + 16,
                height: size + 16,
                borderRadius: (size + 16) / 2,
                borderWidth: 1,
                borderColor: core,
                opacity: 0.45,
              }}
            />
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: core,
                opacity: 0.95,
              }}
            />
          </View>
        );
      })}

      {embers.map((ember, index) => (
        <View key={`ember-${index}`} style={{ position: 'absolute', top: ember.top, left: ember.left }}>
          <View
            style={{
              position: 'absolute',
              top: -(ember.size + 10) / 2 + ember.size / 2,
              left: -(ember.size + 10) / 2 + ember.size / 2,
              width: ember.size + 10,
              height: ember.size + 10,
              borderRadius: (ember.size + 10) / 2,
              borderWidth: 1,
              borderColor: halo,
              opacity: 0.5,
            }}
          />
          <View
            style={{
              width: ember.size,
              height: ember.size,
              borderRadius: ember.size / 2,
              backgroundColor: core,
              opacity: 0.9,
            }}
          />
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Blueprint: full grid, compass, dimension arrows, title block        */
/* ------------------------------------------------------------------ */

function GridMotif({ palette }: MotifProps) {
  const line = tint(palette, palette.accent, 0.32);
  const note = tint(palette, palette.accent, 0.55);
  const spacing = 32;

  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 22 }).map((_, index) => (
        <View
          key={`v-${index}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: index * spacing,
            width: 1,
            backgroundColor: line,
            opacity: 0.42,
          }}
        />
      ))}
      {Array.from({ length: 30 }).map((_, index) => (
        <View
          key={`h-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: index * spacing,
            height: 1,
            backgroundColor: line,
            opacity: 0.42,
          }}
        />
      ))}
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={`vmajor-${index}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: index * spacing * 4,
            width: 1.5,
            backgroundColor: line,
            opacity: 0.62,
          }}
        />
      ))}
      {Array.from({ length: 8 }).map((_, index) => (
        <View
          key={`hmajor-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: index * spacing * 4,
            height: 1.5,
            backgroundColor: line,
            opacity: 0.62,
          }}
        />
      ))}

      <Connector x1={0} y1={0} x2={390} y2={844} color={note} width={1} opacity={0.12} />
      <Connector x1={390} y1={0} x2={0} y2={844} color={note} width={1} opacity={0.1} />

      {/* Compass rose. */}
      <View
        style={{
          position: 'absolute',
          top: '8%',
          right: '4%',
          width: 150,
          height: 150,
          opacity: 0.6,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 2,
            borderColor: note,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 19,
            left: 19,
            width: 112,
            height: 112,
            borderRadius: 56,
            borderWidth: 1,
            borderColor: note,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 74,
            left: 0,
            width: 150,
            height: 1,
            backgroundColor: note,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 74,
            width: 1,
            height: 150,
            backgroundColor: note,
          }}
        />
        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (index * Math.PI) / 4;
          return (
            <View
              key={`tick-${index}`}
              style={{
                position: 'absolute',
                top: 75 + Math.sin(angle) * 68 - 2,
                left: 75 + Math.cos(angle) * 68 - 2,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: note,
              }}
            />
          );
        })}
        <View
          style={{
            position: 'absolute',
            top: 64,
            left: 64,
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: note,
          }}
        />
      </View>

      {/* Horizontal dimension line with end ticks. */}
      <View style={{ position: 'absolute', top: '38%', left: '6%', width: 240, height: 20 }}>
        <View
          style={{
            position: 'absolute',
            top: 9,
            left: 0,
            width: 240,
            height: 1,
            backgroundColor: note,
            opacity: 0.55,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 3,
            left: 0,
            width: 1,
            height: 13,
            backgroundColor: note,
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 3,
            left: 239,
            width: 1,
            height: 13,
            backgroundColor: note,
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 7,
            left: 6,
            width: 5,
            height: 5,
            backgroundColor: note,
            opacity: 0.6,
            transform: [{ rotate: '45deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 7,
            left: 230,
            width: 5,
            height: 5,
            backgroundColor: note,
            opacity: 0.6,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>

      {/* Vertical dimension line. */}
      <View style={{ position: 'absolute', top: '48%', left: '8%', width: 20, height: 210 }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 9,
            width: 1,
            height: 210,
            backgroundColor: note,
            opacity: 0.55,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 3,
            width: 13,
            height: 1,
            backgroundColor: note,
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 209,
            left: 3,
            width: 13,
            height: 1,
            backgroundColor: note,
            opacity: 0.7,
          }}
        />
      </View>

      {/* Dashed section box. */}
      <View
        style={{
          position: 'absolute',
          bottom: '13%',
          left: '7%',
          width: '64%',
          height: 128,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: note,
          opacity: 0.5,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '13%',
          left: '7%',
          width: '64%',
          height: 1,
          backgroundColor: note,
          opacity: 0.35,
        }}
      />

      {/* Title block. */}
      <View
        style={{
          position: 'absolute',
          right: '4%',
          bottom: '5%',
          width: 118,
          height: 62,
          borderWidth: 1.5,
          borderColor: note,
          opacity: 0.55,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: note,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: note,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 20,
            bottom: 0,
            left: 40,
            width: 1,
            backgroundColor: note,
          }}
        />
      </View>

      {/* Registration marks. */}
      {[
        { top: 10, left: 10, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
        { top: 10, right: 10, borderTopWidth: 1.5, borderRightWidth: 1.5 },
        { bottom: 10, left: 10, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
        { bottom: 10, right: 10, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
      ].map((mark, index) => (
        <View
          key={`mark-${index}`}
          style={{
            position: 'absolute',
            width: 18,
            height: 18,
            borderColor: note,
            opacity: 0.7,
            ...mark,
          }}
        />
      ))}

      {/* Reticle and callouts. */}
      <View
        style={{
          position: 'absolute',
          top: '58%',
          right: '10%',
          width: 170,
          height: 170,
          borderRadius: 85,
          borderWidth: 1.5,
          borderColor: note,
          opacity: 0.35,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '62%',
          right: '16%',
          width: 110,
          height: 110,
          borderRadius: 55,
          borderWidth: 1,
          borderColor: note,
          opacity: 0.3,
        }}
      />
      {Array.from({ length: 5 }).map((_, index) => (
        <View
          key={`callout-${index}`}
          style={{
            position: 'absolute',
            top: `${30 + index * 9}%`,
            left: '10%',
            width: 38,
            height: 1,
            backgroundColor: note,
            opacity: 0.4,
            transform: [{ rotate: '-24deg' }],
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* South Park: construction-paper peaks, sky, sun, and confetti        */
/* ------------------------------------------------------------------ */

function PageMountain({
  size,
  color,
  capSize,
  style,
}: {
  size: number;
  color: string;
  capSize: number;
  style: ViewStyle;
}) {
  return (
    <View style={[style, { width: size, height: size }]}>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 0,
          height: 0,
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderBottomWidth: size,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size - capSize * 0.85,
          left: size / 2 - capSize / 2,
          width: 0,
          height: 0,
          borderLeftWidth: capSize / 2,
          borderRightWidth: capSize / 2,
          borderBottomWidth: capSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#FFFFFF',
        }}
      />
    </View>
  );
}

function MountainsMotif({ palette }: MotifProps) {
  const confetti = ['#2563EB', '#16A34A', '#DC2626', '#F97316', '#FACC15', '#9333EA'];

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Full South Park scene. */}
      <Image
        source={require('../assets/theme-sp-scene.png')}
        resizeMode="cover"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '55%',
          opacity: 0.95,
        }}
      />
      {/* Second scene layer for depth at top. */}
      <Image
        source={require('../assets/theme-sp-scene.png')}
        resizeMode="cover"
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          right: '-5%',
          height: '45%',
          opacity: 0.35,
          transform: [{ scale: 0.7 }],
        }}
      />
      {/* Construction paper fiber texture. */}
      {Array.from({ length: 20 }).map((_, index) => (
        <View
          key={`fiber-${index}`}
          style={{
            position: 'absolute',
            top: `${(index * 47) % 100}%`,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: tint(palette, palette.primary, 0.08),
            opacity: 0.35,
          }}
        />
      ))}
      {/* Confetti (character colors). */}
      {Array.from({ length: 36 }).map((_, index) => (
        <View
          key={`confetti-${index}`}
          style={{
            position: 'absolute',
            top: `${2 + ((index * 27) % 92)}%`,
            left: `${(index * 41) % 96}%`,
            width: index % 3 === 0 ? 12 : 7,
            height: index % 3 === 0 ? 12 : 7,
            borderRadius: index % 2 === 0 ? 0 : 4,
            backgroundColor: confetti[index % confetti.length],
            opacity: 0.8,
            transform: [{ rotate: `${(index * 41) % 90}deg` }],
          }}
        />
      ))}
      {/* Snowflakes. */}
      {Array.from({ length: 20 }).map((_, index) => (
        <View
          key={`snow-${index}`}
          style={{
            position: 'absolute',
            top: `${4 + ((index * 43) % 90)}%`,
            left: `${(index * 61) % 96}%`,
            width: index % 2 === 0 ? 4 : 3,
            height: index % 2 === 0 ? 4 : 3,
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
            opacity: 0.85,
          }}
        />
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
  olive: OliveMotif,
  riso: RisoMotif,
  stripes: DinerMotif,
  stars: MidnightMotif,
  bubbles: SeaglassMotif,
  cookies: CookiesMotif,
  rules: NewsprintMotif,
  slices: CitrusMotif,
  sprigs: LavenderMotif,
  petals: SakuraMotif,
  embers: EmberMotif,
  grid: GridMotif,
  mountains: MountainsMotif,
};
