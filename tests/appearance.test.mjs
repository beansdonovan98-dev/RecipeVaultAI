import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FONT_COLOR,
  FONT_COLORS,
  FONT_OPTIONS,
  isFontKey,
  isHexColor,
  normalizeHexColor,
  readableTextColor,
  contrastRatio,
} from '../constants/appearance.ts';
import {
  DEFAULT_THEME_KEY,
  THEME_OPTIONS,
  getThemePalette,
  isThemeKey,
} from '../constants/themes.ts';

test('font and color options are valid', () => {
  assert.equal(isFontKey('system'), true);
  assert.equal(isFontKey('serif'), true);
  assert.equal(isFontKey('handwritten'), true);
  assert.equal(isFontKey('condensed'), true);
  assert.equal(isFontKey('comic'), false);
  assert.equal(isFontKey(null), false);
  assert.ok(FONT_OPTIONS.length >= 8);
  assert.ok(FONT_COLORS.some((option) => option.value === DEFAULT_FONT_COLOR));

  const fontIds = new Set();
  for (const option of FONT_OPTIONS) {
    assert.equal(fontIds.has(option.id), false, `duplicate font id: ${option.id}`);
    fontIds.add(option.id);
    assert.ok(option.label.length > 0);
    assert.ok(option.description.length > 0);
    assert.ok(
      Object.keys(option.families).length > 0 || option.id === 'system',
      `${option.id} needs a font family`
    );
  }
});

test('theme presets are valid and complete', () => {
  assert.equal(isThemeKey(DEFAULT_THEME_KEY), true);
  assert.equal(isThemeKey('vaporwave'), false);
  assert.ok(THEME_OPTIONS.length >= 3);

  const ids = new Set();
  for (const option of THEME_OPTIONS) {
    assert.equal(ids.has(option.id), false, `duplicate theme id: ${option.id}`);
    ids.add(option.id);
    assert.ok(option.label.length > 0);
    assert.equal(getThemePalette(option.id), option.colors);
    for (const [key, value] of Object.entries(option.colors)) {
      assert.equal(typeof value, 'string', `${option.id}.${key} must be a string`);
      assert.ok(value.length > 0, `${option.id}.${key} must not be empty`);
    }
    assert.ok(option.design.cardRadius > 0, `${option.id} needs a card radius`);
    assert.ok(option.design.cardBorderWidth >= 0, `${option.id} needs a border width`);
    assert.ok(['soft', 'hard', 'none'].includes(option.design.cardShadow));
    assert.ok(['sans', 'serif', 'mono', 'rounded', 'condensed'].includes(option.design.displayFont));
    assert.ok(
      option.design.cardPattern === undefined || option.design.cardPattern === 'clouds',
      `${option.id} uses a known card pattern`
    );
  }

  const shinobi = THEME_OPTIONS.find((option) => option.id === 'shinobi');
  assert.equal(shinobi?.design.cardPattern, 'clouds');
});

test('hex colors are validated and normalized', () => {
  assert.equal(isHexColor('#5b3a29'), true);
  assert.equal(isHexColor('5b3a29'), false);
  assert.equal(isHexColor('#fff'), false);
  assert.equal(isHexColor('#GGGGGG'), false);
  assert.equal(normalizeHexColor('  #5b3a29 '), '#5B3A29');
});

test('text colors stay readable on every theme', () => {
  const darkFont = '#1B2A4A';
  const lightFont = '#F7F5FF';

  assert.ok(contrastRatio(lightFont, '#101014') > contrastRatio(darkFont, '#101014'));
  assert.equal(readableTextColor(darkFont, '#101014', lightFont), lightFont);
  assert.equal(readableTextColor(darkFont, '#FFFBF2', lightFont), darkFont);
  assert.equal(readableTextColor(lightFont, '#FFFBF2', darkFont), darkFont);

  for (const option of THEME_OPTIONS) {
    const background = option.colors.background;
    const readable = readableTextColor(darkFont, background, option.colors.text);
    assert.ok(
      contrastRatio(readable, background) >= 2.2,
      `${option.id} keeps text readable`
    );
  }
});

