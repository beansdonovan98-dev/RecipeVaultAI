export type ThemeKey = 'warm' | 'bistro' | 'paper' | 'coastal' | 'date-night';

export interface ThemePalette {
  background: string;
  card: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  accentLight: string;
  tipBackground: string;
  tipBorder: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  white: string;
  error: string;
  success: string;
  warning: string;
  heart: string;
  heartEmpty: string;
  inputBackground: string;
  shadow: string;
  overlay: string;
}

export interface ThemeOption {
  id: ThemeKey;
  label: string;
  description: string;
  colors: ThemePalette;
}

export const DEFAULT_THEME_KEY: ThemeKey = 'warm';

const WARM: ThemePalette = {
  background: '#F1D7A3',
  card: '#FFFDF7',
  primary: '#16325C',
  primaryLight: '#254A80',
  secondary: '#5A4A38',
  accent: '#C25A1E',
  accentLight: '#D97A3C',
  tipBackground: '#F6E7C8',
  tipBorder: '#16325C',
  border: '#16325C',
  borderLight: '#E3C99A',
  text: '#16325C',
  textSecondary: '#5A4A38',
  textMuted: '#8A755C',
  white: '#FFFFFF',
  error: '#E53E3E',
  success: '#38A169',
  warning: '#D69E2E',
  heart: '#E53E3E',
  heartEmpty: '#D4BC8E',
  inputBackground: '#FFFDF7',
  shadow: 'rgba(90, 70, 40, 0.16)',
  overlay: 'rgba(27, 42, 74, 0.5)',
};

const BISTRO: ThemePalette = {
  background: '#D6DFBE',
  card: '#FBFCF6',
  primary: '#1E4D3B',
  primaryLight: '#2E6A52',
  secondary: '#4E5E56',
  accent: '#C97A20',
  accentLight: '#DE9A45',
  tipBackground: '#E7EBD6',
  tipBorder: '#1E4D3B',
  border: '#1E4D3B',
  borderLight: '#BFCB9E',
  text: '#1A3A2C',
  textSecondary: '#4E5E56',
  textMuted: '#7C877F',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#2F7D5B',
  warning: '#C48A26',
  heart: '#C0392B',
  heartEmpty: '#AFBC94',
  inputBackground: '#FBFCF6',
  shadow: 'rgba(30, 77, 59, 0.16)',
  overlay: 'rgba(24, 42, 35, 0.55)',
};

const PAPER: ThemePalette = {
  background: '#E6E1D6',
  card: '#FFFFFF',
  primary: '#111827',
  primaryLight: '#2A3444',
  secondary: '#555F6D',
  accent: '#A67C00',
  accentLight: '#C09300',
  tipBackground: '#EDE8DB',
  tipBorder: '#111827',
  border: '#111827',
  borderLight: '#CFC7B4',
  text: '#111827',
  textSecondary: '#555F6D',
  textMuted: '#87909B',
  white: '#FFFFFF',
  error: '#C53030',
  success: '#2F855A',
  warning: '#B7791F',
  heart: '#C53030',
  heartEmpty: '#B9B2A0',
  inputBackground: '#FFFFFF',
  shadow: 'rgba(17, 24, 39, 0.14)',
  overlay: 'rgba(31, 41, 55, 0.5)',
};

const COASTAL: ThemePalette = {
  background: '#C7E2DC',
  card: '#F3FAF8',
  primary: '#0E5A5F',
  primaryLight: '#157A80',
  secondary: '#4A6664',
  accent: '#C2532A',
  accentLight: '#D97248',
  tipBackground: '#DCEFEB',
  tipBorder: '#0E5A5F',
  border: '#0E5A5F',
  borderLight: '#A6CCC5',
  text: '#0C4245',
  textSecondary: '#4A6664',
  textMuted: '#6E8A88',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#2F855A',
  warning: '#C58B2A',
  heart: '#C0392B',
  heartEmpty: '#9CC0BA',
  inputBackground: '#F3FAF8',
  shadow: 'rgba(14, 90, 95, 0.16)',
  overlay: 'rgba(22, 45, 45, 0.55)',
};

const DATE_NIGHT: ThemePalette = {
  background: '#170F15',
  card: '#2A1D27',
  primary: '#A83B60',
  primaryLight: '#C55B7E',
  secondary: '#CBB7C2',
  accent: '#E0A64B',
  accentLight: '#EEC27A',
  tipBackground: '#3A2633',
  tipBorder: '#C55B7E',
  border: '#5A3C4C',
  borderLight: '#472F3F',
  text: '#F8EDF2',
  textSecondary: '#D7C2CC',
  textMuted: '#A98D9B',
  white: '#FFFFFF',
  error: '#F87171',
  success: '#5FD39A',
  warning: '#F5C26B',
  heart: '#F87171',
  heartEmpty: '#6B5261',
  inputBackground: '#332531',
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'warm',
    label: 'Warm Kitchen',
    description: 'Golden amber with navy and burnt orange',
    colors: WARM,
  },
  {
    id: 'bistro',
    label: 'Modern Bistro',
    description: 'Sage green with forest and brass',
    colors: BISTRO,
  },
  {
    id: 'paper',
    label: 'Paper Minimal',
    description: 'Manila paper with ink black and gold',
    colors: PAPER,
  },
  {
    id: 'coastal',
    label: 'Coastal Table',
    description: 'Sea glass with deep teal and terracotta',
    colors: COASTAL,
  },
  {
    id: 'date-night',
    label: 'Date Night',
    description: 'Dark plum with burgundy and candlelight',
    colors: DATE_NIGHT,
  },
];

export function isThemeKey(value: unknown): value is ThemeKey {
  return THEME_OPTIONS.some((option) => option.id === value);
}

export function getThemePalette(key: ThemeKey): ThemePalette {
  return THEME_OPTIONS.find((option) => option.id === key)?.colors ?? WARM;
}
