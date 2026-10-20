export type FontKey = 'system' | 'serif' | 'rounded' | 'mono' | 'elegant';

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
