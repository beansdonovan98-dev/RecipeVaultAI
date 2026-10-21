import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useAssistant } from '@/contexts/AssistantContext';

// Soft "pixel confetti" shown when no photo has been chosen.
const BACKDROP_BLOCKS = [
  { left: 6, top: 8, size: 34, round: false, rotate: 12 },
  { left: 74, top: 4, size: 22, round: true, rotate: 0 },
  { left: 52, top: 22, size: 14, round: true, rotate: 0 },
  { left: 12, top: 34, size: 26, round: false, rotate: -18 },
  { left: 82, top: 40, size: 18, round: false, rotate: 24 },
  { left: 28, top: 58, size: 12, round: true, rotate: 0 },
  { left: 66, top: 66, size: 30, round: false, rotate: -8 },
  { left: 8, top: 80, size: 20, round: true, rotate: 0 },
  { left: 44, top: 88, size: 16, round: false, rotate: 30 },
];

interface AssistantBackdropProps {
  /** How much of the theme background sits over the photo, for readability. */
  scrim?: number;
}

/**
 * The shared background for every AI tool: the assistant photo chosen in
 * Customize, or the built-in pixel backdrop when no photo is set.
 */
export function AssistantBackdrop({ scrim = 0.62 }: AssistantBackdropProps) {
  const { theme } = useAppearance();
  const { backgroundUri } = useAssistant();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {backgroundUri ? (
        <>
          <Image source={{ uri: backgroundUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: theme.background, opacity: scrim }]}
          />
        </>
      ) : (
        BACKDROP_BLOCKS.map((block, index) => (
          <View
            key={`backdrop-${index}`}
            style={{
              position: 'absolute',
              left: `${block.left}%`,
              top: `${block.top}%`,
              width: block.size,
              height: block.size,
              borderRadius: block.round ? block.size / 2 : 4,
              backgroundColor: index % 2 === 0 ? theme.primary : theme.accent,
              opacity: 0.16,
              transform: [{ rotate: `${block.rotate}deg` }],
            }}
          />
        ))
      )}
    </View>
  );
}
