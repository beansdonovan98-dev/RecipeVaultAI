export type ThemeKey =
  | 'taverna'
  | 'riso'
  | 'diner'
  | 'midnight'
  | 'seaglass'
  | 'butter'
  | 'newsprint'
  | 'citrus'
  | 'lavender'
  | 'sakura'
  | 'ember'
  | 'blueprint'
  | 'shinobi';

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
export type DisplayFontKey = 'sans' | 'serif' | 'mono' | 'rounded' | 'condensed';

/** Optional decorative wallpaper drawn inside recipe cards. */
export type CardPattern =
  | 'checks'
  | 'halftone'
  | 'stripes'
  | 'stars'
  | 'bubbles'
  | 'dots'
  | 'rules'
  | 'slices'
  | 'sprigs'
  | 'petals'
  | 'embers'
  | 'grid'
  | 'clouds';

export interface ThemeDesign {
  cardRadius: number;
  cardBorderWidth: number;
  cardShadow: CardShadowStyle;
  displayFont: DisplayFontKey;
  cardPattern?: CardPattern;
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
  condensed: {
    ios: 'HelveticaNeue-CondensedBold',
    android: 'sans-serif-condensed',
    default: 'sans-serif-condensed',
  },
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

const NEWSPRINT: ThemePalette = {
  background: '#F4EFE3',
  card: '#FFFDF6',
  primary: '#1A1A18',
  primaryLight: '#3D3D38',
  secondary: '#57534E',
  accent: '#B3261E',
  accentLight: '#D4483C',
  tipBackground: '#EAE3D2',
  tipBorder: '#1A1A18',
  border: '#1A1A18',
  borderLight: '#D9D2C2',
  text: '#141412',
  textSecondary: '#57534E',
  textMuted: '#8A8378',
  white: '#FFFFFF',
  error: '#B3261E',
  success: '#2F6B3F',
  warning: '#A15C00',
  heart: '#B3261E',
  heartEmpty: '#C9C1B0',
  inputBackground: '#F7F3E9',
  shadow: 'rgba(20, 20, 18, 0.14)',
  overlay: 'rgba(20, 20, 18, 0.6)',
};

const CITRUS: ThemePalette = {
  background: '#FFF7D6',
  card: '#FFFFFF',
  primary: '#365314',
  primaryLight: '#4D7C0F',
  secondary: '#5F6B4F',
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  tipBackground: '#FDF3C4',
  tipBorder: '#365314',
  border: '#365314',
  borderLight: '#EBDFA8',
  text: '#27300F',
  textSecondary: '#5F6B4F',
  textMuted: '#8F9779',
  white: '#FFFFFF',
  error: '#B42318',
  success: '#3F6212',
  warning: '#B45309',
  heart: '#E11D48',
  heartEmpty: '#D9D2A8',
  inputBackground: '#FFFBE7',
  shadow: 'rgba(54, 83, 20, 0.15)',
  overlay: 'rgba(39, 48, 15, 0.55)',
};

const LAVENDER: ThemePalette = {
  background: '#F4EEFF',
  card: '#FFFFFF',
  primary: '#5B21B6',
  primaryLight: '#7C3AED',
  secondary: '#6B5B95',
  accent: '#A855F7',
  accentLight: '#C084FC',
  tipBackground: '#EBDDFF',
  tipBorder: '#5B21B6',
  border: '#5B21B6',
  borderLight: '#DDD0F5',
  text: '#2E1065',
  textSecondary: '#6B5B95',
  textMuted: '#9585B8',
  white: '#FFFFFF',
  error: '#BE123C',
  success: '#15803D',
  warning: '#B45309',
  heart: '#DB2777',
  heartEmpty: '#CBB8E8',
  inputBackground: '#F8F3FF',
  shadow: 'rgba(91, 33, 182, 0.16)',
  overlay: 'rgba(46, 16, 101, 0.55)',
};

const SAKURA: ThemePalette = {
  background: '#FFF0F5',
  card: '#FFFFFF',
  primary: '#9D174D',
  primaryLight: '#BE185D',
  secondary: '#9F6B7E',
  accent: '#F472B6',
  accentLight: '#F9A8D4',
  tipBackground: '#FFE0EC',
  tipBorder: '#9D174D',
  border: '#9D174D',
  borderLight: '#F5CFDD',
  text: '#4C0519',
  textSecondary: '#9F6B7E',
  textMuted: '#BC93A3',
  white: '#FFFFFF',
  error: '#B91C1C',
  success: '#15803D',
  warning: '#B45309',
  heart: '#DB2777',
  heartEmpty: '#E9C3D3',
  inputBackground: '#FFF6F9',
  shadow: 'rgba(157, 23, 77, 0.14)',
  overlay: 'rgba(76, 5, 25, 0.55)',
};

const EMBER: ThemePalette = {
  background: '#160D0A',
  card: '#221410',
  primary: '#EA580C',
  primaryLight: '#FB923C',
  secondary: '#D6C3B8',
  accent: '#FBBF24',
  accentLight: '#FCD34D',
  tipBackground: '#2C1A13',
  tipBorder: '#FBBF24',
  border: '#4A2C20',
  borderLight: '#38211A',
  text: '#FFF3EA',
  textSecondary: '#D6C3B8',
  textMuted: '#9C8072',
  white: '#FFFFFF',
  error: '#FF7A6B',
  success: '#4ADE80',
  warning: '#FBBF24',
  heart: '#FF6B6B',
  heartEmpty: '#553229',
  inputBackground: '#2A1912',
  shadow: 'rgba(0, 0, 0, 0.55)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const BLUEPRINT: ThemePalette = {
  background: '#0A1F38',
  card: '#0F2C4C',
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  secondary: '#B6D4F0',
  accent: '#7DD3FC',
  accentLight: '#BAE6FD',
  tipBackground: '#14395F',
  tipBorder: '#7DD3FC',
  border: '#2C5A86',
  borderLight: '#1D4368',
  text: '#E8F4FF',
  textSecondary: '#B6D4F0',
  textMuted: '#7EA3C4',
  white: '#FFFFFF',
  error: '#FF7B7B',
  success: '#4ADE80',
  warning: '#FCD34D',
  heart: '#FF8FA3',
  heartEmpty: '#33536F',
  inputBackground: '#123454',
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(4, 14, 26, 0.7)',
};

const SHINOBI: ThemePalette = {
  background: '#F6E6C8',
  card: '#FFFBF2',
  primary: '#D94F00',
  primaryLight: '#F97316',
  secondary: '#1E2A44',
  accent: '#C1121F',
  accentLight: '#E63946',
  tipBackground: '#FCE7C0',
  tipBorder: '#1E2A44',
  border: '#14181F',
  borderLight: '#E4D2AC',
  text: '#1B1B1F',
  textSecondary: '#4A4E5A',
  textMuted: '#8A8172',
  white: '#FFFFFF',
  error: '#B3261E',
  success: '#2F6B3F',
  warning: '#B45309',
  heart: '#C1121F',
  heartEmpty: '#D9C7A4',
  inputBackground: '#FFF7E8',
  shadow: 'rgba(20, 24, 31, 0.9)',
  overlay: 'rgba(20, 24, 31, 0.6)',
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'taverna',
    label: 'Taverna',
    description: 'Parchment and terracotta with a checked tablecloth corner',
    colors: TAVERNA,
    design: {
      cardRadius: 14,
      cardBorderWidth: 1,
      cardShadow: 'soft',
      displayFont: 'serif',
      cardPattern: 'checks',
    },
  },
  {
    id: 'riso',
    label: 'Riso Pop',
    description: 'Screen-printed cream, tomato ink, and halftone dots',
    colors: RISO,
    design: {
      cardRadius: 12,
      cardBorderWidth: 2,
      cardShadow: 'hard',
      displayFont: 'sans',
      cardPattern: 'halftone',
    },
  },
  {
    id: 'diner',
    label: 'Night Diner',
    description: 'Neon pink and mint with late-night awning stripes',
    colors: DINER,
    design: {
      cardRadius: 6,
      cardBorderWidth: 1,
      cardShadow: 'none',
      displayFont: 'mono',
      cardPattern: 'stripes',
    },
  },
  {
    id: 'midnight',
    label: 'Midnight Brass',
    description: 'Deep navy and brass with a dusting of stars',
    colors: MIDNIGHT,
    design: {
      cardRadius: 18,
      cardBorderWidth: 1,
      cardShadow: 'soft',
      displayFont: 'serif',
      cardPattern: 'stars',
    },
  },
  {
    id: 'seaglass',
    label: 'Sea Glass',
    description: 'Airy mint and coral with drifting bubbles',
    colors: SEAGLASS,
    design: {
      cardRadius: 24,
      cardBorderWidth: 0,
      cardShadow: 'soft',
      displayFont: 'rounded',
      cardPattern: 'bubbles',
    },
  },
  {
    id: 'butter',
    label: 'Butter & Cocoa',
    description: 'Bakery yellow and cocoa with polka dots',
    colors: BUTTER,
    design: {
      cardRadius: 20,
      cardBorderWidth: 2,
      cardShadow: 'soft',
      displayFont: 'rounded',
      cardPattern: 'dots',
    },
  },
  {
    id: 'newsprint',
    label: 'Newsprint',
    description: 'Crisp ink, ruled lines, and sharp square corners',
    colors: NEWSPRINT,
    design: {
      cardRadius: 4,
      cardBorderWidth: 1,
      cardShadow: 'none',
      displayFont: 'serif',
      cardPattern: 'rules',
    },
  },
  {
    id: 'citrus',
    label: 'Citrus Grove',
    description: 'Lemon light and leafy green with a citrus wheel',
    colors: CITRUS,
    design: {
      cardRadius: 18,
      cardBorderWidth: 1,
      cardShadow: 'soft',
      displayFont: 'rounded',
      cardPattern: 'slices',
    },
  },
  {
    id: 'lavender',
    label: 'Lavender Haze',
    description: 'Soft violet light with illustrated sprigs',
    colors: LAVENDER,
    design: {
      cardRadius: 22,
      cardBorderWidth: 0,
      cardShadow: 'soft',
      displayFont: 'serif',
      cardPattern: 'sprigs',
    },
  },
  {
    id: 'sakura',
    label: 'Sakura',
    description: 'Blush pink and rose ink with drifting petals',
    colors: SAKURA,
    design: {
      cardRadius: 24,
      cardBorderWidth: 0,
      cardShadow: 'soft',
      displayFont: 'rounded',
      cardPattern: 'petals',
    },
  },
  {
    id: 'ember',
    label: 'Ember',
    description: 'Smoldering charcoal and embers rising up the card',
    colors: EMBER,
    design: {
      cardRadius: 12,
      cardBorderWidth: 1,
      cardShadow: 'soft',
      displayFont: 'serif',
      cardPattern: 'embers',
    },
  },
  {
    id: 'blueprint',
    label: 'Blueprint',
    description: 'Drafting-table navy with a graph-paper grid',
    colors: BLUEPRINT,
    design: {
      cardRadius: 8,
      cardBorderWidth: 1,
      cardShadow: 'none',
      displayFont: 'mono',
      cardPattern: 'grid',
    },
  },
  {
    id: 'shinobi',
    label: 'Shinobi',
    description: 'Ninja orange with red cloud-print cards',
    colors: SHINOBI,
    design: {
      cardRadius: 8,
      cardBorderWidth: 2,
      cardShadow: 'hard',
      displayFont: 'condensed',
      cardPattern: 'clouds',
    },
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
