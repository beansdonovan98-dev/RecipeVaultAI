import React from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
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

function renderInline(segments: InlineSegment[], keyPrefix: string): React.ReactNode {
  return segments.map((segment, index) => {
    const key = `${keyPrefix}-${index}`;
    if (segment.type === 'bold') {
      return (
        <AppText key={key} style={styles.bold}>
          {renderInline(parseInline(segment.content), key)}
        </AppText>
      );
    }
    if (segment.type === 'underline') {
      return (
        <AppText key={key} style={styles.underline}>
          {renderInline(parseInline(segment.content), key)}
        </AppText>
      );
    }
    return <AppText key={key}>{segment.content}</AppText>;
  });
}

interface RichTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

export function RichText({ text, style }: RichTextProps) {
  const { theme } = useAppearance();
  const lines = text.split(/\r?\n/);

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
            <AppText style={[style, isBullet ? styles.bulletText : null]}>
              {renderInline(segments, String(lineIndex))}
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
  bold: {
    fontWeight: '700',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});
