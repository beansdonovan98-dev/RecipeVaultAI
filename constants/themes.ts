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
  background: '#FAF7F2',
  card: '#FFFFFF',
  primary: '#1B2A4A',
  primaryLight: '#2D4A7A',
  secondary: '#4A5568',
  accent: '#8B6F47',
  accentLight: '#A68B6B',
  tipBackground: '#E8EDF2',
  tipBorder: '#1B2A4A',
  border: '#1B2A4A',
  borderLight: '#E2E8F0',
  text: '#1B2A4A',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  white: '#FFFFFF',
  error: '#E53E3E',
  success: '#38A169',
  warning: '#D69E2E',
  heart: '#E53E3E',
  heartEmpty: '#CBD5E0',
  inputBackground: '#F7FAFC',
  shadow: 'rgba(27, 42, 74, 0.08)',
  overlay: 'rgba(27, 42, 74, 0.5)',
};

const BISTRO: ThemePalette = {
  background: '#F3F0E8',
  card: '#FFFDF8',
  primary: '#234137',
  primaryLight: '#356553',
  secondary: '#4E5E56',
  accent: '#B7793C',
  accentLight: '#CE9A63',
  tipBackground: '#E6EEE8',
  tipBorder: '#234137',
  border: '#234137',
  borderLight: '#D8D1C3',
  text: '#20352E',
  textSecondary: '#4E5E56',
  textMuted: '#7C877F',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#2F7D5B',
  warning: '#C48A26',
  heart: '#C0392B',
  heartEmpty: '#C8D0C9',
  inputBackground: '#F8F5EE',
  shadow: 'rgba(35, 65, 55, 0.10)',
  overlay: 'rgba(24, 42, 35, 0.55)',
};

const PAPER: ThemePalette = {
  background: '#F7F5F0',
  card: '#FFFFFF',
  primary: '#1F2937',
  primaryLight: '#3C4A5C',
  secondary: '#555F6D',
  accent: '#96764B',
  accentLight: '#B49A74',
  tipBackground: '#EEEAE2',
  tipBorder: '#1F2937',
  border: '#1F2937',
  borderLight: '#E3DED4',
  text: '#1F2937',
  textSecondary: '#555F6D',
  textMuted: '#87909B',
  white: '#FFFFFF',
  error: '#C53030',
  success: '#2F855A',
  warning: '#B7791F',
  heart: '#C53030',
  heartEmpty: '#CBD5E0',
  inputBackground: '#FBFAF6',
  shadow: 'rgba(31, 41, 55, 0.08)',
  overlay: 'rgba(31, 41, 55, 0.5)',
};

const COASTAL: ThemePalette = {
  background: '#F0F6F5',
  card: '#FFFFFF',
  primary: '#1F4A4A',
  primaryLight: '#306B69',
  secondary: '#4A6664',
  accent: '#C07A4A',
  accentLight: '#D79A6E',
  tipBackground: '#E2F0EE',
  tipBorder: '#1F4A4A',
  border: '#1F4A4A',
  borderLight: '#D2E3E0',
  text: '#1D3E3E',
  textSecondary: '#4A6664',
  textMuted: '#738B89',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#2F855A',
  warning: '#C58B2A',
  heart: '#C0392B',
  heartEmpty: '#C7D6D4',
  inputBackground: '#F7FBFA',
  shadow: 'rgba(31, 74, 74, 0.10)',
  overlay: 'rgba(22, 45, 45, 0.55)',
};

const DATE_NIGHT: ThemePalette = {
  background: '#1A1218',
  card: '#2B1F29',
  primary: '#8E3B58',
  primaryLight: '#B05270',
  secondary: '#CBB7C2',
  accent: '#D9A05B',
  accentLight: '#E7B87B',
  tipBackground: '#3B2836',
  tipBorder: '#B05270',
  border: '#5A3C4C',
  borderLight: '#4A3342',
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
  shadow: 'rgba(0, 0, 0, 0.35)',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'warm',
    label: 'Warm Kitchen',
    description: 'Creamy neutrals with navy and walnut',
    colors: WARM,
  },
  {
    id: 'bistro',
    label: 'Modern Bistro',
    description: 'Deep green, brass, and warm linen',
    colors: BISTRO,
  },
  {
    id: 'paper',
    label: 'Paper Minimal',
    description: 'Soft white, ink, and muted gold',
    colors: PAPER,
  },
  {
    id: 'coastal',
    label: 'Coastal Table',
    description: 'Sea glass, teal, and terracotta',
    colors: COASTAL,
  },
  {
    id: 'date-night',
    label: 'Date Night',
    description: 'Moody plum, burgundy, and candlelight',
    colors: DATE_NIGHT,
  },
];

export function isThemeKey(value: unknown): value is ThemeKey {
  return THEME_OPTIONS.some((option) => option.id === value);
}

export function getThemePalette(key: ThemeKey): ThemePalette {
  return THEME_OPTIONS.find((option) => option.id === key)?.colors ?? WARM;
}
