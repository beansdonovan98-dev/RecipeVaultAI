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
  background: '#F2C879',
  card: '#FFF4E0',
  primary: '#1E3A5F',
  primaryLight: '#2E5385',
  secondary: '#6B5844',
  accent: '#C2410C',
  accentLight: '#EA6A2B',
  tipBackground: '#F8E3B4',
  tipBorder: '#1E3A5F',
  border: '#1E3A5F',
  borderLight: '#E0BE85',
  text: '#1E3A5F',
  textSecondary: '#6B5844',
  textMuted: '#95815F',
  white: '#FFFFFF',
  error: '#DC2626',
  success: '#15803D',
  warning: '#D97706',
  heart: '#DC2626',
  heartEmpty: '#D6B578',
  inputBackground: '#FFF4E0',
  shadow: 'rgba(107, 88, 68, 0.18)',
  overlay: 'rgba(30, 58, 95, 0.5)',
};

const BISTRO: ThemePalette = {
  background: '#BCD49A',
  card: '#F4F9EA',
  primary: '#14532D',
  primaryLight: '#1E6B40',
  secondary: '#4B5D55',
  accent: '#B45309',
  accentLight: '#D97706',
  tipBackground: '#D6E4B6',
  tipBorder: '#14532D',
  border: '#14532D',
  borderLight: '#A6BE7E',
  text: '#16352A',
  textSecondary: '#4B5D55',
  textMuted: '#7E8C84',
  white: '#FFFFFF',
  error: '#B91C1C',
  success: '#15803D',
  warning: '#B45309',
  heart: '#B91C1C',
  heartEmpty: '#9FBA7A',
  inputBackground: '#F4F9EA',
  shadow: 'rgba(20, 83, 45, 0.16)',
  overlay: 'rgba(20, 83, 45, 0.55)',
};

const PAPER: ThemePalette = {
  background: '#E3DBC9',
  card: '#FFFFFF',
  primary: '#111827',
  primaryLight: '#1F2937',
  secondary: '#52525B',
  accent: '#A16207',
  accentLight: '#CA8A04',
  tipBackground: '#EDE6D6',
  tipBorder: '#111827',
  border: '#111827',
  borderLight: '#C9C0AB',
  text: '#111827',
  textSecondary: '#52525B',
  textMuted: '#7D838D',
  white: '#FFFFFF',
  error: '#B91C1C',
  success: '#047857',
  warning: '#A16207',
  heart: '#B91C1C',
  heartEmpty: '#B0A793',
  inputBackground: '#FFFFFF',
  shadow: 'rgba(17, 24, 39, 0.14)',
  overlay: 'rgba(17, 24, 39, 0.5)',
};

const COASTAL: ThemePalette = {
  background: '#A3D8D0',
  card: '#EFFAF7',
  primary: '#0F5257',
  primaryLight: '#15707A',
  secondary: '#4A6664',
  accent: '#C2410C',
  accentLight: '#EA580C',
  tipBackground: '#C8E8E3',
  tipBorder: '#0F5257',
  border: '#0F5257',
  borderLight: '#8CC6BE',
  text: '#0B3B40',
  textSecondary: '#4A6664',
  textMuted: '#6F8B89',
  white: '#FFFFFF',
  error: '#B91C1C',
  success: '#047857',
  warning: '#B45309',
  heart: '#B91C1C',
  heartEmpty: '#8FBBB3',
  inputBackground: '#EFFAF7',
  shadow: 'rgba(15, 82, 87, 0.16)',
  overlay: 'rgba(15, 82, 87, 0.55)',
};

const DATE_NIGHT: ThemePalette = {
  background: '#1B1119',
  card: '#2B1D28',
  primary: '#E11D74',
  primaryLight: '#F0489A',
  secondary: '#C9B4C2',
  accent: '#F0B429',
  accentLight: '#F8CE5C',
  tipBackground: '#3B2634',
  tipBorder: '#F0489A',
  border: '#5C3D4E',
  borderLight: '#48303F',
  text: '#F9EDF4',
  textSecondary: '#D9C4D2',
  textMuted: '#AA8E9C',
  white: '#FFFFFF',
  error: '#F87171',
  success: '#34D399',
  warning: '#F5C26B',
  heart: '#F87171',
  heartEmpty: '#6C5362',
  inputBackground: '#342632',
  shadow: 'rgba(0, 0, 0, 0.45)',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'warm',
    label: 'Warm Kitchen',
    description: 'Golden honey with deep navy and burnt orange',
    colors: WARM,
  },
  {
    id: 'bistro',
    label: 'Modern Bistro',
    description: 'Sage green with forest green and warm brass',
    colors: BISTRO,
  },
  {
    id: 'paper',
    label: 'Paper Minimal',
    description: 'Warm linen with ink black and antique gold',
    colors: PAPER,
  },
  {
    id: 'coastal',
    label: 'Coastal Table',
    description: 'Sea glass with deep teal and coral',
    colors: COASTAL,
  },
  {
    id: 'date-night',
    label: 'Date Night',
    description: 'Deep plum with rose and candlelight gold',
    colors: DATE_NIGHT,
  },
];

export function isThemeKey(value: unknown): value is ThemeKey {
  return THEME_OPTIONS.some((option) => option.id === value);
}

export function getThemePalette(key: ThemeKey): ThemePalette {
  return THEME_OPTIONS.find((option) => option.id === key)?.colors ?? WARM;
}
