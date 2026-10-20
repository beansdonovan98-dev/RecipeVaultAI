import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FONT_COLOR,
  FONT_COLORS,
  FONT_OPTIONS,
  isFontKey,
  isHexColor,
  normalizeHexColor,
} from '../constants/appearance.ts';

test('font and color options are valid', () => {
  assert.equal(isFontKey('system'), true);
  assert.equal(isFontKey('serif'), true);
  assert.equal(isFontKey('comic'), false);
  assert.equal(isFontKey(null), false);
  assert.ok(FONT_OPTIONS.length >= 2);
  assert.ok(FONT_COLORS.some((option) => option.value === DEFAULT_FONT_COLOR));
});

test('hex colors are validated and normalized', () => {
  assert.equal(isHexColor('#5b3a29'), true);
  assert.equal(isHexColor('5b3a29'), false);
  assert.equal(isHexColor('#fff'), false);
  assert.equal(isHexColor('#GGGGGG'), false);
  assert.equal(normalizeHexColor('  #5b3a29 '), '#5B3A29');
});
