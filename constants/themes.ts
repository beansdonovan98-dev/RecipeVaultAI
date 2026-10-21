export type ThemeKey =
  | 'taverna'
  | 'riso'
  | 'diner'
  | 'midnight'
  | 'seaglass'
  | 'butter';

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

/** How a theme treats corners, edges, and shadows. */
export type CardShadowStyle = 'soft' | 'hard' | 'none';

/** Display face used for titles and section labels, separate from the body font. */
export type DisplayFontKey = 'sans' | 'serif' | 'mono' | 'rounded';

export interface ThemeDesign {
  cardRadius: number;
  cardBorderWidth: number;
  cardShadow: CardShadowStyle;
  displayFont: DisplayFontKey;
}

export interface ThemeOption {
  id: ThemeKey;
  label: string;
  description: string;
  colors: ThemePalette;
  design: ThemeDesign;
}

export const DISPLAY_FONTS: Record<
  DisplayFontKey,
  { ios?: string; android?: string; default?: string }
> = {
  // No family means "use the platform default", which also lets the body font
  // setting win when the user has picked one.
  sans: {},
  serif: { ios: 'Georgia', android: 'serif', default: 'serif' },
  mono: { ios: 'Courier New', android: 'monospace', default: 'monospace' },
  rounded: { ios: 'Arial Rounded MT Bold', android: 'sans-serif-medium' },
};

export const DEFAULT_THEME_KEY: ThemeKey = 'taverna';

const TAVERNA: ThemePalette = {
  background: '#F3E7D3',
  card: '#FFFBF2',
  primary: '#3A2A1F',
  primaryLight: '#5A4334',
  secondary: '#6E5A48',
  accent: '#C2542C',
  accentLight: '#E0703F',
  tipBackground: '#EFE0C8',
  tipBorder: '#3A2A1F',
  border: '#3A2A1F',
  borderLight: '#DFCBB0',
  text: '#2E211A',
  textSecondary: '#6E5A48',
  textMuted: '#9A8573',
  white: '#FFFFFF',
  error: '#B3261E',
  success: '#3F6B3B',
  warning: '#B7791F',
  heart: '#B3261E',
  heartEmpty: '#C9B49A',
  inputBackground: '#F7EDDD',
  shadow: 'rgba(58, 42, 31, 0.16)',
  overlay: 'rgba(46, 33, 26, 0.55)',
};

const RISO: ThemePalette = {
  background: '#FFF1DE',
  card: '#FFFBF4',
  primary: '#1A1614',
  primaryLight: '#332B26',
  secondary: '#4A4038',
  accent: '#FF4B2B',
  accentLight: '#FF7A5C',
  tipBackground: '#FFE2A8',
  tipBorder: '#1A1614',
  border: '#1A1614',
  borderLight: '#E8D6BE',
  text: '#1A1614',
  textSecondary: '#4A4038',
  textMuted: '#8A7A68',
  white: '#FFFFFF',
  error: '#D92D20',
  success: '#1F7A45',
  warning: '#C77700',
  heart: '#FF4B2B',
  heartEmpty: '#D9C6AE',
  inputBackground: '#FFF4E4',
  shadow: 'rgba(26, 22, 20, 0.9)',
  overlay: 'rgba(26, 22, 20, 0.55)',
};

const DINER: ThemePalette = {
  background: '#101014',
  card: '#191922',
  primary: '#FF3D8B',
  primaryLight: '#FF6FA9',
  secondary: '#C9C9D6',
  accent: '#22E6C8',
  accentLight: '#6FF5DE',
  tipBackground: '#23232F',
  tipBorder: '#22E6C8',
  border: '#3A3A4C',
  borderLight: '#2C2C3A',
  text: '#F7F5FF',
  textSecondary: '#C9C9D6',
  textMuted: '#8E8EA3',
  white: '#FFFFFF',
  error: '#FF6B6B',
  success: '#3DDC97',
  warning: '#FFC93C',
  heart: '#FF3D8B',
  heartEmpty: '#4A4A5C',
  inputBackground: '#20202B',
  shadow: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const MIDNIGHT: ThemePalette = {
  background: '#0A0F1C',
  card: '#131B2E',
  primary: '#4E7CF0',
  primaryLight: '#7A9DFF',
  secondary: '#B8C4DC',
  accent: '#E8B44A',
  accentLight: '#F5D07E',
  tipBackground: '#1B2540',
  tipBorder: '#E8B44A',
  border: '#2B3A57',
  borderLight: '#24314A',
  text: '#EEF3FF',
  textSecondary: '#B8C4DC',
  textMuted: '#7E8DA8',
  white: '#FFFFFF',
  error: '#FF7B7B',
  success: '#4ADE80',
  warning: '#F5C26B',
  heart: '#FF7B7B',
  heartEmpty: '#3B4A66',
  inputBackground: '#1A2440',
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const SEAGLASS: ThemePalette = {
  background: '#E6F5F0',
  card: '#FFFFFF',
  primary: '#0F5C52',
  primaryLight: '#1B7A6D',
  secondary: '#4A6B66',
  accent: '#FF7A5C',
  accentLight: '#FF9B84',
  tipBackground: '#D3EDE6',
  tipBorder: '#0F5C52',
  border: '#0F5C52',
  borderLight: '#BFDDD5',
  text: '#0B3B36',
  textSecondary: '#4A6B66',
  textMuted: '#7C9993',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#14805E',
  warning: '#C77D00',
  heart: '#E05A45',
  heartEmpty: '#A8C9C1',
  inputBackground: '#F0FAF7',
  shadow: 'rgba(15, 92, 82, 0.14)',
  overlay: 'rgba(11, 59, 54, 0.55)',
};

const BUTTER: ThemePalette = {
  background: '#FBEACB',
  card: '#FFFDF7',
  primary: '#4A2C1E',
  primaryLight: '#6B4230',
  secondary: '#7A5C48',
  accent: '#E4572E',
  accentLight: '#F07C57',
  tipBackground: '#FDE7B8',
  tipBorder: '#4A2C1E',
  border: '#4A2C1E',
  borderLight: '#EFD9AE',
  text: '#3A2216',
  textSecondary: '#7A5C48',
  textMuted: '#A08872',
  white: '#FFFFFF',
  error: '#B3261E',
  success: '#2F7A46',
  warning: '#B26B00',
  heart: '#D14343',
  heartEmpty: '#DCC49B',
  inputBackground: '#FFF7E6',
  shadow: 'rgba(74, 44, 30, 0.16)',
  overlay: 'rgba(58, 34, 22, 0.55)',
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'taverna',
    label: 'Taverna',
    description: 'Parchment, espresso ink, and terracotta — a dog-eared cookbook',
    colors: TAVERNA,
    design: { cardRadius: 14, cardBorderWidth: 1, cardShadow: 'soft', displayFont: 'serif' },
  },
  {
    id: 'riso',
    label: 'Riso Pop',
    description: 'Screen-printed cream and tomato with thick ink outlines',
    colors: RISO,
    design: { cardRadius: 12, cardBorderWidth: 2, cardShadow: 'hard', displayFont: 'sans' },
  },
  {
    id: 'diner',
    label: 'Night Diner',
    description: 'Neon pink and mint on charcoal, straight off the counter',
    colors: DINER,
    design: { cardRadius: 6, cardBorderWidth: 1, cardShadow: 'none', displayFont: 'mono' },
  },
  {
    id: 'midnight',
    label: 'Midnight Brass',
    description: 'Deep navy and brass, a late table with the lights low',
    colors: MIDNIGHT,
    design: { cardRadius: 18, cardBorderWidth: 1, cardShadow: 'soft', displayFont: 'serif' },
  },
  {
    id: 'seaglass',
    label: 'Sea Glass',
    description: 'Airy mint and coral with soft, rounded edges',
    colors: SEAGLASS,
    design: { cardRadius: 24, cardBorderWidth: 0, cardShadow: 'soft', displayFont: 'rounded' },
  },
  {
    id: 'butter',
    label: 'Butter & Cocoa',
    description: 'Bakery yellow, cocoa brown, and a warm persimmon pop',
    colors: BUTTER,
    design: { cardRadius: 20, cardBorderWidth: 2, cardShadow: 'soft', displayFont: 'rounded' },
  },
];

export function isThemeKey(value: unknown): value is ThemeKey {
  return THEME_OPTIONS.some((option) => option.id === value);
}

export function getThemePalette(key: ThemeKey): ThemePalette {
  return THEME_OPTIONS.find((option) => option.id === key)?.colors ?? TAVERNA;
}

export function getThemeDesign(key: ThemeKey): ThemeDesign {
  return (
    THEME_OPTIONS.find((option) => option.id === key)?.design ?? THEME_OPTIONS[0].design
  );
}

export interface CardStyleTokens {
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * Shared card treatment for a theme: rounded paper, thick screen-printed
 * outlines, or a flat diner counter depending on the design.
 */
export function themeCardStyle(design: ThemeDesign, palette: ThemePalette): CardStyleTokens {
  if (design.cardShadow === 'hard') {
    return {
      borderRadius: design.cardRadius,
      borderWidth: design.cardBorderWidth,
      borderColor: palette.border,
      shadowColor: palette.border,
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    };
  }

  if (design.cardShadow === 'none') {
    return {
      borderRadius: design.cardRadius,
      borderWidth: design.cardBorderWidth,
      borderColor: palette.borderLight,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    };
  }

  return {
    borderRadius: design.cardRadius,
    borderWidth: design.cardBorderWidth,
    borderColor: palette.borderLight,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  };
}
