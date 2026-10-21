import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { AppText } from '@/components/AppText';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';

const BULLET_PREFIX = /^(?:- |• |\* )/;
const INLINE_PATTERN = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/;

type InlineType = 'text' | 'bold' | 'underline';

interface InlineSegment {
  type: InlineType;
  content: string;
}

function parseInline(input: string): InlineSegment[] {
  const parts = input.split(INLINE_PATTERN);
  const segments: InlineSegment[] = [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (!part) continue;
    if (i % 2 === 1) {
      if (part.startsWith('**')) {
        segments.push({ type: 'bold', content: part.slice(2, -2) });
      } else if (part.startsWith('__')) {
        segments.push({ type: 'underline', content: part.slice(2, -2) });
      } else if (part.startsWith('*')) {
        segments.push({ type: 'bold', content: part.slice(1, -1) });
      } else {
        segments.push({ type: 'underline', content: part.slice(1, -1) });
      }
    } else {
      segments.push({ type: 'text', content: part });
    }
  }
  return segments;
}

interface SegmentStyles {
  base: TextStyle;
  bold: TextStyle;
  underline: TextStyle;
}

function renderInline(
  segments: InlineSegment[],
  keyPrefix: string,
  segmentStyles: SegmentStyles,
): React.ReactNode {
  return segments.map((segment, index) => {
    const key = `${keyPrefix}-${index}`;
    if (segment.type === 'bold') {
      return (
        <RNText key={key} style={segmentStyles.bold}>
          {renderInline(parseInline(segment.content), key, segmentStyles)}
        </RNText>
      );
    }
    if (segment.type === 'underline') {
      return (
        <RNText key={key} style={segmentStyles.underline}>
          {renderInline(parseInline(segment.content), key, segmentStyles)}
        </RNText>
      );
    }
    return (
      <RNText key={key} style={segmentStyles.base}>
        {segment.content}
      </RNText>
    );
  });
}

interface RichTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

export function RichText({ text, style }: RichTextProps) {
  const { theme, fontColor, fontFamily } = useAppearance();
  const lines = text.split(/\r?\n/);

  // Build the base text style without a font weight so the formatted children
  // (bold/underline) always own their own weight. Relying on weight
  // inheritance across nested Text runs is unreliable and was causing bold to
  // silently render as regular weight.
  const flattened = StyleSheet.flatten(style ?? {}) ?? {};
  const { fontWeight: callerWeight, ...rest } = flattened;
  const baseStyle: TextStyle = {
    ...rest,
    color: fontColor,
    ...(fontFamily ? { fontFamily } : null),
  };
  const segmentStyles: SegmentStyles = {
    base: { ...baseStyle, fontWeight: callerWeight ?? '400' },
    bold: { ...baseStyle, fontWeight: '700' },
    underline: { ...baseStyle, textDecorationLine: 'underline' },
  };

  return (
    <View>
      {lines.map((line, lineIndex) => {
        const isBullet = BULLET_PREFIX.test(line);
        const content = isBullet ? line.slice(2) : line;
        const segments = parseInline(content);
        return (
          <View key={lineIndex} style={styles.line}>
            {isBullet ? (
              <AppText style={[styles.bulletMarker, { color: theme.accent }]}>•</AppText>
            ) : null}
            <AppText style={[baseStyle, isBullet ? styles.bulletText : null]}>
              {renderInline(segments, String(lineIndex), segmentStyles)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletMarker: {
    ...Typography.body,
    color: Colors.accent,
    marginRight: Spacing.sm,
    minWidth: Spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
});
