export type FontKey =
  | 'system'
  | 'serif'
  | 'rounded'
  | 'mono'
  | 'elegant'
  | 'condensed'
  | 'geometric'
  | 'editorial'
  | 'slab'
  | 'handwritten';

export interface FontOption {
  id: FontKey;
  label: string;
  description: string;
  families: {
    ios?: string;
    android?: string;
    default?: string;
  };
}

export interface FontColorOption {
  id: string;
  label: string;
  value: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'system',
    label: 'System',
    description: 'Clean and familiar',
    families: {},
  },
  {
    id: 'serif',
    label: 'Classic',
    description: 'Warm Georgia serif',
    families: { ios: 'Georgia', android: 'serif', default: 'serif' },
  },
  {
    id: 'elegant',
    label: 'Elegant',
    description: 'Polished Palatino',
    families: { ios: 'Palatino', android: 'serif', default: 'serif' },
  },
  {
    id: 'rounded',
    label: 'Rounded',
    description: 'Soft and friendly',
    families: { ios: 'Arial Rounded MT Bold', android: 'sans-serif-medium' },
  },
  {
    id: 'mono',
    label: 'Typewriter',
    description: 'Cozy typewriter feel',
    families: { ios: 'Courier New', android: 'monospace', default: 'monospace' },
  },
  {
    id: 'condensed',
    label: 'Condensed',
    description: 'Tall poster headlines',
    families: {
      ios: 'HelveticaNeue-CondensedBold',
      android: 'sans-serif-condensed',
      default: 'sans-serif-condensed',
    },
  },
  {
    id: 'geometric',
    label: 'Geometric',
    description: 'Clean Futura shapes',
    families: { ios: 'Futura', android: 'sans-serif-medium', default: 'sans-serif' },
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'High-contrast Baskerville',
    families: { ios: 'Baskerville', android: 'serif', default: 'serif' },
  },
  {
    id: 'slab',
    label: 'Slab',
    description: 'Sturdy Rockwell serif',
    families: { ios: 'Rockwell', android: 'serif', default: 'serif' },
  },
  {
    id: 'handwritten',
    label: 'Handwritten',
    description: 'Casual kitchen notes',
    families: { ios: 'Bradley Hand', android: 'casual', default: 'cursive' },
  },
];

export const FONT_COLORS: FontColorOption[] = [
  { id: 'navy', label: 'Navy', value: '#1B2A4A' },
  { id: 'ink', label: 'Ink', value: '#111827' },
  { id: 'espresso', label: 'Espresso', value: '#5B3A29' },
  { id: 'burgundy', label: 'Burgundy', value: '#7A2E3A' },
  { id: 'forest', label: 'Forest', value: '#2F5D50' },
  { id: 'plum', label: 'Plum', value: '#5B3A66' },
  { id: 'slate', label: 'Slate', value: '#334155' },
];

export const DEFAULT_FONT_KEY: FontKey = 'system';
export const DEFAULT_FONT_COLOR = '#1B2A4A';

export function isFontKey(value: unknown): value is FontKey {
  return FONT_OPTIONS.some((option) => option.id === value);
}

export function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value.trim());
}

export function normalizeHexColor(value: string): string {
  return value.trim().toUpperCase();
}

function hexChannels(hex: string): [number, number, number] | null {
  if (!isHexColor(hex)) {
    return null;
  }
  const value = hex.trim().slice(1);
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function channelLuminance(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number | null {
  const channels = hexChannels(hex);
  if (!channels) {
    return null;
  }
  const [red, green, blue] = channels;
  return (
    0.2126 * channelLuminance(red) +
    0.7152 * channelLuminance(green) +
    0.0722 * channelLuminance(blue)
  );
}

/** WCAG-style contrast ratio between two hex colors. Unknown input counts as readable. */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  if (first === null || second === null) {
    return 21;
  }
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Keeps a hand-picked text color, but swaps in a readable one when it would
 * disappear into the background (for example a dark font color on a dark theme).
 */
export function readableTextColor(
  preferred: string,
  background: string,
  fallback: string
): string {
  if (contrastRatio(preferred, background) >= 2.2) {
    return preferred;
  }
  return contrastRatio(fallback, background) > contrastRatio(preferred, background)
    ? fallback
    : preferred;
}
